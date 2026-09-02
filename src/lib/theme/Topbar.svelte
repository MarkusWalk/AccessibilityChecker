<!--
	Persistente Kopfleiste, in +layout.svelte eingebunden — auf jeder Seite
	sichtbar. Trägt Marke, Hauptnavigation, die Umschaltung zwischen den
	Beständen und die Bauschritt-Anzeige aus dem Foliensatz ("08 / 16").
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import mark from '$lib/theme/mark.png';
	import DitherBand from '$lib/theme/DitherBand.svelte';
	import type { BestandListe } from '$lib/theme/types';

	let {
		bestaende = [],
		aktiv = '',
		schritt = 'E0'
	}: { bestaende?: BestandListe[]; aktiv?: string; schritt?: string } = $props();

	const links = [
		{ href: '/', label: 'Übersicht' },
		{ href: '/bestaende', label: 'Bestände' },
		{ href: '/ueber', label: 'Über dieses Werkzeug' }
	];

	// Umschalten hält die aktuelle Route und tauscht nur den Parameter. Kein
	// Neuladen, kein Sprung nach oben, der Fokus bleibt auf der Auswahl.
	function wechseln(name: string) {
		const ziel = new URL($page.url);
		ziel.searchParams.set('bestand', name);
		goto(ziel, { keepFocus: true, noScroll: true });
	}
</script>

<header class="topbar">
	<div class="row">
		<a class="brand" href="/">
			<img class="mark" src={mark} alt="" width="32" height="38" />
			<span class="titel">
				<span class="kicker-mono">Unblock AI · Staat Next Level</span>
				<span class="name">AccessibilityChecker</span>
			</span>
		</a>

		<nav aria-label="Hauptnavigation">
			<ul>
				{#each links as link (link.href)}
					{@const istAktiv = $page.url.pathname === link.href}
					<li>
						<a href={link.href} aria-current={istAktiv ? 'page' : undefined}>{link.label}</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="rechts">
			{#if bestaende.length}
				<label class="bestand">
					<span class="label">Bestand</span>
					<select
						value={aktiv}
						onchange={(e) => wechseln(e.currentTarget.value)}
						aria-label="Bestand wählen"
					>
						{#each bestaende as b (b.name)}
							<option value={b.name}>{b.label}</option>
						{/each}
					</select>
				</label>
			{/if}

			<!-- Bauschritt aus dem Foliensatz. Der Wert wird im Live-Build gesetzt. -->
			<span class="schritt" aria-label="Bauschritt {schritt} von 5">{schritt} / 5</span>
		</div>
	</div>

	<DitherBand />
</header>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: 10;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-4);
		max-width: var(--content-width);
		margin: 0 auto;
		padding: var(--space-3) var(--space-5);
	}

	nav {
		max-width: 100%;
		overflow-x: auto;
		margin-right: auto;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		text-decoration: none;
	}

	.mark {
		image-rendering: pixelated;
		display: block;
	}

	.titel {
		display: flex;
		flex-direction: column;
		line-height: 1.1;
	}

	.kicker-mono {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-blue);
	}

	.name {
		font-size: var(--font-size-h4);
		font-weight: var(--font-weight-bold);
		letter-spacing: -0.02em;
		color: var(--color-ink);
	}

	nav ul {
		list-style: none;
		display: flex;
		gap: var(--space-4);
		margin: 0;
		padding: 0;
	}

	nav a {
		display: inline-block;
		white-space: nowrap;
		text-decoration: none;
		color: var(--color-text);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-medium);
		padding: var(--space-1) 0;
		border-bottom: 2px solid transparent;
		transition:
			color var(--motion-fast) var(--motion-ease),
			border-color var(--motion-fast) var(--motion-ease);
	}

	nav a[aria-current='page'] {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}

	nav a:hover {
		color: var(--color-accent);
	}

	.rechts {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		/* Bleibt rechts, auch wenn die Zeile umbricht. */
		margin-left: auto;
	}

	.bestand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.bestand .label {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-blue);
	}

	select {
		font-family: inherit;
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-medium);
		color: var(--color-ink);
		background: var(--color-surface-tint);
		border: 1px solid var(--color-blue);
		border-radius: var(--radius);
		padding: var(--space-1) var(--space-2);
		max-width: 12rem;
	}

	select:hover {
		background: var(--color-white);
	}

	.schritt {
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		letter-spacing: 0.08em;
		color: var(--color-ink);
		opacity: 0.45;
	}

	/* Schmale Fenster: Navigation und Umschaltung rutschen in eine zweite
	   Zeile, statt sich zu quetschen. */
	@media (max-width: 60rem) {
		nav {
			order: 3;
			flex: 1 1 100%;
			margin-right: 0;
		}

	}
</style>
