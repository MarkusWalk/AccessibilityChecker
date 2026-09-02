<script lang="ts">
	// Die Zahlen kommen aus dem Layout-Loader, nicht aus einem eigenen Import:
	// so sieht diese Seite denselben Stand wie die Umschaltung in der Kopfleiste,
	// inklusive eines Bestands, der erst während des Webinars fertig wird.
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Bestände — AccessibilityChecker</title>
</svelte:head>

<div class="page container">
	<p class="kicker">Bestände</p>
	<h1>Geprüfte <span class="akzent">Bestände</span></h1>
	<p class="hinweis">
		Jeder Bestand ist ein Haus mit vielen Seiten. „Öffnen“ legt ihn auf die Übersicht; die Adresse
		merkt sich die Wahl.
	</p>

	{#if data.bestaende.length === 0}
		<div class="block-gestrichelt">
			<p>Noch kein Bestand vorhanden. Sobald ein Crawl fertig ist, erscheint er hier.</p>
		</div>
	{:else}
		<ul class="grid">
			{#each data.bestaende as bestand (bestand.name)}
				{@const istAktiv = bestand.name === data.bestand.name}
				<li class="card" class:aktiv={istAktiv}>
					<span class="tag">{bestand.live ? 'Live-Crawl' : 'gecachter Crawl'}</span>
					<h2>{bestand.label}</h2>
					<dl>
						<div>
							<dt>Seiten</dt>
							<dd>{bestand.pages}</dd>
						</div>
						<div>
							<dt>Hinweise</dt>
							<dd>{bestand.findings}</dd>
						</div>
					</dl>
					<p class="aktion">
						{#if istAktiv}
							<span class="offen">Geöffnet</span>
						{:else}
							<a class="oeffnen" href="/?bestand={bestand.name}">Öffnen</a>
						{/if}
					</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	h1 {
		margin: 0 0 var(--space-3) 0;
	}

	.hinweis {
		margin: 0 0 var(--space-5) 0;
		max-width: 60ch;
		color: var(--color-ink);
		opacity: 0.7;
	}

	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
	}

	.card {
		display: flex;
		flex-direction: column;
		padding: var(--space-4);
	}

	.card.aktiv {
		border-color: var(--color-blue);
		box-shadow: 8px 8px 0 0 var(--color-blue-light);
	}

	.tag {
		display: inline-flex;
		align-self: flex-start;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: var(--letter-spacing-kicker);
		text-transform: uppercase;
		color: var(--color-blue);
		background: var(--color-surface-tint);
		padding: var(--space-05) var(--space-2);
		margin-bottom: var(--space-3);
	}

	h2 {
		margin: 0 0 var(--space-3) 0;
		font-size: var(--font-size-h3);
	}

	dl {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0 0 var(--space-4) 0;
	}

	dl > div {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		border-top: 1px solid var(--color-border);
		padding-top: var(--space-1);
	}

	dt {
		font-size: var(--font-size-small);
		opacity: 0.7;
	}

	dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--font-size-h4);
		font-weight: var(--font-weight-semibold);
	}

	.aktion {
		margin: auto 0 0 0;
	}

	.oeffnen {
		display: inline-block;
		background: var(--color-blue);
		color: var(--color-white);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-small);
		padding: var(--space-2) var(--space-3);
		transition: background var(--motion-fast) var(--motion-ease);
	}

	.oeffnen:hover {
		background: var(--color-accent-hover);
		color: var(--color-white);
	}

	.offen {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		letter-spacing: 0.06em;
		color: var(--color-blue-dark);
		padding: var(--space-2) 0;
	}
</style>
