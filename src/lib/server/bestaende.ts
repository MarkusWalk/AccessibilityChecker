// Gemeinsamer Zugriff auf die gecachten Bestände in src/lib/data/ und den
// laufenden Live-Crawl. Wird vom Layout-Loader und vom Chat-Endpunkt benutzt.
// Liest bei jedem Aufruf frisch von Platte, damit ein Bestand, der während
// des Webinars fertig wird, ohne Neustart erscheint.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '$lib/types';

const DATA_DIR = join(process.cwd(), 'src/lib/data');

export type BestandInfo = {
	name: string; // Dateiname ohne .json, z.B. 'weinheim'
	label: string; // Anzeigename, z.B. 'Weinheim'
	pages: number;
	findings: number;
	live: boolean; // stammt aus dem Hintergrund-Crawl
};

const LABELS: Record<string, string> = {
	weinheim: 'Weinheim',
	theilheim: 'Theilheim',
	eiterfeld: 'Eiterfeld',
	fallback: 'Beispielbestand',
	live: 'Live-Crawl'
};

function isBestandFile(file: string): boolean {
	return (
		file.endsWith('.json') &&
		!file.endsWith('.raw.json') &&
		!file.startsWith('.') &&
		file !== 'live-status.json'
	);
}

export function listBestaende(): BestandInfo[] {
	if (!existsSync(DATA_DIR)) return [];
	return readdirSync(DATA_DIR)
		.filter(isBestandFile)
		.map((file) => {
			const name = file.replace(/\.json$/, '');
			const pages = loadBestand(name) ?? [];
			return {
				name,
				label: LABELS[name] ?? name,
				pages: pages.length,
				findings: pages.reduce((n, p) => n + p.findings.length, 0),
				live: name === 'live'
			};
		})
		.sort((a, b) => order(a.name) - order(b.name));
}

// Weinheim zuerst, dann die übrigen Häuser, der Beispielbestand und der
// Live-Crawl am Ende.
function order(name: string): number {
	const fixed = ['weinheim', 'theilheim', 'eiterfeld', 'fallback', 'live'];
	const i = fixed.indexOf(name);
	return i === -1 ? fixed.length : i;
}

export function loadBestand(name: string): Page[] | null {
	if (!/^[a-z0-9-]+$/i.test(name)) return null;
	const path = join(DATA_DIR, `${name}.json`);
	if (!existsSync(path)) return null;
	try {
		const parsed = JSON.parse(readFileSync(path, 'utf-8'));
		return Array.isArray(parsed) ? (parsed as Page[]) : ((parsed.pages as Page[]) ?? null);
	} catch {
		return null;
	}
}

export const DEFAULT_BESTAND = 'weinheim';

export function resolveBestand(requested: string | null): { name: string; pages: Page[] } {
	const all = listBestaende();
	const candidates = [requested, DEFAULT_BESTAND, 'theilheim', 'fallback'].filter(
		(n): n is string => !!n
	);
	for (const n of candidates) {
		const pages = loadBestand(n);
		if (pages && pages.length) return { name: n, pages };
	}
	const first = all[0];
	return first ? { name: first.name, pages: loadBestand(first.name) ?? [] } : { name: 'leer', pages: [] };
}
