// Klartext für die Regel-Kennungen aus dem Datenmodell. Die Kennungen
// ('alt-text-fehlt', 'nominalstil', …) bleiben in den Daten, in der
// Oberfläche steht nur noch das Label. Unbekannte Regeln fallen auf die
// Kennung zurück, damit ein Live-Crawl mit neuer Regel nichts kaputt macht.

const LABELS: Record<string, string> = {
	'alt-text-fehlt': 'Alternativtext fehlt',
	'linktext-nichtssagend': 'Linktext ohne Ziel',
	'ueberschriftensprung': 'Überschriftenebene übersprungen',
	'tabelle-ohne-kopfzeile': 'Tabelle ohne Kopfzeile',
	'formularfeld-ohne-label': 'Formularfeld ohne Beschriftung',
	satzlaenge: 'Langer Satz',
	nebensatztiefe: 'Verschachtelter Satz',
	passivanteil: 'Passiv statt Handelnde',
	nominalstil: 'Hauptwortstil',
	'paragraf-ohne-erklaerung': 'Paragraf ohne Erklärung'
};

export function ruleLabel(rule: string): string {
	return LABELS[rule] ?? rule;
}

// Regeln, deren Fundstelle eine Adresse oder ein Dateipfad ist: die Karte
// zeigt den Ausschnitt dann in Monospace und bricht ihn überall um.
const TECHNISCH = new Set(['alt-text-fehlt', 'linktext-nichtssagend', 'formularfeld-ohne-label']);

export function isTechnicalExcerpt(rule: string, excerpt: string): boolean {
	return TECHNISCH.has(rule) || /^(https?:\/\/|\/)\S+$/.test(excerpt.trim());
}

// Seitentitel aus dem Crawl tragen oft den Host als Präfix
// ("weinheim.de - Rathaus"). In Listen ist das Rauschen, der Bestand steht
// ohnehin in der Kopfleiste.
export function shortTitle(title: string): string {
	return title.replace(/^[a-z0-9.-]+\.[a-z]{2,}\s*[-–|:]\s*/i, '').trim() || title;
}
