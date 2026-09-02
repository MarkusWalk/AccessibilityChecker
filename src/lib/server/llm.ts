// Providerneutrale LLM-Fassade für die Modellanalyse (scripts/analyze.ts).
// Zugang ausschließlich über Umgebungsvariablen, jede Antwort wird auf
// Platte gecacht (src/lib/data/.llm-cache/), damit ein zweiter Lauf sofort
// fertig ist. Keine Modellaufrufe im Render-Pfad der Oberfläche — diese
// Datei wird nur von den Vorbereitungs-/Analyse-Skripten importiert.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const CACHE_DIR = join(ROOT, 'src/lib/data/.llm-cache');

export interface LlmAdapter {
	readonly name: string;
	complete(prompt: string, opts?: { json?: boolean }): Promise<string>;
}

/**
 * IBM Consulting Advantage (ICA) als Default-Adapter. OpenAI-kompatibles
 * Chat-Completions-Schema, bestätigt gegen die echte API (2026-09-02):
 *
 *   POST {ICA_API_URL}/chat-models/chat/completions
 *   Body: { model, messages: [{ role: 'user', content: prompt }], stream: false }
 *   Antwort: { choices: [{ message: { content } }] }
 *
 * ICA_API_URL ist die Basis-URL ohne Pfad (Server aus der ICA-OpenAPI-Doku:
 * https://api.nextgen-beta.ica.ibm.com/ica/v1). ICA_MODEL muss eine echte
 * Modell-ID aus `GET {ICA_API_URL}/chat-models` sein, z.B.
 * "ibm/granite-4-h-small" (günstig, IBM-eigenes Modell), "claude-haiku-4-5"
 * oder "gpt-4o" — es gibt keinen sinnvollen Default, den man erraten könnte.
 */
class IcaAdapter implements LlmAdapter {
	readonly name = 'ica';
	private readonly endpoint: string;
	private readonly apiKey: string;
	private readonly model: string;

	constructor() {
		const apiUrl = process.env.ICA_API_URL;
		const apiKey = process.env.ICA_API_KEY;
		const model = process.env.ICA_MODEL;
		if (!apiUrl || !apiKey || !model) {
			throw new Error(
				'ICA_API_URL, ICA_API_KEY und ICA_MODEL müssen gesetzt sein, um LLM_PROVIDER=ica zu nutzen ' +
					'(Modell-ID aus GET {ICA_API_URL}/chat-models, z.B. "ibm/granite-4-h-small").'
			);
		}
		this.endpoint = `${apiUrl.replace(/\/$/, '')}/chat-models/chat/completions`;
		this.apiKey = apiKey;
		this.model = model;
	}

