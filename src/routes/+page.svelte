<svelte:head>
	<title>AccessibilityChecker</title>
</svelte:head>

<div class="canvas container">
	<p class="kicker">Übersicht</p>
	<h1>Willkommen</h1>
	<p class="hinweis">Hier entsteht während des Webinars die Ansicht auf den geprüften Bestand.</p>
</div>

<style>
	.canvas {
		min-height: 60vh;
		background: var(--color-surface);
	}

	h1 {
		margin: 0 0 var(--space-2) 0;
	}

	.hinweis {
		margin: 0;
		max-width: 40ch;
		color: var(--color-ink);
		opacity: 0.7;
	}
</style>
