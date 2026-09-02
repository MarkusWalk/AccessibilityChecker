<!--
	Seitenliste, z.B. für Dashboard/GuidedFlow oder als linke Spalte von
	Arbeitsplatz.svelte. Nur Props: pages, selectedUrl, onSelect. Holt sich
	nichts selbst. Füllt die Breite/Höhe des umgebenden Containers (z.B. die
	18rem-Spalte aus der .werkzeug-Utility) statt einer eigenen festen
	Breite vorzugeben.
-->
<script lang="ts">
	import type { Page } from '$lib/types';
	import Badge from './Badge.svelte';

	let {
		pages,
		selectedUrl = null,
		onSelect
	}: {
		pages: Page[];
		selectedUrl?: string | null;
		onSelect?: (url: string) => void;
	} = $props();

	function schwersteSeverity(page: Page): Page['findings'][number]['severity'] | null {
		if (page.findings.some((f) => f.severity === 'hoch')) return 'hoch';
		if (page.findings.some((f) => f.severity === 'mittel')) return 'mittel';
		if (page.findings.length > 0) return 'niedrig';
		return null;
	}
</script>

<nav class="sidebar" aria-label="Geprüfte Seiten">
	<ul>
		{#each pages as page (page.url)}
			{@const severity = schwersteSeverity(page)}
			<li>
				<button
					class="entry"
					class:active={page.url === selectedUrl}
					onclick={() => onSelect?.(page.url)}
				>
					<span class="title">{page.title}</span>
					<span class="meta">
						<span class="count">{page.findings.length} Befunde</span>
						{#if severity}<Badge tone={severity}>{severity}</Badge>{/if}
					</span>
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.sidebar {
		border-right: 1px solid var(--color-border);
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow-y: auto;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.entry {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-left: 3px solid transparent;
		border-bottom: 1px solid var(--color-border);
		padding: var(--space-2) var(--space-3);
		cursor: pointer;
		font-family: var(--font-sans);
		color: var(--color-text);
		transition: background-color var(--motion-fast) var(--motion-ease);
	}

	.entry:hover {
		background: var(--color-surface-tint);
	}

	.entry.active {
		background: var(--color-surface-tint);
		border-left-color: var(--color-accent);
	}

	.title {
		font-weight: var(--font-weight-medium);
	}

	.meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-small);
		color: var(--color-ink);
		opacity: 0.7;
	}
</style>
