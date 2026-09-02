<!--
	Arbeitsplatz.svelte — der Rahmen, in den nach E1 jeder Archetyp gesetzt
	wird: feste Sidebar links (Seitenliste über Sidebar.svelte), rechts eine
	Spalte mit `haupt` oben (Pflicht) und optional `panel` darunter. Beide
	Bereiche scrollen für sich und kollabieren nicht (siehe .werkzeug/.spalte
	in global.css). Unter 60rem Breite fällt die Sidebar über den Inhalt.

	Das Arbeitsobjekt ist in jeder Kombination dasselbe: die Befundliste der
	gewählten Seite. Der Archetyp (E1) ist nur die Kopfzone darüber, E2 bis
	E5 verändern Inhalt, Reihenfolge und Kopf derselben Liste. Darum hat das
	Panel eine feste Kopfzone (Seitentitel, Befundzahl, Kontext, Zähler) und
	bekommt standardmäßig mehr Platz als `haupt`.

	Props:
	  pages: Page[]
	  selected?: Page          — bindable, Default die erste Seite. Wird beim
	                             Bestandswechsel automatisch zurückgesetzt.
	  gruppen?: Record<string, Page[]>   — E3 D, Gruppen in der Sidebar
	  zaehler?: string         — Mono-Zeile rechts in der Kopfzone, z.B.
	                             "12 Vorschläge · 3 Markierungen"
	  kontext?: string         — Zusatz in der Kopfzone, z.B. die Lebenslage
	  hauptAnteil?: 'klein' | 'gleich' | 'gross'
	                           — wie viel Höhe `haupt` bekommt. 'klein' ist
	                             Default (Chat oben, Liste dominiert),
	                             'gross' für Bericht und Geführt, die selbst
	                             die Befunde zeigen.
	  Snippets: haupt (Pflicht), panel (optional), kopf (optional, ersetzt
	  die Standard-Kopfzone des Panels — der Landeplatz für E5-Filter)

	Braucht KEINE Höhe von außen: ohne Vorgabe füllt der Rahmen den Schirm
	unter der Kopfleiste (`--arbeitsplatz-hoehe` überschreibt das).

	Beispiel — Chat oben, Befundkarten-Liste der ausgewählten Seite darunter:

		<Arbeitsplatz {pages} bind:selected zaehler="…">
			{#snippet haupt()}
				<Chat messages={nachrichten} onSend={…} />
			{/snippet}
			{#snippet panel()}
				{#each selected?.findings ?? [] as f (f.id)}
					<FindingCard finding={f} />
				{/each}
			{/snippet}
		</Arbeitsplatz>

	Einsatz in vier Stufen (siehe CLAUDE.md):
	1. Primitiv: nur `haupt` befüllen, `panel` weglassen.
	2. Gestaltet: `panel` mit einer Befundliste der ausgewählten Seite.
	3. Besser: `zaehler`/`kontext` setzen, `hauptAnteil` passend zum Archetyp.
	4. Klug: `mode`/`scopeFor()`/`countScopes()` aus scope.ts einspeisen.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Page } from '$lib/types';
	import { shortTitle } from '$lib/live/labels';
	import Sidebar from './Sidebar.svelte';

	let {
		pages,
		selected = $bindable(),
		zaehler,
		kontext,
		hauptAnteil = 'klein',
		haupt,
		panel,
		kopf,
		gruppen
	}: {
		pages: Page[];
		selected?: Page;
		zaehler?: string;
		kontext?: string;
		hauptAnteil?: 'klein' | 'gleich' | 'gross';
		haupt: Snippet;
		panel?: Snippet;
		kopf?: Snippet;
		gruppen?: Record<string, Page[]>;
	} = $props();

	function waehleSeite(url: string) {
		selected = pages.find((p) => p.url === url) ?? selected;
	}

	// Ohne Auswahl von außen gilt die erste Seite — und zwar so, dass der
	// Wert auch zum Elternteil zurückfließt (ein Fallback in $bindable täte
	// das nicht, dann zeigte ein Zähler im Elternteil Nullen). Beim
	// Bestandswechsel in der Kopfleiste tauscht `pages` aus, die Komponente
	// bleibt stehen: zeigt `selected` auf eine Seite, die es nicht mehr gibt,
	// springt die Auswahl auf die erste Seite des neuen Bestands.
	$effect(() => {
		if (!selected || !pages.some((p) => p.url === selected?.url)) selected = pages[0];
	});

	const befundzahl = $derived(selected?.findings.length ?? 0);
</script>

<div class="arbeitsplatz werkzeug">
	<Sidebar {pages} selectedUrl={selected?.url ?? null} onSelect={waehleSeite} {gruppen} />

	<div class="rechts spalte anteil-{hauptAnteil}">
		<div class="haupt-bereich">
			{@render haupt()}
		</div>

		{#if panel}
			<div class="panel-bereich spalte">
				{#if kopf}
					<div class="panel-kopf">{@render kopf()}</div>
				{:else if selected}
					<div class="panel-kopf">
						<div class="kopf-links lesbar">
							<strong>{shortTitle(selected.title)}</strong>
							<span class="kopf-meta">
								· {befundzahl}
								{befundzahl === 1 ? 'Befund' : 'Befunde'}
								{#if kontext}· {kontext}{/if}
							</span>
						</div>
						{#if zaehler}
							<span class="mono zaehler">{zaehler}</span>
						{/if}
					</div>
				{/if}
				<div class="panel-inhalt">
					{#if !selected}
						<p class="leerzustand">Keine Seite gewählt. Links eine Seite auswählen.</p>
					{:else if befundzahl === 0}
						<p class="leerzustand">Keine Befunde auf dieser Seite.</p>
					{:else}
						{@render panel()}
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.arbeitsplatz {
		/* Selbsttragend: ohne Vorgabe von außen füllt der Rahmen den Schirm
		   unter Kopfleiste und Seitenkopf. */
		height: var(--arbeitsplatz-hoehe, calc(100dvh - 11rem));
		min-height: 28rem;
	}

	.rechts {
		min-width: 0;
		gap: 0;
	}

	.haupt-bereich {
		min-height: 0;
		min-width: 0;
		overflow-y: auto;
	}

	/* Verhältnis haupt : panel. Ohne Panel bekommt haupt alles. */
	.anteil-klein > .haupt-bereich {
		flex: 0 1 auto;
		max-height: 38%;
		min-height: 12rem;
	}
	.anteil-gleich > .haupt-bereich {
		flex: 1 1 50%;
	}
	.anteil-gross > .haupt-bereich {
		flex: 3 1 0;
	}
	.rechts > .haupt-bereich:only-child {
		flex: 1 1 auto;
		max-height: none;
	}

	.panel-bereich {
		flex: 2 1 0;
		min-height: 0;
		border-top: 1px solid var(--color-border);
		gap: 0;
	}

	.anteil-gross > .panel-bereich {
		flex: 1 1 0;
	}

	.panel-kopf {
		flex: none;
	}

	.kopf-links {
		font-size: var(--font-size-body);
	}

	.kopf-meta {
		opacity: 0.75;
	}

	.panel-inhalt {
		flex: 1;
		min-height: 0;
		min-width: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3) 0 var(--space-3) 0;
	}

	.zaehler {
		font-weight: var(--font-weight-semibold);
		color: var(--color-ink);
		white-space: nowrap;
	}
</style>
