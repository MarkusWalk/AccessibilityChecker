<!--
	Pixel-Band aus der Unblock-AI-Optik: eine Reihe kleiner Kacheln in den
	Theme-Farben. Das 8-Bit-Erkennungszeichen, sparsam als Band eingesetzt
	(siehe CLAUDE.md, Abschnitt "Gestaltung") — keine neuen Farben, keine
	Fläche, nur dieser eine schmale Streifen.
-->
<script lang="ts">
	// 220 Kacheln à 12px decken auch breite Bildschirme; was nicht hineinpasst,
	// schneidet overflow: hidden ab. So endet das Band nie mitten im Fenster.
	// `aufbau` lässt das Band Kachel für Kachel entstehen, statt fertig
	// dazustehen — für den Splash-Screen. `dauer` ist die Gesamtzeit in ms.
	let {
		count = 220,
		aufbau = false,
		dauer = 1200
	}: { count?: number; aufbau?: boolean; dauer?: number } = $props();

	// Feste, sich wiederholende Farbfolge statt Zufall — reproduzierbar bei
	// jedem Hot Reload.
	// Blau, Dunkelblau, Teal, Hellblau, Weiß — die Folge aus dem Foliensatz.
	// Fünf Werte, damit sich das Muster nicht mit geraden Zählungen deckt.
	const sequence = [
		'var(--color-blue)',
		'var(--color-blue-dark)',
		'var(--color-teal)',
		'var(--color-blue-light)',
		'var(--color-white)'
	];
	const tiles = $derived(Array.from({ length: count }, (_, i) => sequence[i % sequence.length]));
</script>

<div class="dither-band" role="presentation" aria-hidden="true">
	{#each tiles as color, i (i)}
		<span
			class="tile"
			class:aufbau
			style:background={color}
			style:animation-delay={aufbau ? `${Math.round((i / count) * dauer)}ms` : null}
		></span>
	{/each}
</div>

<style>
	.dither-band {
		display: flex;
		gap: 2px;
		height: 6px;
		overflow: hidden;
	}

	.tile {
		flex: 0 0 auto;
		width: 10px;
		height: 100%;
	}

	/* Harte Sprünge statt Überblendung: steps(1) schaltet die Kachel an. */
	.tile.aufbau {
		opacity: 0;
		animation: kachel-auf 1ms steps(1, end) both;
	}

	@keyframes kachel-auf {
		to {
			opacity: 1;
		}
	}
</style>
