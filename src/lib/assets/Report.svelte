<!--
	E1 Archetyp D: Bericht. Ein Dokument zum Lesen und Weiterleiten, wie man
	es aus Prüfungen kennt — kein Chat, kein Dashboard, kein geführter Flow.
	Props: pages, bestandLabel, scopeOption (E2, Default 'nirgends' — je
	Befund wird scopeFor(f, scopeOption) berechnet: bei 'markierung' steht
	die Fundstelle statt eines Vorschlags, bei 'frage' die Frage aus
	questionFor()). Kein eigener Fetch, kein State. Druckbar (@media print).

	Einsatz in vier Stufen:
	1. Primitiv: <Report {pages} bestandLabel="Weinheim" /> direkt in den
	   Canvas rendern, ungestylt betrachten.
	2. Gestaltet: Platz im Layout geben (max-width, Innenabstand — das Theme
	   greift bereits über die Klassen unten).
	3. Besser: eine Druck-/Download-Schaltfläche daneben (window.print()
	   bzw. download() aus export.ts).
	4. Klug: `pages` vorher mit einer Funktion aus sort.ts ordnen/gruppieren
	   und `scopeOption` aus der E2-Entscheidung setzen — der Bericht folgt
	   dann derselben Reihenfolge/Zuständigkeit wie die übrige Oberfläche.
-->
<script lang="ts">
	import type { Page, Axis } from '$lib/types';
	import { scopeFor, questionFor, type ScopeOption } from '$lib/live/scope';
	import { ruleLabel, shortTitle } from '$lib/live/labels';

	let {
		pages,
		bestandLabel,
		scopeOption = 'nirgends'
	}: {
		pages: Page[];
		bestandLabel: string;
		scopeOption?: ScopeOption;
	} = $props();

	const heute = new Date().toLocaleDateString('de-DE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const achseLabel: Record<Axis, string> = {
		verstaendlichkeit: 'Verständlichkeit',
		zugaenglichkeit: 'Zugänglichkeit'
	};

	const gesamt = $derived(pages.reduce((n, p) => n + p.findings.length, 0));
	const jeAchse = $derived.by(() => {
		const zaehler: Record<Axis, number> = { verstaendlichkeit: 0, zugaenglichkeit: 0 };
		for (const p of pages) for (const f of p.findings) zaehler[f.axis]++;
		return zaehler;
	});
</script>

<article class="report">
	<header class="report-head">
		<p class="kicker">Arbeitsliste · {bestandLabel}</p>
		<h1>Verständlichkeit und Zugänglichkeit</h1>
		<p class="datum">Erstellt am {heute}</p>
	</header>

	<section class="summary">
		<h2>Zusammenfassung</h2>
		<dl>
			<div>
				<dt>Geprüfte Seiten</dt>
				<dd>{pages.length}</dd>
			</div>
			<div>
				<dt>Befunde insgesamt</dt>
				<dd>{gesamt}</dd>
			</div>
			<div>
				<dt>{achseLabel.verstaendlichkeit}</dt>
				<dd>{jeAchse.verstaendlichkeit}</dd>
			</div>
			<div>
				<dt>{achseLabel.zugaenglichkeit}</dt>
				<dd>{jeAchse.zugaenglichkeit}</dd>
			</div>
		</dl>
	</section>

	{#each pages as page (page.url)}
		<section class="page-section">
			<h2 class="lesbar">{shortTitle(page.title)}</h2>
			<p class="url lesbar">{page.url}</p>

			{#each page.findings as f (f.id)}
				{@const mode = scopeFor(f, scopeOption)}
				<p class="finding lesbar">
					<span class="regel">{ruleLabel(f.rule)}</span>
					<span class="achse">({achseLabel[f.axis]})</span>
					— {f.excerpt}
					{#if mode === 'markierung'}
						<br /><span class="fundstelle">Fundstelle: {f.legalSource ?? 'Gesetzestext'}</span>
					{:else if mode === 'frage'}
						<br /><span class="frage">{questionFor(f)}</span>
					{:else if f.suggestion}
						<br /><span class="suggestion">Vorschlag: {f.suggestion}</span>
					{/if}
				</p>
			{:else}
				<p class="leer">Keine Befunde auf dieser Seite.</p>
			{/each}
		</section>
	{/each}

	<footer class="disclaimer">
		<p>
			Dieses Dokument ist eine Arbeitsliste, kein Konformitätsnachweis nach BITV und
			ersetzt keine Prüfung durch eine Überwachungsstelle.
		</p>
	</footer>
</article>

<style>
	.report {
		max-width: var(--lese-breite, 60rem);
		margin: 0 auto;
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface);
		color: var(--color-text);
		height: 100%;
		min-height: 0;
		overflow-y: auto;
	}

	.report-head h1 {
		font-size: var(--font-size-h2);
	}

	.report-head {
		margin-bottom: var(--space-5);
		padding-bottom: var(--space-4);
		border-bottom: 2px solid var(--color-accent);
	}

	.report-head h1 {
		margin: 0 0 var(--space-1) 0;
	}

	.datum {
		margin: 0;
		font-size: var(--font-size-small);
		opacity: 0.7;
	}

	.summary {
		margin-bottom: var(--space-5);
	}

	.summary dl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: var(--space-3);
		margin: 0;
		padding: var(--space-3);
		border: 1px solid var(--color-border);
	}

	.summary dt {
		font-size: var(--font-size-small);
		opacity: 0.7;
	}

	.summary dd {
		margin: 0;
		font-size: var(--font-size-h3);
		font-weight: var(--font-weight-bold);
	}

	.page-section {
		margin-bottom: var(--space-5);
		break-inside: avoid;
	}

	.page-section h2 {
		margin-bottom: var(--space-1);
	}

	.url {
		margin: 0 0 var(--space-3) 0;
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		color: var(--color-accent);
	}

	.finding {
		margin: 0 0 var(--space-3) 0;
		padding-left: var(--space-3);
		border-left: 2px solid var(--color-border);
		line-height: var(--line-height-body);
	}

	.regel {
		font-weight: var(--font-weight-semibold);
	}

	.achse {
		font-size: var(--font-size-small);
		opacity: 0.7;
	}

	.suggestion {
		color: var(--color-accent-secondary);
	}

	.fundstelle {
		font-style: italic;
		opacity: 0.8;
	}

	.frage {
		color: var(--color-accent-secondary);
		font-weight: var(--font-weight-medium);
	}

	.leer {
		opacity: 0.7;
		font-style: italic;
	}

	.disclaimer {
		margin-top: var(--space-6);
		padding-top: var(--space-3);
		border-top: 1px solid var(--color-border);
		font-size: var(--font-size-small);
		opacity: 0.7;
	}

	.disclaimer p {
		margin: 0;
	}

	@media print {
		.report {
			max-width: none;
			padding: 0;
		}

		.page-section {
			page-break-inside: avoid;
		}

		.url {
			color: var(--color-ink);
		}
	}
</style>
