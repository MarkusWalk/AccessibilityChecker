<script lang="ts">
	// Hier beginnt der Live-Build. data.bestand.pages ist der aktive Bestand.
	// Diese Seite ist absichtlich fast leer: der Startpunkt der zwanzig Minuten.
	// Alles, was die fünf Entscheidungen brauchen, liegt schon in data.
	import type { PageData } from './$types';
	import Arbeitsplatz from '$lib/assets/Arbeitsplatz.svelte';
	import GuidedFlow from '$lib/assets/GuidedFlow.svelte';
	import { countScopes } from '$lib/live/scope';
	import { bySeverity } from '$lib/live/sort';
	import { scopeFor } from '$lib/live/scope';
	import Badge from '$lib/assets/Badge.svelte';

	let { data }: { data: PageData } = $props();

	let aktuelleSeite = $state<PageData['bestand']['pages'][number] | null>(null);

	const sortierteSeiten = $derived(bySeverity(data.bestand.pages));
	const alleFunde = $derived(data.bestand.pages.flatMap((p) => p.findings));
	const scopeZaehler = $derived(countScopes(alleFunde, 'ermessen'));
	const ermessensBefunde = $derived(alleFunde.filter((f) => !f.machineDecidable).length);
	const ermessensAufSeite = $derived(
		(aktuelleSeite?.findings ?? []).filter((f) => !f.machineDecidable).length
	);
	const fragenAufSeite = $derived(
		(aktuelleSeite?.findings ?? []).filter((f) => scopeFor(f, 'ermessen') !== 'markierung').length
	);

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
		<p class="stand">
			{scopeZaehler.vorschlag} Vorschläge · {scopeZaehler.markierung} Markierungen ·
			{scopeZaehler.frage} Fragen
		</p>
		<p class="stand">Sortiert nach Schwere · schwerste Seite zuerst</p>
		<p class="stand">
			Markierung und Frage · den Text schreiben Sie · {fragenAufSeite} auf dieser Seite offen
		</p>
		{#if ermessensBefunde > 0}
			<p class="stand einschaetzung">
				<Badge tone="mittel">Einschätzung</Badge>
				{ermessensAufSeite} auf dieser Seite · {ermessensBefunde} im ganzen Bestand
			</p>
		{/if}
	</div>

	<Arbeitsplatz
		pages={sortierteSeiten}
		selected={aktuelleSeite ?? undefined}
		hauptAnteil="gross"
		kontext="Schwerste zuerst"
		sidebarInteractive={false}
	>
		{#snippet haupt()}
			<GuidedFlow
				pages={sortierteSeiten}
				onPageChange={(p) => (aktuelleSeite = p)}
				scopeOption="ermessen"
				variant="frage"
			/>
		{/snippet}
	</Arbeitsplatz>
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

	.einschaetzung {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}
</style>
