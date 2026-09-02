<!-- Szene 4: Spielregeln und der Absprung in den Live-Build. -->
<script lang="ts">
	let { onStart }: { onStart: () => void } = $props();

	const regeln = [
		'Sie stimmen ab.',
		'Ich tippe die Entscheidung als Auftrag.',
		'Die Oberfläche wächst, während die nächste Abstimmung läuft.'
	];
</script>

<section class="szene szene-blau">
	<p class="kicker">03 · Spielregeln</p>

	<ol class="regeln">
		{#each regeln as regel, i (regel)}
			<li class="stufe" style="--i: {i}; --start: 200ms">
				<span class="pixel" aria-hidden="true"></span>
				<span class="wort-text">{regel}</span>
			</li>
		{/each}
	</ol>

	<p class="takt stufe" style="--i: 3; --start: 200ms">
		150 Sekunden je Schritt · Erst roh, dann gestaltet, dann besser, dann klug
	</p>

	<p class="aktion stufe" style="--i: 4; --start: 200ms">
		<button type="button" onclick={(e) => { e.stopPropagation(); onStart(); }}>Los geht’s</button>
	</p>
</section>

<style>
	.regeln {
		list-style: none;
		margin: clamp(0.75rem, 3vh, 2rem) 0 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: clamp(0.5rem, 2vh, 1.25rem);
	}

	.regeln li {
		display: flex;
		align-items: baseline;
		gap: clamp(0.75rem, 1.6vw, 1.5rem);
		font-size: clamp(1.5rem, 3.5vw, 3.5rem);
		font-weight: var(--font-weight-bold);
		line-height: 1.05;
		letter-spacing: -0.03em;
		color: var(--color-white);
	}

	.pixel {
		flex: 0 0 auto;
		width: 0.42em;
		height: 0.42em;
		background: var(--color-blue-dark);
		transform: translateY(-0.06em);
	}

	.takt {
		margin: clamp(1rem, 3.5vh, 2.25rem) 0 0 0;
		font-family: var(--font-mono);
		font-size: clamp(0.7rem, 0.95vw, 1rem);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-blue-light);
	}

	.aktion {
		margin: clamp(1.25rem, 4vh, 2.75rem) 0 0 0;
	}

	button {
		font-family: var(--font-sans);
		font-size: clamp(1rem, 1.4vw, 1.375rem);
		font-weight: var(--font-weight-bold);
		letter-spacing: -0.01em;
		color: var(--color-blue);
		background: var(--color-white);
		border: 2px solid var(--color-white);
		border-radius: var(--radius);
		padding: clamp(0.6rem, 1.6vh, 1rem) clamp(1.5rem, 3vw, 2.75rem);
		cursor: pointer;
		box-shadow: 8px 8px 0 0 var(--color-blue-dark);
	}

	button:hover {
		color: var(--color-white);
		background: var(--color-blue);
	}

	button:focus-visible {
		outline: 2px solid var(--color-white);
		outline-offset: 4px;
	}
</style>
