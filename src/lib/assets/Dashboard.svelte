<!--
	E1 Archetyp B: Dashboard. Zahlen zum Bestand auf einen Blick, darunter
	die Befunde. Die Seitenliste bringt das Dashboard NICHT mehr selbst mit,
	die liefert die Sidebar des Arbeitsplatz-Rahmens (Entscheidung A aus
	docs/erkenntnisse.md: ein Rahmen für alle vier Archetypen, keine zwei
	Seitenlisten auf einem Schirm).

	Nur Props: pages, variant (E4-Anzeigevariante, an FindingCard
	weitergereicht), scopeOption (E2, Default 'nirgends'), selectedUrl
	(hebt die Zahlen der gewählten Seite hervor). Kein eigener Fetch, keine
	eigene Sortierlogik — das entsteht live bei E3 (sort.ts auf `pages`
	anwenden, bevor sie hier reinkommen).

	Zwischen den Zahlen oben und der Befundliste unten steht ein
	"Prioritäten"-Block, vorbereitet nach dem Probelauf mit B/A/A/A: eine
	Schwere-×-Aufwand-Matrix (die eigentliche Frage beim Öffnen — was
	zuerst?), Schwere je Achse und die Reichweite der fünf meistgenutzten
	Seiten. Kein Chart-Schmuck, keine neue Abhängigkeit — reines CSS/Grid,
	nur Palette-Farben. Blendet sich aus, wenn der Bestand keine Befunde hat.

	Füllt die Höhe seines Containers und scrollt selbst.
-->
<script lang="ts">
	import type { Page, Axis } from '$lib/types';
	import { scopeFor, countScopes, type ScopeOption } from '$lib/live/scope';
	import Counter from './Counter.svelte';
	import FindingCard from './FindingCard.svelte';

	let {
		pages,
		variant = 'text',
		scopeOption = 'nirgends',
		selectedUrl = null
	}: {
		pages: Page[];
		variant?: 'text' | 'begruendung' | 'frage' | 'zwei';
		scopeOption?: ScopeOption;
		selectedUrl?: string | null;
	} = $props();

	const alle = $derived(pages.flatMap((p) => p.findings));
	const hoch = $derived(alle.filter((f) => f.severity === 'hoch').length);
	const jeAchse = $derived.by(() => {
		const z: Record<Axis, number> = { verstaendlichkeit: 0, zugaenglichkeit: 0 };
		for (const f of alle) z[f.axis]++;
		return z;
	});
	const scopes = $derived(countScopes(alle, scopeOption));

	// Prioritäten: kein Schmuckdiagramm, sondern die Frage, die beim Öffnen
	// des Dashboards eigentlich ansteht — was zuerst? "Hoch × klein" ist die
	// Zelle mit der größten Wirkung für den geringsten Aufwand.
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

	// Schwere je Achse als Balken statt nur als Zahl — zeigt, welches der
	// beiden Themen (Verständlichkeit/Zugänglichkeit) mehr wiegt.
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

	// Reichweite: nur die fünf meistgenutzten Seiten, nicht der ganze
	// Bestand — das Dashboard soll auf einen Blick lesbar bleiben (E3·A).
	const topReichweite = $derived([...pages].sort((a, b) => b.reach - a.reach).slice(0, 5));
	const reichweiteMax = $derived(Math.max(1, ...topReichweite.map((p) => p.reach)));
</script>

