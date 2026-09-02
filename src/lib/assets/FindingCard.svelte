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

	Lesbarkeit: Regeln stehen im Klartext (labels.ts), der Ausschnitt bricht
	überall um und ist in der Höhe begrenzt, Adressen und Pfade stehen in
	Monospace. Jeder Modus endet mit einer Handlung: Übernehmen bei einem
	Vorschlag, sonst "Erledigt" zum Abhaken.

	Nimmt ausschließlich Props entgegen, holt sich nichts selbst.

	Einsatz in vier Stufen:
	1. Primitiv: <FindingCard finding={f} /> roh in eine Liste.
	2. Gestaltet: in Dashboard/GuidedFlow/ScreenshotViewer einsetzen.
	3. Besser: `variant` passend zur getroffenen E4-Antwort setzen.
	4. Klug: `mode` aus `scopeFor(finding, gewählteOption)` mitgeben.
-->
<script lang="ts">
	import type { Finding } from '$lib/types';
	import { questionFor, type ScopeMode } from '$lib/live/scope';
	import { ruleLabel, isTechnicalExcerpt } from '$lib/live/labels';
	import Badge from './Badge.svelte';
	import Tag from './Tag.svelte';
	import Button from './Button.svelte';

	let {
		finding,
		variant = 'text',
		mode,
		onAdopt,
		onDone
	}: {
		finding: Finding;
		variant?: 'text' | 'begruendung' | 'frage' | 'zwei';
		mode?: ScopeMode;
		onAdopt?: (finding: Finding) => void;
		onDone?: (finding: Finding) => void;
	} = $props();

	const achseLabel: Record<Finding['axis'], string> = {
		verstaendlichkeit: 'Verständlichkeit',
		zugaenglichkeit: 'Zugänglichkeit'
	};

	let uebernommen = $state(false);
	let erledigt = $state(false);

	function uebernehmen() {
		uebernommen = true;
		onAdopt?.(finding);
	}

	function abhaken() {
		erledigt = !erledigt;
		if (erledigt) onDone?.(finding);
	}

	// E2 geht vor E4: ohne explizit gesetztes `mode` verhält sich die Karte
	// wie zuvor ('vorschlag', durch `variant` bestimmt).
	const anzeige = $derived(mode ?? 'vorschlag');
	const technisch = $derived(isTechnicalExcerpt(finding.rule, finding.excerpt));
	const zeigtUebernehmen = $derived(
		anzeige === 'vorschlag' && variant === 'text' && !!finding.suggestion
	);
</script>

<article class="card {finding.axis}" class:erledigt>
	<header class="card-header">
		<Tag>{achseLabel[finding.axis]}</Tag>
		<span class="regel">{ruleLabel(finding.rule)}</span>
		<Badge tone={finding.severity}>{finding.severity}</Badge>
		{#if finding.legalSource && anzeige === 'markierung'}
			<Tag>{finding.legalSource}</Tag>
		{/if}
	</header>

	<blockquote class="excerpt lesbar" class:technisch>{finding.excerpt}</blockquote>

	{#if anzeige === 'markierung'}
		<p class="note">Markiert zur Prüfung — hier wird nichts vorformuliert.</p>
	{:else if anzeige === 'frage'}
		<p class="frage">{questionFor(finding)}</p>
	{:else if variant === 'text'}
		{#if finding.suggestion}
			<p class="suggestion lesbar">{finding.suggestion}</p>
		{:else}
			<p class="note">Kein Vorschlag vorhanden.</p>
		{/if}
	{:else if variant === 'begruendung'}
		{#if finding.suggestion}
			<p class="suggestion lesbar">{finding.suggestion}</p>
		{/if}
		{#if finding.rationale}
			<p class="rationale lesbar">{finding.rationale}</p>
		{/if}
	{:else if variant === 'frage'}
		<p class="frage">{questionFor(finding)}</p>
	{:else if variant === 'zwei'}
		<div class="varianten">
			{#if finding.suggestion}
				<label class="variante">
					<input type="radio" name="variante-{finding.id}" checked />
					<span class="lesbar">{finding.suggestion}</span>
				</label>
			{/if}
			{#if finding.suggestionAlt}
				<label class="variante">
					<input type="radio" name="variante-{finding.id}" />
					<span class="lesbar">{finding.suggestionAlt}</span>
				</label>
			{/if}
		</div>
	{/if}

	<footer class="aktionen">
		{#if zeigtUebernehmen}
			{#if uebernommen}
				<span class="uebernommen-hinweis">Übernommen</span>
			{:else}
				<Button variant="primary" onclick={uebernehmen}>Übernehmen</Button>
			{/if}
		{/if}
		<Button variant="ghost" onclick={abhaken}>{erledigt ? 'Wieder öffnen' : 'Erledigt'}</Button>
	</footer>
</article>

<style>
	.card {
		border: 1px solid var(--color-border);
		padding: var(--space-3);
		background: var(--color-surface);
		border-left: 3px solid var(--color-accent);
		transition:
			border-color var(--motion-base) var(--motion-ease),
			opacity var(--motion-base) var(--motion-ease);
		min-width: 0;
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

	.card.erledigt {
		opacity: 0.55;
	}

	.card-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.regel {
		font-weight: var(--font-weight-semibold);
	}

	.excerpt {
		margin: 0 0 var(--space-2) 0;
		padding-left: var(--space-2);
		border-left: 2px solid var(--color-border);
		color: var(--color-text);
		font-style: normal;
		max-height: 7.5rem;
		overflow: hidden;
	}

	.excerpt.technisch {
		hyphens: none;
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		opacity: 0.85;
	}

	.suggestion {
		margin: 0 0 var(--space-2) 0;
		font-weight: var(--font-weight-medium);
	}

	.rationale {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--font-size-small);
		color: var(--color-ink);
		opacity: 0.8;
	}

	.note {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--font-size-small);
		font-style: italic;
	}

	.frage {
		margin: 0 0 var(--space-2) 0;
		font-weight: var(--font-weight-medium);
		color: var(--color-accent-secondary);
	}

	.aktionen {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-top: var(--space-1);
	}

	.uebernommen-hinweis {
		display: inline-flex;
		align-items: center;
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
		color: var(--color-accent-secondary);
	}

	.varianten {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
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
