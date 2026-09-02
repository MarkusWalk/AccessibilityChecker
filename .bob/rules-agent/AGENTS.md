# AGENTS.md (Agent Mode)

This file provides guidance to agents when working with code in this repository.

## Kritische Coding-Regeln

**Bauschritt-Pflicht — die wichtigste Regel im Live-Build.** Die fertige
Lösung darf **nie in einem Schritt** auftauchen, auch wenn sie in Sekunden
baubar wäre. Für jede Entscheidung gilt exakt diese Stufenfolge, **jede
Stufe endet mit Speichern**, keine Stufe wird übersprungen oder
zusammengefasst:

1. **Primitiv.** Etwas Rohes aus den echten Daten (`data.bestand.pages`),
   ganz ohne die vorbereitete Komponente — eine schlichte Liste, Tabelle
   oder ein Textblock, bewusst ungestylt. Pflicht, auch wenn sie nur zehn
   Sekunden auf dem Schirm steht.
2. **Gestaltet.** Erst jetzt löst die vorbereitete Komponente aus
   `src/lib/assets/` das Rohe ab, das Theme (`tokens.css`) greift.
3. **Besser.** Zuschnitt, Platz im Layout, Zähler, Zustände.
4. **Klug.** Logik aus `src/lib/live/` oder ein Endpunkt wird angeschlossen.

Nie länger als 60 Sekunden ohne eine sichtbare, gespeicherte Änderung. Ein
Fehler auf dem Bildschirm ist besser als kein Zwischenschritt.

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
