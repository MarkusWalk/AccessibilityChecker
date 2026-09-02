// Lese-Endpunkt für E5 (Live-Crawl-Status, LiveMonitor.svelte). Liest
// src/lib/data/live-status.json, das erst entsteht, wenn scripts/live-crawl.ts
// läuft (verbotene scripts/-Zone, wird hier nicht angefasst). Fehlt die Datei
// — am Webinartag vor Minute 0, oder in dieser Simulation immer —, liefert
// der Endpunkt einen plausiblen Demo-Status, damit LiveMonitor auch ohne
// laufenden echten Crawl etwas Sinnvolles zeigt. Kein Schreibzugriff, kein
// Eingriff in Datenmodell oder scripts/.
//
// GET -> 200 { crawled, total, currentUrl, errors, done }

import { json } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { RequestHandler } from './$types';

const LIVE_STATUS_PATH = fileURLToPath(
	new URL('../../../lib/data/live-status.json', import.meta.url)
);

const DEMO_STATUS = {
	crawled: 7,
	total: 20,
	currentUrl: 'https://beispielstadt.de/leistungen/wohngeld',
	errors: 0,
	done: false
};

export const GET: RequestHandler = async () => {
	try {
		const inhalt = await readFile(LIVE_STATUS_PATH, 'utf-8');
		return json(JSON.parse(inhalt));
	} catch {
		return json(DEMO_STATUS);
	}
};
