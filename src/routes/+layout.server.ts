// Lädt den aktiven Bestand für jede Route. Der Bestand steht als
// Query-Parameter in der Adresse (?bestand=theilheim), nicht in einem Cookie:
// so ist jeder Stand teilbar, per Link umschaltbar und nach einem Hot Reload
// noch da.
//
// Alles, was die Oberfläche im Live-Build braucht, liegt danach unter
// `data.bestand.pages` — auf jeder Seite, ohne weiteren Loader.

import { listBestaende, resolveBestand } from '$lib/server/bestaende';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ url }) => {
	// Der Zugriff auf searchParams macht den Loader von der Adresse abhängig.
	// Ein goto('?bestand=…') lässt ihn darum erneut laufen, ohne Neuladen.
	const angefragt = url.searchParams.get('bestand');
	const bestand = resolveBestand(angefragt);

	return {
		bestand,
		bestaende: listBestaende()
	};
};
