<!--
	E4 Variante D: die Seite selbst, mit den Stellen markiert. Nur Props:
	page, findings (Default page.findings), onSelect, activeId. Kein eigener
	Fetch.

	Rechtecke aus `box` (CSS-Pixel der Vollseite, siehe types.ts) werden in
	Prozent der natürlichen Bildgröße positioniert — dadurch stimmt die Lage
	unabhängig davon, wie breit das Bild gerade dargestellt wird, und
	unabhängig von einem eventuellen devicePixelRatio-Unterschied zwischen
	Screenshot und `box` (beides skaliert gleich, das Verhältnis bleibt).
	`box` fehlt aktuell in allen Beständen (wird von anderer Stelle
	nachgetragen) — Befunde ohne `box` erscheinen darum als Liste unter dem
	Bild, nicht als Fehlerzustand.

	Einsatz in vier Stufen:
	1. Primitiv: <ScreenshotViewer {page} /> roh unter die Befundliste
	   setzen — das Bild erscheint, Rechtecke nur, sobald `box` vorhanden
	   ist.
	2. Gestaltet: neben der Befundliste im Layout platzieren.
	3. Besser: `onSelect`/`activeId` an die Liste anbinden (Klick auf ein
	   Rechteck springt zur Karte, siehe docs/entscheidungen.md E4/D).
	4. Klug: Hover-Tooltip (Regel + Vorschlag) und Tastaturbedienung sind
	   schon eingebaut, es muss nichts mehr ergänzt werden.
-->
<script lang="ts">
	import type { Page, Finding } from '$lib/types';
	import { ruleLabel, shortTitle } from '$lib/live/labels';

	let {
		page,
		findings = page.findings,
		onSelect,
		activeId = null
	}: {
		page: Page;
		findings?: Finding[];
		onSelect?: (finding: Finding) => void;
		activeId?: string | null;
	} = $props();

	let naturalWidth = $state(0);
	let naturalHeight = $state(0);
	let hoverId = $state<string | null>(null);

	function bildGeladen(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		naturalWidth = img.naturalWidth;
		naturalHeight = img.naturalHeight;
	}

	const mitPosition = $derived(findings.filter((f) => f.box));
	const ohnePosition = $derived(findings.filter((f) => !f.box));

	function position(f: Finding) {
		if (!f.box || !naturalWidth || !naturalHeight) return null;
		return {
			left: (f.box.x / naturalWidth) * 100,
			top: (f.box.y / naturalHeight) * 100,
			width: (f.box.width / naturalWidth) * 100,
			height: (f.box.height / naturalHeight) * 100
		};
	}
</script>

<figure class="viewer">
	<div class="bild-wrapper">
		<img src={page.screenshot} alt="Screenshot: {page.title}" onload={bildGeladen} />

		{#if naturalWidth && naturalHeight}
			{#each mitPosition as f (f.id)}
				{@const p = position(f)}
				{#if p}
					<button
						type="button"
						class="markierung"
						class:hoch={f.severity === 'hoch'}
						class:active={f.id === activeId}
						style:left="{p.left}%"
						style:top="{p.top}%"
						style:width="{p.width}%"
						style:height="{p.height}%"
						aria-label="{ruleLabel(f.rule)}: {f.excerpt}"
						onmouseenter={() => (hoverId = f.id)}
						onmouseleave={() => (hoverId = null)}
						onfocus={() => (hoverId = f.id)}
						onblur={() => (hoverId = null)}
						onclick={() => onSelect?.(f)}
					>
						{#if hoverId === f.id}
							<span class="tooltip" role="tooltip">
								<strong>{ruleLabel(f.rule)}</strong>
								<span class="lesbar">{f.suggestion ?? f.excerpt}</span>
							</span>
						{/if}
					</button>
				{/if}
			{/each}
		{/if}
	</div>

	{#if ohnePosition.length > 0}
		<div class="ohne-position">
			<p class="hinweis">Ohne Position auf der Seite</p>
			<ul>
				{#each ohnePosition as f (f.id)}
					<li>
						<button
							type="button"
							class="eintrag"
							class:active={f.id === activeId}
							onclick={() => onSelect?.(f)}
						>
							<strong>{ruleLabel(f.rule)}</strong> — {f.excerpt}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- figcaption muss erstes oder letztes Kind von figure sein (a11y) -->
	<figcaption class="lesbar">{shortTitle(page.title)}</figcaption>
</figure>

<style>
	.viewer {
		margin: 0;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		display: flex;
		flex-direction: column;
		max-height: var(--viewer-hoehe, 70vh);
		min-height: 0;
	}

	/* Vollseiten-Screenshots sind mehrere tausend Pixel hoch: das Bild
	   scrollt in seinem Rahmen, die Markierungen scrollen mit. */
	.bild-wrapper {
		position: relative;
		line-height: 0;
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
	}

	.bild-wrapper > img {
		position: relative;
	}

	.ohne-position,
	figcaption {
		flex: none;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}

	.markierung {
		position: absolute;
		box-sizing: border-box;
		border: 2px solid var(--color-accent);
		background: transparent;
		padding: 0;
		cursor: pointer;
	}

	.markierung.hoch {
		border-color: var(--color-magenta);
	}

	.markierung.active {
		border-width: 3px;
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}

	.markierung:hover,
	.markierung:focus-visible {
		border-width: 3px;
	}

	.tooltip {
		position: absolute;
		z-index: 20;
		top: calc(100% + var(--space-1));
		left: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		width: max-content;
		max-width: 18rem;
		padding: var(--space-2);
		background: var(--color-ink);
		color: var(--color-white);
		font-size: var(--font-size-small);
		text-align: left;
		white-space: normal;
		pointer-events: none;
	}

	.tooltip strong {
		color: var(--color-white);
	}

	figcaption {
		padding: var(--space-2) var(--space-3);
		font-size: var(--font-size-small);
		border-top: 1px solid var(--color-border);
		color: var(--color-ink);
	}

	.ohne-position {
		padding: var(--space-2) var(--space-3) var(--space-3);
		border-top: 1px solid var(--color-border);
	}

	.hinweis {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
		opacity: 0.7;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.eintrag {
		width: 100%;
		text-align: left;
		overflow-wrap: anywhere;
		background: none;
		border: none;
		border-left: 3px solid transparent;
		padding: var(--space-1) var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--font-size-small);
		color: var(--color-text);
		cursor: pointer;
	}

	.eintrag:hover {
		background: var(--color-surface-tint);
	}

	.eintrag.active {
		border-left-color: var(--color-accent);
		background: var(--color-surface-tint);
	}
</style>
