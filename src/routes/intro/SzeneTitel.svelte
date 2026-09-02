<!-- Szene 1: Titelfolie. Band baut sich auf, dann die Headline Wort für Wort. -->
<script lang="ts">
	import DitherBand from '$lib/theme/DitherBand.svelte';
	import mark from '$lib/theme/mark.png';

	const worte = ['Souveränität', 'beginnt', 'beim'];
	// Nach dem Band (1200ms) beginnt die Headline.
	const start = 1300;
</script>

<section class="szene szene-blau titel">
	<div class="band"><DitherBand aufbau dauer={1200} /></div>

	<div class="raster">
		<div class="text">
			<p class="kicker stufe" style="--i: 5; --start: {start}ms">
				Unblock AI · Staat Next Level · Live-Build
			</p>

			<h1 class="intro-h1 h1-gross">
				{#each worte as wort, i (wort)}
					<span class="wort" style="--i: {i}; --start: {start}ms">{wort}</span>{' '}
				{/each}<span class="wort akzent-dunkel" style="--i: {worte.length}; --start: {start}ms"
					>Prototyp</span
				><span class="cursor" style="--start: {start + worte.length * 110 + 200}ms"></span>
			</h1>
		</div>

		<div class="marke">
			<img src={mark} alt="" />
		</div>
	</div>
</section>

<style>
	.titel {
		position: relative;
	}

	.band {
		position: absolute;
		top: clamp(1.5rem, 4vh, 3.5rem);
		left: 0;
		right: 0;
	}

	.raster {
		display: grid;
		grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
		align-items: center;
		gap: clamp(2rem, 5vw, 5rem);
	}

	.kicker {
		margin-bottom: clamp(0.75rem, 2vh, 1.5rem);
	}

	.akzent-dunkel {
		color: var(--color-blue-dark);
	}

	.marke {
		display: flex;
		justify-content: flex-end;
	}

	/* Die Marke stark vergrößert, hart gerastert — das 8-Bit-Erkennungszeichen.
	   Dahinter ein zweites Rechteck als harter Versatz, kein Schatten. */
	.marke img {
		display: block;
		height: clamp(11rem, 34vh, 20rem);
		width: auto;
		image-rendering: pixelated;
		background: var(--color-white);
		padding: clamp(0.75rem, 2vh, 1.5rem);
		box-shadow: 12px 12px 0 0 var(--color-blue-dark);
		opacity: 0;
		animation: marke-auf 400ms steps(4, end) both;
		animation-delay: 900ms;
	}

	@keyframes marke-auf {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 60rem) {
		.raster {
			grid-template-columns: minmax(0, 1fr);
		}

		.marke {
			display: none;
		}
	}
</style>
