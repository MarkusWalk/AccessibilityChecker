// Modellanalyse. Liest ein *.raw.json (aus scripts/crawl.ts), legt Seiten
// mit identischem Titel und identischem Textinhalt zusammen (kanonische,
// kürzere URL bleibt), lässt die Rohanalyse (scripts/lib/rules.ts) über
// jede verbleibende Seite laufen, entfernt siteweite Dubletten (gleiche
// Regel + gleicher normalisierter Auszug über mehrere Seiten — z.B. ein
// wiederkehrender "hier klicken"-Link im Fließtext, nicht in Nav/Header/
// Footer, die rules.ts bereits ausschließt), behält jeweils nur das
// Vorkommen auf der Seite mit der höchsten Reichweite, und füllt danach
// über die LLM-Fassade (src/lib/server/llm.ts) die Felder, die Urteil
// verlangen: suggestion, suggestionAlt, rationale, effort (bei
// Urteilssachen). lebenslage wird zuerst lokal aus Pfad/Titel geschätzt
// (siehe LEBENSLAGE_ZUORDNUNG) und nur bei keinem Treffer ans Modell
// delegiert. Schreibt den fertigen Bestand nach src/lib/data/<bestand>.json.
//
// Boxen (Finding.box): Wird vor dem Schreiben ein bereits vorhandener
// Bestand src/lib/data/<bestand>.json gefunden, werden dessen Boxen anhand
// von (pageUrl, rule, selector) auf die neu erzeugten Findings übertragen —
// die Selektor-Berechnung in rules.ts hängt nicht davon ab, ob ein Element
// am Ende als Befund gemeldet wird, darum bleibt der Selektor eines
// überlebenden Elements stabil und ein neuer Playwright-Lauf (scripts/
// boxes.ts) ist nur nötig, wenn sich Seiteninhalt oder Selektoren
// tatsächlich geändert haben (Bericht am Ende nennt die Trefferquote).
//
// Aufruf:
//   npx tsx scripts/analyze.ts <bestand>
//   (liest src/lib/data/<bestand>.raw.json, schreibt src/lib/data/<bestand>.json)

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { analysePage } from './lib/rules.ts';
import { complete, currentProvider } from '../src/lib/server/llm.ts';
import type { Finding, Page, RawCrawlResult } from '../src/lib/types.ts';

const ROOT = join(import.meta.dirname, '..');

function findingPrompt(finding: Finding): string {
	const lines = [
		'Aufgabe: Formuliere einen Vorschlag zur Behebung dieses Befunds.',
		`Achse: ${finding.axis}`,
		`Regel: ${finding.rule}`,
		`Originalsatz: "${finding.excerpt}"`
	];
	if (finding.fromLegalSource) {
		lines.push(`Rechtsquelle: ${finding.legalSource ?? 'unbekannt'}`);
	}
	lines.push(
		'Antworte als JSON mit den Feldern suggestion, suggestionAlt, rationale, effort (klein|mittel|gross).'
	);
	return lines.join('\n');
}

function lebenslagePrompt(page: Omit<Page, 'findings'>): string {
	return [
		'Aufgabe: lebenslage',
		`Titel: ${page.title}`,
		`URL: ${page.url}`,
		'Antworte mit einem kurzen thematischen Bündel (2-4 Wörter), zu dem diese Seite gehört.'
	].join('\n');
}

async function judgeFinding(finding: Finding): Promise<Finding> {
	try {
		const raw = await complete(findingPrompt(finding), { json: true });
		const parsed = JSON.parse(raw) as {
			suggestion?: string | null;
			suggestionAlt?: string | null;
			rationale?: string | null;
			effort?: Finding['effort'];
		};
		return {
			...finding,
			suggestion: parsed.suggestion ?? finding.suggestion,
			suggestionAlt: parsed.suggestionAlt ?? finding.suggestionAlt,
			rationale: parsed.rationale ?? finding.rationale,
			effort: parsed.effort ?? finding.effort
		};
	} catch (err) {
		console.error(`Modellantwort für ${finding.id} (${finding.rule}) unbrauchbar:`, err);
		return finding;
	}
}

