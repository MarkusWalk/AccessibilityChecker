# AGENTS.md

This file provides guidance to agents when working with code in this repository.

**Verbindlich ist `CLAUDE.md`** im Repo-Wurzelverzeichnis. Diese Datei ist eine
Kurzreferenz mit Befehlen und technischen Details. Bei Widerspruch gilt `CLAUDE.md`.

**Vor jedem Bauschritt lesen:** [`docs/erkenntnisse.md`](docs/erkenntnisse.md)
— Protokoll getroffener Entscheidungen. Wer es nicht liest, wiederholt gelöste Probleme
(z.B. Dashboard-Sidebar-Duplikat, GuidedFlow-Wizard-Umbau, Dashboard-`hauptAnteil`-Vergessen).

## Kontext

Live-Webinar-Tool. Dev-Server läuft durch — jede gespeicherte Änderung erscheint per Hot Reload.
**Goldregel:** Nie länger als 60 Sekunden ohne sichtbare Änderung. Ein Fehler ist besser als eine leere Seite.

## Befehle

```bash
npm run dev           # SvelteKit Dev-Server
npm run check         # svelte-check + TypeScript (einzige Validierung — kein npm test)
npm run analyze <bestand>   # liest src/lib/data/<bestand>.raw.json → schreibt <bestand>.json
npm run tag e1        # git commit + tag live/e1 (macht der Referent, nicht der Agent)
npm run rollback e1   # harter Reset auf live/e1 (muss < 5 Sek. laufen)
```

## Architektur & Datenfluss

```
scripts/crawl.ts  →  src/lib/data/<bestand>.raw.json  (RawCrawlResult)
scripts/analyze.ts  →  src/lib/data/<bestand>.json    (Page[])
src/routes/  →  liest Page[]-JSON direkt (kein API-Endpunkt, kein LLM im Render-Pfad)
```

- `scripts/lib/rules.ts` — regelbasierte Rohanalyse, **kein LLM**, liefert `Finding[]` mit `suggestion: null`
- `src/lib/server/llm.ts` — **nur** von `scripts/` aufrufen, nie aus SvelteKit-Routes oder Komponenten
- LLM-Antworten gecacht in `src/lib/data/.llm-cache/` (SHA256-Hash) — zweiter Lauf ohne Netz
- `LLM_PROVIDER=mock` (default ohne `ICA_API_KEY`) liefert deterministisch aus `MOCK_TEMPLATES`
- `.env` wird von `npm run dev` **nicht** automatisch in `process.env` geladen — behoben via `vite.config.ts` mit Vites `loadEnv()`. Für `scripts/` weiterhin manuelles `export` nötig.

## Die fünf Entscheidungen

Das Datenmodell in [`src/lib/types.ts`](src/lib/types.ts) trägt **alle** fünf Entscheidungen — keine Felder live ergänzen.

| | Betrifft |
|---|---|
| E1 | Archetyp: Chat / Dashboard / GuidedFlow / Report |
| E2 | `fromLegalSource` / `machineDecidable` am Finding — Scope-Filterung |
| E3 | Sortierfunktionen aus `src/lib/live/sort.ts` |
| E4 | Anzeigevariante in `FindingCard.svelte` (`suggestion`, `suggestionAlt`, `rationale`) |
| E5 | Wildcard — `LiveMonitor.svelte`, `ScreenshotViewer.svelte`, `export.ts` liegen bereit |

## `src/lib/assets/` — absichtlich unbenutzt

Komponenten sind fertig, aber noch nicht in eine Route eingebunden. **Das Verdrahten passiert live.**
Das Verbessern der Komponenten selbst ist erlaubt. Verdrahten vorab ist verboten.

**Die vier E1-Archetypen (`Chat`, `Dashboard`, `GuidedFlow`, `Report`) sind
Vorlage, nicht Bauteil.** Nicht per `import` einbinden und in einer Zeile
rendern (`<Chat ... />`) — das ist Kopieren, kein Bauschritt. Struktur und
Markup der Datei als Vorlage lesen, die Elemente selbst, einzeln, in die
Route schreiben. Bausteine ohne eigene Entscheidung (`Arbeitsplatz`,
`FindingCard`, `Badge`, `Button`, `Counter`, `Sidebar`, `ScreenshotViewer`,
`LiveMonitor`) werden normal importiert.

**Kritisch:** `Arbeitsplatz.svelte` ist der Rahmen nach E1 — Seitenliste links, Archetyp rechts oben, Befundliste darunter. `hauptAnteil`-Prop je Archetyp: `'klein'` (Chat), `'gleich'` (Dashboard), `'gross'` (GuidedFlow/Report).

**GuidedFlow ist ein echter Wizard** (ein Befund pro Schritt, lineare Reihenfolge). Bei E1·C muss `sidebarInteractive={false}` gesetzt werden, sonst ist die Seitenliste parallel klickbar — sieht aus wie ein Bug.

## Während des Live-Builds tabu

- `scripts/`, `src/lib/data/`, Crawl-Pipeline — nicht anfassen
- Keine neuen npm-Pakete (`npm install` verboten)
- Kein Refactoring, keine Umbenennungen
- Kein `git commit`, kein `git tag` (Markus sichert selbst)

## Styling

CSS-Variablen aus [`src/lib/theme/tokens.css`](src/lib/theme/tokens.css) — keine neuen Farben.
Globale Hilfsklassen: `.container`, `.card`, `.kicker`. `--radius: 0`, 8px-Spacing-Rhythmus.
Farbcodierung nach Schwere: Magenta = hoch, Lila = mittel, Teal = niedrig. Blau = Akzent/Reichweite.

## Imports

```ts
// Svelte-Komponenten / src/routes:
import type { Page, Finding } from '$lib/types';   // Kit-Alias, nicht relativ

// scripts/*.ts:
import { analysePage } from './lib/rules.ts';       // Relative Pfade mit .ts-Extension, kein Alias
```

## Sprache & Ton

UI-Texte: Deutsch, geschlechtsneutral (Nutzende, Bietende). Kein "Fehler", kein "Verstoß".
Befunde sind Hinweise, keine Vorwürfe. Kein Konformitäts-Disclaimer weglassen.

## Agenten-Verhalten auf der Bühne

Bei Prompts die mit "Das Publikum hat entschieden" beginnen: Deutsch, eine Statuszeile je Stufe,
keine Erklärungen, keine Rückfragen. Nie committen oder taggen.

**Wortwahl:** "abschreiben"/"kopieren" sind interne Begriffe für die
Bauregel, keine Bühnensprache. Auf der Bühne z. B.: „Markup aus
`Chat.svelte` und `Arbeitsplatz.svelte` wird geschrieben, Elemente einzeln
überlegt." Nicht: „…wird abgeschrieben."
