// Vorbereitung für E3 ("Womit fängt das Haus am Montag an?"). Ungenutzt,
// bis live entschieden ist, welche Option gewinnt — dann wird nur noch die
// passende Funktion hier importiert und auf die Seiten-/Befundliste
// angewendet.

import type { Page, Finding } from '$lib/types';

const SEVERITY_RANG: Record<Finding['severity'], number> = { hoch: 0, mittel: 1, niedrig: 2 };
const EFFORT_RANG: Record<Finding['effort'], number> = { klein: 0, mittel: 1, gross: 2 };

// A: Reichweite — meistbesuchte Seiten zuerst.
export function nachReichweite(pages: Page[]): Page[] {
	return [...pages].sort((a, b) => b.reach - a.reach);
}

// B: Schwere des Befunds — Seiten mit den schwersten Befunden zuerst.
export function nachSchwere(pages: Page[]): Page[] {
	const schwerste = (p: Page) =>
		Math.min(...p.findings.map((f) => SEVERITY_RANG[f.severity]), Infinity);
	return [...pages].sort((a, b) => schwerste(a) - schwerste(b));
}

// C: Aufwand — Seiten mit den schnellsten Korrekturen zuerst.
export function nachAufwand(pages: Page[]): Page[] {
	const geringsterAufwand = (p: Page) =>
		Math.min(...p.findings.map((f) => EFFORT_RANG[f.effort]), Infinity);
	return [...pages].sort((a, b) => geringsterAufwand(a) - geringsterAufwand(b));
}

// D: Lebenslage — Gruppierung statt Sortierung. Erst die Gruppenüberschriften
// sichtbar machen, dann die Seiten einsortieren (siehe docs/entscheidungen.md).
export function nachLebenslage(pages: Page[]): Map<string, Page[]> {
	const gruppen = new Map<string, Page[]>();
	for (const page of pages) {
		const schluessel = page.lebenslage ?? 'Ohne Zuordnung';
		gruppen.set(schluessel, [...(gruppen.get(schluessel) ?? []), page]);
	}
	return gruppen;
}
