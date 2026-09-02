// Zweiter, kurzer Playwright-Durchlauf: öffnet jede Seite eines bereits
// analysierten Bestands (src/lib/data/<bestand>.json, geschrieben von
// scripts/analyze.ts) noch einmal, misst für jeden vorkommenden
// Finding.selector das getBoundingClientRect() im echten Browser-DOM und
// trägt das Ergebnis als `box` ein. Alle anderen Felder eines Findings
// (suggestion, rationale, fromLegalSource, effort, ...) bleiben unverändert
// — es wird nur `box` gesetzt bzw. überschrieben.
//
// Warum ein zweiter Durchlauf statt Boxen direkt im Crawl zu erfassen: Der
// Crawl (scripts/crawl.ts) kennt die CSS-Selektoren noch nicht, die
// entstehen erst in der Rohanalyse (scripts/lib/rules.ts) beim Verarbeiten
// des gespeicherten HTML. Die dort erzeugten Selektor-Strings (z.B.
// "main > section:nth-of-type(2) > p:nth-of-type(1)") sind gültiges CSS und
// lassen sich darum unverändert per document.querySelector() im echten
// Browser wiederverwenden — ohne den Selektor-Algorithmus ein zweites Mal
// nachzubauen. Voraussetzung: Die Seite hat sich seit dem Crawl strukturell
// nicht verändert. Bei rein statischen Behördenseiten ist das der
// Normalfall; weicht eine Seite zwischen den beiden Durchläufen ab, bleibt
// die betroffene box schlicht null (kein Absturz, siehe try/catch unten).
//
// Nimmt am selben Zug einen frischen Vollseiten-Screenshot auf (überschreibt
// die vorhandene PNG unter static/<Page.screenshot>), damit Screenshot und
// Boxen garantiert zum selben Seitenzustand und Viewport gehören.
//
// Viewport: scripts/crawl.ts::VIEWPORT (1280x800 CSS-Pixel) — identisch zum
// Crawl. box.x/y/width/height sind also CSS-Pixel bezogen auf einen mit
// dieser Breite, fullPage aufgenommenen Screenshot (Ursprung oben links).
//
// robots.txt und der Mindestabstand von 1 Sekunde zwischen Abrufen gelten
// hier genauso wie beim Crawl (scripts/crawl.ts).
//
// Aufruf:
//   npx tsx scripts/boxes.ts <bestand>
//   (liest und schreibt src/lib/data/<bestand>.json)

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchRobots, USER_AGENT, MIN_DELAY_MS, VIEWPORT } from './crawl.ts';
import type { Box, Page as Bestandsseite } from '../src/lib/types.ts';

const ROOT = join(import.meta.dirname, '..');

async function main() {
	const bestand = process.argv[2];
	if (!bestand) {
		console.error('Nutzung: npx tsx scripts/boxes.ts <bestand>');
		process.exit(1);
	}

	const dataPath = join(ROOT, 'src/lib/data', `${bestand}.json`);
	const pages = JSON.parse(readFileSync(dataPath, 'utf-8')) as Bestandsseite[];

	if (pages.length === 0) {
		console.log('Keine Seiten im Bestand — nichts zu tun.');
		return;
	}

	const robots = await fetchRobots(pages[0].url);
	// Gleiche Regel wie scripts/crawl.ts: ein von robots.txt verlangter
	// größerer Crawl-Delay hat Vorrang vor MIN_DELAY_MS.
	const crawlDelaySekunden = robots.getCrawlDelay?.(USER_AGENT);
	const delayMs = Math.max(MIN_DELAY_MS, (crawlDelaySekunden ?? 0) * 1000);
	const browser = await chromium.launch({ headless: true });

	let boxenGesetzt = 0;
	let gesamt = 0;

	for (const [index, seite] of pages.entries()) {
		gesamt += seite.findings.length;

		// 'html' ist der Selektor für Seitenebenen-Befunde (z.B.
		// sprachauszeichnung-fehlt) — dafür gibt es laut Datenmodell keine box.
		const selectors = [
			...new Set(
				seite.findings
					.map((f) => f.selector)
					.filter((s): s is string => !!s && s !== 'html')
			)
		];

		if (robots.isDisallowed?.(seite.url, USER_AGENT)) {
			console.log(`robots.txt verbietet: ${seite.url} — Boxen bleiben null`);
			for (const f of seite.findings) f.box = null;
			continue;
		}

		const context = await browser.newContext({ userAgent: USER_AGENT, viewport: VIEWPORT });
		const page = await context.newPage();
		try {
			console.log(`(${index + 1}/${pages.length}) ${seite.url}`);
			await page.goto(seite.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
			await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
			await page.evaluate(() => window.scrollTo(0, 0));

			// Frischer Vollseiten-Screenshot, damit er garantiert zu den
			// gleich gemessenen Boxen passt (gleicher Seitenzustand, gleicher
			// Viewport).
			const screenshotAbsPath = join(ROOT, 'static', seite.screenshot.replace(/^\//, ''));
			await page.screenshot({ path: screenshotAbsPath, fullPage: true });

			const boxBySelector = new Map<string, Box | null>();
			for (const sel of selectors) {
				try {
					const rect = await page.$eval(sel, (el) => {
						const r = el.getBoundingClientRect();
						return { x: r.left, y: r.top, width: r.width, height: r.height };
					});
					boxBySelector.set(sel, {
						x: Math.round(rect.x),
						y: Math.round(rect.y),
						width: Math.round(rect.width),
						height: Math.round(rect.height)
					});
				} catch {
					// Selektor nicht gefunden (Seite hat sich seit dem Crawl
					// geändert) — box bleibt null für diesen Selektor.
					boxBySelector.set(sel, null);
				}
			}

			for (const f of seite.findings) {
				f.box = !f.selector || f.selector === 'html' ? null : (boxBySelector.get(f.selector) ?? null);
				if (f.box) boxenGesetzt += 1;
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.error(`Fehlgeschlagen: ${seite.url} — ${message}`);
			for (const f of seite.findings) f.box = f.box ?? null;
		} finally {
			await context.close();
		}

		await new Promise((r) => setTimeout(r, delayMs));
	}

	await browser.close();

	writeFileSync(dataPath, JSON.stringify(pages, null, 2), 'utf-8');
	console.log(`\nFertig: ${boxenGesetzt}/${gesamt} Boxen gesetzt. Geschrieben nach ${dataPath}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
