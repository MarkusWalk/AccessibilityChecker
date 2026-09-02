<svelte:head>
	<title>Über dieses Werkzeug — AccessibilityChecker</title>
</svelte:head>

<div class="page container">
	<p class="kicker">Über dieses Werkzeug</p>
	<h1>Eine Arbeitsliste, <span class="akzent">keine Note</span></h1>

	<div class="spalten">
		<div class="text">
			<h2>Was es tut</h2>
			<p>
				Das Werkzeug liest den Webauftritt eines Hauses und prüft ihn auf zwei Achsen.
				<strong>Verständlichkeit</strong>: Schachtelsätze, Passivketten, unerklärte Fachbegriffe, Paragrafenverweise
				ohne Erklärung. <strong>Zugänglichkeit</strong>: fehlende Alternativtexte, Überschriften ohne
				Ordnung, Linktexte wie „hier klicken“, Text in Bildern.
			</p>
			<p>
				Geprüft wird ein Bestand von vielen Seiten, nicht eine einzelne Seite. Jeder Hinweis nennt
				die Stelle im Original und, wo es geht, einen Vorschlag. Was daraus wird, entscheiden die
				Menschen im Haus.
			</p>

			<h2>Was es nicht tut</h2>
			<p>
				Es vergibt keine Note und keine Punktzahl. Es stellt nichts fest, was ein Mensch besser
				beurteilt. Wie weit es bei Sätzen aus einer Rechtsquelle geht, entscheidet das Haus, nicht eine Voreinstellung.
			</p>

			<div class="block-gestrichelt">
				<p class="kicker">Wichtig</p>
				<p>
					Dieses Werkzeug ist kein Konformitätsnachweis nach BITV und ersetzt keine Prüfung durch
					eine Überwachungsstelle.
				</p>
			</div>
		</div>

		<aside class="block-blau">
			<p class="kicker">Souveränität</p>
			<p class="gross">
				Jede Voreinstellung ist eine <span class="akzent">Entscheidung</span>. Wer den Prototyp
				selbst baut, trifft sie selbst.
			</p>
			<p class="quelle">Webinar „Souveränität beginnt beim Prototyp“ · IBM iX</p>
		</aside>
	</div>
</div>

<style>
	.page {
		padding-bottom: var(--space-7);
	}

	h1 {
		margin: 0 0 var(--space-6) 0;
		max-width: 20ch;
	}

	h2 {
		font-size: var(--font-size-h3);
		margin-top: var(--space-5);
	}

	h2:first-child {
		margin-top: 0;
	}

	.spalten {
		display: grid;
		grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
		gap: var(--space-7);
		align-items: start;
	}

	.text p {
		max-width: 62ch;
		margin: 0 0 var(--space-3) 0;
	}

	.block-gestrichelt {
		margin-top: var(--space-5);
	}

	.block-gestrichelt p:last-child {
		margin: 0;
		max-width: 60ch;
	}

	aside {
		/* Der Versatz braucht rechts und unten Platz, sonst schneidet ihn das
		   Raster ab. */
		margin: 0 8px 8px 0;
	}

	aside p {
		margin: 0;
	}

	.gross {
		font-size: var(--font-size-h3);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-heading);
		letter-spacing: -0.02em;
		margin-bottom: var(--space-4);
	}

	.quelle {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: var(--letter-spacing-kicker);
		text-transform: uppercase;
		color: var(--color-blue-light);
	}

	@media (max-width: 60rem) {
		.spalten {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--space-6);
		}
	}
</style>
