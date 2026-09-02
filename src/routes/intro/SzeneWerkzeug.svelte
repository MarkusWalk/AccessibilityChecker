<!--
	Szene 2: Das Szenario, das den Bau begründet. Sie befähigen ein neues
	Digitalteam für ihr Land — alle Portale sollen bürgernah werden. Danach
	drei Blöcke, wie das Werkzeug zu diesem Auftrag beiträgt: prüfen,
	liefern, nicht sein.
-->
<script lang="ts">
	let { bestand = 'Weinheim', seiten = 50 }: { bestand?: string; seiten?: number } = $props();

	const prueft = [
		'Verständlichkeit: Schachtelsätze, Passivketten, Paragrafen ohne Erklärung',
		'Zugänglichkeit: Alternativtexte, Überschriften, Linktexte wie „hier klicken“',
		'Nicht eine Seite, sondern den ganzen Auftritt'
	];
	const liefert = [
		'Eine Arbeitsliste: Stelle, Hinweis, Vorschlag',
		'Eine Reihenfolge, womit die Redaktion anfängt',
		'Eine Antwort, wie weit das System selbst gehen darf'
	];
	const nicht = [
		'Kein Konformitätsnachweis nach BITV',
		'Keine Note, keine Punktzahl für ein Haus',
		'Ein Prototyp: beantwortet Fragen, wird danach weggeworfen'
	];
</script>

<section class="szene szene-weiss">
	<p class="kicker">01 · Das Szenario</p>
	<h1 class="intro-h1 h1-mittel">
		Sie bauen ein neues <span class="akzent">Digitalteam</span> für Ihr Land auf.
	</h1>
	<p class="lead stufe" style="--i: 0; --start: 120ms">
		Der Auftrag: alle Portale des Landes und seiner Kommunen werden
		<strong>bürgernah</strong>, <strong>zugänglich</strong> und <strong>verständlich</strong> —
		damit sich Bürgerinnen und Bürger zurechtfinden, ohne Amtsdeutsch zu übersetzen oder zweimal
		anzurufen. Bei Hunderten Websites und wenig Redaktion reicht Handarbeit allein nicht.
		Deswegen dieses Werkzeug.
	</p>

	<div class="spalten">
		<div class="block-blau feld">
			<p class="kicker">Was es prüft</p>
			<ul>
				{#each prueft as zeile, i (zeile)}
					<li class="stufe" style="--i: {i}; --start: 320ms">{zeile}</li>
				{/each}
			</ul>
		</div>

		<div class="block-linie feld">
			<p class="kicker">Was es liefert</p>
			<ul>
				{#each liefert as zeile, i (zeile)}
					<li class="stufe" style="--i: {i}; --start: 680ms">{zeile}</li>
				{/each}
			</ul>
		</div>

		<div class="block-gestrichelt feld">
			<p class="kicker">Was es nicht ist</p>
			<ul>
				{#each nicht as zeile, i (zeile)}
					<li class="stufe" style="--i: {i}; --start: 1040ms">{zeile}</li>
				{/each}
			</ul>
		</div>
	</div>

	<p class="fuss stufe" style="--i: 0; --start: 1500ms">
		Heute: <strong>{bestand}, {seiten} Seiten.</strong> Das Werkzeug beantwortet die Frage, ob
		das eine Aufgabe für KI ist, und welche Entscheidungen sie dem Haus abverlangt.
	</p>
</section>

<style>
	h1 {
		max-width: 26ch;
		margin-bottom: clamp(0.75rem, 2vh, 1.25rem);
	}

	.lead {
		max-width: 62ch;
		margin: 0 0 clamp(1rem, 3.5vh, 2.25rem) 0;
		font-size: clamp(1rem, 1.35vw, 1.4rem);
		line-height: 1.4;
		color: var(--color-ink);
	}

	.spalten {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(1.25rem, 3vw, 2.75rem);
		align-items: stretch;
	}

	.feld {
		/* Platz für den harten Versatz rechts und unten. */
		margin: 0 12px 12px 0;
		padding: clamp(1rem, 2.6vh, 1.75rem);
		min-height: clamp(11rem, 30vh, 17rem);
		display: flex;
		flex-direction: column;
	}

	/* Gleiche Innenkante wie bei den Blöcken daneben. */
	.block-blau.feld {
		border: 2px solid var(--color-blue);
	}

	.block-linie {
		border: 2px solid var(--color-ink);
		background: var(--color-surface);
	}

	.block-linie .kicker {
		color: var(--color-ink);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: clamp(0.5rem, 1.6vh, 1rem);
		justify-content: center;
		flex: 1;
	}

	li {
		font-size: clamp(0.95rem, 1.25vw, 1.3rem);
		font-weight: var(--font-weight-semibold);
		letter-spacing: -0.01em;
		line-height: 1.3;
		padding-left: 1.1em;
		text-indent: -1.1em;
	}

	li::before {
		content: '';
		display: inline-block;
		width: 0.5em;
		height: 0.5em;
		margin-right: 0.6em;
		vertical-align: 0.1em;
		background: currentColor;
	}

	.block-gestrichelt li,
	.block-linie li {
		color: var(--color-ink);
	}

	.fuss {
		max-width: 70ch;
		margin: clamp(1rem, 3.5vh, 2.25rem) 0 0 0;
		font-size: clamp(0.95rem, 1.15vw, 1.25rem);
	}

	.fuss strong {
		font-weight: var(--font-weight-bold);
		color: var(--color-blue);
	}
</style>
