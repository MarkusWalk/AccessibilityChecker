// Modellanalyse. Liest ein *.raw.json (aus scripts/crawl.ts), lässt die
// Rohanalyse (scripts/lib/rules.ts) über jede Seite laufen und füllt danach
// über die LLM-Fassade (src/lib/server/llm.ts) die Felder, die Urteil
// verlangen: suggestion, suggestionAlt, rationale, effort (bei
// Urteilssachen), lebenslage je Seite. Schreibt den fertigen Bestand nach
// src/lib/data/<bestand>.json.
//
// Aufruf:
//   npx tsx scripts/analyze.ts <bestand>
//   (liest src/lib/data/<bestand>.raw.json, schreibt src/lib/data/<bestand>.json)

import { readFileSync, writeFileSync } from 'node:fs';
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

async function main() {
	const bestand = process.argv[2];
	if (!bestand) {
		console.error('Nutzung: npx tsx scripts/analyze.ts <bestand>');
		process.exit(1);
	}

	const rawPath = join(ROOT, 'src/lib/data', `${bestand}.raw.json`);
	const raw = JSON.parse(readFileSync(rawPath, 'utf-8')) as RawCrawlResult;

	console.log(`Provider: ${currentProvider()}`);
	console.log(`${raw.pages.length} Seiten, Rohanalyse startet...`);

	const pages: Page[] = [];
	let legalHits = 0;
	let totalFindings = 0;

	for (const [index, rawPage] of raw.pages.entries()) {
		const html = raw.html[rawPage.url];
		const rohBefunde = html ? analysePage(html, rawPage.url) : [];

		const befunde: Finding[] = [];
		for (const finding of rohBefunde) {
			const judged = await judgeFinding(finding);
			befunde.push(judged);
			if (judged.fromLegalSource) legalHits += 1;
		}
		totalFindings += befunde.length;

		const lebenslage = await complete(lebenslagePrompt(rawPage));

		pages.push({
			...rawPage,
			reach: schaetzeReichweite(rawPage, index),
			lebenslage: lebenslage.trim() || null,
			findings: befunde
		});

		console.log(`  ${rawPage.url} — ${befunde.length} Befunde`);
	}

	const outPath = join(ROOT, 'src/lib/data', `${bestand}.json`);
	writeFileSync(outPath, JSON.stringify(pages, null, 2), 'utf-8');

	console.log(`\nFertig: ${pages.length} Seiten, ${totalFindings} Befunde insgesamt.`);
	console.log(
		`Davon fromLegalSource: true → ${legalHits} (wichtig für E1 — siehe docs/aufbau-vor-dem-webinar.md, Abschnitt 4).`
	);
	console.log(`Geschrieben nach ${outPath}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
