<!--
	E2 Archetyp A: Chat. Man befragt den Bestand. Nur Props: messages,
	onSend. Kein eigener Modellaufruf hier — die Anbindung an echte
	Antworten entsteht live (Stufe 4 aus CLAUDE.md).
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
		max-width: 640px;
	}

	.verlauf {
		flex: 1;
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
