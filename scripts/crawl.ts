// Playwright-Crawl. Nimmt eine Startadresse und eine Seitenzahl, folgt
// internen Links, respektiert robots.txt, schreibt Page[] (ohne findings)
// + Screenshots + rohes HTML nach src/lib/data/<bestand>.raw.json.
//
// Aufruf:
//   npx tsx scripts/crawl.ts <start-url> [--max-pages 50] [--name <bestand>]
//
// Läuft weiter, wenn einzelne Seiten fehlschlagen; Fehler landen in
// result.errors statt den Lauf abzubrechen.

import { chromium, type Browser } from 'playwright';
import robotsParser from 'robots-parser';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RawCrawlResult } from '../src/lib/types.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTACT_EMAIL = 'm.schmitz1712@gmail.com';
export const USER_AGENT = `AccessibilityChecker-Crawler/0.1 (+Zweck: Verständlichkeits- und Zugänglichkeitsprüfung für ein Webinar-Demo-Projekt; Kontakt: ${CONTACT_EMAIL})`;
export const MIN_DELAY_MS = 1000;

// Fester Viewport für Crawl UND für scripts/boxes.ts (zweiter Durchlauf, der
// die Finding.box-Rechtecke misst). Beide müssen dieselbe Breite verwenden,
// sonst passen die Vollseiten-Screenshots (fullPage: true, siehe unten) und
// die daraus abgeleiteten Boxen nicht mehr zusammen — bei 1280 CSS-Pixel
// Breite reflowt eine Seite nicht anders, wenn crawl.ts und boxes.ts sie
// nacheinander laden. box.x/box.y/box.width/box.height in Finding sind daher
// CSS-Pixel bezogen auf einen mit VIEWPORT.width breiten, fullPage
// aufgenommenen Screenshot.
export const VIEWPORT = { width: 1280, height: 800 };

// Pfad-Schlüsselwörter, die für die Prüfung besonders relevant sind (Satzungen,
// Ortsrecht, Bekanntmachungen, Datenschutz — Quelle für E1-Gesetzeszitate —
// sowie Formulare/Bürgerservice). Links, deren Pfad eines davon enthält,
// werden vor allen anderen noch offenen Links besucht.
const PRIORITAETS_SCHLUESSELWOERTER = [
	'satzung',
	'ortsrecht',
	'bekanntmachung',
	'datenschutz',
	'impressum',
	'buerger',
	'bürger',
	'service',
	'formular'
];

// Viele Kommunal-CMS (auch weinheim.de) generieren einen riesigen Katalog
// einzelner "Verfahrensbeschreibung"-Blätter (ein Vorgang pro Leistung, mit
// langer numerischer ID im Pfad, z.B. ".../vbid6024929" oder
// "/-/verfahrensbeschreibung/..."). Deren Namen enthalten oft zufällig
// "buerger" oder "service" (z.B. "buergergeld", "servicedienstleister") und
// würden die Prioritäts-Warteschlange bei begrenztem maxPages allein
// füllen, noch bevor Satzungen/Ortsrecht/Datenschutz erreicht sind. Solche
// Katalog-Einzelseiten werden deshalb von der Priorisierung ausgenommen
// (sie werden weiterhin normal gecrawlt, nur eben nicht vorgezogen).
const KATALOG_MUSTER = /verfahrensbeschreibung|vbid\d+|\/\d{5,}(\/|$)/;

function istPrioritaetsLink(url: string): boolean {
	const path = decodeURIComponent(new URL(url).pathname).toLowerCase();
	if (KATALOG_MUSTER.test(path)) return false;
	return PRIORITAETS_SCHLUESSELWOERTER.some((wort) => path.includes(wort));
}

type CliArgs = { startUrl: string; maxPages: number; name: string };

function parseArgs(argv: string[]): CliArgs {
	const [startUrl, ...rest] = argv;
	if (!startUrl) {
		console.error('Nutzung: npx tsx scripts/crawl.ts <start-url> [--max-pages 50] [--name <bestand>]');
		process.exit(1);
	}
	let maxPages = 50;
	let name = new URL(startUrl).hostname.replace(/^www\./, '');
	for (let i = 0; i < rest.length; i++) {
		if (rest[i] === '--max-pages') maxPages = Number(rest[++i]);
		if (rest[i] === '--name') name = rest[++i];
	}
	return { startUrl, maxPages, name };
}

