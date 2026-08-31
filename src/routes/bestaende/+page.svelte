<script lang="ts">
	import type { Page } from '$lib/types';
	import theilheim from '$lib/data/theilheim.json';
	import eiterfeld from '$lib/data/eiterfeld.json';
	import fallback from '$lib/data/fallback.json';

	type Bestand = { name: string; herkunft: string; pages: Page[] };

	const bestaende: Bestand[] = [
		{ name: 'Theilheim', herkunft: 'echter Crawl', pages: theilheim as Page[] },
		{ name: 'Eiterfeld', herkunft: 'echter Crawl', pages: eiterfeld as Page[] },
		{ name: 'Rückfallbestand', herkunft: 'handgebaut', pages: fallback as Page[] }
	];

	function findingCount(pages: Page[]): number {
		return pages.reduce((n, p) => n + p.findings.length, 0);
	}

	function legalCount(pages: Page[]): number {
		return pages.reduce((n, p) => n + p.findings.filter((f) => f.fromLegalSource).length, 0);
	}
</script>

<svelte:head>
	<title>Bestände — AccessibilityChecker</title>
</svelte:head>

<div class="page container">
	<p class="kicker">Bestände</p>
	<h1>Vorbereitete Bestände</h1>
	<p class="hinweis">Zwei echte Crawls und ein Rückfallbestand, gecacht als JSON in <code>src/lib/data/</code>.</p>

	<ul class="grid">
		{#each bestaende as bestand (bestand.name)}
			<li class="card">
				<span class="tag">{bestand.herkunft}</span>
				<h2>{bestand.name}</h2>
				<dl>
					<div>
						<dt>Seiten</dt>
						<dd>{bestand.pages.length}</dd>
					</div>
					<div>
						<dt>Befunde</dt>
						<dd>{findingCount(bestand.pages)}</dd>
					</div>
					<div>
						<dt>aus Rechtsquelle</dt>
						<dd>{legalCount(bestand.pages)}</dd>
					</div>
				</dl>
			</li>
		{/each}
	</ul>
</div>

<style>
	h1 {
		margin: 0 0 var(--space-2) 0;
	}

	.hinweis {
		margin: 0 0 var(--space-4) 0;
		color: var(--color-ink);
		opacity: 0.7;
	}

	code {
		font-family: monospace;
		background: var(--color-surface-tint);
		padding: 0 0.2rem;
	}

	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: var(--space-3);
	}

	.tag {
		display: inline-flex;
		font-size: var(--font-size-small);
		color: var(--color-accent);
		background: var(--color-surface-tint);
		padding: 0.1rem var(--space-2);
		margin-bottom: var(--space-2);
	}

	h2 {
		margin: 0 0 var(--space-3) 0;
		font-size: var(--font-size-h3);
	}

	dl {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0;
	}

	dl > div {
		display: flex;
		justify-content: space-between;
		border-top: 1px solid var(--color-border);
		padding-top: var(--space-1);
	}

	dt {
		font-size: var(--font-size-small);
		opacity: 0.7;
	}

	dd {
		margin: 0;
		font-weight: var(--font-weight-semibold);
	}
</style>
