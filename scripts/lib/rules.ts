// Rohanalyse: rein regelbasiert, kein Modell. Läuft über das rohe HTML einer
// Seite und erzeugt Finding[] nach dem Schema aus src/lib/types.ts. Die
// modellabhängigen Felder (suggestion, suggestionAlt, rationale, effort bei
// Urteilssachen, lebenslage) bleiben hier auf sinnvollen Platzhaltern —
// scripts/analyze.ts füllt sie in Schritt 4 nach.

import { parse, type HTMLElement } from 'node-html-parser';
import type { Finding, Axis, Severity, Effort } from '../../src/lib/types.ts';

let counter = 0;
function nextId(pageUrl: string): string {
	counter += 1;
	return `${new URL(pageUrl).pathname.replace(/\W+/g, '-') || 'root'}-${counter}`;
}

function selectorFor(el: HTMLElement): string {
	const parts: string[] = [];
	let node: HTMLElement | null = el;
	while (node && node.tagName) {
		let part = node.tagName.toLowerCase();
		if (node.id) {
			part += `#${node.id}`;
			parts.unshift(part);
			break;
		}
		const parent = node.parentNode as HTMLElement | null;
		if (parent) {
			const siblings = parent.childNodes.filter(
				(n): n is HTMLElement => (n as HTMLElement).tagName === node!.tagName
			);
			if (siblings.length > 1) {
				const index = siblings.indexOf(node) + 1;
				part += `:nth-of-type(${index})`;
			}
		}
		parts.unshift(part);
		node = parent;
	}
	return parts.join(' > ');
}

function makeFinding(
	pageUrl: string,
	axis: Axis,
	rule: string,
	severity: Severity,
	excerpt: string,
	selector: string | null,
	effort: Effort,
	overrides: Partial<Finding> = {}
): Finding {
	return {
		id: nextId(pageUrl),
		pageUrl,
		axis,
		rule,
		severity,
		excerpt: excerpt.trim().slice(0, 300),
		selector,
		machineDecidable: true,
		fromLegalSource: false,
		legalSource: null,
		suggestion: null,
		suggestionAlt: null,
		rationale: null,
		effort,
		...overrides
	};
}

const NICHTSSAGENDE_LINKTEXTE = [
	'hier',
	'hier klicken',
	'mehr',
	'mehr erfahren',
	'weiterlesen',
	'weiter',
	'klicken sie hier',
	'link'
];

// --- Zugänglichkeit ---------------------------------------------------

function findeBilderOhneAlt(root: HTMLElement, pageUrl: string): Finding[] {
	return root
		.querySelectorAll('img')
		.filter((img) => !img.getAttribute('alt')?.trim())
		.map((img) =>
			makeFinding(
				pageUrl,
				'zugaenglichkeit',
				'alt-text-fehlt',
				'hoch',
				img.getAttribute('src') ?? '(ohne src)',
				selectorFor(img),
				'klein'
			)
		);
}

function findeNichtssagendeLinktexte(root: HTMLElement, pageUrl: string): Finding[] {
	return root
		.querySelectorAll('a')
		.filter((a) => {
			const text = a.textContent.trim().toLowerCase();
			return text.length === 0 || NICHTSSAGENDE_LINKTEXTE.includes(text);
		})
		.map((a) =>
			makeFinding(
				pageUrl,
				'zugaenglichkeit',
				'linktext-nichtssagend',
				'mittel',
				a.textContent.trim() || '(leerer Linktext)',
				selectorFor(a),
				'klein'
			)
		);
}

function findeUeberschriftenspruenge(root: HTMLElement, pageUrl: string): Finding[] {
	const headings = root.querySelectorAll('h1,h2,h3,h4,h5,h6');
	const findings: Finding[] = [];
	let lastLevel = 0;
	for (const h of headings) {
		const level = Number(h.tagName.slice(1));
		if (lastLevel > 0 && level - lastLevel > 1) {
			findings.push(
				makeFinding(
					pageUrl,
					'zugaenglichkeit',
					'ueberschriftensprung',
					'mittel',
					`${h.tagName} nach h${lastLevel}: "${h.textContent.trim()}"`,
					selectorFor(h),
					'mittel'
				)
			);
		}
		lastLevel = level;
	}
	return findings;
}

