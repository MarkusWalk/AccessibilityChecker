<!--
	E1 Archetyp C: Geführter Flow. Eine Seite nach der anderen. Nur Props:
	pages, variant (E4-Anzeigevariante, an FindingCard weitergereicht),
	index (kontrolliert von außen), onIndexChange.
-->
<script lang="ts">
	import type { Page } from '$lib/types';
	import FindingCard from './FindingCard.svelte';
	import ScreenshotViewer from './ScreenshotViewer.svelte';
	import Button from './Button.svelte';

	let {
		pages,
		variant = 'text',
		index = 0,
		onIndexChange
	}: {
		pages: Page[];
		variant?: 'text' | 'begruendung' | 'frage' | 'zwei';
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
			<h2>{seite.title}</h2>
		</header>

		<div class="flow-body">
			<ScreenshotViewer page={seite} />

			<div class="findings">
				{#each seite.findings as finding (finding.id)}
					<FindingCard {finding} {variant} />
				{:else}
					<p class="leer">Keine Befunde auf dieser Seite.</p>
				{/each}
			</div>
		</div>

		<footer class="flow-nav">
			<Button variant="ghost" onclick={zurueck}>Zurück</Button>
			<Button variant="primary" onclick={weiter}>Weiter</Button>
		</footer>
	</div>
{/if}

<style>
	.flow {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-4);
		max-width: 900px;
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
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}

	.findings {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.leer {
		opacity: 0.7;
	}

	.flow-nav {
		display: flex;
		justify-content: space-between;
	}
</style>
