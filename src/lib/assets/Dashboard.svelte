<!--
	E1 Archetyp B: Dashboard. Alle Seiten mit Befunden auf einen Blick.
	Nur Props: pages, variant (wird an FindingCard weitergereicht als E4-
	Anzeigevariante), onSelectPage. Kein eigener Fetch, keine eigene
	Sortierlogik — das entsteht live bei E3 (sort.ts auf `pages` anwenden,
	bevor sie hier reinkommen).
-->
<script lang="ts">
	import type { Page, Finding } from '$lib/types';
	import Badge from './Badge.svelte';
	import FindingCard from './FindingCard.svelte';

	let {
		pages,
		variant = 'text',
		onSelectPage
	}: {
		pages: Page[];
		variant?: 'text' | 'begruendung' | 'frage' | 'zwei';
		onSelectPage?: (url: string) => void;
	} = $props();

	function schwersteSeverity(page: Page): Finding['severity'] | null {
		if (page.findings.some((f) => f.severity === 'hoch')) return 'hoch';
		if (page.findings.some((f) => f.severity === 'mittel')) return 'mittel';
		if (page.findings.length > 0) return 'niedrig';
		return null;
	}
</script>

<div class="dashboard">
	<section class="overview">
		<h2>Alle Seiten</h2>
		<ul class="page-grid">
			{#each pages as page (page.url)}
				{@const severity = schwersteSeverity(page)}
				<li>
					<button class="page-tile" onclick={() => onSelectPage?.(page.url)}>
						<span class="page-title">{page.title}</span>
						<span class="page-meta">
							<span>{page.findings.length} Befunde</span>
							{#if severity}<Badge tone={severity}>{severity}</Badge>{/if}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</section>

	<section class="findings">
		<h2>Befunde</h2>
		<div class="finding-list">
			{#each pages as page (page.url)}
				{#each page.findings as finding (finding.id)}
					<FindingCard {finding} {variant} />
				{/each}
			{/each}
		</div>
	</section>
</div>

<style>
	.dashboard {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: var(--space-4);
		padding: var(--space-4);
	}

	.page-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.page-tile {
		width: 100%;
		text-align: left;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		padding: var(--space-2) var(--space-3);
		cursor: pointer;
		font-family: var(--font-sans);
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.page-title {
		font-weight: var(--font-weight-medium);
	}

	.page-meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-small);
		opacity: 0.75;
	}

	.finding-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
