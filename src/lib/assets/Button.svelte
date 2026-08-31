<!--
	Grundbaustein. Nimmt seine Daten ausschließlich über Props entgegen und
	holt sich nichts selbst (siehe CLAUDE.md, Abschnitt "Aufbau").
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		type = 'button',
		onclick,
		children
	}: {
		variant?: 'primary' | 'secondary' | 'ghost';
		type?: 'button' | 'submit';
		onclick?: () => void;
		children: Snippet;
	} = $props();
</script>

<button class="btn {variant}" {type} {onclick}>
	{@render children()}
</button>

<style>
	.btn {
		font-family: var(--font-sans);
		font-size: var(--font-size-body);
		font-weight: var(--font-weight-semibold);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius);
		cursor: pointer;
		border: 1px solid transparent;
		transition:
			background-color var(--motion-fast) var(--motion-ease),
			border-color var(--motion-fast) var(--motion-ease),
			color var(--motion-fast) var(--motion-ease);
	}

	.primary {
		background: var(--color-accent);
		color: var(--color-white);
		border-color: var(--color-accent);
	}

	.primary:hover {
		background: var(--color-accent-hover);
		border-color: var(--color-accent-hover);
	}

	.secondary {
		background: var(--color-surface);
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.secondary:hover {
		background: var(--color-surface-tint);
	}

	.ghost {
		background: transparent;
		color: var(--color-text);
		border-color: var(--color-border);
	}

	.ghost:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.btn:active {
		transform: translateY(1px);
	}
</style>
