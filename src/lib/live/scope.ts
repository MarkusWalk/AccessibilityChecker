// Vorbereitung für E2 ("Wo hört die Zuständigkeit des Systems auf?").
// Weist jedem Befund einen Modus zu: 'vorschlag' (das System schlägt einen
// Text vor), 'markierung' (das System zeigt nur die Stelle, schreibt
// nichts), 'frage' (das System stellt eine Frage, den Text schreiben
// Menschen). Ungenutzt, bis live entschieden ist, welche Option gewinnt —
// dann wird nur noch `scopeFor`/`countScopes` importiert und der Karte
// (`FindingCard.svelte`, Prop `mode`) übergeben.

import type { Finding } from '$lib/types';

export type ScopeOption = 'nirgends' | 'gesetz' | 'ermessen' | 'sprache';
export type ScopeMode = 'vorschlag' | 'markierung' | 'frage';

export function scopeFor(f: Finding, option: ScopeOption): ScopeMode {
	switch (option) {
		case 'nirgends':
			// A: Keine Grenze — auch ein Satz aus einem Gesetz wird umformuliert.
			return 'vorschlag';

		case 'gesetz':
			// B: Zitate aus Gesetzen werden markiert, nie umgeschrieben. Alles
			// andere bekommt weiter einen Vorschlag.
			return f.fromLegalSource ? 'markierung' : 'vorschlag';

		case 'ermessen':
			// C: Belegbares (z.B. fehlender Alt-Text, `machineDecidable`) bekommt
			// einen Vorschlag, Ermessensfragen (z.B. "ist der Satz verständlich?")
			// werden gefragt statt beantwortet. Gesetzestext bleibt zusätzlich
			// markiert, unabhängig davon, ob er als belegbar gilt.
			if (f.fromLegalSource) return 'markierung';
			return f.machineDecidable ? 'vorschlag' : 'frage';

		case 'sprache':
			// D: Das System prüft nur Technik (Achse Zugänglichkeit). Texte
			// (Achse Verständlichkeit) bleiben ganz bei Menschen — dort wird nur
			// die Stelle markiert, nie umformuliert.
			return f.axis === 'zugaenglichkeit' ? 'vorschlag' : 'markierung';
	}
}

export function countScopes(findings: Finding[], option: ScopeOption): Record<ScopeMode, number> {
	const zaehler: Record<ScopeMode, number> = { vorschlag: 0, markierung: 0, frage: 0 };
	for (const f of findings) zaehler[scopeFor(f, option)]++;
	return zaehler;
}

// Kurze, unterstützende Frage je Regel für Modus 'frage' — der Mensch schreibt
// den Text, das System hilft nur beim Hinsehen. Regeln ohne eigene
// Formulierung fallen auf eine achsenneutrale Frage zurück.
const FRAGEN: Record<string, string> = {
	satzlaenge: 'Ist dieser Satz für Leserinnen und Leser ohne Vorwissen verständlich?',
	nebensatztiefe: 'Lässt sich dieser Satz beim ersten Lesen erfassen?',
	passivanteil: 'Ist klar erkennbar, wer hier handelt?',
	nominalstil: 'Liest sich das noch wie gesprochene Sprache?',
	'paragraf-ohne-erklaerung': 'Braucht diese Stelle eine kurze Erklärung in eigenen Worten?'
};

export function questionFor(f: Finding): string {
	return (
		FRAGEN[f.rule] ??
		(f.axis === 'verstaendlichkeit'
			? 'Ist diese Stelle für Leserinnen und Leser ohne Vorwissen verständlich?'
			: 'Ist diese Stelle für alle Nutzenden zugänglich?')
	);
}
