<script lang="ts">
	import favicon from '$lib/theme/favicon.svg';
	import '$lib/theme/global.css';
	import Topbar from '$lib/theme/Topbar.svelte';
	import Footer from '$lib/theme/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a class="skip-link" href="#hauptinhalt">Zum Inhalt springen</a>

<div class="shell">
	<Topbar />
	<main id="hauptinhalt">
		{@render children()}
	</main>
	<Footer />
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
