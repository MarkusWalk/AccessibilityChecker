// Backstage-Route, nicht Teil des Live-Builds und nicht in der
// Hauptnavigation verlinkt: falls am Tag selbst ein Bauschritt klemmt, zeigt
// diese Seite die archivierten Probeläufe aus docs/archiv/ — Screenshot je
// Entscheidung, plus die README zum jeweiligen Durchlauf. Reines Nachschlagen,
// keine Interaktion mit dem laufenden Bestand.
//
// Läuft nur, solange docs/ neben dem Prozess liegt (lokaler Dev-Server, wie
// im ganzen Projekt vorausgesetzt) — kein Produktions-Deploy-Fall hier.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { PageServerLoad } from './$types';

const ARCHIV_DIR = join(process.cwd(), 'docs', 'archiv');

export type ArchivLauf = {
	name: string;
	titel: string;
	readme: string;
	bilder: string[];
};

export const load: PageServerLoad = () => {
	let ordnernamen: string[] = [];
	try {
		ordnernamen = readdirSync(ARCHIV_DIR)
			.filter((name) => statSync(join(ARCHIV_DIR, name)).isDirectory())
			.sort();
	} catch {
		// docs/archiv existiert nicht (noch kein Probelauf archiviert) — leere Liste.
	}

	const laeufe: ArchivLauf[] = ordnernamen.map((name) => {
		const ordnerPfad = join(ARCHIV_DIR, name);

		let readme = '';
		try {
			readme = readFileSync(join(ordnerPfad, 'README.md'), 'utf-8');
		} catch {
			readme = '';
		}

		let bilder: string[] = [];
		try {
			bilder = readdirSync(ordnerPfad)
				.filter((datei) => datei.toLowerCase().endsWith('.png'))
				.sort();
		} catch {
			bilder = [];
		}

		const ersteZeile = readme.split('\n')[0]?.replace(/^#+\s*/, '').trim();
		const titel = ersteZeile || name;

		return { name, titel, readme, bilder };
	});

	return { laeufe };
};
