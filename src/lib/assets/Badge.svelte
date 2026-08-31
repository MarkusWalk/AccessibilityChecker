<!-- Grundbaustein: Severity-/Effort-Badge. Nur Props, kein eigener State. -->
<script lang="ts">
	let {
		tone = 'neutral',
		children
	}: {
		tone?: 'hoch' | 'mittel' | 'niedrig' | 'neutral';
		children: import('svelte').Snippet;
	} = $props();
</script>

<span class="badge {tone}">
	{@render children()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
		padding: 0.1rem var(--space-2);
		border: 1px solid var(--color-border);
	}

	.hoch {
		color: var(--color-magenta);
		border-color: var(--color-magenta);
	}
	.mittel {
		color: var(--color-purple);
		border-color: var(--color-purple);
	}
	.niedrig {
		color: var(--color-teal);
		border-color: var(--color-teal);
	}
	.neutral {
		color: var(--color-text);
	}
</style>
