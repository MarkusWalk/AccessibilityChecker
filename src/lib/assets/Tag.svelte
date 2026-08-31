<!-- Grundbaustein: kleines Etikett, z.B. für Regel-Namen oder Lebenslage. -->
<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();
</script>

<span class="tag">
	{@render children()}
</span>

<style>
	.tag {
		display: inline-flex;
		align-items: center;
		font-size: var(--font-size-small);
		color: var(--color-accent);
		background: var(--color-surface-tint);
		padding: 0.1rem var(--space-2);
	}
</style>
