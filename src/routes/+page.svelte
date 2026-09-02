<script lang="ts">
	// Hier beginnt der Live-Build. data.bestand.pages ist der aktive Bestand.
	// Diese Seite ist absichtlich fast leer: der Startpunkt der zwanzig Minuten.
	// Alles, was die fünf Entscheidungen brauchen, liegt schon in data.
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const seiten = $derived(data.bestand.pages.length);
	const befunde = $derived(data.bestand.pages.reduce((n, p) => n + p.findings.length, 0));
	const label = $derived(
		data.bestaende.find((b) => b.name === data.bestand.name)?.label ?? data.bestand.name
	);
</script>

<svelte:head>
	<title>AccessibilityChecker</title>
</svelte:head>

<!--
	Seitenkopf, bewusst flach: Kicker, Headline und Stand in einer Zone,
	damit der Arbeitsplatz darunter über der Falz beginnt. Die Headline
	bleibt in h2-Größe; die große Display-Größe gehört der Intro.
-->
<div class="canvas container">
	<div class="kopf">
		<div>
			<p class="kicker">Übersicht</p>
			<h1>Will<span class="akzent">kommen</span></h1>
		</div>
		<p class="stand">
			Bestand <strong>{label}</strong> · {seiten}
			{seiten === 1 ? 'Seite' : 'Seiten'} · {befunde}
			{befunde === 1 ? 'Befund' : 'Befunde'} geladen
		</p>
	</div>
</div>

<style>
	.canvas {
		padding-top: var(--space-4);
		padding-bottom: var(--space-3);
	}

	.kopf {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2) var(--space-4);
	}

	.kicker {
		margin-bottom: var(--space-1);
	}

	h1 {
		margin: 0;
		font-size: var(--font-size-h2);
		line-height: var(--line-height-heading);
	}

	.stand {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		letter-spacing: 0.04em;
		color: var(--color-ink);
		opacity: 0.7;
	}

	.stand strong {
		font-weight: var(--font-weight-semibold);
		opacity: 1;
	}
</style>
