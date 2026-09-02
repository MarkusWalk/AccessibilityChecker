<script lang="ts">
	// Splash-Screen vor dem Live-Build. Vier Szenen, von Markus per Tastendruck
	// weitergeschaltet. Die aktuelle Szene steht im Hash (#1 … #4), damit ein
	// Reload nicht bei Null beginnt.
	import { onMount } from 'svelte';
	import { goto, replaceState } from '$app/navigation';
	import type { PageData } from './$types';
	import './intro.css';
	import SzeneTitel from './SzeneTitel.svelte';
	import SzeneWerkzeug from './SzeneWerkzeug.svelte';
	import SzeneEntscheidungen from './SzeneEntscheidungen.svelte';
	import SzeneRegeln from './SzeneRegeln.svelte';

	let { data }: { data: PageData } = $props();

	const ANZAHL = 4;
	let szene = $state(1);

	// Bestand aus dem Layout-Loader, mit Rückfall auf den Stand der Vorbereitung.
	const bestand = $derived(
		data.bestaende.find((b) => b.name === data.bestand.name)?.label || 'Weinheim'
	);
	const seiten = $derived(data.bestand.pages.length || 50);

	// Szene 1 und 4 stehen auf Blau, 2 und 3 auf Weiß.
	const aufBlau = $derived(szene === 1 || szene === 4);

	onMount(() => {
		const n = Number(location.hash.slice(1));
		if (n >= 1 && n <= ANZAHL) szene = n;
	});

	function zu(n: number) {
		const ziel = Math.min(ANZAHL, Math.max(1, n));
		if (ziel === szene) return;
		szene = ziel;
		replaceState(`#${ziel}`, {});
	}

	function los() {
		goto('/');
	}

	function taste(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter' || e.key === 'ArrowRight') {
			e.preventDefault();
			// Enter auf der letzten Szene löst denselben Weg wie der Button aus.
			if (szene === ANZAHL) {
				if (e.key === 'Enter') los();
				return;
			}
			zu(szene + 1);
		} else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
			e.preventDefault();
			zu(szene - 1);
		}
	}
</script>

<svelte:head>
	<title>Souveränität beginnt beim Prototyp</title>
</svelte:head>

<svelte:window onkeydown={taste} />

<!-- Klick irgendwo schaltet weiter. Die Tastatur bleibt der Hauptweg; der
     Bereich ist darum kein Bedienelement, sondern nur eine Bequemlichkeit. -->
<div
	class="intro"
	class:auf-blau={aufBlau}
	class:auf-weiss={!aufBlau}
	onclick={() => szene < ANZAHL && zu(szene + 1)}
	role="presentation"
>
	<div class="buehne" aria-live="polite">
		{#key szene}
			{#if szene === 1}
				<SzeneTitel />
			{:else if szene === 2}
				<SzeneWerkzeug {bestand} {seiten} />
			{:else if szene === 3}
				<SzeneEntscheidungen />
			{:else}
				<SzeneRegeln onStart={los} />
			{/if}
		{/key}
	</div>

	<div class="intro-fuss">
		<div
			class="fortschritt"
			role="img"
			aria-label="Szene {szene} von {ANZAHL}"
		>
			{#each Array.from({ length: ANZAHL }, (_, i) => i + 1) as n (n)}
				<span class:aktiv={n <= szene}></span>
			{/each}
		</div>
		<p class="hinweis">{szene} / {ANZAHL} · Leertaste</p>
	</div>
</div>

<style>
	.buehne {
		height: 100%;
	}
</style>
