<!--
	E1 Archetyp B: Dashboard. Zahlen zum Bestand auf einen Blick, darunter
	die Befunde. Die Seitenliste bringt das Dashboard NICHT mehr selbst mit,
	die liefert die Sidebar des Arbeitsplatz-Rahmens (Entscheidung A aus
	docs/erkenntnisse.md: ein Rahmen für alle vier Archetypen, keine zwei
	Seitenlisten auf einem Schirm).

	Nur Props: pages, variant (E4-Anzeigevariante, an FindingCard
	weitergereicht), scopeOption (E2, Default 'nirgends'), selectedUrl
	(hebt die Zahlen der gewählten Seite hervor). Kein eigener Fetch, keine
	eigene Sortierlogik — das entsteht live bei E3 (sort.ts auf `pages`
	anwenden, bevor sie hier reinkommen).

	Füllt die Höhe seines Containers und scrollt selbst.
-->
<script lang="ts">
	import type { Page, Axis } from '$lib/types';
	import { scopeFor, countScopes, type ScopeOption } from '$lib/live/scope';
	import Counter from './Counter.svelte';
	import FindingCard from './FindingCard.svelte';

	let {
		pages,
		variant = 'text',
		scopeOption = 'nirgends',
		selectedUrl = null
	}: {
		pages: Page[];
		variant?: 'text' | 'begruendung' | 'frage' | 'zwei';
		scopeOption?: ScopeOption;
		selectedUrl?: string | null;
	} = $props();

	const alle = $derived(pages.flatMap((p) => p.findings));
	const hoch = $derived(alle.filter((f) => f.severity === 'hoch').length);
	const jeAchse = $derived.by(() => {
		const z: Record<Axis, number> = { verstaendlichkeit: 0, zugaenglichkeit: 0 };
		for (const f of alle) z[f.axis]++;
		return z;
	});
	const scopes = $derived(countScopes(alle, scopeOption));
</script>

<div class="dashboard">
	<section class="overview" aria-label="Zahlen zum Bestand">
		<Counter label="Seiten" value={pages.length} />
		<Counter label="Befunde" value={alle.length} />
		<Counter label="Schwere hoch" value={hoch} of={alle.length} />
		<Counter label="Verständlichkeit" value={jeAchse.verstaendlichkeit} of={alle.length} />
		<Counter label="Zugänglichkeit" value={jeAchse.zugaenglichkeit} of={alle.length} />
		{#if scopeOption !== 'nirgends'}
			<Counter label="Vorschläge" value={scopes.vorschlag} of={alle.length} />
		{/if}
	</section>

	<section class="findings">
		<h2>Befunde</h2>
		{#if alle.length === 0}
			<p class="leerzustand">Keine Befunde im Bestand.</p>
		{:else}
			<div class="finding-list">
				{#each pages as page (page.url)}
					{#each page.findings as finding (finding.id)}
						<FindingCard {finding} {variant} mode={scopeFor(finding, scopeOption)} />
					{/each}
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.dashboard {
		height: 100%;
		min-height: 0;
		overflow-y: auto;
		padding: var(--space-3) var(--space-3) var(--space-4);
	}

	.overview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
		gap: var(--space-4);
		padding: var(--space-3);
		margin-bottom: var(--space-4);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.findings h2 {
		font-size: var(--font-size-h4);
		margin-bottom: var(--space-2);
	}

	.finding-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
		gap: var(--space-3);
	}
</style>
