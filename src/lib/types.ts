// Das Datenmodell, das alle fünf Entscheidungen des Webinars trägt.
// Siehe CLAUDE.md, Abschnitt "Das Datenmodell trägt alle fünf Entscheidungen".
// Nicht live anfassen — jedes Feld, das eine Antwortoption braucht, existiert
// bereits hier.

export type Axis = 'verstaendlichkeit' | 'zugaenglichkeit';
export type Severity = 'hoch' | 'mittel' | 'niedrig';
export type Effort = 'klein' | 'mittel' | 'gross';

// Rechteck im Seiten-Screenshot (Vollseite, CSS-Pixel, Ursprung oben links).
// Wird vom Crawl über den Selektor erfasst. null, wenn kein Element
// zuzuordnen war (z.B. Befunde auf Seitenebene wie fehlende Sprachangabe).
export type Box = { x: number; y: number; width: number; height: number };

export type Finding = {
	id: string;
	pageUrl: string;
	axis: Axis;
	rule: string; // z.B. 'satzlaenge', 'alt-text-fehlt'
	severity: Severity;
	excerpt: string; // die betroffene Stelle im Original
	selector: string | null; // CSS-Pfad für den Screenshot-Viewer
	box: Box | null; // E4 D: Lage der Stelle im Screenshot, in CSS-Pixeln der Vollseite
	machineDecidable: boolean; // E2: belegt oder Ermessensfrage
	fromLegalSource: boolean; // E2: stammt der Satz aus einem Gesetz
	legalSource: string | null; // E2: die Fundstelle, falls bekannt
	suggestion: string | null; // E4: fertiger Vorschlagstext
	suggestionAlt: string | null; // E5-Rückfall: zweite Variante
	rationale: string | null; // E4: Begründung mit Regelbezug
	effort: Effort; // E3: Priorisierung nach Aufwand
};

export type Page = {
	url: string;
	title: string;
	reach: number; // E3: Zugriffe oder Klicktiefe als Ersatz
	lebenslage: string | null; // E3: thematische Bündelung
	screenshot: string; // Pfad zur PNG
	findings: Finding[];
};

// Zwischenformat des Crawls (scripts/crawl.ts), bevor Rohanalyse und
// Modellanalyse die findings gefüllt haben.
export type RawCrawlResult = {
	crawledAt: string;
	startUrl: string;
	pages: Omit<Page, 'findings'>[];
	// Rohes DOM/Text je Seite, für die Rohanalyse (Schritt 3). Wird nicht mit
	// ausgeliefert, nur zwischen crawl.ts und analyze.ts weitergereicht.
	html: Record<string, string>;
	errors: { url: string; message: string }[];
};
