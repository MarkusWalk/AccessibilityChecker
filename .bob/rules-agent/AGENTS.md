# AGENTS.md (Agent Mode)

This file provides guidance to agents when working with code in this repository.

## Kritische Coding-Regeln

**Bauschritt-Pflicht:** Nach jedem sichtbaren Zwischenschritt speichern. Stufenfolge für Interface-Entscheidungen:
1. Komponente roh einfügen (sofort sichtbar)
2. Zuschnitt & Layout
3. Theme-Farben aus `tokens.css`
4. Daten anbinden

**Kein LLM im Render-Pfad.** `src/lib/server/llm.ts` nur von `scripts/` aus aufrufen — nie aus SvelteKit-Routes oder Komponenten.

**`src/lib/assets/`-Komponenten** sind absichtlich unbenutzt — live einsetzen, nicht vorab einbinden.

**Import-Konvention:**
- Svelte-Komponenten: `import ... from '$lib/types'` (Kit-Alias)
- `scripts/*.ts`: Relative Pfade mit `.ts`-Extension (kein Alias, bare ESM)

**Neue Findings nur über `makeFinding()`** in `scripts/lib/rules.ts` erzeugen — setzt `fromLegalSource: false` und alle Nullfelder korrekt.

**Mock-Adapter erkennt Prompts strukturell** — Prompts aus `analyze.ts` müssen die Marker `Regel:`, `Originalsatz:` (und optional `Rechtsquelle:`) enthalten, damit `MOCK_TEMPLATES` greift.

## E5-Vorbereitung (Wildcard)

Fertige, ungenutzte Utilities für wahrscheinliche Wünsche:
- Export: `src/lib/live/export.ts` → `alsCsv()` / `alsMarkdown()`
- Sortierung: `src/lib/live/sort.ts` → `nachReichweite/Schwere/Aufwand/Lebenslage()`
- Komponenten: `LiveMonitor.svelte`, `ScreenshotViewer.svelte`
