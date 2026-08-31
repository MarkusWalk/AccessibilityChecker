<!--
	Zeigt den Screenshot einer Seite, optional mit Hinweis auf den
	betroffenen Selektor eines Befunds. Nur Props, kein eigener Fetch.
-->
<script lang="ts">
	let {
		src,
		alt,
		selector = null
	}: {
		src: string;
		alt: string;
		selector?: string | null;
	} = $props();
</script>

<figure class="viewer">
	<img {src} {alt} />
	{#if selector}
		<figcaption>Betroffene Stelle: <code>{selector}</code></figcaption>
	{/if}
</figure>

<style>
	.viewer {
		margin: 0;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}

	figcaption {
		padding: var(--space-2) var(--space-3);
		font-size: var(--font-size-small);
		border-top: 1px solid var(--color-border);
		color: var(--color-ink);
	}

	code {
		font-family: monospace;
		background: var(--color-surface-tint);
		padding: 0 0.2rem;
	}
</style>
