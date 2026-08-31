<!--
	Pixel-Band aus der Unblock-AI-Optik: eine Reihe kleiner Kacheln in den
	Theme-Farben. Das 8-Bit-Erkennungszeichen, sparsam als Band eingesetzt
	(siehe CLAUDE.md, Abschnitt "Gestaltung") — keine neuen Farben, keine
	Fläche, nur dieser eine schmale Streifen.
-->
<script lang="ts">
	let { count = 32 }: { count?: number } = $props();

	// Feste, sich wiederholende Farbfolge statt Zufall — reproduzierbar bei
	// jedem Hot Reload.
	const sequence = [
		'var(--color-blue)',
		'var(--color-teal)',
		'var(--color-ink)',
		'var(--color-surface-tint)'
	];
	const tiles = $derived(Array.from({ length: count }, (_, i) => sequence[i % sequence.length]));
</script>

<div class="dither-band" role="presentation" aria-hidden="true">
	{#each tiles as color, i (i)}
		<span class="tile" style:background={color}></span>
	{/each}
</div>

<style>
	.dither-band {
		display: flex;
		gap: 2px;
		height: 6px;
	}

	.tile {
		flex: 0 0 auto;
		width: 10px;
		height: 100%;
	}
</style>
