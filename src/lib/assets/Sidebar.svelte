<!--
	Seitenliste, linke Spalte von Arbeitsplatz.svelte. Nur Props: pages,
	selectedUrl, onSelect, gruppen (E3 D). Holt sich nichts selbst. Füllt
	Breite/Höhe des umgebenden Containers.

	Ruhig gehalten: Titel ohne Host-Präfix, höchstens zwei Zeilen, die
	Befundzahl als Zahl, die Schwere als Farbstreifen links statt als Badge
	in jeder Zeile. Badges bleiben den Karten vorbehalten.

	interactive (Default true): bei false wird die Liste zur reinen
	Fortschrittsanzeige — kein Klick, kein Hover, nur die aktive Zeile
	zeigt, wo man steht. Für den Wizard-Charakter von Geführt (E1 C), wo
	die Reihenfolge beim System liegt, nicht bei freier Auswahl.
-->
<script lang="ts">
	import type { Page } from '$lib/types';
	import { shortTitle } from '$lib/live/labels';

	let {
		pages,
		selectedUrl = null,
		onSelect,
		gruppen,
		interactive = true
	}: {
		pages: Page[];
		selectedUrl?: string | null;
		onSelect?: (url: string) => void;
		gruppen?: Record<string, Page[]>;
		interactive?: boolean;
	} = $props();

	function schwersteSeverity(page: Page): Page['findings'][number]['severity'] | null {
		if (page.findings.some((f) => f.severity === 'hoch')) return 'hoch';
		if (page.findings.some((f) => f.severity === 'mittel')) return 'mittel';
		if (page.findings.length > 0) return 'niedrig';
		return null;
	}

	let offen = $state<Record<string, boolean>>({});
	function istOffen(name: string): boolean {
		return offen[name] ?? true;
	}
	function umschalten(name: string) {
		offen[name] = !istOffen(name);
	}
	function befundeInGruppe(gruppenSeiten: Page[]): number {
		return gruppenSeiten.reduce((n, p) => n + p.findings.length, 0);
	}

	// Pfeil hoch/runter wandert durch die Einträge, Home/End an Anfang/Ende.
	function tastatur(e: KeyboardEvent) {
		if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
		const nav = (e.currentTarget as HTMLElement).closest('nav');
		if (!nav) return;
		const eintraege = [...nav.querySelectorAll<HTMLButtonElement>('.entry')];
		const i = eintraege.indexOf(document.activeElement as HTMLButtonElement);
		if (i < 0) return;
		e.preventDefault();
		const ziel =
			e.key === 'ArrowDown'
				? Math.min(i + 1, eintraege.length - 1)
				: e.key === 'ArrowUp'
					? Math.max(i - 1, 0)
					: e.key === 'Home'
						? 0
						: eintraege.length - 1;
		eintraege[ziel]?.focus();
	}
</script>

{#snippet eintrag(page: Page)}
	{@const severity = schwersteSeverity(page)}
	{@const total = page.findings.length}
	{@const anzHoch = page.findings.filter((f) => f.severity === 'hoch').length}
	{@const anzMittel = page.findings.filter((f) => f.severity === 'mittel').length}
	{@const anzNiedrig = page.findings.filter((f) => f.severity === 'niedrig').length}
	<li>
		<button
			class="entry {severity ?? 'ohne'}"
			class:active={page.url === selectedUrl}
			class:static={!interactive}
			aria-current={page.url === selectedUrl ? 'true' : undefined}
			tabindex={interactive ? 0 : -1}
			title={page.title}
			onclick={interactive ? () => onSelect?.(page.url) : undefined}
			onkeydown={interactive ? tastatur : undefined}
		>
			<span class="title zeilen-2">{shortTitle(page.title)}</span>
			<span class="meta">
				<span class="count">{total}</span>
				{total === 1 ? 'Befund' : 'Befunde'}
			</span>
			{#if total > 0}
				<div class="schwere-balken" aria-hidden="true">
					{#if anzHoch > 0}<span class="sb-hoch" style="flex: {anzHoch}"></span>{/if}
					{#if anzMittel > 0}<span class="sb-mittel" style="flex: {anzMittel}"></span>{/if}
					{#if anzNiedrig > 0}<span class="sb-niedrig" style="flex: {anzNiedrig}"></span>{/if}
				</div>
			{/if}
		</button>
	</li>
{/snippet}

<nav class="sidebar" aria-label="Geprüfte Seiten">
	{#if pages.length === 0}
		<p class="leerzustand">Noch keine Seiten im Bestand.</p>
	{:else if gruppen}
		{#each Object.entries(gruppen) as [name, gruppenSeiten] (name)}
			<button
				type="button"
				class="gruppen-titel"
				aria-expanded={istOffen(name)}
				onclick={() => umschalten(name)}
			>
				<span class="gruppen-name">{istOffen(name) ? '▾' : '▸'} {name}</span>
				<span class="gruppen-zaehler">{befundeInGruppe(gruppenSeiten)} Befunde</span>
			</button>
			{#if istOffen(name)}
				<ul>
					{#each gruppenSeiten as page (page.url)}
						{@render eintrag(page)}
					{/each}
				</ul>
			{/if}
		{/each}
	{:else}
		<ul>
			{#each pages as page (page.url)}
				{@render eintrag(page)}
			{/each}
		</ul>
	{/if}
</nav>

<style>
	.sidebar {
		border-right: 1px solid var(--color-border);
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow-y: auto;
	}

	.sidebar .leerzustand {
		margin: var(--space-3);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.entry {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-left: 3px solid var(--color-line);
		border-bottom: 1px solid var(--color-border);
		padding: var(--space-2) var(--space-3);
		cursor: pointer;
		font-family: var(--font-sans);
		color: var(--color-text);
		transition: background-color var(--motion-fast) var(--motion-ease);
	}

	/* Schwere als Streifen: dieselben Töne wie Badge.svelte. */
	.entry.hoch {
		border-left-color: var(--color-magenta);
	}
	.entry.mittel {
		border-left-color: var(--color-purple);
	}
	.entry.niedrig {
		border-left-color: var(--color-teal);
	}

	.entry:hover {
		background: var(--color-surface-tint);
	}

	.entry.active {
		background: var(--color-surface-tint);
		box-shadow: inset 0 0 0 1px var(--color-accent);
	}

	.entry.static {
		cursor: default;
	}

	.entry.static:hover {
		background: none;
	}

	.entry:focus-visible {
		outline-offset: -2px;
	}

	.title {
		font-weight: var(--font-weight-medium);
		line-height: var(--line-height-small);
	}

	.meta {
		font-size: var(--font-size-small);
		color: var(--color-ink);
		opacity: 0.85;
	}

	.count {
		font-family: var(--font-mono);
		font-weight: var(--font-weight-semibold);
	}

	.gruppen-titel {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		width: 100%;
		margin: 0;
		padding: var(--space-2) var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-accent-secondary);
		background: var(--color-surface-tint);
		border: none;
		border-bottom: 1px solid var(--color-border);
		cursor: pointer;
	}

	.gruppen-name {
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: left;
	}

	.gruppen-zaehler {
		flex: none;
		font-weight: var(--font-weight-regular);
		opacity: 0.85;
		text-transform: none;
		letter-spacing: 0;
		white-space: nowrap;
	}

	/* E3·B: Schwere-Balken je Seite */
	.schwere-balken {
		display: flex;
		height: 3px;
		margin-top: var(--space-1);
		overflow: hidden;
	}

	.sb-hoch    { background: var(--color-magenta); }
	.sb-mittel  { background: var(--color-purple); }
	.sb-niedrig { background: var(--color-teal); }
</style>