// Grobe Ersatz-Reichweite (E3), solange keine echten Zugriffszahlen
// vorliegen: Startseite und Kernthemen vorn, Rechtliches/Archiv hinten.
function schaetzeReichweite(page: Omit<Page, 'findings'>, index: number): number {
	const path = new URL(page.url).pathname.toLowerCase();
	if (path === '/' || path === '') return 100;
	if (/impressum|datenschutz/.test(path)) return 15;
	if (/veranstaltung/.test(path)) return 25;
	return Math.max(30, 90 - index * 6);
}

// --- Seiten-Dubletten (gleicher Titel + gleicher Textinhalt) -----------
//
// Manche Kommunal-CMS erreichen dieselbe Seite über mehrere URLs (z.B.
// weinheim.de/datenschutz und .../Funktionsseiten/datenschutz.html). Ohne
// Zusammenlegung würde jede Variante dieselben Findings ein zweites Mal
// erzeugen. Text- statt HTML-Vergleich, damit reine Auszeichnungs-
// unterschiede (Klassen, IDs) nicht als "andere Seite" zählen.

function normalisiereSeitentext(html: string): string {
	return html
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();
}

function legeDublettenZusammen(raw: RawCrawlResult): {
	pages: Omit<Page, 'findings'>[];
	html: Record<string, string>;
	zusammengelegt: number;
} {
	const gruppen = new Map<string, Omit<Page, 'findings'>[]>();
	for (const p of raw.pages) {
		const text = normalisiereSeitentext(raw.html[p.url] ?? '');
		const key = `${p.title.trim().toLowerCase()}::${text}`;
		if (!gruppen.has(key)) gruppen.set(key, []);
		gruppen.get(key)!.push(p);
	}

	const pages: Omit<Page, 'findings'>[] = [];
	const html: Record<string, string> = {};
	let zusammengelegt = 0;

	for (const gruppe of gruppen.values()) {
		if (gruppe.length > 1) {
			zusammengelegt += gruppe.length - 1;
			const namen = gruppe.map((p) => p.url).join(', ');
			console.log(`Dublette zusammengelegt (${gruppe.length}x): ${namen}`);
		}
		// kürzeste URL ist die kanonische
		const kanonisch = [...gruppe].sort((a, b) => a.url.length - b.url.length)[0];
		pages.push(kanonisch);
		html[kanonisch.url] = raw.html[kanonisch.url];
	}

	return { pages, html, zusammengelegt };
}

// --- Siteweite Dublettenbereinigung (gleiche Regel + Auszug) -----------

function normalisiereAuszug(excerpt: string): string {
	return excerpt.trim().toLowerCase().replace(/\s+/g, ' ');
}

type SeitenEintrag = {
	rawPage: Omit<Page, 'findings'>;
	reach: number;
	pageIndex: number;
	rohBefunde: Finding[];
};

