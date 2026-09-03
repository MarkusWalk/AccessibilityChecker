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
2. **Gestaltet.** Das Rohe aus Stufe 1 wird durch echtes Markup ersetzt, das
   wie die vorbereitete Komponente aus `src/lib/assets/` aussieht — Elemente
   einzeln nacheinander geschrieben (Eingabefeld, dann Liste, dann Button,
   …), jedes für sich sichtbar. **Nicht** die fertige Komponente importieren
   und in einer Zeile rendern (`<Chat ... />`) — das ist kein Bauschritt,
   das ist Kopieren. Die Datei in `src/lib/assets/` ist die **Vorlage**:
   Struktur, Klassen, Wortwahl daraus abschreiben, nicht als Blackbox
   einbinden.
3. **Besser.** Zuschnitt, Platz im Layout, Zähler, Zustände.
4. **Klug.** Logik aus `src/lib/live/` oder ein Endpunkt wird angeschlossen.

Nie länger als 60 Sekunden ohne eine sichtbare, gespeicherte Änderung. Ein
Fehler auf dem Bildschirm ist besser als kein Zwischenschritt.

**Kein LLM im Render-Pfad.** `src/lib/server/llm.ts` nur von `scripts/` aus aufrufen — nie aus SvelteKit-Routes oder Komponenten.

**Die vier E1-Archetypen (`Chat`, `Dashboard`, `GuidedFlow`, `Report`) sind
Vorlage, nicht Bauteil.** Nicht per `import` als Komponente einbinden und
verdrahten — das ersetzt den Bauschritt durch einen einzigen
Copy-Paste-Moment und ist live nicht von "schon vorher fertig gebaut" zu
unterscheiden. Stattdessen die Datei lesen und ihre Elemente selbst,
einzeln, in die Route schreiben. Gilt nur für die entscheidungsprägende
Komponente der aktuellen Frage — Bausteine ohne eigene Entscheidung
(`Arbeitsplatz`, `FindingCard`, `Badge`, `Button`, `Counter`, `Sidebar`,
`ScreenshotViewer`, `LiveMonitor`) werden normal importiert.

**Import-Konvention:**
- Svelte-Komponenten: `import ... from '$lib/types'` (Kit-Alias)
- `scripts/*.ts`: Relative Pfade mit `.ts`-Extension (kein Alias, bare ESM)

**Neue Findings nur über `makeFinding()`** in `scripts/lib/rules.ts` erzeugen — setzt `fromLegalSource: false` und alle Nullfelder korrekt.

**Mock-Adapter erkennt Prompts strukturell** — Prompts aus `analyze.ts` müssen die Marker `Regel:`, `Originalsatz:` (und optional `Rechtsquelle:`) enthalten, damit `MOCK_TEMPLATES` greift.

## Häufige Fehler aus Probeläufen

- **`hauptAnteil` vergessen:** `Arbeitsplatz.svelte` benötigt je Archetyp den richtigen Wert: `'klein'` (Chat), `'gleich'` (Dashboard), `'gross'` (GuidedFlow/Report). Ohne ihn quetscht sich der Panel-Bereich.
- **Dashboard darf keine eigene Seitenliste haben.** `Dashboard.svelte` zeigt Zähler und Befundraster — keine `onSelectPage`-Kachelliste. Die Seitenauswahl liegt allein in der Arbeitsplatz-Sidebar.
- **GuidedFlow ist ein Wizard, kein Sortiermodus.** Bei E1·C muss `sidebarInteractive={false}` gesetzt werden; ohne das ist die Seitenliste weiterhin klickbar, was live wie ein Bug aussieht.
- **`byLebenslage()` gibt `Record<string, Page[]>` zurück**, kein Array — in Svelte mit `Object.entries(gruppen)` iterieren.
- **E5-Suche matcht gegen Klartext**, nicht gegen `rule`-Schlüssel. Suchbegriff vorab festlegen ("alternativ", "hier klicken"), nicht "alt-text-fehlt".
- **Flex ohne `min-height: 0` kollabiert.** Chat und Sidebar schrumpfen in Flex-Reihen auf null. `.werkzeug` / `.spalte` in `global.css` sind dafür vorhanden — nutzen, nicht freihändig layouten.

## Kein starres Schema

Die Stufenfolge oben ist der Normalfall, kein Dogma. Sinnvolle
Abweichungen sind erwünscht: Chat an die Seite statt mittig oder als
Hover-Fenster, Dashboard mit klickbaren dynamischen Kacheln statt reiner
Zahlen, andere Stufenreihenfolge, eine zusätzliche Facette. Keine
Beliebigkeit — Stufe 1 ungestylt, jede Stufe gespeichert, nie länger als
60 Sekunden ohne Änderung bleiben Pflicht.

## KI gehört in jeden Archetyp

Nicht nur Chat bekommt einen LLM-Moment — jeder E1-Archetyp einen eigenen:
Dashboard eine kurze generierte Übersicht ("Was fällt auf?") über dem
Befundraster, Geführt eine intelligente Anmerkung je Schritt, Bericht eine
generierte Zusammenfassung am Anfang. Endpunkte sollen **streamen**
(bessere UX) statt auf die vollständige Antwort zu warten — `complete()`
in `src/lib/server/llm.ts` setzt aktuell `stream: false` fest, ICA
unterstützt `stream: true`, das ist noch nicht angebunden.

## Verhalten auf der Bühne

Bei Prompts, die mit "Das Publikum hat entschieden" beginnen oder erkennbar
aus dem Live-Build stammen: Deutsch, eine kurze Statuszeile je Stufe, keine
Erklärungen, keine Rückfragen, nie committen oder taggen.

**Wortwahl:** "abschreiben" und "kopieren" sind interne Begriffe für die
Bauregel oben (Vorlage, nicht Bauteil) — keine Bühnensprache, das klingt
vor Publikum nach Abkürzung statt nach Handwerk. Auf der Bühne z. B.:
„Markup aus `Chat.svelte` und `Arbeitsplatz.svelte` wird geschrieben,
Elemente einzeln überlegt." Nicht: „…wird abgeschrieben." Weitere
brauchbare Formulierungen: „wird Element für Element aufgebaut", „entsteht
nach dem Vorbild von …", „wird einzeln nachgebaut".

## E5-Vorbereitung (Wildcard)

Fertige, ungenutzte Utilities für wahrscheinliche Wünsche:
- Export: `src/lib/live/export.ts` → `toCsv()` / `toMarkdown()` / `download()`
- Sortierung: `src/lib/live/sort.ts` → `byReach/bySeverity/byEffort/byLebenslage()`
- Komponenten: `LiveMonitor.svelte`, `ScreenshotViewer.svelte`
- Live-Status-Endpunkt: `src/routes/api/live-status/+server.ts` (liest `live-status.json` mit Demo-Fallback)
