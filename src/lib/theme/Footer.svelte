<!--
	Persistenter Fußbereich mit dem Pflichthinweis aus CLAUDE.md
	("Was dieses Werkzeug nicht ist") — steht auf jeder Seite, wird nicht
	weggelassen.
-->
<footer class="footer">
	<div class="row">
		<p class="hinweis">
			Dieses Werkzeug ist kein Konformitätsnachweis nach BITV und ersetzt keine Prüfung durch eine
			Überwachungsstelle. <a href="/ueber">Mehr dazu</a>
		</p>
		<p class="meta">Webinar „Souveränität beginnt beim Prototyp“ · IBM iX, Unblock AI</p>
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
		align-items: baseline;
		gap: var(--space-2) var(--space-4);
		max-width: var(--content-width);
		margin: 0 auto;
		padding: var(--space-4) var(--space-5);
	}

	.hinweis {
		flex: 1 1 40ch;
		min-width: 0;
	}

	p {
		margin: 0;
		font-size: var(--font-size-small);
		color: var(--color-ink);
	}

	.hinweis {
		opacity: 0.85;
	}

	.hinweis a {
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
	}

	.meta {
		opacity: 0.6;
	}
</style>
