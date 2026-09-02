// Vorbereitung für einen wahrscheinlichen E5-Wunsch: Export der Befunde als
// CSV oder Markdown. Ungenutzt, bis live eine Export-Schaltfläche entsteht —
// dann reicht ein Button, der `toCsv`/`toMarkdown` aufruft und das Ergebnis
// mit `download()` als Datei anbietet.

import type { Page, Finding } from '$lib/types';

function alleFindings(pages: Page[]): (Finding & { pageTitle: string })[] {
	return pages.flatMap((page) => page.findings.map((f) => ({ ...f, pageTitle: page.title })));
}

function csvFeld(wert: string | number | boolean | null): string {
	const text = wert === null ? '' : String(wert);
	return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(pages: Page[]): string {
	const spalten = [
		'seite',
		'achse',
		'regel',
		'schwere',
		'aufwand',
		'ausschnitt',
		'rechtsquelle',
		'vorschlag'
	];
	const zeilen = alleFindings(pages).map((f) =>
		[f.pageTitle, f.axis, f.rule, f.severity, f.effort, f.excerpt, f.legalSource, f.suggestion]
			.map(csvFeld)
			.join(',')
	);
	return [spalten.join(','), ...zeilen].join('\n');
}

export function toMarkdown(pages: Page[]): string {
	const zeilen: string[] = ['# Befunde', ''];
	for (const page of pages) {
		if (page.findings.length === 0) continue;
		zeilen.push(`## ${page.title}`, '');
		for (const f of page.findings) {
			zeilen.push(`- **${f.rule}** (${f.severity}, ${f.axis}): ${f.excerpt}`);
			if (f.suggestion) zeilen.push(`  - Vorschlag: ${f.suggestion}`);
			if (f.legalSource) zeilen.push(`  - Rechtsquelle: ${f.legalSource}`);
		}
		zeilen.push('');
	}
	return zeilen.join('\n');
}

// Löst im Browser einen Datei-Download aus. Läuft nur clientseitig (Aufruf
// aus einem Button-Handler) — ohne `document` (z.B. während SSR importiert,
// aber nicht ausgeführt) passiert nichts.
export function download(filename: string, text: string): void {
	if (typeof document === 'undefined') return;
	const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
