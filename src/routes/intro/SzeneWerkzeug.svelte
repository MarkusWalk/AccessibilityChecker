<!-- Szene 2: Was gebaut wird. Zwei Achsen, zwei Blöcke. -->
<script lang="ts">
	let { bestand = 'Weinheim', seiten = 50 }: { bestand?: string; seiten?: number } = $props();

	const verstaendlichkeit = ['Schachtelsätze', 'Passivketten', 'Paragrafen ohne Erklärung'];
	const zugaenglichkeit = ['Alternativtexte', 'Überschriftenstruktur', 'Linktexte wie „hier klicken“'];
</script>

<section class="szene szene-weiss">
	<p class="kicker">01 · Das Werkzeug</p>
	<h1 class="intro-h1 h1-mittel">
		Ein <span class="akzent">Prüfwerkzeug</span> für den Webauftritt einer Behörde.
	</h1>

	<div class="spalten">
		<div class="block-blau achse">
			<p class="kicker">Verständlichkeit</p>
			<ul>
				{#each verstaendlichkeit as zeile, i (zeile)}
					<li class="stufe" style="--i: {i}; --start: 200ms">{zeile}</li>
				{/each}
			</ul>
		</div>

		<div class="block-gestrichelt achse">
			<p class="kicker">Zugänglichkeit</p>
			<ul>
				{#each zugaenglichkeit as zeile, i (zeile)}
					<li class="stufe" style="--i: {i}; --start: 560ms">{zeile}</li>
				{/each}
			</ul>
		</div>
	</div>

	<p class="fuss stufe" style="--i: 0; --start: 1000ms">
		Geprüft wird ein ganzer Bestand. Heute: <strong>{bestand}, {seiten} Seiten.</strong>
	</p>
</section>

<style>
	h1 {
		max-width: 26ch;
		margin-bottom: clamp(1.25rem, 4vh, 2.75rem);
	}

	.spalten {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: clamp(1.5rem, 4vw, 3.5rem);
		align-items: stretch;
	}

	.achse {
		/* Platz für den harten Versatz rechts und unten. */
		margin: 0 12px 12px 0;
		padding: clamp(1.25rem, 3.2vh, 2.25rem);
		min-height: clamp(12rem, 30vh, 18rem);
		display: flex;
		flex-direction: column;
	}

	/* Gleiche Innenkante wie beim gestrichelten Block gegenüber. */
	.block-blau.achse {
		border: 2px solid var(--color-blue);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: clamp(0.5rem, 1.8vh, 1.1rem);
		justify-content: center;
		flex: 1;
	}

	li {
		font-size: clamp(1.05rem, 1.75vw, 1.75rem);
		font-weight: var(--font-weight-semibold);
		letter-spacing: -0.015em;
		line-height: 1.25;
	}

	.block-gestrichelt li {
		color: var(--color-ink);
	}

	.fuss {
		margin: clamp(1.25rem, 4vh, 2.5rem) 0 0 0;
		font-size: clamp(0.95rem, 1.15vw, 1.25rem);
	}

	.fuss strong {
		font-weight: var(--font-weight-bold);
		color: var(--color-blue);
	}
</style>
