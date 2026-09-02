<!--
	E1 Archetyp C: echter Wizard. Nicht eine Seite nach der anderen, sondern
	ein Befund nach dem anderen — jede Seite ohne Befunde ist ein eigener,
	kurzer Schritt ("keine Befunde"). Die Reihenfolge liegt beim System:
	nur Vor/Zurück, kein Sprung. Am Ende steht eine Zusammenfassung statt
	einer leeren Fläche.

	Props: pages, variant (E4), scopeOption (E2), onPageChange (meldet die
	Seite des aktuellen Schritts nach außen, z.B. damit Arbeitsplatz die
	Sidebar als Fortschrittsanzeige mitführt — dort dann
	sidebarInteractive={false} setzen).

	Kein index/onIndexChange von außen mehr: der Fortschritt ist Sache des
	Wizards selbst, das ist der Kern des Konzepts (siehe docs/erkenntnisse.md,
	"Was 'geführt' im Webdesign bedeutet").
-->
<script lang="ts">
	import type { Page } from '$lib/types';
	import { scopeFor, type ScopeOption } from '$lib/live/scope';
	import FindingCard from './FindingCard.svelte';
	import ScreenshotViewer from './ScreenshotViewer.svelte';
	import Button from './Button.svelte';
	import { shortTitle } from '$lib/live/labels';

	let {
		pages,
		variant = 'text',
		scopeOption = 'nirgends',
		onPageChange
	}: {
		pages: Page[];
		variant?: 'text' | 'begruendung' | 'frage' | 'zwei';
		scopeOption?: ScopeOption;
		onPageChange?: (page: Page | null) => void;
	} = $props();

	type Schritt = { page: Page; finding: Page['findings'][number] | null };

	const schritte = $derived(
		pages.flatMap((page): Schritt[] =>
			page.findings.length > 0
				? page.findings.map((finding) => ({ page, finding }))
				: [{ page, finding: null }]
		)
	);

	let index = $state(0);

	const fertig = $derived(index >= schritte.length);
	const aktuell = $derived(fertig ? undefined : schritte[index]);

	$effect(() => {
		onPageChange?.(aktuell?.page ?? null);
	});

	const bearbeiteteSeiten = $derived(new Set(pages.map((p) => p.url)).size);
	const bearbeiteteBefunde = $derived(schritte.filter((s) => s.finding).length);

	function weiter() {
		if (index < schritte.length) index += 1;
	}
	function zurueck() {
		if (index > 0) index -= 1;
	}
	function nochmal() {
		index = 0;
	}
</script>

{#if fertig}
	<div class="flow">
		<div class="fertig">
			<p class="kicker">Fertig</p>
			<h2 class="lesbar">Alle Befunde durchgearbeitet</h2>
			<p class="zusammenfassung">
				{bearbeiteteSeiten} {bearbeiteteSeiten === 1 ? 'Seite' : 'Seiten'} ·
				{bearbeiteteBefunde} {bearbeiteteBefunde === 1 ? 'Befund' : 'Befunde'} gesehen
			</p>
			<Button variant="primary" onclick={nochmal}>Von vorn</Button>
		</div>
	</div>
{:else if aktuell}
	<div class="flow">
		<header class="flow-header">
			<span class="fortschritt">Schritt {index + 1} von {schritte.length}</span>
			<h2 class="lesbar">{shortTitle(aktuell.page.title)}</h2>
		</header>

		<div class="flow-body">
			<ScreenshotViewer
				page={aktuell.page}
				findings={aktuell.finding ? [aktuell.finding] : []}
				activeId={aktuell.finding?.id ?? null}
			/>

			<div class="findings">
				{#if aktuell.finding}
					{#key aktuell.finding.id}
						<FindingCard
							finding={aktuell.finding}
							{variant}
							mode={scopeFor(aktuell.finding, scopeOption)}
						/>
					{/key}
				{:else}
					<p class="leer">Keine Befunde auf dieser Seite.</p>
				{/if}
			</div>
		</div>

		<footer class="flow-nav">
			<Button variant="ghost" disabled={index === 0} onclick={zurueck}>Zurück</Button>
			<Button variant="primary" onclick={weiter}>
				{index === schritte.length - 1 ? 'Fertig' : 'Weiter'}
			</Button>
		</footer>
	</div>
{/if}

<style>
	.flow {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3);
		height: 100%;
		min-height: 0;
		overflow-y: auto;
		max-width: var(--lese-breite, none);
	}

	.flow-header h2 {
		font-size: var(--font-size-h3);
		margin: 0;
	}

	.fortschritt {
		font-size: var(--font-size-small);
		color: var(--color-accent-secondary);
		font-weight: var(--font-weight-semibold);
	}

	.flow-body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--space-4);
		align-items: start;
	}

	.flow-body > * {
		min-width: 0;
	}

	.findings {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.leer {
		margin: 0;
		padding: var(--space-4);
		border: 2px dashed var(--color-border);
		opacity: 0.7;
		text-align: center;
	}

	.flow-nav {
		display: flex;
		justify-content: space-between;
	}

	.fertig {
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		max-width: 28rem;
		padding: var(--space-5) var(--space-4);
		text-align: center;
	}

	.fertig .kicker {
		margin: 0;
	}

	.fertig h2 {
		margin: 0;
	}

	.zusammenfassung {
		margin: 0 0 var(--space-2) 0;
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		opacity: 0.75;
	}
</style>
