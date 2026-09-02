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
		onSend
	}: {
		messages: { role: 'user' | 'assistant'; text: string }[];
		onSend?: (text: string) => void;
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
		{#each messages as m, i (i)}
			<div class="bubble {m.role}">{m.text}</div>
		{/each}
	</div>

	<form class="eingabe" onsubmit={absenden}>
		<label class="sr-only" for="chat-input">Frage an den Bestand</label>
		<input id="chat-input" type="text" bind:value={entwurf} placeholder="Frage an den Bestand…" />
		<button type="submit">Senden</button>
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

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
</style>
