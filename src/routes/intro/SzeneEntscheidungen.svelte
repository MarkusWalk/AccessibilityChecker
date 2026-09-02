<!-- Szene 3: Die fünf Abstimmungen. Karten fahren nacheinander von unten ein. -->
<script lang="ts">
	const karten = [
		{ nr: 'E1', frage: 'Sie öffnen das Werkzeug. Was sehen Sie zuerst?', wirkt: 'Die ganze Oberfläche' },
		{ nr: 'E2', frage: 'Wo hört die Zuständigkeit des Systems auf?', wirkt: 'Jede Karte' },
		{ nr: 'E3', frage: 'Wie arbeiten Mitarbeitende die Ergebnisse durch?', wirkt: 'Die Reihenfolge' },
		{ nr: 'E4', frage: 'Sie öffnen einen Befund. Welches Ergebnis liegt Ihnen vor?', wirkt: 'Der Befund' },
		{ nr: 'E5', frage: 'Wildcard. Was macht diese Anwendung zehnmal besser?', wirkt: 'Offen' }
	];

	// Nach der letzten Karte blinkt eine kurz auf, wie ein Cursor. Dann Ruhe.
	const blinkIndex = 2;
	const blinkStart = karten.length * 200 + 500;
</script>

<section class="szene szene-weiss">
	<p class="kicker">02 · Fünf Entscheidungen</p>
	<h1 class="intro-h1 h1-mittel">
		Zwanzig Minuten. Fünf Abstimmungen. <span class="akzent">Sie bauen mit.</span>
	</h1>

	<ul class="karten">
		{#each karten as karte, i (karte.nr)}
			<li
				class="karte"
				class:offen={karte.nr === 'E5'}
				class:blinker={i === blinkIndex}
				style="--d: {i * 200 + 120}ms; --d2: {blinkStart}ms"
			>
				<span class="nr">{karte.nr}</span>
				<p class="frage">{karte.frage}</p>
				<p class="wirkt">{karte.wirkt}</p>
			</li>
		{/each}
	</ul>
</section>

<style>
	h1 {
		max-width: 30ch;
		margin-bottom: clamp(1.25rem, 4vh, 2.75rem);
	}

	.karten {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: clamp(0.75rem, 1.4vw, 1.5rem);
		align-items: stretch;
	}

	.karte {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-line);
		background: var(--color-surface);
		padding: clamp(1rem, 2.4vh, 1.625rem);
		min-height: clamp(11.5rem, 30vh, 18rem);
		opacity: 0;
		/* Einfahren von unten in sechs Sprüngen, nicht gleitend. */
		animation: einfahrt 360ms steps(6, end) var(--d, 0ms) both;
	}

	/* Genau eine Karte wechselt nach dem Einfahren kurz zu Blau und zurück. */
	.karte.blinker {
		animation-name: einfahrt, karte-blink;
		animation-duration: 360ms, 640ms;
		animation-timing-function: steps(6, end), steps(1, end);
		animation-delay: var(--d, 0ms), var(--d2, 0ms);
		animation-iteration-count: 1, 2;
		animation-fill-mode: both, both;
	}

	.karte.offen {
		border: 2px dashed var(--color-blue);
	}

	.nr {
		font-family: var(--font-mono);
		font-size: clamp(1.75rem, 3vw, 3.25rem);
		font-weight: var(--font-weight-bold);
		line-height: 1;
		letter-spacing: -0.02em;
		color: var(--color-blue);
		margin-bottom: clamp(0.5rem, 1.4vh, 1rem);
	}

	.karte.offen .nr {
		color: var(--color-blue-dark);
	}

	.frage {
		margin: 0 0 clamp(0.75rem, 2vh, 1.25rem) 0;
		font-size: clamp(0.85rem, 1.12vw, 1.1875rem);
		font-weight: var(--font-weight-semibold);
		line-height: 1.3;
		letter-spacing: -0.01em;
		flex: 1;
	}

	.wirkt {
		margin: 0;
		padding-top: clamp(0.4rem, 1.2vh, 0.75rem);
		border-top: 1px solid var(--color-line);
		font-family: var(--font-mono);
		font-size: clamp(0.6rem, 0.75vw, 0.8125rem);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-ink);
		opacity: 0.6;
	}
</style>
