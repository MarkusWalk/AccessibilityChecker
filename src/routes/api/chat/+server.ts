// Endpunkt für E1 Archetyp A (Chat.svelte, Stufe 4). Nimmt eine Frage
// entgegen, baut aus einem geladenen Bestand einen kompakten Kontext und
// ruft `complete()` aus src/lib/server/llm.ts auf — der Plattencache dort
// greift automatisch, ein zweiter Lauf mit derselben Frage ist sofort
// fertig. Kein Modellaufruf im Render-Pfad der Oberfläche, nur hier im
// Server-Endpunkt.
//
// POST { bestand: string, question: string, history?: {role, text}[] }
//   -> 200 { answer: string, provider: string, source?: 'daten' | 'modell', error?: string }
// Fehler landen immer mit Status 200 und einer unterstützenden
// Ausweichantwort — der Chat soll nie mit einem rohen Fehlerzustand enden.
//
// Zwei Antwortpfade: `answerFromData()` beantwortet typische Fragen direkt
// aus dem geladenen Bestand (Schlüsselwörter, keine Modellkosten, immer
// verfügbar). Bei `LLM_PROVIDER=mock` ist das der primäre Pfad, weil die
// Probe/Demo ohne ICA-Zugang läuft; bei einem echten Provider ist es nur
// der Rückfall, falls der Modellaufruf fehlschlägt. `source` im Ergebnis
// sagt, welcher Pfad geantwortet hat.

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolveBestand } from '$lib/server/bestaende';
import { complete, currentProvider } from '$lib/server/llm';
import type { Finding, Page } from '$lib/types';

const MAX_CONTEXT_CHARS = 12000;
const AUSWEICHANTWORT = 'Das System kann diese Frage gerade nicht beantworten.';

const SEVERITY_RANG: Record<Finding['severity'], number> = { hoch: 0, mittel: 1, niedrig: 2 };

type Verlaufseintrag = { role: 'user' | 'assistant'; text: string };
type Quelle = 'daten' | 'modell';

// Je Seite: Titel, URL, Befundzahl je Achse, die fünf schwersten Befunde
// mit Regel und Auszug. Gekürzt, falls der Gesamtkontext zu groß wird.
function buildContext(pages: Page[]): string {
	const bloecke = pages.map((page) => {
		const jeAchse = { verstaendlichkeit: 0, zugaenglichkeit: 0 };
		for (const f of page.findings) jeAchse[f.axis]++;

		const schwerste = [...page.findings]
			.sort((a, b) => SEVERITY_RANG[a.severity] - SEVERITY_RANG[b.severity])
			.slice(0, 5);
		const zeilen = schwerste.map((f) => `  - ${f.rule}: "${f.excerpt}"`).join('\n');

		return [
			`Seite: ${page.title}`,
			`URL: ${page.url}`,
			`Verständlichkeit: ${jeAchse.verstaendlichkeit} Hinweise, Zugänglichkeit: ${jeAchse.zugaenglichkeit} Hinweise`,
			zeilen ? `Wichtigste Stellen:\n${zeilen}` : null
		]
			.filter((z): z is string => z !== null)
			.join('\n');
	});

	let context = bloecke.join('\n\n');
	if (context.length > MAX_CONTEXT_CHARS) {
		context = context.slice(0, MAX_CONTEXT_CHARS) + '\n…(gekürzt)';
	}
	return context;
}

function buildPrompt(
	bestandLabel: string,
	context: string,
	question: string,
	history: Verlaufseintrag[]
): string {
	const verlauf = history.map((m) => `${m.role === 'user' ? 'Frage' : 'Antwort'}: ${m.text}`).join('\n');

	return [
		'Du bist eine unterstützende Auskunft zu einer Prüfung von Verständlichkeit und',
		'Zugänglichkeit auf den Webseiten einer Behörde. Antworte ausschließlich auf',
		'Grundlage der unten stehenden Befunde, nicht aus eigenem Wissen. Nenne',
		'betroffene Seiten mit ihrer URL. Der Ton ist unterstützend: ein Befund ist ein',
		'Hinweis, kein Vorwurf. Vermeide Wörter wie "Fehler" oder "Verstoß" und vergib',
		'keine Noten oder Punktzahlen. Antworte auf Deutsch, in wenigen Sätzen. Wenn',
		'sich die Frage aus den Befunden nicht beantworten lässt, sag das offen, statt',
		'etwas zu erfinden.',
		'',
		`Bestand: ${bestandLabel}`,
		'',
		context,
		verlauf ? `\nBisheriger Verlauf:\n${verlauf}` : '',
		'',
		`Frage: ${question}`
	]
		.filter((zeile) => zeile !== '')
		.join('\n');
}