	async complete(prompt: string, opts?: { json?: boolean }): Promise<string> {
		const res = await fetch(this.endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiKey}`
			},
			body: JSON.stringify({
				model: this.model,
				messages: [{ role: 'user', content: prompt }],
				stream: false,
				// Best-effort, OpenAI-üblich — die ICA-Doku bestätigt dieses Feld
				// nicht ausdrücklich, wird bei Nichtunterstützung ignoriert statt
				// abzulehnen (getestet gegen chat-models).
				...(opts?.json ? { response_format: { type: 'json_object' } } : {})
			})
		});
		if (!res.ok) {
			let detail = '';
			try {
				const err = (await res.json()) as { detail?: string };
				detail = err.detail ?? '';
			} catch {
				// Antwort war kein JSON — Statuszeile allein reicht als Fehlermeldung.
			}
			throw new Error(
				`ICA-Anfrage fehlgeschlagen: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`
			);
		}
		const data = (await res.json()) as {
			choices?: { message?: { content?: string } }[];
		};
		const text = data.choices?.[0]?.message?.content;
		if (typeof text !== 'string') {
			throw new Error('ICA-Antwort ohne choices[0].message.content.');
		}
		return text;
	}
}

// Rule-Vorlagen für den MockAdapter. scripts/analyze.ts formatiert seine
// Prompts immer mit den Markern "Regel:", "Originalsatz:" (und optional
// "Rechtsquelle:") — das erlaubt dem Mock, ohne echtes Modell plausible,
// auf die jeweilige Regel zugeschnittene Antworten zu liefern, statt eines
// nichtssagenden Platzhaltertexts. Ein echter Adapter (z.B. ICA) bekommt
// denselben Prompt und braucht diese Struktur nicht zu kennen.
type MockTemplate = {
	suggestion: (excerpt: string, legalSource: string | null) => string;
	suggestionAlt: (excerpt: string, legalSource: string | null) => string;
	rationale: string;
	effort: 'klein' | 'mittel' | 'gross';
};

const MOCK_TEMPLATES: Record<string, MockTemplate> = {
	'alt-text-fehlt': {
		suggestion: () =>
			'Alternativtext ergänzen, der Inhalt und Zweck des Bildes in ein bis zwei Sätzen beschreibt.',
		suggestionAlt: () => 'Kurzform: Motiv und Kontext in wenigen Worten benennen (z. B. "Foto: Rathaus, Außenansicht").',
		rationale: 'Ohne Alternativtext bleibt der Bildinhalt für Screenreader-Nutzende unzugänglich (WCAG 1.1.1).',
		effort: 'klein'
	},
	'linktext-nichtssagend': {
		suggestion: () =>
			'Linktext so umformulieren, dass er das Ziel benennt, z. B. "Formular herunterladen" statt "hier klicken".',
		suggestionAlt: () => 'Alternativ: den Seitentitel des Linkziels als Linktext übernehmen.',
		rationale: 'Screenreader-Nutzende springen oft über eine Liste aller Linktexte — "hier" oder "mehr" sagt dort nichts aus.',
		effort: 'klein'
	},
	ueberschriftensprung: {
		suggestion: () => 'Zwischenüberschrift auf die nächstniedrigere Ebene setzen, damit die Gliederung lückenlos bleibt.',
		suggestionAlt: () => 'Alternativ: eine zusätzliche Zwischenebene einziehen, statt die Ebene zu überspringen.',
		rationale: 'Screenreader-Nutzende navigieren über Überschriftenebenen; ein Sprung wirkt wie eine fehlende Ebene.',
		effort: 'mittel'
	},
	'formularfeld-ohne-label': {
		suggestion: () => 'Sichtbares <label for="…"> oder aria-label ergänzen, das die Eingabe eindeutig benennt.',
		suggestionAlt: () => 'Alternativ: Platzhaltertext durch eine echte, dauerhaft sichtbare Beschriftung ersetzen.',
		rationale: 'Ohne Beschriftung ist unklar, welche Angabe erwartet wird — besonders bei Screenreadern und Spracheingabe.',
		effort: 'mittel'
	},
	'tabelle-ohne-kopfzeile': {
		suggestion: () => 'Erste Zeile oder Spalte als <th> auszeichnen, damit Zellen ihrer Überschrift zugeordnet werden.',
		suggestionAlt: () => 'Alternativ: bei komplexen Tabellen zusätzlich scope="col"/"row" setzen.',
		rationale: 'Ohne <th> liest ein Screenreader nur lose Werte ohne erkennbaren Bezug vor.',
		effort: 'mittel'
	},
	'sprachauszeichnung-fehlt': {
		suggestion: () => 'lang="de" am <html>-Element ergänzen.',
		suggestionAlt: () => 'Bei fremdsprachigen Teilbereichen zusätzlich ein lokales lang-Attribut auf dem Abschnitt setzen.',
		rationale: 'Ohne Sprachauszeichnung wählen Vorlesehilfen möglicherweise die falsche Aussprache.',
		effort: 'klein'
	},
	satzlaenge: {
		suggestion: (excerpt) => teileSatz(excerpt),
		suggestionAlt: (excerpt) => teileSatz(excerpt, true),
		rationale: 'Lange Sätze mit mehreren eingeschobenen Informationen erschweren das Verstehen — kurze Sätze mit je einem Gedanken sind leichter zu erfassen.',
		effort: 'mittel'
	},
	nebensatztiefe: {
		suggestion: () => 'Satz in zwei bis drei kurze Hauptsätze auftrennen, jeweils mit einem eigenen Gedanken.',
		suggestionAlt: () => 'Alternativ: den wichtigsten Hauptsatz zuerst nennen, Bedingungen und Ausnahmen danach.',
		rationale: 'Mehrfach verschachtelte Nebensätze verlangen, mehrere Bedingungen gleichzeitig im Kopf zu behalten.',
		effort: 'mittel'
	},
	passivanteil: {
		suggestion: () => 'Passivkonstruktion in eine aktive Formulierung mit klar benannter handelnder Stelle umwandeln.',
		suggestionAlt: () => 'Alternativ: "Sie" bzw. "Wir" als Subjekt einsetzen, um die Zuständigkeit direkt zu benennen.',
		rationale: 'Aktivsätze benennen, wer handelt — das macht Zuständigkeiten und Abläufe klarer.',
		effort: 'mittel'
	},
	nominalstil: {
		suggestion: () => 'Substantivierungen auf -ung durch Verben ersetzen (z. B. "wir prüfen" statt "die Prüfung erfolgt").',
		suggestionAlt: () => 'Alternativ: den Satz komplett aus der Sicht der handelnden Person neu aufbauen.',
		rationale: 'Nominalstil verdichtet Handlungen zu Hauptwörtern und macht Sätze abstrakter und schwerer lesbar.',
		effort: 'gross'
	},
	'paragraf-ohne-erklaerung': {
		suggestion: (_excerpt, legalSource) =>
			`Kurz erklärt: Dieser Abschnitt beruht auf ${legalSource ?? 'der genannten Rechtsgrundlage'}. Bei Fragen dazu hilft das zuständige Amt weiter.`,
		suggestionAlt: (_excerpt, legalSource) =>
			`Was das für Sie bedeutet: ${legalSource ?? 'Die genannte Vorschrift'} regelt diesen Punkt verbindlich — der Wortlaut oben bleibt unverändert.`,
		rationale: 'Ein Verweis auf eine Rechtsnorm bleibt für Laien oft unklar, ohne dass erklärt wird, was er im Alltag bedeutet.',
		effort: 'mittel'
	}
};

function teileSatz(excerpt: string, zweiteVariante = false): string {
	const trennstellen = zweiteVariante ? [' und ', '; ', ', der ', ', die ', ', das '] : [', ', '; ', ' und '];
	for (const trenner of trennstellen) {
		const idx = excerpt.indexOf(trenner);
		if (idx > 15 && idx < excerpt.length - 15) {
			const erster = excerpt.slice(0, idx).trim().replace(/[,;]$/, '') + '.';
			const zweiter = excerpt.slice(idx + trenner.length).trim();
			return `${erster} ${zweiter.charAt(0).toUpperCase()}${zweiter.slice(1)}`;
		}
	}
	return `Kürzer gefasst: ${excerpt.slice(0, Math.ceil(excerpt.length / 2)).trim()}…`;
}

/**
 * Liefert deterministische, auf die jeweilige Regel zugeschnittene
 * Platzhaltertexte, ganz ohne Netzzugang. Damit blockiert die Vorbereitung
 * nie an einem fehlenden ICA-Zugang — scripts/analyze.ts läuft mit
 * LLM_PROVIDER=mock offline durch und liefert trotzdem vorzeigbare Daten.
 */
class MockAdapter implements LlmAdapter {
	readonly name = 'mock';

	async complete(prompt: string, opts?: { json?: boolean }): Promise<string> {
		if (/Aufgabe:\s*lebenslage/.test(prompt)) {
			return this.lebenslage(prompt);
		}

		const regelMatch = prompt.match(/Regel:\s*(\S+)/);

		// Prompts außerhalb des analyze.ts-Schemas (kein "Regel:"-Marker) —
		// z.B. aus dem Chat-Endpunkt /api/chat — bekommen eine kurze, eigene
		// Antwort statt eines nichtssagenden Platzhalters. Der Mock kennt den
		// Bestand nicht wirklich; /api/chat beantwortet die typischen Fragen
		// bereits datengetrieben (answerFromData), bevor überhaupt hierher
		// verzweigt wird — diese Antwort ist also der Rückfall für alles
		// andere.
		if (!regelMatch) {
			return this.chatRueckfall(prompt);
		}

		const regel = regelMatch[1];
		const excerpt = prompt.match(/Originalsatz:\s*"([\s\S]*?)"/)?.[1] ?? '';
		const legalSource = prompt.match(/Rechtsquelle:\s*(.+)/)?.[1]?.trim() ?? null;
		const template = MOCK_TEMPLATES[regel] ?? null;

		if (!opts?.json) {
			return template
				? template.suggestion(excerpt, legalSource)
				: `[Mock] Kein Vorlagen-Eintrag für Regel "${regel}".`;
		}

		if (!template) {
			return JSON.stringify({
				suggestion: null,
				suggestionAlt: null,
				rationale: null,
				effort: 'mittel'
			});
		}

		return JSON.stringify({
			suggestion: template.suggestion(excerpt, legalSource),
			suggestionAlt: template.suggestionAlt(excerpt, legalSource),
			rationale: template.rationale,
			effort: template.effort
		});
	}

	// Kurze, unterstützende Antwort für Prompts ohne analyze.ts-Schema (der
	// Chat-Endpunkt hängt die Frage als letzte Zeile "Frage: ..." an).
	// Greift die Frage auf, statt sie zu ignorieren, und verweist auf die
	// Seitenübersicht statt etwas zu erfinden.
	private chatRueckfall(prompt: string): string {
		const frage = prompt.match(/Frage:\s*(.+)/)?.[1]?.trim();
		if (!frage) {
			return 'Dazu liegt im Mock-Modus keine Modellantwort vor.';
		}
		return `Zu "${frage}" lässt sich ohne echtes Modell keine eigene Einschätzung geben. Ein Blick in die Seitenübersicht oder das Dashboard hilft an dieser Stelle weiter.`;
	}

	private lebenslage(prompt: string): string {
		const titel = (prompt.match(/Titel:\s*(.+)/)?.[1] ?? '').toLowerCase();
		const url = (prompt.match(/URL:\s*(.+)/)?.[1] ?? '').toLowerCase();
		const text = `${titel} ${url}`;
		const treffer: [RegExp, string][] = [
			[/bauleit|bebauung|gewerbe|bau/, 'Bauen & Gewerbe'],
			[/reisepass|ausweis|formular|antrag|dokument|ummeld|meldebeh|wohnsitz/, 'Dokumente & Anträge'],
			[/kirche|verein|veranstaltung|fest|stammtisch/, 'Leben vor Ort'],
			[/bürgermeister|rat|gemeinde|verwaltung/, 'Verwaltung & Politik'],
			[/impressum|datenschutz|barrierefrei/, 'Rechtliches'],
			[/mitteilung|news|aktuell/, 'Aktuelles']
		];
		for (const [muster, label] of treffer) {
			if (muster.test(text)) return label;
		}
		return 'Allgemein';
	}
}

function createAdapter(): LlmAdapter {
	const provider = process.env.LLM_PROVIDER ?? (process.env.ICA_API_KEY ? 'ica' : 'mock');
	switch (provider) {
		case 'ica':
			return new IcaAdapter();
		case 'mock':
			return new MockAdapter();
		default:
			throw new Error(`Unbekannter LLM_PROVIDER: ${provider} (erlaubt: ica, mock)`);
	}
}

let adapter: LlmAdapter | null = null;
function getAdapter(): LlmAdapter {
	if (!adapter) adapter = createAdapter();
	return adapter;
}

function cachePathFor(adapterName: string, prompt: string, json: boolean): string {
	const hash = createHash('sha256').update(`${adapterName}:${json}:${prompt}`).digest('hex');
	return join(CACHE_DIR, `${hash}.json`);
}

/**
 * Ruft das konfigurierte Modell auf und cacht die Antwort auf Platte.
 * Gleicher Prompt + gleicher Provider -> zweiter Lauf liest nur noch die
 * Datei, ohne Netzzugriff.
 */
export async function complete(prompt: string, opts?: { json?: boolean }): Promise<string> {
	const client = getAdapter();
	const json = opts?.json ?? false;
	const cachePath = cachePathFor(client.name, prompt, json);

	if (existsSync(cachePath)) {
		const cached = JSON.parse(readFileSync(cachePath, 'utf-8')) as { response: string };
		return cached.response;
	}

	const response = await client.complete(prompt, opts);

	mkdirSync(CACHE_DIR, { recursive: true });
	writeFileSync(cachePath, JSON.stringify({ prompt, response }, null, 2), 'utf-8');

	return response;
}

export function currentProvider(): string {
	return getAdapter().name;
}
