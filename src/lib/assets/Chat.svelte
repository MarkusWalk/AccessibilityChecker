<!--
	E1 Archetyp A: Chat. Man befragt den Bestand. Nur Props: messages,
	onSend. Kein eigener Modellaufruf hier — die Anbindung an
	`/api/chat` entsteht live (Stufe 4 aus CLAUDE.md).

	Füllt die Höhe seines Containers (z.B. `haupt` in Arbeitsplatz.svelte)
	vollständig, `.verlauf` scrollt für sich — dafür braucht der Container
	selbst eine begrenzte Höhe plus `min-height: 0` in der Kette (siehe
	.werkzeug/.spalte in global.css), sonst kollabiert der Chat auf 0px in
	einer Flex-/Grid-Zeile. Keine eigene max-width mehr (war 640px, brach
	genau das) — bei Bedarf von außen über --chat-max-width begrenzen.
-->
<script lang="ts">
	let {
		messages,
		onSend,
		wartet = false
	}: {
		messages: { role: 'user' | 'assistant'; text: string }[];
		onSend?: (text: string) => void;
		// true, solange eine Antwort vom Endpunkt aussteht: zeigt eine
		// Warte-Blase, damit nach dem Senden nie Stille auf dem Schirm ist.
		wartet?: boolean;
	} = $props();

	let entwurf = $state('');

	function absenden(e: SubmitEvent) {
		e.preventDefault();
		if (!entwurf.trim()) return;
		onSend?.(entwurf.trim());
		entwurf = '';
	}
</script>

<div class="chat">
	<div class="verlauf" aria-live="polite">
		{#if messages.length === 0}
			<p class="leer">
				Stellen Sie eine Frage zum Bestand, zum Beispiel „Welche Seiten haben die meisten
				Barrieren?“ oder „Was fehlt auf der Startseite?“
			</p>
		{/if}
		{#each messages as m, i (i)}
			<div class="bubble {m.role} lesbar">{m.text}</div>
		{/each}
		{#if wartet}
			<div class="bubble assistant wartet" aria-label="Antwort wird erstellt">
				<span class="pixelreihe" aria-hidden="true"><span></span><span class="leer"></span><span class="leer"></span></span>
				Antwort wird erstellt…
			</div>
		{/if}
	</div>

	<form class="eingabe werkzeug-flaeche" onsubmit={absenden}>
		<label class="sr-only" for="chat-input">Frage an den Bestand</label>
		<input id="chat-input" type="text" bind:value={entwurf} placeholder="Frage an den Bestand…" disabled={wartet} />
		<button type="submit" disabled={wartet}>Senden</button>
	</form>
</div>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		max-width: var(--chat-max-width, none);
	}

	.verlauf {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		overflow-y: auto;
	}

	.leer {
		margin: auto 0 0;
		max-width: 32rem;
		font-size: var(--font-size-small);
		color: var(--color-ink);
		opacity: 0.55;
	}

	.bubble {
		max-width: 80%;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
	}

	.bubble.user {
		align-self: flex-end;
		background: var(--color-surface-tint);
	}

	.bubble.assistant {
		align-self: flex-start;
		background: var(--color-surface);
	}

	.bubble.wartet {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-small);
		opacity: 0.7;
	}

	button:disabled,
	input:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.eingabe {
		display: flex;
		gap: var(--space-2);
		padding: var(--space-3);
		border-top: 1px solid var(--color-border);
	}

	input {
		flex: 1;
		font-family: var(--font-sans);
		font-size: var(--font-size-body);
		padding: var(--space-2);
		border: 1px solid var(--color-border);
	}

	button {
		font-family: var(--font-sans);
		font-weight: var(--font-weight-semibold);
		background: var(--color-accent);
		color: var(--color-white);
		border: none;
		padding: var(--space-2) var(--space-3);
		cursor: pointer;
	}
</style>
