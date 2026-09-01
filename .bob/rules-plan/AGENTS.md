# AGENTS.md (Plan Mode)

This file provides guidance to agents when working with code in this repository.

## Architektonische Constraints

**Datenmodell ist eingefroren.** [`src/lib/types.ts`](src/lib/types.ts) darf live nicht verändert werden — alle Felder für alle fünf Entscheidungen sind bereits dort. Planen, die ein Feld hinzufügen, scheitern.

**Zwei-Stufen-Pipeline, strikt getrennt:**
1. `scripts/` (Node/Playwright/LLM) — Offline-Vorbereitung, läuft vor dem Webinar
2. `src/` (SvelteKit) — Render-Pfad, liest nur gecachte JSON, kein LLM

Jede Planung, die LLM-Aufrufe in den Render-Pfad zieht, ist ein Architekturverstoß.

**Komponenten-Strategie für E2:** `Chat.svelte`, `Dashboard.svelte`, `GuidedFlow.svelte` sind vollständig in `src/lib/assets/`. Planen heißt: Einfügen + Theme-Anpassung + Datenanbindung — nicht neu bauen.

**Zeitbudget je Entscheidung:** 90–150 Sek. Abbruch bei 150 Sek. E2 ist die größte Änderung (~150 Sek.), E4 die kleinste (~60–90 Sek.), E3/Lebenslage die risikoreichste Option (~150 Sek.).

**Rollback-Garantie:** Jeder Plan muss nach `npm run tag eN` rollbackfähig bleiben. Keine Datenbankmigrationen, keine externen Zustandsänderungen.

**`src/lib/live/sort.ts` gibt für E3 Lebenslage eine `Map<string, Page[]>` zurück** — kein Array. Planungen, die eine Sortierung erwarten, brechen dort ab.
