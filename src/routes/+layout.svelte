<script lang="ts">
	import favicon from '$lib/theme/favicon.svg';
	import '$lib/theme/global.css';
	import Topbar from '$lib/theme/Topbar.svelte';
	import Footer from '$lib/theme/Footer.svelte';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	// Der Splash-Screen vor dem Live-Build ist Vollbild: dort trägt die Seite
	// weder Kopfleiste noch Fußbereich.
	const blank = $derived(page.url.pathname.startsWith('/intro'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !blank}
	<a class="skip-link" href="#hauptinhalt">Zum Inhalt springen</a>
{/if}

<div class="shell">
	{#if !blank}
		<Topbar bestaende={data.bestaende} aktiv={data.bestand.name} />
	{/if}
	<main id="hauptinhalt">
		{@render children()}
	</main>
	{#if !blank}
		<Footer />
	{/if}
</div>

<style>
	.shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
	}

	/* Klassisches Skip-Link-Muster: unsichtbar, bis es per Tastatur fokussiert
	   wird — dann klar sichtbar oben links. Passend für ein Werkzeug, das
	   genau solche Muster bei anderen Seiten einfordert. */
	.skip-link {
		position: absolute;
		top: -100%;
		left: var(--space-3);
		z-index: 100;
		background: var(--color-ink);
		color: var(--color-white);
		padding: var(--space-2) var(--space-3);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
		transition: top var(--motion-base) var(--motion-ease);
	}

	.skip-link:focus-visible {
		top: var(--space-2);
	}
</style>
