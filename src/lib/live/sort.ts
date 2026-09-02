// Vorbereitung für E3 ("Womit fängt das Haus am Montag an?"). Ungenutzt,
// bis live entschieden ist, welche Option gewinnt — dann wird nur noch die
// passende Funktion hier importiert und auf die Seitenliste angewendet.

import type { Page, Finding } from '$lib/types';

const SEVERITY_RANG: Record<Finding['severity'], number> = { hoch: 0, mittel: 1, niedrig: 2 };
const EFFORT_RANG: Record<Finding['effort'], number> = { klein: 0, mittel: 1, gross: 2 };

// A: Reichweite — meistbesuchte Seiten zuerst.
export function byReach(pages: Page[]): Page[] {
	return [...pages].sort((a, b) => b.reach - a.reach);
}

// B: Schwere des Befunds — Seiten mit den schwersten Befunden zuerst.
export function bySeverity(pages: Page[]): Page[] {
	const schwerste = (p: Page) =>
		Math.min(...p.findings.map((f) => SEVERITY_RANG[f.severity]), Infinity);
	return [...pages].sort((a, b) => schwerste(a) - schwerste(b));
}

// C: Aufwand — Seiten mit den am schnellsten erledigten Korrekturen zuerst.
export function byEffort(pages: Page[]): Page[] {
	const geringsterAufwand = (p: Page) =>
		Math.min(...p.findings.map((f) => EFFORT_RANG[f.effort]), Infinity);
	return [...pages].sort((a, b) => geringsterAufwand(a) - geringsterAufwand(b));
}

// D: Lebenslage — Gruppierung statt Sortierung, darum die aufwendigste
// Option (siehe docs/entscheidungen.md). Erst die Gruppenüberschriften
// sichtbar machen, dann die Seiten einsortieren. `Record` statt `Map`, damit
// sich das Ergebnis in Svelte direkt mit `Object.entries(...)` iterieren
// lässt.
export function byLebenslage(pages: Page[]): Record<string, Page[]> {
	const gruppen: Record<string, Page[]> = {};
	for (const page of pages) {
		const schluessel = page.lebenslage ?? 'Ohne Zuordnung';
		(gruppen[schluessel] ??= []).push(page);
	}
	return gruppen;
}
