// Einmaliges Merge-Script: korrigiert `machineDecidable` in bereits
// analysierten Beständen (src/lib/data/<bestand>.json), ohne einen neuen
// Crawl oder eine neue Modellanalyse zu brauchen — alle anderen Felder
// (suggestion, rationale, fromLegalSource, effort, box, ...) bleiben
// unverändert.
//
// Hintergrund (E2 C, "Beim Ermessen"): scopeFor(finding, 'ermessen') zeigt
// den Modus 'frage' nur, wenn machineDecidable === false vorkommt. Bis zu
// diesem Fix stand es bei jedem Befund auf true (Default in
// scripts/lib/rules.ts::makeFinding), Option C hatte darum keine sichtbare
// Wirkung.
//
// Regel:
// - Zugänglichkeit ist mechanisch prüfbar (Attribut da oder nicht, Ebene
//   da oder nicht) -> machineDecidable: true.
// - Verständlichkeit außer Paragrafenverweis ist Ermessenssache (ist der
//   Satz "zu lang", ist der Nominalstil "zu dicht"?) -> false.
// - paragraf-ohne-erklaerung: der Verweis selbst ist belegbar (Zitat da
//   oder nicht) -> true. fromLegalSource bleibt unangetastet.
//
// scripts/lib/rules.ts erzeugt neue Bestände inzwischen direkt korrekt;
// dieses Script holt nur bereits vorhandene *.json nach.
//
// Aufruf:
//   npx tsx scripts/fix-machine-decidable.ts <bestand> [<bestand> ...]
//   (liest und schreibt src/lib/data/<bestand>.json)

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page as Bestandsseite } from '../src/lib/types.ts';

const ROOT = join(import.meta.dirname, '..');

// Deckt alle Regeln ab, die scripts/lib/rules.ts aktuell erzeugt.
const ERMESSENS_REGELN = new Set(['satzlaenge', 'nebensatztiefe', 'passivanteil', 'nominalstil']);

function korrigiereMachineDecidable(rule: string): boolean {
	return !ERMESSENS_REGELN.has(rule);
}

function main() {
	const bestaende = process.argv.slice(2);
	if (bestaende.length === 0) {
		console.error('Nutzung: npx tsx scripts/fix-machine-decidable.ts <bestand> [<bestand> ...]');
		process.exit(1);
	}

	for (const bestand of bestaende) {
		const dataPath = join(ROOT, 'src/lib/data', `${bestand}.json`);
		const pages = JSON.parse(readFileSync(dataPath, 'utf-8')) as Bestandsseite[];

		let gesamt = 0;
		let ermessen = 0;
		for (const seite of pages) {
			for (const f of seite.findings) {
				gesamt += 1;
				f.machineDecidable = korrigiereMachineDecidable(f.rule);
				if (!f.machineDecidable) ermessen += 1;
			}
		}

		writeFileSync(dataPath, JSON.stringify(pages, null, '\t') + '\n', 'utf-8');
		console.log(`${bestand}: machineDecidable false ${ermessen} / ${gesamt} gesamt`);
	}
}

main();
