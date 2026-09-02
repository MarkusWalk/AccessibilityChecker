# AGENTS.md (Plan Mode)

This file provides guidance to agents when working with code in this repository.

## Architektonische Constraints

**Datenmodell ist eingefroren.** [`src/lib/types.ts`](src/lib/types.ts) darf live nicht verändert werden — alle Felder für alle fünf Entscheidungen sind bereits dort. Pläne, die ein Feld hinzufügen, scheitern.

**Zwei-Stufen-Pipeline, strikt getrennt:**
1. `scripts/` (Node/Playwright/LLM) — Offline-Vorbereitung, läuft vor dem Webinar
2. `src/` (SvelteKit) — Render-Pfad, liest nur gecachte JSON, kein LLM

Jede Planung, die LLM-Aufrufe in den Render-Pfad zieht, ist ein Architekturverstoß.

**Komponenten-Strategie für E1:** `Chat.svelte`, `Dashboard.svelte`, `GuidedFlow.svelte`, `Report.svelte` sind vollständig in `src/lib/assets/` — aber als **Vorlage**, nicht als importierbares Bauteil. Ein Plan, der `import Chat from '$lib/assets/Chat.svelte'` und `<Chat ... />` vorsieht, ist falsch: das verdrahtet die fertige Komponente in einem Schritt statt sie zu bauen. Planen heißt: Struktur und Markup der Vorlage übernehmen, aber als eigene Elemente in `Arbeitsplatz.svelte` (`haupt`-Snippet) Schritt für Schritt neu schreiben, dazwischen `hauptAnteil` setzen und die Datenanbindung als eigene Stufe.

**`Arbeitsplatz.svelte` ist der Rahmen für alle vier E1-Archetypen.** Seitenliste links (Sidebar), Archetyp rechts oben (haupt-Snippet), Befundliste darunter (panel-Snippet). `hauptAnteil`-Prop ist Pflicht je Archetyp: `'klein'` (Chat), `'gleich'` (Dashboard), `'gross'` (GuidedFlow/Report).

**Zeitbudget je Entscheidung:** 90–150 Sek. Abbruch bei 150 Sek. E2 ist die größte Änderung (~150 Sek.), E4 die kleinste (~60–90 Sek.), E3·Lebenslage die risikoreichste Option (~150 Sek.).

**Rollback-Garantie:** Jeder Plan muss nach `npm run tag eN` rollbackfähig bleiben. Keine Datenbankmigrationen, keine externen Zustandsänderungen.

## Bekannte Architektur-Entscheide (nicht mehr offen)

- **Dashboard hat keine eigene Seitenliste.** Entschieden: Kachel-Spalte gestrichen, Seitenauswahl allein in Arbeitsplatz-Sidebar.
- **GuidedFlow ist ein echter Wizard** (Schritt-Index über alle Befunde, nicht Seiten-Index). API: `onPageChange`, nicht `onIndexChange`. Bei E1·C muss `sidebarInteractive={false}` gesetzt werden.
- **`byLebenslage()` gibt `Record<string, Page[]>` zurück**, kein sortiertes Array. Pläne die Sortierung erwarten, brechen dort ab — stattdessen `Object.entries()` in der Svelte-Komponente.
- **`bestaend` umschalten** passiert über URL-Parameter `?bestand=<name>`, nicht Cookie/Store. Ein `goto('?bestand=…')` lässt den Layout-Loader neu laufen ohne Neuladen.

## `.env`-Fallstrick

`npm run dev` liest `.env` dank `vite.config.ts` automatisch. `scripts/` (Node-Prozesse) lesen `.env` **nicht** automatisch — `LLM_PROVIDER`, `ICA_API_KEY` etc. müssen dort manuell exportiert sein. Pläne, die analyze-Skripte in CI laufen lassen wollen, müssen das berücksichtigen.
