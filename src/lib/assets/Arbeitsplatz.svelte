<!--
	Arbeitsplatz.svelte — der Rahmen, in den nach E1 jeder Archetyp gesetzt
	wird: feste Sidebar links (Seitenliste über Sidebar.svelte), rechts eine
	Spalte mit `haupt` oben (Pflicht) und optional `panel` darunter. Beide
	Bereiche scrollen für sich und kollabieren nicht (siehe .werkzeug/.spalte
	in global.css) — das war der Layoutbruch aus dem Probelauf. Unter 60rem
	Breite fällt die Sidebar über den Inhalt.

	Props:
	  pages: Page[]
	  selected?: Page        — bindable, Default die erste Seite
	  zaehler?: string       — Mono-Zeile über dem Panel, z.B.
	                            "12 Vorschläge · 3 Markierungen"
	  Snippets: haupt (Pflicht), panel (optional)

	Arbeitsplatz braucht selbst eine Höhe von außen (z.B. `height: 100vh`
	auf der Seite oder `flex: 1` in einem Flex-Container mit fester Höhe) —
	erst dann greift das interne Scrollen statt dass die Seite wächst.

	Beispiel — Chat oben, Befundkarten-Liste der ausgewählten Seite darunter:

		<script lang="ts">
			import type { Page } from '$lib/types';
			let { pages }: { pages: Page[] } = $props();
			let selected = $state<Page | undefined>();
			let nachrichten = $state<{ role: 'user' | 'assistant'; text: string }[]>([]);
		</script>

		<Arbeitsplatz
			{pages}
			bind:selected
			zaehler="{selected?.findings.length ?? 0} Befunde auf dieser Seite"
		>
			{#snippet haupt()}
				<Chat messages={nachrichten} onSend={(text) => { /* .../api/chat */ }} />
			{/snippet}
			{#snippet panel()}
				{#each selected?.findings ?? [] as f (f.id)}
					<FindingCard finding={f} />
				{/each}
			{/snippet}
		</Arbeitsplatz>

	Einsatz in vier Stufen (siehe CLAUDE.md):
	1. Primitiv: nur `haupt` befüllen, `panel` weglassen — Sidebar + ein
	   Bereich reicht schon für E1 alleine.
	2. Gestaltet: `panel` mit einer Befundliste der ausgewählten Seite
	   ergänzen (Vorbereitung für E2).
	3. Besser: `zaehler` setzen, sobald eine Zahl feststeht.
	4. Klug: `mode`/`scopeFor()`/`countScopes()` aus scope.ts in `panel`
	   bzw. `zaehler` einspeisen, sobald E2 entschieden ist.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Page } from '$lib/types';
	import Sidebar from './Sidebar.svelte';

	let {
		pages,
		selected = $bindable(pages[0]),
		zaehler,
		haupt,
		panel
	}: {
		pages: Page[];
		selected?: Page;
		zaehler?: string;
		haupt: Snippet;
		panel?: Snippet;
	} = $props();

	function waehleSeite(url: string) {
		selected = pages.find((p) => p.url === url) ?? selected;
	}
</script>

<div class="arbeitsplatz werkzeug">
	<Sidebar {pages} selectedUrl={selected?.url ?? null} onSelect={waehleSeite} />

	<div class="rechts spalte">
		<div class="haupt-bereich">
			{@render haupt()}
		</div>

		{#if panel}
			<div class="panel-bereich spalte">
				{#if zaehler}
					<p class="mono zaehler">{zaehler}</p>
				{/if}
				<div class="panel-inhalt">
					{@render panel()}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.arbeitsplatz {
		height: 100%;
		min-height: 0;
	}

	.rechts {
		min-width: 0;
	}

	.haupt-bereich {
		flex: 1;
		min-height: 0;
		min-width: 0;
		overflow-y: auto;
	}

	.panel-bereich {
		flex: 1;
		min-height: 0;
		border-top: 1px solid var(--color-border);
		padding-top: var(--space-3);
	}

	.panel-inhalt {
		flex: 1;
		min-height: 0;
		min-width: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.zaehler {
		flex: none;
		opacity: 0.7;
	}
</style>
