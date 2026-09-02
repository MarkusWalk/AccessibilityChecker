<script lang="ts">
	// Hier beginnt der Live-Build. data.bestand.pages ist der aktive Bestand.
	// E1 A: Chat. E2 C: Beim Ermessen. E3 D: Nach Thema. E4 C: Markierung mit
	// Frage. E5: Live-Crawl-Status.
	import type { PageData } from './$types';
	import type { Page } from '$lib/types';
	import Arbeitsplatz from '$lib/assets/Arbeitsplatz.svelte';
	import Chat from '$lib/assets/Chat.svelte';
	import FindingCard from '$lib/assets/FindingCard.svelte';
	import { byLebenslage } from '$lib/live/sort';
	import { scopeFor, countScopes } from '$lib/live/scope';
	import LiveMonitor from '$lib/assets/LiveMonitor.svelte';

	let { data }: { data: PageData } = $props();

	const seiten = $derived(data.bestand.pages.length);
	const befunde = $derived(data.bestand.pages.reduce((n, p) => n + p.findings.length, 0));
	const label = $derived(
		data.bestaende.find((b) => b.name === data.bestand.name)?.label ?? data.bestand.name
	);

	// E3 D: Gruppierung nach Lebenslage statt Sortierung, siehe sort.ts.
	const gruppen = $derived(byLebenslage(data.bestand.pages));

	let ausgewaehlt = $state<Page | undefined>(undefined);

	// E2 C + E4 C: 'ermessen' entscheidet je Befund über vorschlag,
	// markierung oder frage — der Zähler macht sichtbar, was verschwindet.
	const zaehlerWerte = $derived(countScopes(ausgewaehlt?.findings ?? [], 'ermessen'));
	const zaehlerText = $derived(
		`${zaehlerWerte.vorschlag} Vorschläge · ${zaehlerWerte.markierung} Markierungen · ${zaehlerWerte.frage} Fragen`
	);

	// E1 A, Stufe 4: Chat an /api/chat anbinden, history wird mitgeschickt.
	let nachrichten = $state<{ role: 'user' | 'assistant'; text: string }[]>([]);
	let wartet = $state(false);

	async function senden(text: string) {
		const history = nachrichten;
		nachrichten = [...nachrichten, { role: 'user', text }];
		wartet = true;
		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ bestand: data.bestand.name, question: text, history })
			});
			const antwort: { answer: string } = await res.json();
			nachrichten = [...nachrichten, { role: 'assistant', text: antwort.answer }];
		} finally {
			wartet = false;
		}
	}

	// E5: Live-Crawl-Status, gepollt über den Lese-Endpunkt /api/live-status.
	type LiveStatus = {
		crawled: number;
		total: number | null;
		currentUrl: string | null;
		errors: number;
		done: boolean;
	};
	let liveStatus = $state<LiveStatus | null>(null);

	async function liveStatusLaden() {
		try {
			const res = await fetch('/api/live-status');
			liveStatus = await res.json();
		} catch {
			// Anzeige bleibt einfach aus, wenn der Endpunkt nicht erreichbar ist.
		}
	}

	$effect(() => {
		liveStatusLaden();
		const intervall = setInterval(liveStatusLaden, 4000);
		return () => clearInterval(intervall);
	});
</script>

<svelte:head>
	<title>AccessibilityChecker</title>
</svelte:head>

<div class="canvas container">
	<p class="kicker">Übersicht</p>
	<h1>Will<span class="akzent">kommen</span></h1>

	<p class="stand">
		Bestand <strong>{label}</strong> · {seiten}
		{seiten === 1 ? 'Seite' : 'Seiten'} · {befunde}
		{befunde === 1 ? 'Hinweis' : 'Hinweise'} geladen
	</p>

	{#if liveStatus}
		<div class="live-monitor">
			<LiveMonitor status={liveStatus} />
		</div>
	{/if}
</div>

<div class="container arbeitsplatz-huelle">
	<Arbeitsplatz
		pages={data.bestand.pages}
		bind:selected={ausgewaehlt}
		{gruppen}
		kontext={ausgewaehlt?.lebenslage ?? undefined}
		zaehler={zaehlerText}
	>
		{#snippet haupt()}
			<Chat messages={nachrichten} onSend={senden} {wartet} />
		{/snippet}
		{#snippet panel()}
			{#each ausgewaehlt?.findings ?? [] as f (f.id)}
				<FindingCard finding={f} variant="frage" mode={scopeFor(f, 'ermessen')} />
			{/each}
		{/snippet}
	</Arbeitsplatz>
</div>

<style>
	.canvas {
		padding-bottom: var(--space-3);
	}

	h1 {
		margin: 0 0 var(--space-4) 0;
	}

	.stand {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--font-size-small);
		letter-spacing: 0.04em;
		color: var(--color-ink);
		opacity: 0.7;
	}

	.stand strong {
		font-weight: var(--font-weight-semibold);
		opacity: 1;
	}

	.arbeitsplatz-huelle {
		padding-bottom: var(--space-4);
	}

	.live-monitor {
		margin-top: var(--space-3);
		max-width: 24rem;
	}
</style>