function providerOderUnbekannt(): string {
	try {
		return currentProvider();
	} catch {
		return 'unbekannt';
	}
}

function seitenBezug(page: Page): string {
	return `${page.title} (${page.url})`;
}

function achseLabel(axis: Finding['axis']): string {
	return axis === 'verstaendlichkeit' ? 'Verständlichkeit' : 'Zugänglichkeit';
}

// Datengetriebener Antwortpfad: beantwortet typische Fragen direkt aus dem
// geladenen Bestand, per Schlüsselwort erkannt — kein Modellaufruf nötig.
// Liefert `null`, wenn keine der bekannten Fragen erkannt wurde (dann geht
// es zum Modell weiter). Ton unterstützend, nennt Seiten mit Titel und URL
// und konkrete Zahlen, keine Noten, keine Wörter wie "Fehler"/"Verstoß".
function answerFromData(question: string, pages: Page[]): string | null {
	const q = question.toLowerCase();

	if (pages.length === 0) {
		return 'Der Bestand enthält aktuell keine geprüften Seiten.';
	}

	// "Welche Seite hat die meisten Hinweise?"
	if (/meiste/.test(q) && /(hinweis|befund)/.test(q)) {
		const top = [...pages].sort((a, b) => b.findings.length - a.findings.length)[0];
		return `Die meisten Hinweise hat ${seitenBezug(top)}, mit ${top.findings.length} Hinweisen.`;
	}

	// "Wie viele Hinweise gibt es?"
	if (/wie\s*viele/.test(q) && /(hinweis|befund)/.test(q)) {
		const gesamt = pages.reduce((n, p) => n + p.findings.length, 0);
		return `Insgesamt gibt es ${gesamt} Hinweise auf ${pages.length} geprüften Seiten.`;
	}

	// "Was ist am schwersten?"
	if (/schwer(st|ste|sten|es)/.test(q)) {
		const schwerste = pages.flatMap((p) => p.findings.map((f) => ({ f, p }))).filter(({ f }) => f.severity === 'hoch');
		if (schwerste.length === 0) {
			return 'Es gibt aktuell keine Hinweise mit hoher Schwere im Bestand.';
		}
		const beispiele = schwerste
			.slice(0, 3)
			.map(({ f, p }) => `${f.rule} auf ${seitenBezug(p)}`)
			.join('; ');
		return `${schwerste.length} Hinweise sind mit hoher Schwere eingestuft, zum Beispiel ${beispiele}.`;
	}

	// "Welche Seiten betreffen Gesetzestext?"
	if (/gesetz/.test(q)) {
		const seiten = pages.filter((p) => p.findings.some((f) => f.fromLegalSource));
		if (seiten.length === 0) {
			return 'Keine der Seiten hat aktuell Hinweise mit Bezug zu einem Gesetzestext.';
		}
		return `Gesetzestext betrifft: ${seiten.map(seitenBezug).join(', ')}.`;
	}

	// "Was ist schnell erledigt?"
	if (/schnell/.test(q) || /geringe(r|m|n)?\s*aufwand/.test(q) || /klein(er|em|en)?\s*aufwand/.test(q)) {
		const klein = pages.flatMap((p) => p.findings.map((f) => ({ f, p }))).filter(({ f }) => f.effort === 'klein');
		if (klein.length === 0) {
			return 'Es sind aktuell keine Hinweise mit geringem Aufwand hinterlegt.';
		}
		const beispiele = klein
			.slice(0, 3)
			.map(({ f, p }) => `${f.rule} auf ${seitenBezug(p)}`)
			.join('; ');
		return `${klein.length} Hinweise sind mit geringem Aufwand erledigt, zum Beispiel ${beispiele}.`;
	}

	// "Was betrifft Verständlichkeit / Zugänglichkeit?"
	if (/(verständlichkeit|zugänglichkeit)/.test(q)) {
		const achse: Finding['axis'] = /verständlichkeit/.test(q) ? 'verstaendlichkeit' : 'zugaenglichkeit';
		const anzahl = pages.reduce((n, p) => n + p.findings.filter((f) => f.axis === achse).length, 0);
		const seiten = pages.filter((p) => p.findings.some((f) => f.axis === achse));
		if (seiten.length === 0) {
			return `Zur Achse ${achseLabel(achse)} gibt es aktuell keine Hinweise.`;
		}
		return `${anzahl} Hinweise betreffen ${achseLabel(achse)}, auf ${seiten.length} Seiten, unter anderem ${seiten
			.slice(0, 3)
			.map(seitenBezug)
			.join(', ')}.`;
	}

	// "Zeig mir die Startseite"
	if (/startseite/.test(q)) {
		const start =
			pages.find((p) => /startseite/i.test(p.title)) ??
			[...pages].sort((a, b) => a.url.length - b.url.length)[0];
		return `Die Startseite ist ${seitenBezug(start)}, mit ${start.findings.length} Hinweisen.`;
	}

	return null;
}

