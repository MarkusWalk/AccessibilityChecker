# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Kontext

Live-Webinar-Tool (AccessibilityChecker). Während des 20-minütigen Live-Builds trifft das Publikum fünf Entscheidungen per Abstimmung. Der Dev-Server läuft durch — jede gespeicherte Änderung erscheint sofort per Hot Reload.

**Goldregel:** Nie länger als 60 Sekunden ohne sichtbare Änderung auf dem Schirm. Ein sichtbarer Fehler ist besser als eine leere Seite.

## Befehle

```bash
npm run dev           # SvelteKit Dev-Server (läuft während des Webinars durch)
npm run check         # svelte-check + TypeScript
npm run analyze <bestand>   # LLM-Analyse: liest src/lib/data/<bestand>.raw.json → schreibt <bestand>.json
npm run crawl         # Playwright-Crawl, schreibt *.raw.json + Screenshots
npm run tag e1        # git commit + tag live/e1 (nach jeder Entscheidung)
npm run rollback e1   # harter Reset auf live/e1 (muss < 5 Sek. laufen)
```

Kein `npm test` — kein Testrunner vorhanden. Validierung über `npm run check`.

## Architektur & Datenfluss

```
scripts/crawl.ts  →  src/lib/data/<bestand>.raw.json  (RawCrawlResult)
scripts/analyze.ts  →  src/lib/data/<bestand>.json    (Page[])
src/routes/  →  liest Page[]-JSON direkt (kein API-Endpunkt)
```

- `scripts/lib/rules.ts` — rein regelbasierte Rohanalyse, **kein LLM**, liefert `Finding[]` mit `suggestion: null`
- `src/lib/server/llm.ts` — **nur** von `scripts/analyze.ts` aufgerufen, nie im Render-Pfad
- LLM-Antworten werden in `src/lib/data/.llm-cache/` (SHA256-Hash) gecacht — zweiter Lauf ohne Netz
- `LLM_PROVIDER=mock` (default wenn kein `ICA_API_KEY`) liefert deterministisch Platzhalterdaten aus `MOCK_TEMPLATES`

## Die fünf Webinar-Entscheidungen

Das Datenmodell in [`src/lib/types.ts`](src/lib/types.ts) trägt **alle** fünf Entscheidungen bereits — keine Felder live ergänzen.

| | Betrifft |
|---|---|
| E1 | `fromLegalSource` / `legalSource` am Finding — Filterung/Anzeige von Gesetzessätzen |
| E2 | Welche Komponente aus `src/lib/assets/` eingesetzt wird (Chat/Dashboard/GuidedFlow) |
| E3 | Sortierfunktionen aus `src/lib/live/sort.ts` (`nachReichweite/Schwere/Aufwand/Lebenslage`) |
| E4 | Anzeigevariante in `FindingCard.svelte` (`suggestion`, `suggestionAlt`, `rationale`) |
| E5 | Wildcard — `LiveMonitor.svelte`, `ScreenshotViewer.svelte` und `src/lib/live/export.ts` liegen ungenutzt bereit |

## `src/lib/assets/` — absichtlich unbenutzt

Alle Komponenten dort sind fertig gebaut, aber bewusst noch nicht eingebunden. Sie werden live eingesetzt. **Nicht vorab einbinden.**

## Während des Live-Builds tabu

- `scripts/`, `src/lib/data/`, Crawl-Pipeline — nicht anfassen
- Keine neuen npm-Pakete (`npm install` verboten)
- Kein Refactoring, keine Umbenennungen, keine Ordnerverschiebungen

## Styling

CSS-Variablen aus [`src/lib/theme/tokens.css`](src/lib/theme/tokens.css) verwenden — keine neuen Farben erfinden.
Globale Hilfsklassen: `.container`, `.card`, `.kicker` (aus `global.css`).
- `--radius: 0` — klare Kanten, keine border-radius
- Spacing-Skala: `--space-1` (4px) bis `--space-7` (64px), 8px-Rhythmus
- Schrift: IBM Plex Sans via `var(--font-sans)`

## Imports in Svelte-Komponenten

```ts
import type { Page, Finding } from '$lib/types';   // Pfad-Alias, nicht relativ
```

In `scripts/` müssen relative Pfade mit `.ts`-Extension verwendet werden (ESM, kein Alias):
```ts
import { analysePage } from './lib/rules.ts';
import { complete } from '../src/lib/server/llm.ts';
```

## Sprache & Ton

- UI-Texte: Deutsch, geschlechtsneutral (Nutzende, Bietende)
- Kein "Fehler", kein "Verstoß" — Befunde sind Hinweise, keine Vorwürfe
- Kein Konformitäts-Disclaimer weglassen
