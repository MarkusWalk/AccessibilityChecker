<!--
	Persistente Kopfleiste, in +layout.svelte eingebunden — auf jeder Seite
	sichtbar. Trägt Marke, Titel und die Hauptnavigation. Nimmt nichts über
	Props entgegen, liest die aktuelle Route nur zur Hervorhebung.
-->
<script lang="ts">
	import { page } from '$app/stores';
	import mark from '$lib/theme/mark.png';
	import DitherBand from '$lib/theme/DitherBand.svelte';

	const links = [
		{ href: '/', label: 'Übersicht' },
		{ href: '/bestaende', label: 'Bestände' },
		{ href: '/ueber', label: 'Über dieses Werkzeug' }
	];
</script>

<header class="topbar">
	<div class="row">
		<a class="brand" href="/">
			<img class="mark" src={mark} alt="" width="32" height="38" />
			<span class="title">AccessibilityChecker</span>
		</a>

		<nav aria-label="Hauptnavigation">
			<ul>
				{#each links as link (link.href)}
					{@const aktiv = $page.url.pathname === link.href}
					<li>
						<a href={link.href} aria-current={aktiv ? 'page' : undefined}>{link.label}</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>

	<DitherBand count={60} />
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
		justify-content: space-between;
		gap: var(--space-2) var(--space-4);
		max-width: var(--content-width);
		margin: 0 auto;
		padding: var(--space-3) var(--space-5);
	}

	nav {
		max-width: 100%;
		overflow-x: auto;
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

	.title {
		font-size: var(--font-size-h3);
		font-weight: var(--font-weight-semibold);
		color: var(--color-heading);
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
</style>
