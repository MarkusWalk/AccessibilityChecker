<!--
	Backstage-Rückfallebene: archivierte Probeläufe zum Nachschauen, falls am
	Tag selbst ein Bauschritt klemmt. Nicht in der Hauptnavigation verlinkt,
	nur über /archiv erreichbar — bewusst nicht für das Publikum gedacht.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Standardmäßig den zuletzt archivierten Lauf aufgeklappt — nur der
	// Startwert zählt, kein Nachziehen bei späterer Navigation nötig.
	let offen = $state<string | null>(untrack(() => data.laeufe.at(-1)?.name ?? null));

	function toggeln(name: string) {
		offen = offen === name ? null : name;
	}
</script>

<svelte:head>
	<title>Archiv der Probeläufe — AccessibilityChecker</title>
</svelte:head>

<div class="page container">
	<p class="kicker">Rückfallebene</p>
	<h1>Archiv der <span class="akzent">Probeläufe</span></h1>
	<p class="hinweis">
		Endstände und Screenshots früherer Durchläufe. Kein Teil des Live-Builds
		— nur zum Nachschauen, falls am Tag selbst ein Bauschritt nicht auf
		Anhieb klappt.
	</p>

	{#if data.laeufe.length === 0}
		<p class="leerzustand">Noch kein archivierter Probelauf vorhanden.</p>
	{/if}

	{#each data.laeufe as lauf (lauf.name)}
		<section class="lauf">
			<button
				class="lauf-kopf"
				onclick={() => toggeln(lauf.name)}
				aria-expanded={offen === lauf.name}
			>
				<span class="lauf-titel">{lauf.titel}</span>
				<span class="lauf-toggle" aria-hidden="true">{offen === lauf.name ? '−' : '+'}</span>
			</button>

			{#if offen === lauf.name}
				<div class="lauf-inhalt">
					{#if lauf.readme}
						<pre class="readme">{lauf.readme}</pre>
					{/if}

					{#if lauf.bilder.length > 0}
						<div class="bilder">
							{#each lauf.bilder as bild (bild)}
								<figure>
									<img src="/archiv/{lauf.name}/{bild}" alt="Screenshot {bild}" loading="lazy" />
									<figcaption class="mono">{bild}</figcaption>
								</figure>
							{/each}
						</div>
					{:else}
						<p class="leerzustand">Keine Screenshots in diesem Lauf.</p>
					{/if}
				</div>
			{/if}
		</section>
	{/each}
</div>

<style>
	.page {
		padding-bottom: var(--space-7);
	}

	h1 {
		margin: 0 0 var(--space-3) 0;
	}

	.hinweis {
		max-width: 60ch;
		opacity: 0.75;
		margin-bottom: var(--space-5);
	}

	.leerzustand {
		padding: var(--space-4);
		border: 2px dashed var(--color-border);
		opacity: 0.7;
		text-align: center;
	}

	.lauf {
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		margin-bottom: var(--space-3);
	}

	.lauf-kopf {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3);
		background: none;
		border: none;
		cursor: pointer;
		font: inherit;
		text-align: left;
		color: var(--color-text);
	}

	.lauf-kopf:hover {
		background: var(--color-surface-tint);
	}

	.lauf-titel {
		font-weight: var(--font-weight-semibold);
	}

	.lauf-toggle {
		font-family: var(--font-mono);
		font-size: var(--font-size-h4);
		color: var(--color-accent);
		line-height: 1;
	}

	.lauf-inhalt {
		padding: 0 var(--space-3) var(--space-4);
		border-top: 1px solid var(--color-border);
	}

	.readme {
		white-space: pre-wrap;
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		line-height: var(--line-height-body);
		background: var(--color-surface-tint);
		padding: var(--space-3);
		margin: var(--space-3) 0;
		overflow-x: auto;
	}

	.bilder {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		gap: var(--space-3);
	}

	figure {
		margin: 0;
		border: 1px solid var(--color-border);
	}

	figure img {
		display: block;
		width: 100%;
		height: auto;
	}

	figcaption {
		padding: var(--space-1) var(--space-2);
		font-size: var(--font-size-small);
		opacity: 0.7;
		border-top: 1px solid var(--color-border);
	}
</style>
