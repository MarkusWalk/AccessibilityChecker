<script lang="ts">
	// Hier beginnt der Live-Build. data.bestand.pages ist der aktive Bestand.
	import type { PageData } from './$types';
	import type { Page } from '$lib/types';
	import Arbeitsplatz from '$lib/assets/Arbeitsplatz.svelte';
	import Dashboard from '$lib/assets/Dashboard.svelte';
	import FindingCard from '$lib/assets/FindingCard.svelte';
	import Button from '$lib/assets/Button.svelte';
	import { scopeFor, countScopes } from '$lib/live/scope';
	import { byReach } from '$lib/live/sort';
	import { toMarkdown, toCsv, download } from '$lib/live/export';

	let { data }: { data: PageData } = $props();

	// E3: nach Reichweite sortiert. Wirkt über die Reihenfolge in Sidebar und
	// Dashboard sowie über den Reichweite-Balken im Dashboard-Prioritätenblock.
	const sortierteSeiten = $derived(byReach(data.bestand.pages));

	let selected = $state<Page | undefined>(undefined);

	// E2: 'nirgends' — das System schlägt auch Formulierungen vor.
	const zaehler = $derived.by(() => {
		const z = countScopes(selected?.findings ?? [], 'nirgends');
		return `${z.vorschlag} Vorschläge · ${z.markierung} Markierungen · ${z.frage} Fragen`;
	});
</script>

<svelte:head>
	<title>AccessibilityChecker</title>
</svelte:head>

<!--
	Seitenkopf wie im Startzustand: Kicker, Headline und eine Zusatzzeile in
	einer Zone, damit der Arbeitsplatz darunter über der Falz beginnt. Die
	Zusatzzeile ist hier die E5-Export-Schaltfläche statt des Standtexts.
-->
<div class="canvas container">
	<div class="kopf">
		<div>
			<p class="kicker">Übersicht</p>
			<h1>Alle <span class="akzent">Seiten</span></h1>
		</div>
		<div class="export-leiste">
			<Button
				variant="secondary"
				onclick={() => download('befunde.md', toMarkdown(sortierteSeiten))}
			>
				Als Markdown exportieren
			</Button>
			<Button
				variant="secondary"
				onclick={() => download('befunde.csv', toCsv(sortierteSeiten))}
			>
				Als CSV exportieren
			</Button>
		</div>
	</div>

	<Arbeitsplatz pages={sortierteSeiten} bind:selected {zaehler} hauptAnteil="gleich">
		{#snippet haupt()}
			<Dashboard
				pages={sortierteSeiten}
				variant="text"
				scopeOption="nirgends"
				selectedUrl={selected?.url}
			/>
		{/snippet}
		{#snippet panel()}
			{#each selected?.findings ?? [] as f (f.id)}
				<FindingCard finding={f} variant="text" mode={scopeFor(f, 'nirgends')} />
			{/each}
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
		margin-bottom: var(--space-3);
	}

	.kicker {
		margin-bottom: var(--space-1);
	}

	h1 {
		margin: 0;
		font-size: var(--font-size-h2);
		line-height: var(--line-height-heading);
	}

	.export-leiste {
		display: flex;
		gap: var(--space-2);
	}
</style>
