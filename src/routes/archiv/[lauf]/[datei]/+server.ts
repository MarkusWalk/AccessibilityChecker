// Liefert einzelne Screenshot-Dateien aus docs/archiv/<lauf>/<datei> aus —
// docs/ liegt außerhalb von static/, darum dieser kleine Ausgabepunkt statt
// eines öffentlichen Assets. Nur PNGs, nur innerhalb von docs/archiv, kein
// Pfad-Escape (resolve()+startsWith-Prüfung statt Regex allein).
import { error } from '@sveltejs/kit';
import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import type { RequestHandler } from './$types';

const ARCHIV_DIR = resolve(process.cwd(), 'docs', 'archiv');

export const GET: RequestHandler = ({ params }) => {
	const { lauf, datei } = params;

	if (!datei.toLowerCase().endsWith('.png')) {
		error(400, 'Nur PNG-Dateien');
	}

	const ordnerPfad = resolve(ARCHIV_DIR, lauf);
	if (ordnerPfad !== ARCHIV_DIR && !ordnerPfad.startsWith(ARCHIV_DIR + sep)) {
		error(400, 'Ungültiger Pfad');
	}

	const dateiPfad = resolve(ordnerPfad, datei);
	if (!dateiPfad.startsWith(ordnerPfad + sep)) {
		error(400, 'Ungültiger Pfad');
	}

	try {
		const bytes = readFileSync(dateiPfad);
		return new Response(bytes, {
			headers: { 'content-type': 'image/png', 'cache-control': 'no-store' }
		});
	} catch {
		error(404, 'Datei nicht gefunden');
	}
};