export const POST: RequestHandler = async ({ request }) => {
	let body: { bestand?: string; question?: string; history?: Verlaufseintrag[] };
	try {
		body = await request.json();
	} catch {
		return json(
			{ answer: AUSWEICHANTWORT, provider: providerOderUnbekannt(), error: 'Ungültige Anfrage.' },
			{ status: 200 }
		);
	}

	const question = body.question?.trim();
	if (!question) {
		return json(
			{ answer: AUSWEICHANTWORT, provider: providerOderUnbekannt(), error: 'Keine Frage übermittelt.' },
			{ status: 200 }
		);
	}

	const { name, pages } = resolveBestand(body.bestand ?? null);
	const provider = providerOderUnbekannt();

	// Mock-Modus: der Datenpfad ist der primäre Weg (die Probe/Demo läuft
	// ohne ICA-Zugang) — erst wenn keine der bekannten Fragen erkannt wird,
	// geht es zum Modellaufruf weiter.
	if (provider === 'mock') {
		const datenAntwort = answerFromData(question, pages);
		if (datenAntwort) {
			return json({ answer: datenAntwort, provider, source: 'daten' satisfies Quelle });
		}
	}

	try {
		const context = buildContext(pages);
		const prompt = buildPrompt(name, context, question, body.history ?? []);
		const answer = await complete(prompt);
		return json({ answer, provider: currentProvider(), source: 'modell' satisfies Quelle });
	} catch (err) {
		// Echter Provider, Modellaufruf fehlgeschlagen: Datenpfad als
		// Rückfall versuchen, bevor die Ausweichantwort greift.
		const datenAntwort = answerFromData(question, pages);
		if (datenAntwort) {
			return json({ answer: datenAntwort, provider, source: 'daten' satisfies Quelle });
		}
		return json(
			{
				answer: AUSWEICHANTWORT,
				provider,
				error: err instanceof Error ? err.message : 'Unbekannter Fehler.'
			},
			{ status: 200 }
		);
	}
};

export const GET: RequestHandler = async () => {
	return json({
		beschreibung:
			'POST { bestand: string, question: string, history?: {role, text}[] } -> { answer, provider, source }',
		hinweis:
			'Antwortet ausschließlich aus dem geladenen Bestand (src/lib/server/bestaende.ts), kein freier Modellzugriff. source ist "daten" (direkt aus dem Bestand beantwortet) oder "modell" (über complete() aus llm.ts). Fehler kommen als 200 mit answer/error zurück.'
	});
};
