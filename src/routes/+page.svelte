<script lang="ts">
	import mark from '$lib/theme/mark.png';
	import DitherBand from '$lib/theme/DitherBand.svelte';
</script>

<svelte:head>
	<title>AccessibilityChecker</title>
</svelte:head>

<div class="canvas">
	<header class="header">
		<p class="kicker">Verständlichkeit · Zugänglichkeit</p>
		<div class="title-row">
			<img class="mark" src={mark} alt="" width="40" height="48" />
			<h1>AccessibilityChecker</h1>
		</div>
	</header>
	<DitherBand count={40} />
</div>

<style>
	.canvas {
		min-height: 100vh;
		background: var(--color-surface);
	}

	.header {
		padding: var(--space-4) var(--space-5) var(--space-3);
		border-bottom: 1px solid var(--color-border);
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.mark {
		image-rendering: pixelated;
		display: block;
	}

	.header h1 {
		margin: 0;
	}
</style>
