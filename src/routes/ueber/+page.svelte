<svelte:head>
	<title>Über dieses Werkzeug — AccessibilityChecker</title>
</svelte:head>

<div class="page">
	<p class="kicker">Über dieses Werkzeug</p>
	<h1>Was der AccessibilityChecker tut — und was nicht</h1>

	<p>
		Das Werkzeug prüft den Webauftritt einer Behörde auf zwei Achsen:
		Verständlichkeit (Schachtelsätze, Passivketten, unerklärte Fachbegriffe,
		Paragrafenverweise ohne Erklärung) und Zugänglichkeit (fehlende
		Alternativtexte, Überschriftenstruktur ohne Ordnung, Linktexte wie
		„hier klicken“, Text in Bildern).
	</p>

	<p>
		Geprüft wird ein Bestand von vielen Seiten, nicht eine einzelne Seite.
		Der Rahmen ist Unterstützung. Es gibt keine Note für ein Haus, es gibt
		eine Arbeitsliste.
	</p>

	<div class="hinweis-box">
		<strong>Kein Konformitätsnachweis.</strong>
		<p>
			Dieses Werkzeug ist kein Konformitätsnachweis nach BITV und ersetzt
			keine Prüfung durch eine Überwachungsstelle.
		</p>
	</div>
</div>

<style>
	.page {
		padding: var(--space-5);
		max-width: 640px;
	}

	h1 {
		margin: 0 0 var(--space-4) 0;
	}

	p {
		line-height: var(--line-height-body);
	}

	.hinweis-box {
		margin-top: var(--space-4);
		border-left: 3px solid var(--color-magenta);
		background: var(--color-surface-tint);
		padding: var(--space-3);
	}

	.hinweis-box strong {
		display: block;
		margin-bottom: var(--space-1);
		color: var(--color-magenta);
	}

	.hinweis-box p {
		margin: 0;
	}
</style>
