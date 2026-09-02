// Typen für die Gerüst-Bausteine des Themes.
//
// `BestandListe` beschreibt dieselbe Form wie `BestandInfo` aus
// `src/lib/server/bestaende.ts`. Sie steht hier noch einmal, weil Topbar und
// Bestände-Seite Client-Code sind und aus `$lib/server/` nichts importieren
// dürfen — auch keinen Typ.

export type BestandListe = {
	name: string; // Dateiname ohne .json, z.B. 'theilheim'
	label: string; // Anzeigename, z.B. 'Theilheim'
	pages: number;
	findings: number;
	live: boolean; // stammt aus dem Hintergrund-Crawl
};
