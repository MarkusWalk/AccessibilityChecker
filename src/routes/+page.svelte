<script lang="ts">
	import type { PageData } from './$types';
	import type { Page, Axis } from '$lib/types';
	import Arbeitsplatz from '$lib/assets/Arbeitsplatz.svelte';
	import Counter from '$lib/assets/Counter.svelte';
	import FindingCard from '$lib/assets/FindingCard.svelte';
	import ScreenshotViewer from '$lib/assets/ScreenshotViewer.svelte';
	import { scopeFor, countScopes } from '$lib/live/scope';
	import { bySeverity } from '$lib/live/sort';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let selected = $state<Page | undefined>(undefined);
	// E3·B: nach Schwere sortiert — schwerste Seite zuerst
	const pages = $derived(bySeverity(data.bestand.pages));
	const alle = $derived(pages.flatMap((p) => p.findings));

	const hoch = $derived(alle.filter((f) => f.severity === 'hoch').length);
	const markiert = $derived(alle.filter((f) => f.fromLegalSource).length);
	const zaehler = $derived(`${markiert} markiert · ${alle.length - markiert} Vorschläge`);

	// E2·B Stufe 4: countScopes auf gewählte Seite — Zähler im Panel-Kopf
	const seitenScopes = $derived(countScopes(selected?.findings ?? [], 'gesetz'));
	const seitenZaehler = $derived(
		`${seitenScopes.markierung} markiert · ${seitenScopes.vorschlag} Vorschläge`
	);

	// Prioritäten-Matrix: Schwere × Aufwand
	const SCHWEREN = ['hoch', 'mittel', 'niedrig'] as const;
	const AUFWAENDE = ['klein', 'mittel', 'gross'] as const;
	type Schwere = (typeof SCHWEREN)[number];
	type Aufwand = (typeof AUFWAENDE)[number];

	const matrix = $derived.by(() => {
		const m: Record<Schwere, Record<Aufwand, number>> = {
			hoch: { klein: 0, mittel: 0, gross: 0 },
			mittel: { klein: 0, mittel: 0, gross: 0 },
			niedrig: { klein: 0, mittel: 0, gross: 0 }
		};
		for (const f of alle) m[f.severity][f.effort]++;
		return m;
	});

	// Aktiver Filter: Klick auf Matrixzelle filtert die Befundliste im Panel
	let filterSchwere = $state<Schwere | null>(null);
	let filterAufwand = $state<Aufwand | null>(null);

	function toggleFilter(s: Schwere, a: Aufwand) {
		if (filterSchwere === s && filterAufwand === a) {
			filterSchwere = null;
			filterAufwand = null;
		} else {
			filterSchwere = s;
			filterAufwand = a;
		}
	}

	const SEVERITY_RANG: Record<string, number> = { hoch: 0, mittel: 1, niedrig: 2 };

	const panelBefunde = $derived.by(() => {
		const basis = [...(selected?.findings ?? [])].sort(
			(a, b) => SEVERITY_RANG[a.severity] - SEVERITY_RANG[b.severity]
		);
		if (!filterSchwere || !filterAufwand) return basis;
		return basis.filter((f) => f.severity === filterSchwere && f.effort === filterAufwand);
	});

	const filterLabel = $derived(
		filterSchwere && filterAufwand ? `${filterSchwere} × ${filterAufwand}` : null
	);

	// Schwere je Achse als Balken
	const ACHSEN_LABEL: Record<Axis, string> = {
		verstaendlichkeit: 'Verständlichkeit',
		zugaenglichkeit: 'Zugänglichkeit'
	};
	const achsenSchwere = $derived.by(() =>
		(['verstaendlichkeit', 'zugaenglichkeit'] as Axis[]).map((axis) => ({
			axis,
			hoch: alle.filter((f) => f.axis === axis && f.severity === 'hoch').length,
			mittel: alle.filter((f) => f.axis === axis && f.severity === 'mittel').length,
			niedrig: alle.filter((f) => f.axis === axis && f.severity === 'niedrig').length
		}))
	);
	const achsenMax = $derived(Math.max(1, ...achsenSchwere.map((a) => a.hoch + a.mittel + a.niedrig)));

	// Top-5 Seiten nach Reichweite — klickbar: wählt Seite in Sidebar
	const topReichweite = $derived([...pages].sort((a, b) => b.reach - a.reach).slice(0, 5));
	const reichweiteMax = $derived(Math.max(1, ...topReichweite.map((p) => p.reach)));

	function waehleSeiteAusBalken(url: string) {
		selected = pages.find((p) => p.url === url) ?? selected;
	}

	// E4·B: aktiver Befund für Viewer-Hervorhebung + Scroll zur Karte
	let activeId = $state<string | null>(null);

	function waehlebefund(id: string) {
		activeId = activeId === id ? null : id;
		if (activeId) {
			// Karte in Sicht scrollen — kurze Verzögerung damit der DOM die
			// karte-aktiv-Klasse gesetzt hat bevor scrollIntoView aufgerufen wird
			requestAnimationFrame(() => {
				document.getElementById(`karte-${activeId}`)?.scrollIntoView({
					behavior: 'smooth',
					block: 'nearest'
				});
			});
		}
	}

	// Bei Seitenwechsel activeId zurücksetzen
	$effect(() => {
		selected;
		activeId = null;
	});

	// E5: Benchmark — alle Bestände aus data.bestaende
	const bestaende = $derived(data.bestaende.filter((b) => !b.live && b.name !== 'fallback'));
	const benchmarkMax = $derived(Math.max(1, ...bestaende.map((b) => b.findings)));