<div class="dashboard">
	<section class="overview" aria-label="Zahlen zum Bestand">
		<Counter label="Seiten" value={pages.length} />
		<Counter label="Befunde" value={alle.length} />
		<Counter label="Schwere hoch" value={hoch} of={alle.length} />
		<Counter label="Verständlichkeit" value={jeAchse.verstaendlichkeit} of={alle.length} />
		<Counter label="Zugänglichkeit" value={jeAchse.zugaenglichkeit} of={alle.length} />
		{#if scopeOption !== 'nirgends'}
			<Counter label="Vorschläge" value={scopes.vorschlag} of={alle.length} />
		{/if}
	</section>

	{#if alle.length > 0}
		<section class="prioritaeten" aria-label="Prioritäten">
			<h2>Prioritäten</h2>
			<div class="prio-grid">
				<div class="prio-block">
					<p class="prio-titel">Schwere × Aufwand</p>
					<div class="matrix-tabelle">
						<div class="matrix-kopf">
							<span></span>
							{#each AUFWAENDE as a (a)}<span>{a}</span>{/each}
						</div>
						{#each SCHWEREN as s (s)}
							<div class="matrix-zeile">
								<span class="matrix-label">{s}</span>
								{#each AUFWAENDE as a (a)}
									<span class="matrix-zelle" class:quick={s === 'hoch' && a === 'klein'}>
										{matrix[s][a]}
									</span>
								{/each}
							</div>
						{/each}
					</div>
					<p class="prio-hinweis">Hoch × klein zuerst — größte Wirkung, wenigster Aufwand.</p>
				</div>

				<div class="prio-block">
					<p class="prio-titel">Schwere je Achse</p>
					{#each achsenSchwere as a (a.axis)}
						<div class="balken-zeile">
							<span class="balken-label">{ACHSEN_LABEL[a.axis]}</span>
							<div class="balken-spur">
								<span class="balken-teil hoch" style="width: {(a.hoch / achsenMax) * 100}%"></span>
								<span class="balken-teil mittel" style="width: {(a.mittel / achsenMax) * 100}%"
								></span>
								<span class="balken-teil niedrig" style="width: {(a.niedrig / achsenMax) * 100}%"
								></span>
							</div>
							<span class="balken-zahl mono">{a.hoch + a.mittel + a.niedrig}</span>
						</div>
					{/each}
				</div>

				<div class="prio-block">
					<p class="prio-titel">Reichweite · Top {topReichweite.length}</p>
					{#each topReichweite as p (p.url)}
						<div class="balken-zeile">
							<span class="balken-label" title={p.title}>{p.title}</span>
							<div class="balken-spur">
								<span
									class="balken-teil reichweite"
									style="width: {(p.reach / reichweiteMax) * 100}%"
								></span>
							</div>
							<span class="balken-zahl mono">{p.reach}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<section class="findings">
		<h2>Befunde</h2>
		{#if alle.length === 0}
			<p class="leerzustand">Keine Befunde im Bestand.</p>
		{:else}
			<div class="finding-list">
				{#each pages as page (page.url)}
					{#each page.findings as finding (finding.id)}
						<FindingCard {finding} {variant} mode={scopeFor(finding, scopeOption)} />
					{/each}
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.dashboard {
		height: 100%;
		min-height: 0;
		overflow-y: auto;
		padding: var(--space-3) var(--space-3) var(--space-4);
	}

	.overview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
		gap: var(--space-4);
		padding: var(--space-3);
		margin-bottom: var(--space-4);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.findings h2 {
		font-size: var(--font-size-h4);
		margin-bottom: var(--space-2);
	}

	.prioritaeten {
		margin-bottom: var(--space-4);
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

	.matrix-kopf,
	.matrix-zeile {
		display: contents;
	}

	.matrix-kopf span {
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
	}

	.matrix-zelle.quick {
		border-color: var(--color-blue);
		background: var(--color-surface-tint);
		color: var(--color-blue);
	}

	.balken-zeile {
		display: grid;
		grid-template-columns: 8rem 1fr 2.25rem;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-small);
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

	.balken-teil.hoch {
		background: var(--color-magenta);
	}

	.balken-teil.mittel {
		background: var(--color-purple);
	}

	.balken-teil.niedrig {
		background: var(--color-teal);
	}

	.balken-teil.reichweite {
		background: var(--color-blue);
	}

	.balken-zahl {
		text-align: right;
	}

	.finding-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
		gap: var(--space-3);
	}
</style>