function findeFormularfelderOhneLabel(root: HTMLElement, pageUrl: string): Finding[] {
	const findings: Finding[] = [];
	const felder = root.querySelectorAll('input,select,textarea');
	for (const feld of felder) {
		const type = feld.getAttribute('type');
		if (type === 'hidden' || type === 'submit' || type === 'button') continue;
		const id = feld.getAttribute('id');
		const hasAriaLabel =
			feld.getAttribute('aria-label') || feld.getAttribute('aria-labelledby');
		const hasLabel = id && root.querySelector(`label[for="${id}"]`);
		const isInsideLabel = feld.closest('label') !== null;
		if (!hasAriaLabel && !hasLabel && !isInsideLabel) {
			findings.push(
				makeFinding(
					pageUrl,
					'zugaenglichkeit',
					'formularfeld-ohne-label',
					'hoch',
					feld.getAttribute('name') ?? feld.getAttribute('placeholder') ?? '(unbenanntes Feld)',
					selectorFor(feld),
					'mittel'
				)
			);
		}
	}
	return findings;
}

function findeTabellenOhneKopfzeile(root: HTMLElement, pageUrl: string): Finding[] {
	return root
		.querySelectorAll('table')
		.filter((table) => table.querySelectorAll('th').length === 0)
		.map((table) =>
			makeFinding(
				pageUrl,
				'zugaenglichkeit',
				'tabelle-ohne-kopfzeile',
				'mittel',
				table.textContent.trim().slice(0, 100),
				selectorFor(table),
				'mittel'
			)
		);
}

function findeFehlendeSprachauszeichnung(root: HTMLElement, pageUrl: string): Finding[] {
	const html = root.querySelector('html');
	if (html && !html.getAttribute('lang')?.trim()) {
		return [
			makeFinding(
				pageUrl,
				'zugaenglichkeit',
				'sprachauszeichnung-fehlt',
				'mittel',
				'<html> ohne lang-Attribut',
				'html',
				'klein'
			)
		];
	}
	return [];
}

// --- Verständlichkeit --------------------------------------------------

const SATZLAENGE_SCHWELLWERT = 25; // Wörter
const NEBENSATZ_MARKER =
	/\b(dass|weil|obwohl|wenn|während|damit|sodass|indem|nachdem|bevor|falls|soweit|sofern)\b/gi;
const PASSIV_MUSTER = /\b(wird|werden|wurde|wurden|worden)\b\s+\w+(t|en|et)\b/gi;
const NOMINALSTIL_MUSTER = /\b\w+ung(en)?\b/gi;
// § BauGB / SGB / Art. DSGVO — beide Zitierformen deutscher Verwaltungstexte.
const PARAGRAF_MUSTER =
	/(§+\s?\d+[a-z]?|Art(?:\.|ikel)\s?\d+[a-z]?)(\s?(Abs\.|Absatz)\s?\d+)?(\s?(lit\.|Buchst\.)\s?[a-z])?\s?[A-ZÄÖÜ][\wÄÖÜäöüß]*/g;
const ERKLAERUNGS_HINWEISE = /\b(das (bedeutet|heißt)|das ist|kurz gesagt|einfacher gesagt)\b/i;

// Häufige Abkürzungen, an denen nicht getrennt werden soll (sonst zerreißt
// z.B. "§ 12 Abs. 2 SGB II" in zwei Sätze).
const ABKUERZUNGEN = ['Abs', 'Art', 'Nr', 'bzw', 'ca', 'ggf', 'z.B', 'u.a', 'i.d.R', 'Std', 'Dr', 'Prof'];

function splitSaetze(text: string): string[] {
	let geschuetzt = text.replace(/\s+/g, ' ');
	for (const abk of ABKUERZUNGEN) {
		geschuetzt = geschuetzt.replaceAll(`${abk}.`, `${abk}__DOT__`);
	}
	return geschuetzt
		.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
		.map((s) => s.replaceAll('__DOT__', '.').trim())
		.filter((s) => s.length > 0);
}

function textBloecke(root: HTMLElement): HTMLElement[] {
	return root.querySelectorAll('p,li,td,dd').filter((el) => el.textContent.trim().length > 0);
}

