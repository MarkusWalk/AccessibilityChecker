<!--
	Die Befund-Karte. Betrifft E4 ("Welches Ergebnis liegt Ihnen vor?") über
	die Prop `variant`: 'text' (A, fertiger Text + Übernehmen-Button),
	'begruendung' (B, Vorschlag mit Begründung), 'frage' (C, Markierung und
	Frage — den Text schreiben Menschen), 'zwei' (E5-Rückfall, zwei
	Varianten zur Wahl über `suggestionAlt`). E4-Variante D ist keine
	FindingCard-Variante, sondern `ScreenshotViewer.svelte`.

	Die optionale Prop `mode` kommt aus E2 (`scopeFor()` in
	`src/lib/live/scope.ts`) und geht `variant` vor: Bei 'markierung' zeigt
	die Karte die Fundstelle aus `legalSource` als Tag und keinen Vorschlag,
	bei 'frage' zeigt sie `questionFor(finding)` statt eines Vorschlags —
	unabhängig davon, welche E4-Variante sonst gewählt wurde. Das bildet die
	Reihenfolge der Entscheidungen ab: E2 legt fest, *ob* das System
	überhaupt vorschlägt, E4 nur noch *wie*.

	Nimmt ausschließlich Props entgegen, holt sich nichts selbst.

	Einsatz in vier Stufen:
	1. Primitiv: <FindingCard finding={f} /> roh in eine Liste, ungestylt
	   betrachten (Standard-Variante 'text').
	2. Gestaltet: in Dashboard/GuidedFlow/ScreenshotViewer einsetzen, das
	   Theme greift automatisch (gemeinsame .card-Klasse).
	3. Besser: `variant` passend zur getroffenen E4-Antwort setzen.
	4. Klug: `mode` aus `scopeFor(finding, gewählteOption)` mitgeben, sobald
	   E2 entschieden ist.
-->
<script lang="ts">
	import type { Finding } from '$lib/types';
	import { questionFor, type ScopeMode } from '$lib/live/scope';
	import Badge from './Badge.svelte';
	import Tag from './Tag.svelte';
	import Button from './Button.svelte';

	let {
		finding,
		variant = 'text',
		mode,
		onAdopt
	}: {
		finding: Finding;
		variant?: 'text' | 'begruendung' | 'frage' | 'zwei';
		mode?: ScopeMode;
		onAdopt?: (finding: Finding) => void;
	} = $props();

	const achseLabel: Record<Finding['axis'], string> = {
		verstaendlichkeit: 'Verständlichkeit',
		zugaenglichkeit: 'Zugänglichkeit'
	};

	let uebernommen = $state(false);

	function uebernehmen() {
		uebernommen = true;
		onAdopt?.(finding);
	}

	// E2 geht vor E4: ohne explizit gesetztes `mode` verhält sich die Karte
	// wie zuvor ('vorschlag', durch `variant` bestimmt).
	const anzeige = $derived(mode ?? 'vorschlag');
</script>

<article class="card {finding.axis}">
	<header class="card-header">
		<Tag>{achseLabel[finding.axis]}</Tag>
		<Tag>{finding.rule}</Tag>
		<Badge tone={finding.severity}>{finding.severity}</Badge>
		{#if finding.legalSource && anzeige === 'markierung'}
			<Tag>{finding.legalSource}</Tag>
		{/if}
	</header>

	<blockquote class="excerpt">{finding.excerpt}</blockquote>

	{#if anzeige === 'markierung'}
		<p class="note">Markiert zur Prüfung — hier wird nichts vorformuliert.</p>
	{:else if anzeige === 'frage'}
		<p class="frage">{questionFor(finding)}</p>
	{:else if variant === 'text'}
		{#if finding.suggestion}
			<p class="suggestion">{finding.suggestion}</p>
			{#if uebernommen}
				<p class="uebernommen-hinweis">Übernommen</p>
			{:else}
				<Button variant="primary" onclick={uebernehmen}>Übernehmen</Button>
			{/if}
		{/if}
	{:else if variant === 'begruendung'}
		{#if finding.suggestion}
			<p class="suggestion">{finding.suggestion}</p>
		{/if}
		{#if finding.rationale}
			<p class="rationale">{finding.rationale}</p>
		{/if}
	{:else if variant === 'frage'}
		<p class="frage">{questionFor(finding)}</p>
	{:else if variant === 'zwei'}
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
		transition: border-color var(--motion-base) var(--motion-ease);
	}

	.card:hover {
		border-color: var(--color-accent);
		border-left-color: var(--color-accent);
	}

	.card.zugaenglichkeit {
		border-left-color: var(--color-teal);
	}

	.card.zugaenglichkeit:hover {
		border-color: var(--color-teal);
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

	.frage {
		margin: 0;
		font-weight: var(--font-weight-medium);
		color: var(--color-accent-secondary);
	}

	.uebernommen-hinweis {
		display: inline-flex;
		align-items: center;
		margin: 0;
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
		color: var(--color-accent-secondary);
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
		padding: var(--space-2);
		cursor: pointer;
		transition: background-color var(--motion-fast) var(--motion-ease);
	}

	.variante:hover {
		background: var(--color-surface-tint);
	}

	.variante input {
		margin-top: 0.3em;
		accent-color: var(--color-accent);
	}
</style>
