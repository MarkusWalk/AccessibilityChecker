<!--
	Persistenter Fußbereich mit dem Pflichthinweis aus CLAUDE.md
	("Was dieses Werkzeug nicht ist") — steht auf jeder Seite, wird nicht
	weggelassen. Kicker-Zeile und Marke in Monospace wie im Foliensatz.
-->
<script lang="ts">
	import DitherBand from '$lib/theme/DitherBand.svelte';
</script>

<footer class="footer">
	<DitherBand />
	<div class="row">
		<div class="text">
			<p class="kicker">Hinweis</p>
			<p class="hinweis">
				Dieses Werkzeug ist kein Konformitätsnachweis nach BITV und ersetzt keine Prüfung durch eine
				Überwachungsstelle. <a href="/ueber">Mehr dazu</a>
			</p>
		</div>
		<p class="marke">Unblock AI · Staat Next Level</p>
	</div>
</footer>

<style>
	.footer {
		border-top: 1px solid var(--color-border);
		background: var(--color-surface-tint);
		margin-top: auto;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-3) var(--space-5);
		max-width: var(--content-width);
		margin: 0 auto;
		padding: var(--space-5) var(--space-5) var(--space-4);
	}

	.text {
		flex: 1 1 40ch;
		min-width: 0;
	}

	.kicker {
		margin-bottom: var(--space-1);
	}

	p {
		margin: 0;
		font-size: var(--font-size-small);
		color: var(--color-ink);
	}

	.hinweis {
		max-width: 62ch;
		opacity: 0.85;
	}

	.hinweis a {
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
	}

	.marke {
		font-family: var(--font-mono);
		letter-spacing: var(--letter-spacing-kicker);
		text-transform: uppercase;
		font-size: 0.625rem;
		color: var(--color-ink);
		opacity: 0.55;
		white-space: nowrap;
	}
</style>