function dedupliziereSiteweit(seiten: SeitenEintrag[]): Map<string, Finding[]> {
	type Vorkommen = { finding: Finding; pageUrl: string; reach: number; pageIndex: number };
	const gruppen = new Map<string, Vorkommen[]>();

	for (const s of seiten) {
		for (const finding of s.rohBefunde) {
			const key = `${finding.rule}::${normalisiereAuszug(finding.excerpt)}`;
			if (!gruppen.has(key)) gruppen.set(key, []);
			gruppen.get(key)!.push({ finding, pageUrl: s.rawPage.url, reach: s.reach, pageIndex: s.pageIndex });
		}
	}

	// "auf mehreren Seiten" heißt: die Gruppe muss auf mindestens zwei
	// VERSCHIEDENEN Seiten vorkommen, bevor sie auf eine einzige zusammen-
	// fällt. Mehrfachvorkommen innerhalb ein und derselben Seite (z.B. drei
	// gleich benannte "hier"-Links im selben Artikel) sind keine
	// Seiten-Dublette und bleiben alle stehen — sonst würde eine Seite mit
	// mehreren Instanzen desselben Problems nur eine einzige davon zeigen,
	// obwohl gar keine andere Seite betroffen ist.
	const zuBehalten = new Set<string>();
	for (const vorkommen of gruppen.values()) {
		const verschiedeneSeiten = new Set(vorkommen.map((v) => v.pageUrl));
		if (verschiedeneSeiten.size < 2) {
			for (const v of vorkommen) zuBehalten.add(v.finding.id);
			continue;
		}
		const gewinnerSeite = [...verschiedeneSeiten].reduce((besteUrl, url) => {
			const a = vorkommen.find((v) => v.pageUrl === besteUrl)!;
			const b = vorkommen.find((v) => v.pageUrl === url)!;
			return b.reach > a.reach || (b.reach === a.reach && b.pageIndex < a.pageIndex) ? url : besteUrl;
		});
		// Von der Gewinner-Seite bleiben alle dortigen Vorkommen erhalten
		// (das sind keine Seiten-Dubletten mehr, sondern echte Mehrfach-
		// vorkommen auf einer Seite) — nur die Vorkommen auf den anderen
		// Seiten entfallen.
		for (const v of vorkommen) {
			if (v.pageUrl === gewinnerSeite) zuBehalten.add(v.finding.id);
		}
	}

	const ergebnis = new Map<string, Finding[]>();
	for (const s of seiten) {
		const uebrig = s.rohBefunde.filter((f) => zuBehalten.has(f.id));
		// Schutz gegen leere Seiten: Verliert eine Seite durch die
		// Dublettenbereinigung ALLE ihre Befunde (z.B. weil jeder einzelne
		// auch woanders mit höherer Reichweite vorkommt), behält sie
		// stattdessen ihre ursprünglichen Rohbefunde. "Jede Seite hat noch
		// mehrere" wiegt hier schwerer als die letzte Konsequenz der
		// Dedup-Regel für diesen Randfall.
		ergebnis.set(s.rawPage.url, uebrig.length > 0 || s.rohBefunde.length === 0 ? uebrig : s.rohBefunde);
	}
	return ergebnis;
}

// --- Lebenslage: erst lokal aus Pfad/Titel, sonst ans Modell ----------
//
// Reihenfolge ist Priorität bei Überschneidung — der erste Treffer
// gewinnt. "sonst Allgemein" ist der explizite Rückfall, wenn weder ein
// Schlüsselwort noch das Modell etwas liefert.
const LEBENSLAGE_ZUORDNUNG: [string[], string][] = [
	[['verkehr', 'parken'], 'Mobilität'],
	[['buergerbuero', 'buergerservice', 'ausweis', 'formular'], 'Bürgerservice'],
	[['bau', 'liegenschaft', 'hochbau'], 'Bauen und Wohnen'],
	[['datenschutz', 'impressum'], 'Rechtliches'],
	[['rathaus', 'gemeinderat', 'buergerbeteiligung', 'engagement'], 'Verwaltung und Beteiligung'],
	[['baeder', 'sport', 'kultur'], 'Freizeit'],
	[['schule', 'kita', 'familie'], 'Familie und Bildung'],
	[['abfall', 'versorgung', 'entsorgung'], 'Versorgung']
];

// Grobe Transliteration, damit Umlaute in Titel/URL (z.B. "Bürgerbüro")
// gegen die ASCII-Schlüsselwörter aus der Aufgabenstellung matchen.
function transliteriere(text: string): string {
	return text
		.toLowerCase()
		.replace(/ä/g, 'ae')
		.replace(/ö/g, 'oe')
		.replace(/ü/g, 'ue')
		.replace(/ß/g, 'ss');
}

function schaetzeLebenslageLokal(page: Omit<Page, 'findings'>): string | null {
	const heuhaufen = transliteriere(`${page.title} ${new URL(page.url).pathname}`);
	for (const [schluesselwoerter, label] of LEBENSLAGE_ZUORDNUNG) {
		if (schluesselwoerter.some((wort) => heuhaufen.includes(wort))) return label;
	}
	return null;
}

// --- Boxen aus einem vorhandenen Bestand zurückmergen -------------------

function ladeBoxLookup(bestandPath: string): Map<string, Finding['box']> {
	const lookup = new Map<string, Finding['box']>();
	if (!existsSync(bestandPath)) return lookup;
	try {
		const alt = JSON.parse(readFileSync(bestandPath, 'utf-8')) as Page[];
		for (const seite of alt) {
			for (const f of seite.findings) {
				if (!f.selector) continue;
				lookup.set(`${f.pageUrl}::${f.rule}::${f.selector}`, f.box ?? null);
			}
		}
	} catch (err) {
		console.error(`Alter Bestand ${bestandPath} nicht lesbar, Boxen werden nicht übernommen:`, err);
	}
	return lookup;
}

