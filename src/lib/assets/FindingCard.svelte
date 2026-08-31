<!--
	Die Befund-Karte. Betrifft ausschließlich E4 ("Wie weit geht das System
	von sich aus?") — alle vier Anzeigevarianten derselben Daten
	(suggestion, suggestionAlt, rationale), über die Prop `mode` geschaltet.
	Live wird nur noch entschieden, welcher Modus der App-weite Standard ist.

	Nimmt ausschließlich Props entgegen, holt sich nichts selbst.
-->
<script lang="ts">
	import type { Finding } from '$lib/types';
	import Badge from './Badge.svelte';
	import Tag from './Tag.svelte';
	import Button from './Button.svelte';

	let {
		finding,
		mode = 'vorschlag',
		onApply
	}: {
		finding: Finding;
		mode?: 'vorschlag' | 'begruendet' | 'markierung' | 'zwei-varianten';
		onApply?: (finding: Finding) => void;
	} = $props();

	const achseLabel: Record<Finding['axis'], string> = {
		verstaendlichkeit: 'Verständlichkeit',
		zugaenglichkeit: 'Zugänglichkeit'
	};
</script>

<article class="card {finding.axis}">
	<header class="card-header">
		<Tag>{achseLabel[finding.axis]}</Tag>
		<Tag>{finding.rule}</Tag>
		<Badge tone={finding.severity}>{finding.severity}</Badge>
		{#if finding.legalSource}
			<Tag>{finding.legalSource}</Tag>
		{/if}
	</header>

	<blockquote class="excerpt">{finding.excerpt}</blockquote>

	{#if mode === 'markierung'}
		<p class="note">Markiert zur Prüfung — keine automatische Formulierung.</p>
	{:else if mode === 'vorschlag'}
		{#if finding.suggestion}
			<p class="suggestion">{finding.suggestion}</p>
			<Button variant="primary" onclick={() => onApply?.(finding)}>Übernehmen</Button>
		{/if}
	{:else if mode === 'begruendet'}
		{#if finding.suggestion}
			<p class="suggestion">{finding.suggestion}</p>
		{/if}
		{#if finding.rationale}
			<p class="rationale">{finding.rationale}</p>
		{/if}
	{:else if mode === 'zwei-varianten'}
		<div class="varianten">
			{#if finding.suggestion}
				<label class="variante">
					<input type="radio" name="variante-{finding.id}" checked />
					<span>{finding.suggestion}</span>
				</label>
			{/if}
			{#if finding.suggestionAlt}
				<label class="variante">
					<input type="radio" name="variante-{finding.id}" />
					<span>{finding.suggestionAlt}</span>
				</label>
			{/if}
		</div>
	{/if}
</article>

<style>
	.card {
		border: 1px solid var(--color-border);
		padding: var(--space-3);
		background: var(--color-surface);
		border-left: 3px solid var(--color-accent);
	}

	.card.zugaenglichkeit {
		border-left-color: var(--color-teal);
	}

	.card-header {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.excerpt {
		margin: 0 0 var(--space-2) 0;
		padding-left: var(--space-2);
		border-left: 2px solid var(--color-border);
		color: var(--color-text);
		font-style: normal;
	}

	.suggestion {
		margin: 0 0 var(--space-2) 0;
		font-weight: var(--font-weight-medium);
	}

	.rationale {
		margin: 0;
		font-size: var(--font-size-small);
		color: var(--color-ink);
		opacity: 0.75;
	}

	.note {
		margin: 0;
		font-size: var(--font-size-small);
		font-style: italic;
	}

	.varianten {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.variante {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
	}
</style>
