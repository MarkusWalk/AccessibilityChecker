<!--
	Zeigt den Fortschritt eines Hintergrund-Crawls (siehe
	scripts/live-crawl.ts). Wahrscheinlicher E5-Wunsch: "was passiert gerade
	im Hintergrund". Nur Props, kein eigenes Polling — die aufrufende Seite
	entscheidet, wie oft der Status neu gelesen wird.
-->
<script lang="ts">
	let {
		status
	}: {
		status: {
			crawled: number;
			total: number | null;
			currentUrl: string | null;
			errors: number;
			done: boolean;
		};
	} = $props();

	const anteil = $derived(
		status.total && status.total > 0 ? Math.min(100, Math.round((status.crawled / status.total) * 100)) : null
	);
</script>

<section class="monitor" aria-live="polite">
	<header>
		<span class="kicker">Hintergrund-Crawl</span>
		<span class="status">{status.done ? 'Fertig' : 'Läuft'}</span>
	</header>

	<div class="bar" role="progressbar" aria-valuenow={anteil ?? undefined} aria-valuemin={0} aria-valuemax={100}>
		<div class="fill" style:width="{anteil ?? (status.done ? 100 : 10)}%"></div>
	</div>

	<dl>
		<div>
			<dt>Seiten</dt>
			<dd>{status.crawled}{status.total ? ` / ${status.total}` : ''}</dd>
		</div>
		<div>
			<dt>Fehler</dt>
			<dd>{status.errors}</dd>
		</div>
	</dl>

	{#if status.currentUrl}
		<p class="current">{status.currentUrl}</p>
	{/if}
</section>

<style>
	.monitor {
		border: 1px solid var(--color-border);
		padding: var(--space-3);
		background: var(--color-surface);
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-2);
	}

	.status {
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
		color: var(--color-accent-secondary);
	}

	.bar {
		height: 6px;
		background: var(--color-surface-tint);
		margin-bottom: var(--space-2);
	}

	.fill {
		height: 100%;
		background: var(--color-accent);
		transition: width 0.3s ease;
	}

	dl {
		display: flex;
		gap: var(--space-4);
		margin: 0 0 var(--space-2) 0;
	}

	dt {
		font-size: var(--font-size-small);
		opacity: 0.7;
	}

	dd {
		margin: 0;
		font-weight: var(--font-weight-medium);
	}

	.current {
		margin: 0;
		font-size: var(--font-size-small);
		font-family: monospace;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