async function main() {
	const bestand = process.argv[2];
	if (!bestand) {
		console.error('Nutzung: npx tsx scripts/analyze.ts <bestand>');
		process.exit(1);
	}

	const rawPath = join(ROOT, 'src/lib/data', `${bestand}.raw.json`);
	const raw = JSON.parse(readFileSync(rawPath, 'utf-8')) as RawCrawlResult;
	const outPath = join(ROOT, 'src/lib/data', `${bestand}.json`);
	const boxLookup = ladeBoxLookup(outPath);

	console.log(`Provider: ${currentProvider()}`);
	console.log(`${raw.pages.length} Seiten im Rohergebnis.`);

	const { pages: kanonischeSeiten, html: kanonischesHtml, zusammengelegt } = legeDublettenZusammen(raw);
	console.log(
		`Nach Dubletten-Zusammenlegung (Titel + Textinhalt gleich): ${kanonischeSeiten.length} Seiten (${zusammengelegt} zusammengelegt).`
	);

	// Rohanalyse (rules.ts) je verbleibender Seite, noch ohne Modell-Urteil —
	// reach wird vorab gebraucht, um bei der siteweiten Dedup die Seite mit
	// der höchsten Reichweite zu bestimmen.
	const seiten: SeitenEintrag[] = kanonischeSeiten.map((rawPage, pageIndex) => ({
		rawPage,
		reach: schaetzeReichweite(rawPage, pageIndex),
		pageIndex,
		rohBefunde: kanonischesHtml[rawPage.url] ? analysePage(kanonischesHtml[rawPage.url], rawPage.url) : []
	}));

	const rohGesamt = seiten.reduce((n, s) => n + s.rohBefunde.length, 0);
	const behalten = dedupliziereSiteweit(seiten);
	const behaltenGesamt = [...behalten.values()].reduce((n, arr) => n + arr.length, 0);
	console.log(
		`Siteweite Dublettenbereinigung (gleiche Regel + Auszug, höchste Reichweite gewinnt): ${rohGesamt} → ${behaltenGesamt} Befunde.`
	);

	const pages: Page[] = [];
	let legalHits = 0;
	let totalFindings = 0;
	let boxTreffer = 0;
	let boxGesamt = 0;

	for (const s of seiten) {
		const rawPage = s.rawPage;
		const rohBefunde = behalten.get(rawPage.url) ?? [];

		const befunde: Finding[] = [];
		for (const finding of rohBefunde) {
			const judged = await judgeFinding(finding);
			if (judged.selector) {
				boxGesamt += 1;
				const box = boxLookup.get(`${judged.pageUrl}::${judged.rule}::${judged.selector}`);
				if (box !== undefined) {
					judged.box = box;
					boxTreffer += 1;
				} else {
					judged.box = null;
				}
			} else {
				judged.box = null;
			}
			befunde.push(judged);
			if (judged.fromLegalSource) legalHits += 1;
		}
		totalFindings += befunde.length;

		const lokal = schaetzeLebenslageLokal(rawPage);
		const lebenslage = lokal ?? (await complete(lebenslagePrompt(rawPage))).trim() ?? '';

		pages.push({
			...rawPage,
			reach: s.reach,
			lebenslage: lebenslage || 'Allgemein',
			findings: befunde
		});

		console.log(`  ${rawPage.url} — ${befunde.length} Befunde, Lebenslage: ${lebenslage || 'Allgemein'}`);
	}

	writeFileSync(outPath, JSON.stringify(pages, null, 2), 'utf-8');

	console.log(`\nFertig: ${pages.length} Seiten, ${totalFindings} Befunde insgesamt.`);
	console.log(`Davon fromLegalSource: true → ${legalHits}.`);
	console.log(
		`Boxen aus vorhandenem Bestand übernommen: ${boxTreffer}/${boxGesamt}${boxGesamt > 0 && boxTreffer < boxGesamt ? ' — Rest fehlt, ggf. npx tsx scripts/boxes.ts ' + bestand + ' erneut laufen lassen.' : ''}`
	);
	console.log(`Geschrieben nach ${outPath}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
