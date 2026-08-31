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
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RawCrawlResult } from '../src/lib/types.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTACT_EMAIL = 'm.schmitz1712@gmail.com';
const USER_AGENT = `AccessibilityChecker-Crawler/0.1 (+Zweck: Verständlichkeits- und Zugänglichkeitsprüfung für ein Webinar-Demo-Projekt; Kontakt: ${CONTACT_EMAIL})`;
const MIN_DELAY_MS = 1000;

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

async function fetchRobots(startUrl: string) {
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

function extractInternalLinks(html: string, baseUrl: string, host: string): string[] {
	const links = new Set<string>();
	const re = /<a\s+[^>]*href=["']([^"'#]+)["']/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html))) {
		try {
			const abs = new URL(m[1], baseUrl);
			if (abs.hostname.replace(/^www\./, '') !== host) continue;
			if (!/^https?:$/.test(abs.protocol)) continue;
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
	const context = await browser.newContext({ userAgent: USER_AGENT });
	const page = await context.newPage();
	try {
		await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
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
				screenshot: `src/lib/data/screenshots/${host}/${slug}.png`
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

	const screenshotDir = join(ROOT, 'src/lib/data/screenshots', host);
	mkdirSync(screenshotDir, { recursive: true });

	const browser = await chromium.launch({ headless: true });

	const visited = new Set<string>();
	const queue: string[] = [startUrl];
	const result: RawCrawlResult = {
		crawledAt: new Date().toISOString(),
		startUrl,
		pages: [],
		html: {},
		errors: []
	};

	while (queue.length > 0 && result.pages.length < maxPages) {
		const url = queue.shift()!;
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
			for (const link of links) {
				if (!visited.has(link) && !queue.includes(link)) queue.push(link);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.error(`Fehlgeschlagen: ${url} — ${message}`);
			result.errors.push({ url, message });
		}

		await new Promise((r) => setTimeout(r, MIN_DELAY_MS));
	}

	await browser.close();

	const outPath = join(ROOT, 'src/lib/data', `${name}.raw.json`);
	writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
	console.log(
		`\nFertig: ${result.pages.length} Seiten, ${result.errors.length} Fehler.\nGeschrieben nach ${outPath}`
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
