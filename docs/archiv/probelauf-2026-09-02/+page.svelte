<script lang="ts">
	// Hier beginnt der Live-Build. data.bestand.pages ist der aktive Bestand.
	// Diese Seite ist absichtlich fast leer: der Startpunkt der zwanzig Minuten.
	// Alles, was die fünf Entscheidungen brauchen, liegt schon in data.
	import type { PageData } from './$types';
	import Arbeitsplatz from '$lib/assets/Arbeitsplatz.svelte';
	import Chat from '$lib/assets/Chat.svelte';
	import FindingCard from '$lib/assets/FindingCard.svelte';
	import type { Page } from '$lib/types';
	import { scopeFor, countScopes } from '$lib/live/scope';
	import { byLebenslage } from '$lib/live/sort';
	import ScreenshotViewer from '$lib/assets/ScreenshotViewer.svelte';
	import { ruleLabel, shortTitle } from '$lib/live/labels';
	import type { Axis, Severity } from '$lib/types';

	let { data }: { data: PageData } = $props();

	let nachrichten: { role: 'user' | 'assistant'; text: string }[] = $state([]);
	let selected: Page | undefined = $state();
	let wartet = $state(false);
	let aktiverFund: string | null = $state(null);
	let filterAchse: Axis | 'alle' = $state('alle');
	let filterSeverity: Severity | 'alle' = $state('alle');
	let filterSuche = $state('');

	async function onSend(text: string) {
		nachrichten.push({ role: 'user', text });
		wartet = true;
		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bestand: data.bestand.name,
					question: text,
					history: nachrichten
				})
			});
			const { answer } = await res.json();
			nachrichten.push({ role: 'assistant', text: answer });
		} finally {
			wartet = false;
		}
	}

	const scopeCounts = $derived(countScopes(selected?.findings ?? [], 'gesetz'));
	const gruppen = $derived(byLebenslage(data.bestand.pages));

	const gefiltert = $derived(
		(selected?.findings ?? []).filter((f) => {
			if (filterAchse !== 'alle' && f.axis !== filterAchse) return false;
			if (filterSeverity !== 'alle' && f.severity !== filterSeverity) return false;
			if (filterSuche.trim()) {
				const q = filterSuche.trim().toLowerCase();
				if (!ruleLabel(f.rule).toLowerCase().includes(q) && !f.excerpt.toLowerCase().includes(q))
					return false;
			}
			return true;
		})
	);

	const seiten = $derived(data.bestand.pages.length);
	const befunde = $derived(data.bestand.pages.reduce((n, p) => n + p.findings.length, 0));
	const label = $derived(
		data.bestaende.find((b) => b.name === data.bestand.name)?.label ?? data.bestand.name
	);
</script>

<svelte:head>
	<title>AccessibilityChecker</title>
</svelte:head>

<!--
	Seitenkopf, bewusst flach: Kicker, Headline und Stand in einer Zone,
	damit der Arbeitsplatz darunter über der Falz beginnt. Die Headline
	bleibt in h2-Größe; die große Display-Größe gehört der Intro.
-->
<div class="canvas container">
	<div class="kopf">
		<div>
			<p class="kicker">Übersicht</p>
			<h1>Will<span class="akzent">kommen</span></h1>
		</div>
		<p class="stand">
			Bestand <strong>{label}</strong> · {seiten}
			{seiten === 1 ? 'Seite' : 'Seiten'} · {befunde}
			{befunde === 1 ? 'Befund' : 'Befunde'} geladen
		</p>
	</div>

	<Arbeitsplatz
		pages={data.bestand.pages}
		{gruppen}
		bind:selected
		zaehler="{scopeCounts.vorschlag} Vorschläge · {scopeCounts.markierung} Markierungen · {scopeCounts.frage} Fragen"
	>
		{#snippet haupt()}
			<Chat messages={nachrichten} {onSend} {wartet} />
		{/snippet}
		{#snippet kopf()}
			<div class="panel-kopf-eigen">
				<div class="kopf-links lesbar">
					<strong>{selected ? shortTitle(selected.title) : ''}</strong>
					<span class="kopf-meta">
						· {gefiltert.length} von {selected?.findings.length ?? 0} Befunden
					</span>
				</div>
				<span class="mono zaehler">
					{scopeCounts.vorschlag} Vorschläge · {scopeCounts.markierung} Markierungen · {scopeCounts.frage}
					Fragen
				</span>
			</div>
			<div class="filterleiste">
				<input type="search" placeholder="Suche in Regel oder Auszug…" bind:value={filterSuche} />
				<select bind:value={filterAchse}>
					<option value="alle">Alle Achsen</option>
					<option value="verstaendlichkeit">Verständlichkeit</option>
					<option value="zugaenglichkeit">Zugänglichkeit</option>
				</select>
				<select bind:value={filterSeverity}>
					<option value="alle">Alle Schweregrade</option>
					<option value="hoch">Hoch</option>
					<option value="mittel">Mittel</option>
					<option value="niedrig">Niedrig</option>
				</select>
			</div>
		{/snippet}
		{#snippet panel()}
			<div class="seite-mit-viewer">
				<div class="fund-liste">
					{#each gefiltert as f (f.id)}
						<div id="fund-{f.id}">
							<FindingCard finding={f} mode={scopeFor(f, 'gesetz')} />
						</div>
					{/each}
				</div>
				{#if selected}
					<div class="viewer-spalte">
						<ScreenshotViewer
							page={selected}
							findings={gefiltert}
							activeId={aktiverFund}
							onSelect={(f) => {
								aktiverFund = f.id;
								document
									.getElementById(`fund-${f.id}`)
									?.scrollIntoView({ behavior: 'smooth', block: 'center' });
							}}
						/>
					</div>
				{/if}
			</div>
		{/snippet}
	</Arbeitsplatz>
</div>

<style>
	.canvas {
		padding-top: var(--space-4);
		padding-bottom: var(--space-3);
	}

	.kopf {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2) var(--space-4);
	}

	.kicker {
		margin-bottom: var(--space-1);
	}

	h1 {
		margin: 0;
		font-size: var(--font-size-h2);
		line-height: var(--line-height-heading);
	}

	.stand {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		letter-spacing: 0.04em;
		color: var(--color-ink);
		opacity: 0.7;
	}

	.stand strong {
		font-weight: var(--font-weight-semibold);
		opacity: 1;
	}

	.seite-mit-viewer {
		display: flex;
		gap: var(--space-3);
		min-height: 0;
		height: 100%;
	}

	.fund-liste {
		flex: 1 1 50%;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		overflow-y: auto;
	}

	.viewer-spalte {
		flex: 1 1 50%;
		min-width: 0;
	}

	.panel-kopf-eigen {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		font-size: var(--font-size-body);
	}

	.kopf-meta {
		opacity: 0.75;
	}

	.mono.zaehler {
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
	}

	.filterleiste {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.filterleiste input,
	.filterleiste select {
		font-family: var(--font-sans);
		font-size: var(--font-size-small);
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text);
	}

	.filterleiste input[type='search'] {
		flex: 1 1 12rem;
	}
</style>