function findeSatzlaenge(root: HTMLElement, pageUrl: string): Finding[] {
	const findings: Finding[] = [];
	for (const block of textBloecke(root)) {
		for (const satz of splitSaetze(block.textContent)) {
			const woerter = satz.split(/\s+/).filter(Boolean).length;
			if (woerter > SATZLAENGE_SCHWELLWERT) {
				findings.push(
					makeFinding(
						pageUrl,
						'verstaendlichkeit',
						'satzlaenge',
						woerter > SATZLAENGE_SCHWELLWERT * 1.5 ? 'hoch' : 'mittel',
						satz,
						selectorFor(block),
						'mittel'
					)
				);
			}
		}
	}
	return findings;
}

function findeNebensatztiefe(root: HTMLElement, pageUrl: string): Finding[] {
	const findings: Finding[] = [];
	for (const block of textBloecke(root)) {
		for (const satz of splitSaetze(block.textContent)) {
			const marker = satz.match(NEBENSATZ_MARKER)?.length ?? 0;
			const kommata = (satz.match(/,/g) ?? []).length;
			if (marker >= 2 || kommata >= 3) {
				findings.push(
					makeFinding(
						pageUrl,
						'verstaendlichkeit',
						'nebensatztiefe',
						marker + kommata >= 5 ? 'hoch' : 'mittel',
						satz,
						selectorFor(block),
						'mittel'
					)
				);
			}
		}
	}
	return findings;
}

function findePassivanteil(root: HTMLElement, pageUrl: string): Finding[] {
	const findings: Finding[] = [];
	for (const block of textBloecke(root)) {
		for (const satz of splitSaetze(block.textContent)) {
			const treffer = satz.match(PASSIV_MUSTER)?.length ?? 0;
			if (treffer >= 1) {
				findings.push(
					makeFinding(
						pageUrl,
						'verstaendlichkeit',
						'passivanteil',
						treffer >= 2 ? 'hoch' : 'niedrig',
						satz,
						selectorFor(block),
						'mittel'
					)
				);
			}
		}
	}
	return findings;
}

function findeNominalstil(root: HTMLElement, pageUrl: string): Finding[] {
	const findings: Finding[] = [];
	for (const block of textBloecke(root)) {
		for (const satz of splitSaetze(block.textContent)) {
			const treffer = satz.match(NOMINALSTIL_MUSTER)?.length ?? 0;
			if (treffer >= 3) {
				findings.push(
					makeFinding(
						pageUrl,
						'verstaendlichkeit',
						'nominalstil',
						treffer >= 5 ? 'hoch' : 'mittel',
						satz,
						selectorFor(block),
						'gross'
					)
				);
			}
		}
	}
	return findings;
}

function findeParagrafenOhneErklaerung(root: HTMLElement, pageUrl: string): Finding[] {
	const findings: Finding[] = [];
	for (const block of textBloecke(root)) {
		for (const satz of splitSaetze(block.textContent)) {
			const treffer = satz.match(PARAGRAF_MUSTER);
			if (treffer && !ERKLAERUNGS_HINWEISE.test(satz)) {
				findings.push(
					makeFinding(
						pageUrl,
						'verstaendlichkeit',
						'paragraf-ohne-erklaerung',
						'mittel',
						satz,
						selectorFor(block),
						'mittel',
						{
							// Mechanisch erkennbar: Der Satz zitiert eine Rechtsquelle.
							// legalSource bleibt die rohe Fundstelle, bis Schritt 4 sie
							// bei Bedarf gegen die echte Norm prüft/ergänzt.
							fromLegalSource: true,
							legalSource: treffer[0]
						}
					)
				);
			}
		}
	}
	return findings;
}

export function analysePage(html: string, pageUrl: string): Finding[] {
	const root = parse(html);
	return [
		...findeBilderOhneAlt(root, pageUrl),
		...findeNichtssagendeLinktexte(root, pageUrl),
		...findeUeberschriftenspruenge(root, pageUrl),
		...findeFormularfelderOhneLabel(root, pageUrl),
		...findeTabellenOhneKopfzeile(root, pageUrl),
		...findeFehlendeSprachauszeichnung(root, pageUrl),
		...findeSatzlaenge(root, pageUrl),
		...findeNebensatztiefe(root, pageUrl),
		...findePassivanteil(root, pageUrl),
		...findeNominalstil(root, pageUrl),
		...findeParagrafenOhneErklaerung(root, pageUrl)
	];
}
