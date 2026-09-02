<!--
	E1 Archetyp C: Geführter Flow. Eine Seite nach der anderen. Nur Props:
	pages, variant (E4-Anzeigevariante, an FindingCard weitergereicht),
	scopeOption (E2, Default 'nirgends' — je Befund wird scopeFor(f,
	scopeOption) berechnet und als `mode` an FindingCard weitergereicht),
	index (kontrolliert von außen), onIndexChange.
-->
<script lang="ts">
	import type { Page } from '$lib/types';
	import { scopeFor, type ScopeOption } from '$lib/live/scope';
	import FindingCard from './FindingCard.svelte';
	import ScreenshotViewer from './ScreenshotViewer.svelte';
	import Button from './Button.svelte';
	import { shortTitle } from '$lib/live/labels';

	let {
		pages,
		variant = 'text',
		scopeOption = 'nirgends',
		index = 0,
		onIndexChange
	}: {
		pages: Page[];
		variant?: 'text' | 'begruendung' | 'frage' | 'zwei';
		scopeOption?: ScopeOption;
		index?: number;
		onIndexChange?: (index: number) => void;
	} = $props();

	const seite = $derived(pages[index]);

	function weiter() {
		if (index < pages.length - 1) onIndexChange?.(index + 1);
	}
	function zurueck() {
		if (index > 0) onIndexChange?.(index - 1);
	}
</script>

{#if seite}
	<div class="flow">
		<header class="flow-header">
			<span class="fortschritt">Seite {index + 1} von {pages.length}</span>
			<h2 class="lesbar">{shortTitle(seite.title)}</h2>
		</header>

		<div class="flow-body">
			<ScreenshotViewer page={seite} />

			<div class="findings">
				{#each seite.findings as finding (finding.id)}
					<FindingCard {finding} {variant} mode={scopeFor(finding, scopeOption)} />
				{:else}
					<p class="leer">Keine Befunde auf dieser Seite.</p>
				{/each}
			</div>
		</div>

		<footer class="flow-nav">
			<Button variant="ghost" disabled={index === 0} onclick={zurueck}>Zurück</Button>
			<Button variant="primary" disabled={index === pages.length - 1} onclick={weiter}>Weiter</Button>
		</footer>
	</div>
{/if}

<style>
	.flow {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3);
		height: 100%;
		min-height: 0;
		overflow-y: auto;
		max-width: var(--lese-breite, none);
	}

	.flow-header h2 {
		font-size: var(--font-size-h3);
	}

	.flow-header h2 {
		margin: 0;
	}

	.fortschritt {
		font-size: var(--font-size-small);
		color: var(--color-accent-secondary);
		font-weight: var(--font-weight-semibold);
	}

	.flow-body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--space-4);
		align-items: start;
	}

	.flow-body > * {
		min-width: 0;
	}

	.findings {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.leer {
		margin: 0;
		padding: var(--space-4);
		border: 2px dashed var(--color-border);
		opacity: 0.7;
		text-align: center;
	}

	.flow-nav {
		display: flex;
		justify-content: space-between;
	}
</style>
