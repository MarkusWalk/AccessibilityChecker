<!--
	E5-Rückfall: kompakte Kennzahl. Passt für den Kopfzeilen-Zähler aus E2
	("N Vorschläge · M Markierungen · K Fragen", siehe scope.ts/countScopes)
	genauso wie für eine einzelne Zahl im Dashboard ("17 Seiten").
	Nur Props: label, value, of (optional). Kein eigener State, kein Fetch.

	Einsatz in vier Stufen:
	1. Primitiv: <Counter label="Seiten" value={pages.length} /> roh in den
	   Kopf setzen, ungestylt betrachten.
	2. Gestaltet: neben andere Zähler in eine Reihe stellen.
	3. Besser: `of` ergänzen, damit die kleinen Quadrate erscheinen.
	4. Klug: value/of aus `countScopes()` (scope.ts) oder einer
	   Sortier-/Gruppierfunktion (sort.ts) live nachführen.
-->
<script lang="ts">
	let {
		label,
		value,
		of
	}: {
		label: string;
		value: number;
		of?: number;
	} = $props();

	// Höchstens 20 Quadrate, sonst wird die Reihe unübersichtlich statt
	// lesbar. gefuellt rundet, damit auch kleine Anteile sichtbar bleiben.
	const quadrate = $derived(of && of > 0 ? Math.min(of, 20) : 0);
	const gefuellt = $derived(
		of && of > 0 && quadrate > 0 ? Math.round((value / of) * quadrate) : 0
	);
</script>

<div class="counter">
	<span class="kicker">{label}</span>
	<span class="value">
		{value}{#if of !== undefined}<span class="of"> / {of}</span>{/if}
	</span>
	{#if quadrate > 0}
		<div class="squares" aria-hidden="true">
			{#each { length: quadrate } as _, i (i)}
				<span class="square" class:filled={i < gefuellt}></span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.counter {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.kicker {
		font-family: monospace;
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-accent-secondary);
	}

	.value {
		font-family: var(--font-sans);
		font-weight: var(--font-weight-bold);
		font-size: var(--font-size-h2);
		color: var(--color-text);
		line-height: 1;
	}

	.of {
		font-weight: var(--font-weight-regular);
		font-size: var(--font-size-h4);
		opacity: 0.6;
	}

	.squares {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		margin-top: var(--space-1);
		max-width: 11rem;
	}

	.square {
		width: 8px;
		height: 8px;
		background: var(--color-surface-tint);
		border: 1px solid var(--color-border);
	}

	.square.filled {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}
</style>
