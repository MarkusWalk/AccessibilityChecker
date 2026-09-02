<script lang="ts">
	// Proberoute für die Vorbereitung, nicht Teil des Live-Builds: zeigt alle
	// vier E1-Archetypen im Arbeitsplatz-Rahmen, damit Rahmen, Kopfzone,
	// Leerzustände und Bausteine vor dem Tag einmal durchgespielt sind.
	// ?archetyp=chat|dashboard|gefuehrt|bericht  ?scope=nirgends|gesetz|ermessen|sprache
	// ?variant=text|begruendung|frage|zwei  ?viewer=1  ?gruppen=1
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import Arbeitsplatz from '$lib/assets/Arbeitsplatz.svelte';
	import Chat from '$lib/assets/Chat.svelte';
	import Dashboard from '$lib/assets/Dashboard.svelte';
	import GuidedFlow from '$lib/assets/GuidedFlow.svelte';
	import Report from '$lib/assets/Report.svelte';
	import FindingCard from '$lib/assets/FindingCard.svelte';
	import ScreenshotViewer from '$lib/assets/ScreenshotViewer.svelte';
	import { scopeFor, countScopes, type ScopeOption } from '$lib/live/scope';
	import { byLebenslage } from '$lib/live/sort';
	import type { Page } from '$lib/types';

	let { data }: { data: PageData } = $props();

	const archetyp = $derived(page.url.searchParams.get('archetyp') ?? 'chat');
	const scope = $derived((page.url.searchParams.get('scope') ?? 'nirgends') as ScopeOption);
	const variant = $derived(
		(page.url.searchParams.get('variant') ?? 'text') as 'text' | 'begruendung' | 'frage' | 'zwei'
	);
	const viewer = $derived(page.url.searchParams.get('viewer') === '1');
	const gruppen = $derived(
		page.url.searchParams.get('gruppen') === '1' ? byLebenslage(data.bestand.pages) : undefined
	);
	const label = $derived(
		data.bestaende.find((b) => b.name === data.bestand.name)?.label ?? data.bestand.name
	);

	let ausgewaehlt = $state<Page | undefined>(undefined);
	let nachrichten = $state<{ role: 'user' | 'assistant'; text: string }[]>([]);
	let wartet = $state(false);
	let aktiveFindingId = $state<string | null>(null);

	const scopes = $derived(countScopes(ausgewaehlt?.findings ?? [], scope));
	const zaehler = $derived(
		scope === 'nirgends'
			? undefined
			: `${scopes.vorschlag} Vorschläge · ${scopes.markierung} Markierungen · ${scopes.frage} Fragen`
	);

	async function frageSenden(text: string) {
		nachrichten = [...nachrichten, { role: 'user', text }];
		wartet = true;
		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ bestand: data.bestand.name, question: text, history: nachrichten })
			});
			const { answer } = await res.json();
			nachrichten = [...nachrichten, { role: 'assistant', text: answer }];
		} finally {
			wartet = false;
		}
	}

	function zurKarte(f: { id: string }) {
		aktiveFindingId = f.id;
		document.getElementById(`finding-${f.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
</script>

<svelte:head><title>Probe · {archetyp}</title></svelte:head>

<div class="container probe-kopf">
	<p class="kicker">Probe</p>
	<p class="mono">
		{#each ['chat', 'dashboard', 'gefuehrt', 'bericht'] as a (a)}
			<a href="?archetyp={a}" aria-current={a === archetyp ? 'page' : undefined}>{a}</a> ·
		{/each}
		scope={scope} · variant={variant} · viewer={viewer ? 1 : 0} · gruppen={gruppen ? 1 : 0}
	</p>
</div>

<div class="container probe-flaeche">
	<Arbeitsplatz
		pages={data.bestand.pages}
		bind:selected={ausgewaehlt}
		{gruppen}
		{zaehler}
		kontext={ausgewaehlt?.lebenslage ?? undefined}
		hauptAnteil={archetyp === 'gefuehrt' || archetyp === 'bericht' ? 'gross' : archetyp === 'dashboard' ? 'gleich' : 'klein'}
	>
		{#snippet haupt()}
			{#if archetyp === 'chat'}
				<Chat messages={nachrichten} onSend={frageSenden} {wartet} />
			{:else if archetyp === 'dashboard'}
				<Dashboard pages={data.bestand.pages} {variant} scopeOption={scope} selectedUrl={ausgewaehlt?.url} />
			{:else if archetyp === 'gefuehrt'}
				<GuidedFlow
					pages={data.bestand.pages}
					{variant}
					scopeOption={scope}
					onPageChange={(p) => (ausgewaehlt = p ?? undefined)}
				/>
			{:else}
				<Report pages={data.bestand.pages} bestandLabel={label} scopeOption={scope} />
			{/if}
		{/snippet}
		{#snippet panel()}
			{#if viewer && ausgewaehlt}
				<div class="zweispaltig">
					<div class="karten">
						{#each ausgewaehlt.findings as f (f.id)}
							<div id="finding-{f.id}"><FindingCard finding={f} {variant} mode={scopeFor(f, scope)} /></div>
						{/each}
					</div>
					<div class="viewer-spalte">
						<ScreenshotViewer page={ausgewaehlt} onSelect={zurKarte} activeId={aktiveFindingId} />
					</div>
				</div>
			{:else}
				{#each ausgewaehlt?.findings ?? [] as f (f.id)}
					<FindingCard finding={f} {variant} mode={scopeFor(f, scope)} />
				{/each}
			{/if}
		{/snippet}
	</Arbeitsplatz>
</div>

<style>
	.probe-kopf {
		padding-top: var(--space-3);
		padding-bottom: 0;
	}
	.probe-kopf a[aria-current] {
		font-weight: var(--font-weight-bold);
	}
	.probe-flaeche {
		padding-top: var(--space-3);
	}
	.karten {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.viewer-spalte {
		position: sticky;
		top: 0;
	}
</style>