</script>

<svelte:head>
	<title>AccessibilityChecker</title>
</svelte:head>

<Arbeitsplatz {pages} bind:selected hauptAnteil="gleich" zaehler={seitenZaehler}>
	{#snippet haupt()}
		<!-- Zähler-Reihe -->
		<section class="overview" aria-label="Zahlen zum Bestand">
			<Counter label="Seiten" value={pages.length} />
			<Counter label="Befunde" value={alle.length} />
			<Counter label="Schwere hoch" value={hoch} of={alle.length} />
			<Counter label="Gesetze markiert" value={markiert} of={alle.length} />
			<Counter label="Verständlichkeit" value={alle.filter((f) => f.axis === 'verstaendlichkeit').length} of={alle.length} />
			<Counter label="Zugänglichkeit" value={alle.filter((f) => f.axis === 'zugaenglichkeit').length} of={alle.length} />
		</section>

		<!-- E5: Benchmark -->
		{#if bestaende.length > 1}
			<section class="benchmark" aria-label="Benchmark Kommunen">
				<h2>Benchmark</h2>
				<div class="bench-liste">
					{#each bestaende as b (b.name)}
						{@const aktiv = b.name === data.bestand.name}
						{@const breite = (b.findings / benchmarkMax) * 100}
						{@const proSeite = b.pages > 0 ? (b.findings / b.pages).toFixed(1) : '—'}
						<button
							class="bench-zeile"
							class:bench-aktiv={aktiv}
							onclick={() => goto(`/?bestand=${b.name}`, { noScroll: true })}
							title="{b.label} öffnen"
						>
							<span class="bench-label">{b.label}</span>
							<div class="bench-spur">
								<span class="bench-balken" style="width: {breite}%"></span>
							</div>
							<span class="bench-zahl mono">{b.findings}</span>
							<span class="bench-rate mono" title="Befunde je Seite">{proSeite}/S</span>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		{#if alle.length > 0}
			<!-- Prioritäten-Block -->
			<section class="prioritaeten" aria-label="Prioritäten">
				<h2>Prioritäten</h2>
				<div class="prio-grid">
					<!-- Schwere × Aufwand Matrix -->
					<div class="prio-block">
						<p class="prio-titel">Schwere × Aufwand</p>
						<div class="matrix-tabelle">
							<span></span>
							{#each AUFWAENDE as a (a)}<span class="matrix-kopf-zelle">{a}</span>{/each}
							{#each SCHWEREN as s (s)}
								<span class="matrix-label">{s}</span>
								{#each AUFWAENDE as a (a)}
									<button
										class="matrix-zelle"
										class:quick={s === 'hoch' && a === 'klein'}
										class:aktiv={filterSchwere === s && filterAufwand === a}
										onclick={() => toggleFilter(s, a)}
										title="Filtern nach {s} × {a}"
									>
										{matrix[s][a]}
									</button>
								{/each}
							{/each}
						</div>
						<p class="prio-hinweis">
							{#if filterLabel}
								Zeige <strong>{filterLabel}</strong> — Klick zum Zurücksetzen.
							{:else}
								Hoch × klein zuerst — größte Wirkung, wenigster Aufwand.
							{/if}
						</p>
					</div>

					<!-- Schwere je Achse -->
					<div class="prio-block">
						<p class="prio-titel">Schwere je Achse</p>
						{#each achsenSchwere as a (a.axis)}
							<div class="balken-zeile">
								<span class="balken-label">{ACHSEN_LABEL[a.axis]}</span>
								<div class="balken-spur">
									<span class="balken-teil b-hoch" style="width: {(a.hoch / achsenMax) * 100}%"></span>
									<span class="balken-teil b-mittel" style="width: {(a.mittel / achsenMax) * 100}%"></span>
									<span class="balken-teil b-niedrig" style="width: {(a.niedrig / achsenMax) * 100}%"></span>
								</div>
								<span class="balken-zahl mono">{a.hoch + a.mittel + a.niedrig}</span>
							</div>
						{/each}
					</div>

					<!-- Top-5 Reichweite, klickbar -->
					<div class="prio-block">
						<p class="prio-titel">Reichweite · Top {topReichweite.length}</p>
						{#each topReichweite as p (p.url)}
							<button
								class="balken-zeile balken-btn"
								class:balken-aktiv={selected?.url === p.url}
								onclick={() => waehleSeiteAusBalken(p.url)}
								title="Seite auswählen: {p.title}"
							>
								<span class="balken-label" title={p.title}>{p.title}</span>
								<div class="balken-spur">
									<span class="balken-teil b-reichweite" style="width: {(p.reach / reichweiteMax) * 100}%"></span>
								</div>
								<span class="balken-zahl mono">{p.reach}</span>
							</button>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	{/snippet}

	{#snippet panel()}
		<div class="panel-viewer-layout">
			{#if selected?.screenshot}
				<div class="viewer-spalte">
					<ScreenshotViewer
						page={selected}
						findings={panelBefunde}
						{activeId}
						onSelect={(f) => waehlebefund(f.id)}
					/>
				</div>
			{/if}
			<div class="karten-spalte">
				{#each SCHWEREN as s (s)}
					{@const gruppe = panelBefunde.filter((f) => f.severity === s)}
					{#if gruppe.length > 0}
						<div class="schwere-gruppe">
							<div class="schwere-trenner schwere-{s}">
								<span class="schwere-label">{s}</span>
								<span class="schwere-zahl mono">{gruppe.length}</span>
							</div>
							{#each gruppe as f (f.id)}
								<div
									id="karte-{f.id}"
									role="button"
									tabindex="0"
									class="karte-wrapper"
									class:karte-aktiv={activeId === f.id}
									onclick={() => waehlebefund(f.id)}
									onkeydown={(e) => e.key === 'Enter' && waehlebefund(f.id)}
								>
									<FindingCard finding={f} variant="begruendung" mode={scopeFor(f, 'gesetz')} />
								</div>
							{/each}
						</div>
					{/if}
				{/each}
				{#if filterLabel && panelBefunde.length === 0}
					<p class="leerzustand">Keine Befunde auf dieser Seite mit Filter „{filterLabel}".</p>
				{/if}
			</div>
		</div>
	{/snippet}
</Arbeitsplatz>

<style>
	.overview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
		gap: var(--space-4);
		padding: var(--space-3);
		margin-bottom: var(--space-4);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.prioritaeten {
		padding: var(--space-3);
	}

	.prioritaeten h2 {
		font-size: var(--font-size-h4);
		margin-bottom: var(--space-2);
	}

	.prio-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.prio-block {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}

	.prio-titel {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		opacity: 0.7;
	}

	.prio-hinweis {
		margin: 0;
		font-size: var(--font-size-small);
		opacity: 0.7;
	}

	.matrix-tabelle {
		display: grid;
		grid-template-columns: 4.5rem repeat(3, 1fr);
		gap: var(--space-1);
	}

	.matrix-kopf-zelle {
		text-align: center;
		font-size: var(--font-size-small);
		text-transform: capitalize;
		opacity: 0.7;
	}

	.matrix-label {
		display: flex;
		align-items: center;
		font-size: var(--font-size-small);
		text-transform: capitalize;
	}

	.matrix-zelle {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border);
		padding: var(--space-1);
		font-family: var(--font-mono);
		font-weight: var(--font-weight-semibold);
		background: none;
		cursor: pointer;
		transition: background-color var(--motion-fast) var(--motion-ease);
	}

	.matrix-zelle:hover {
		background: var(--color-surface-tint);
	}

	.matrix-zelle.quick {
		border-color: var(--color-blue);
		background: var(--color-surface-tint);
		color: var(--color-blue);
	}

	.matrix-zelle.aktiv {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-white);
	}

	.balken-zeile {
		display: grid;
		grid-template-columns: 8rem 1fr 2.25rem;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-small);
	}

	.balken-btn {
		background: none;
		border: 1px solid transparent;
		cursor: pointer;
		padding: var(--space-1);
		transition: border-color var(--motion-fast) var(--motion-ease);
		text-align: left;
	}

	.balken-btn:hover {
		border-color: var(--color-border);
		background: var(--color-surface-tint);
	}

	.balken-aktiv {
		border-color: var(--color-blue) !important;
		background: var(--color-surface-tint) !important;
	}

	.balken-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.balken-spur {
		display: flex;
		height: 0.75rem;
		background: var(--color-surface-tint);
		overflow: hidden;
	}

	.balken-teil {
		height: 100%;
	}

	.b-hoch { background: var(--color-magenta); }
	.b-mittel { background: var(--color-purple); }
	.b-niedrig { background: var(--color-teal); }
	.b-reichweite { background: var(--color-blue); }

	.balken-zahl {
		text-align: right;
	}

	.leerzustand {
		font-size: var(--font-size-small);
		opacity: 0.6;
		padding: var(--space-3);
	}

	/* E3·B: Schwere-Gruppierung im Panel */
	.schwere-gruppe {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.schwere-trenner {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		border-left: 3px solid currentColor;
	}

	.schwere-hoch  { color: var(--color-magenta); }
	.schwere-mittel { color: var(--color-purple); }
	.schwere-niedrig { color: var(--color-teal); }

	.schwere-label {
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.schwere-zahl {
		font-size: var(--font-size-small);
		opacity: 0.7;
	}

	/* E4·B: Viewer + Karten nebeneinander */
	.panel-viewer-layout {
		display: flex;
		gap: var(--space-3);
		min-height: 0;
		height: 100%;
	}

	.viewer-spalte {
		flex: 0 0 38%;
		min-width: 0;
		min-height: 0;
	}

	.karten-spalte {
		flex: 1 1 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		overflow-y: auto;
	}

	.karte-wrapper {
		cursor: pointer;
		outline: 2px solid transparent;
		transition: outline-color var(--motion-fast) var(--motion-ease);
	}

	.karte-wrapper:hover {
		outline-color: var(--color-border);
	}

	.karte-aktiv {
		outline-color: var(--color-accent) !important;
	}

	/* E5: Benchmark */
	.benchmark {
		padding: var(--space-3);
	}

	.benchmark h2 {
		font-size: var(--font-size-h4);
		margin-bottom: var(--space-2);
	}

	.bench-liste {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.bench-zeile {
		display: grid;
		grid-template-columns: 7rem 1fr 3rem 3.5rem;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		background: none;
		border: 1px solid transparent;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-sans);
		color: var(--color-text);
		transition: border-color var(--motion-fast) var(--motion-ease);
	}

	.bench-zeile:hover {
		border-color: var(--color-border);
		background: var(--color-surface-tint);
	}

	.bench-aktiv {
		border-color: var(--color-blue) !important;
		background: var(--color-surface-tint) !important;
	}

	.bench-aktiv .bench-balken {
		background: var(--color-blue);
	}

	.bench-label {
		font-weight: var(--font-weight-medium);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bench-spur {
		height: 0.625rem;
		background: var(--color-surface-tint);
		overflow: hidden;
	}

	.bench-balken {
		display: block;
		height: 100%;
		background: var(--color-purple);
		transition: width var(--motion-base) var(--motion-ease);
	}

	.bench-zahl {
		text-align: right;
		font-weight: var(--font-weight-semibold);
	}

	.bench-rate {
		text-align: right;
		font-size: var(--font-size-small);
		opacity: 0.7;
	}
</style>
