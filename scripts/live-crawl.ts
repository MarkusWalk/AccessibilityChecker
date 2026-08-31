// Hintergrund-Crawl für den Webinartag: nimmt die vom Publikum genannte
// Adresse, crawlt und analysiert sie, ohne dass die Oberfläche darauf
// wartet. Schreibt laufend einen Fortschritts-Status nach
// src/lib/data/live-status.json — LiveMonitor.svelte kann diese Datei
// (z.B. über einen einfachen +server.ts-Endpunkt) anzeigen.
//
// Wird am Webinartag gestartet, sobald die Publikums-URL feststeht:
//   npx tsx scripts/live-crawl.ts <start-url> [--max-pages 30] [--name live]
//
// Läuft synchron in diesem Prozess (im Hintergrund starten, z.B. mit `&`
// oder einem eigenen Terminal-Tab) — die App selbst ruft nie ein Modell
// oder den Crawler aus dem Render-Pfad auf.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = join(import.meta.dirname, '..');
const STATUS_PATH = join(ROOT, 'src/lib/data/live-status.json');

type Status = {
	crawled: number;
	total: number | null;
	currentUrl: string | null;
	errors: number;
	done: boolean;
};

function schreibeStatus(status: Status) {
	writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2), 'utf-8');
}

function run(cmd: string, args: string[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const proc = spawn(cmd, args, { stdio: 'inherit', cwd: ROOT });
		proc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))));
	});
}

async function main() {
	const [startUrl, ...rest] = process.argv.slice(2);
	if (!startUrl) {
		console.error('Nutzung: npx tsx scripts/live-crawl.ts <start-url> [--max-pages 30] [--name live]');
		process.exit(1);
	}
	const maxPagesIdx = rest.indexOf('--max-pages');
	const maxPages = maxPagesIdx >= 0 ? rest[maxPagesIdx + 1] : '30';
	const nameIdx = rest.indexOf('--name');
	const name = nameIdx >= 0 ? rest[nameIdx + 1] : 'live';

	schreibeStatus({ crawled: 0, total: Number(maxPages), currentUrl: startUrl, errors: 0, done: false });

	console.log(`Hintergrund-Crawl: ${startUrl} (max. ${maxPages} Seiten) -> Bestand "${name}"`);
	await run('npx', ['tsx', 'scripts/crawl.ts', startUrl, '--max-pages', maxPages, '--name', name]);
	await run('npx', ['tsx', 'scripts/analyze.ts', name]);

	schreibeStatus({ crawled: Number(maxPages), total: Number(maxPages), currentUrl: null, errors: 0, done: true });
	console.log(`Fertig. Bestand liegt unter src/lib/data/${name}.json`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