export async function fetchRobots(startUrl: string) {
	const robotsUrl = new URL('/robots.txt', startUrl).toString();
	try {
		const res = await fetch(robotsUrl, { headers: { 'User-Agent': USER_AGENT } });
		if (!res.ok) return robotsParser(robotsUrl, '');
		const body = await res.text();
		return robotsParser(robotsUrl, body);
	} catch {
		// Kein robots.txt erreichbar -> nichts verboten, aber trotzdem
		// höflich (Rate-Limit) crawlen.
		return robotsParser(robotsUrl, '');
	}
}

function slugFor(url: string): string {
	const u = new URL(url);
	const path = u.pathname === '/' || u.pathname === '' ? 'startseite' : u.pathname;
	return path
		.replace(/^\/|\/$/g, '')
		.replace(/[^a-z0-9]+/gi, '-')
		.toLowerCase()
		.slice(0, 80) || 'startseite';
}

// Dateiendungen, die kein HTML sind. Playwright kann sie nicht als Seite
// laden (löst z.T. einen Download aus), sie zählen deshalb nicht als
// internes Link-Ziel für den Crawl.
const NICHT_HTML_ENDUNGEN =
	/\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|svg|webp|zip|ics|mp3|mp4|css|js|xml)$/i;

function decodeHtmlEntities(text: string): string {
	return text
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#0?39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function extractInternalLinks(html: string, baseUrl: string, host: string): string[] {
	const links = new Set<string>();
	const re = /<a\s+[^>]*href=["']([^"'#]+)["']/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html))) {
		try {
			const abs = new URL(decodeHtmlEntities(m[1]), baseUrl);
			if (abs.hostname.replace(/^www\./, '') !== host) continue;
			if (!/^https?:$/.test(abs.protocol)) continue;
			if (NICHT_HTML_ENDUNGEN.test(abs.pathname)) continue;
			abs.hash = '';
			links.add(abs.toString());
		} catch {
			// ungültige URL, überspringen
		}
	}
	return [...links];
}

async function crawlPage(
	browser: Browser,
	url: string,
	host: string,
	screenshotDir: string
): Promise<{ page: Omit<import('../src/lib/types.ts').Page, 'findings'>; html: string; links: string[] }> {
	const context = await browser.newContext({ userAgent: USER_AGENT, viewport: VIEWPORT });
	const page = await context.newPage();
	try {
		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
		// Kurz auf Nachlade-Inhalte warten, aber nicht am networkidle-Timeout
		// scheitern (viele Behörden-Seiten werden wegen Tracking-Beacons nie
		// wirklich "idle").
		await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
		const title = (await page.title()) || url;
		const html = await page.content();
		const slug = slugFor(url);
		const screenshotPath = join(screenshotDir, `${slug}.png`);
		await page.screenshot({ path: screenshotPath, fullPage: true });
		const links = extractInternalLinks(html, url, host);
		return {
			page: {
				url,
				title,
				reach: 0, // wird nicht gecrawlt, bleibt 0 bis Analyse/Bestand es setzt
				lebenslage: null,
				screenshot: `/screenshots/${host}/${slug}.png`
			},
			html,
			links
		};
	} finally {
		await context.close();
	}
}

async function main() {
	const { startUrl, maxPages, name } = parseArgs(process.argv.slice(2));
	const host = new URL(startUrl).hostname.replace(/^www\./, '');
	const robots = await fetchRobots(startUrl);
	// robots.txt kann für User-agent: * einen eigenen Crawl-Delay verlangen
	// (z.B. weinheim.de: 30s). MIN_DELAY_MS ist nur das Minimum — ein von der
	// Seite verlangter größerer Abstand hat Vorrang.
	const crawlDelaySekunden = robots.getCrawlDelay?.(USER_AGENT);
	const delayMs = Math.max(MIN_DELAY_MS, (crawlDelaySekunden ?? 0) * 1000);
	if (crawlDelaySekunden) {
		console.log(`robots.txt verlangt Crawl-Delay: ${crawlDelaySekunden}s — genutzt: ${delayMs}ms zwischen Abrufen.`);
	}

	const screenshotDir = join(ROOT, 'static/screenshots', host);
	mkdirSync(screenshotDir, { recursive: true });

	const browser = await chromium.launch({ headless: true });

	const outPath = join(ROOT, 'src/lib/data', `${name}.raw.json`);
	// Zwischenspeicherung alle 5 Seiten: Bricht der Crawl vorzeitig ab
	// (Zeitdruck, Abbruch durch Markus), geht der bereits gecrawlte Teil
	// nicht verloren — scripts/analyze.ts kann direkt mit dem Teilergebnis
	// weiterarbeiten.
	function schreibeZwischenstand() {
		writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
	}

	const visited = new Set<string>();
	// Zwei getrennte FIFO-Warteschlangen statt einer einzelnen mit unshift():
	// Ein unshift() hätte bei jeder neu gefundenen Prioritäts-Charge die
	// bereits wartenden Prioritäts-Links wieder nach hinten verdrängt (LIFO
	// statt FIFO) — z.B. wurden so auf weinheim.de die auf der Startseite
	// verlinkten Datenschutz-/Impressum-Seiten von jeder späteren Seite mit
	// eigenen Prioritäts-Treffern immer weiter zurückgeschoben und nie
	// erreicht. priorityQueue wird vollständig vor normalQueue geleert,
	// innerhalb jeder der beiden bleibt die Fundreihenfolge erhalten.
	const priorityQueue: string[] = [];
	const normalQueue: string[] = [startUrl];
	const imQueue = new Set<string>([startUrl]);
	const result: RawCrawlResult = {
		crawledAt: new Date().toISOString(),
		startUrl,
		pages: [],
		html: {},
		errors: []
	};

	while ((priorityQueue.length > 0 || normalQueue.length > 0) && result.pages.length < maxPages) {
		const url = (priorityQueue.length > 0 ? priorityQueue.shift() : normalQueue.shift())!;
		imQueue.delete(url);
		if (visited.has(url)) continue;
		visited.add(url);

		if (robots.isDisallowed?.(url, USER_AGENT)) {
			console.log(`robots.txt verbietet: ${url}`);
			continue;
		}

		try {
			console.log(`(${result.pages.length + 1}/${maxPages}) ${url}`);
			const { page, html, links } = await crawlPage(browser, url, host, screenshotDir);
			result.pages.push(page);
			result.html[url] = html;
			// Neue Links: Schlüsselwort-Treffer (Satzung, Ortsrecht, Datenschutz
			// usw.) kommen ans Ende der Prioritäts-Warteschlange, alle anderen
			// ans Ende der normalen — bei begrenztem maxPages werden so eher
			// rechtlich relevante Seiten erreicht statt z.B. Terminlisten oder
			// Presseartikel, ohne früher gefundene Prioritäts-Links zu verdrängen.
			for (const link of links) {
				if (visited.has(link) || imQueue.has(link)) continue;
				imQueue.add(link);
				(istPrioritaetsLink(link) ? priorityQueue : normalQueue).push(link);
			}
			if (result.pages.length % 5 === 0) schreibeZwischenstand();
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.error(`Fehlgeschlagen: ${url} — ${message}`);
			result.errors.push({ url, message });
		}

		await new Promise((r) => setTimeout(r, delayMs));
	}

	await browser.close();

	schreibeZwischenstand();
	console.log(
		`\nFertig: ${result.pages.length} Seiten, ${result.errors.length} Fehler.\nGeschrieben nach ${outPath}`
	);
}

// Nur als CLI ausführen, nicht beim Import (scripts/boxes.ts importiert
// fetchRobots/USER_AGENT/MIN_DELAY_MS/VIEWPORT aus dieser Datei und darf
// main() dabei nicht auslösen).
const istCliAufruf = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (istCliAufruf) {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
