# UX-Prinzipien für den Live-Build

Was vor dem Webinar in Rahmen, Bausteine und Theme verdrahtet ist, damit
die Oberfläche am Ende brauchbar aussieht, egal welche der 4×4×4×4
Kombinationen das Publikum wählt. Ergebnis der Auswertung des Probelaufs
vom 2026-09-02 (Screenshots e1 bis e5): leerer Chat auf der halben Bühne,
Hero drückt die Arbeitsfläche unter die Falz, Sidebar mit Host-Rauschen,
rohe Regel-Kennungen, Filterleiste läuft aus dem Bild, Screenshot-Viewer
unsichtbar.

## Leitprinzip

Das Arbeitsobjekt ist in jeder Kombination dasselbe: **die Befundliste der
gewählten Seite.** Der Archetyp aus E1 ist nur die Kopfzone darüber. E2 bis
E5 verändern Inhalt, Reihenfolge und Kopf derselben Liste. Der Rahmen
erzwingt diese Rangfolge, statt sie dem Zufall der Stufen zu überlassen.

## Was verdrahtet ist

### Viewport-Budget

- **Seitenkopf flach.** Kicker, Headline in h2-Größe und Stand in einer
  Zeile (`src/routes/+page.svelte`). Die Display-Größe gehört der Intro.
- **Arbeitsplatz selbsttragend.** `Arbeitsplatz.svelte` braucht keine Höhe
  von außen mehr: ohne Vorgabe füllt er den Schirm unter Kopfleiste und
  Seitenkopf (`calc(100dvh - 11rem)`), überschreibbar über
  `--arbeitsplatz-hoehe`. Kein Wrapper, kein `80vh` im Prompt.
- **Panel dominiert.** Prop `hauptAnteil`: `klein` (Default, Chat oben mit
  höchstens 38 Prozent), `gleich` (Dashboard), `gross` (Bericht, Geführt,
  die selbst Befunde zeigen). Ohne Panel bekommt `haupt` alles.
- **Grid-Kinder brechen nicht aus.** `.werkzeug > *`, `.spalte > *` und
  `.zweispaltig > *` haben `min-width: 0`. Das war der Grund, warum der
  Screenshot-Viewer im Probelauf aus dem Bild geschoben wurde.

### Zonen mit festem Landeplatz

- **Panel-Kopfzone** (`.panel-kopf`, sticky, Tint): Seitentitel,
  Befundzahl, `kontext` (z.B. Lebenslage), rechts `zaehler` (E2). Snippet
  `kopf` ersetzt die Zone, das ist der Landeplatz für E5-Filter.
- **Filterzeile** (`.filterzeile`): Raster mit `auto-fit`, läuft nie aus
  dem Bild. Trefferzahl gehört in die Kopfzone, nicht in die Leiste.
- **Zwei Spalten** (`.zweispaltig`): Karten links, Screenshot rechts,
  beide auf `minmax(0, 1fr)`.

### Zustände

- **Leerzustand** (`.leerzustand`): gestrichelte Fläche mit einem Satz,
  nie eine weiße Bühne. Arbeitsplatz zeigt „Keine Seite gewählt“ und
  „Keine Befunde auf dieser Seite“ selbst, Sidebar „Noch keine Seiten“,
  Dashboard „Keine Befunde im Bestand“.
- **Warten im Chat**: Prop `wartet` zeigt eine Blase „Antwort wird
  erstellt…“ mit Pixelreihe und sperrt die Eingabe, bis der Endpunkt
  antwortet.
- **Auswahl beim Bestandswechsel**: `Arbeitsplatz` setzt `selected`
  zurück, wenn die Seite im neuen Bestand nicht existiert.
- **Erledigt**: jede Karte endet mit einer Handlung. Vorschlag hat
  „Übernehmen“, alle Modi haben „Erledigt“ (Karte wird blass).

### Inhalt und Sprache

- **Regeln im Klartext** über `src/lib/live/labels.ts` (`ruleLabel`):
  „Alternativtext fehlt“, „Linktext ohne Ziel“, „Langer Satz“ … Karte,
  Bericht, Viewer und Tooltip nutzen das. Unbekannte Regeln fallen auf die
  Kennung zurück, ein Live-Crawl bricht nichts.
- **Seitentitel ohne Host** (`shortTitle`): „weinheim.de - Rathaus“ wird
  „Rathaus“, der Bestand steht in der Kopfleiste.
- **Ausschnitte lesbar** (`.lesbar`, `isTechnicalExcerpt`): Adressen und
  Pfade in Monospace, überall umbrechend, Höhe der Blockquote begrenzt.
- **Ein Wort für die Sache**: überall „Befunde“, nicht „Hinweise“.

### Sidebar

- Titel auf zwei Zeilen (`.zeilen-2`), Zahl in Mono, Schwere als
  Farbstreifen links in den Badge-Tönen statt als Badge in jeder Zeile.
  Badges bleiben den Karten vorbehalten.
- `aria-current` auf dem aktiven Eintrag, `aria-expanded` auf
  Gruppentiteln, Pfeiltasten und Home/End wandern durch die Liste.

### Bausteine im Rahmen

- **Dashboard** ohne eigene Seitenliste (Entscheidung A aus
  `erkenntnisse.md`): Zähler-Reihe aus `Counter.svelte` plus Befundraster,
  scrollt selbst.
- **GuidedFlow** und **Report** füllen den `haupt`-Slot, scrollen selbst,
  Lesebreite über `--lese-breite` von außen. Bei E1 C/D `hauptAnteil="gross"`.
- **ScreenshotViewer** scrollt das Bild in einem Rahmen mit
  `--viewer-hoehe` (Default 70vh), die Markierungen scrollen mit.

### Theme

- `--font-size-small` auf 15px, Meta-Deckung 85 Prozent: 14px bei 70
  Prozent liegt im Teams-Video unter 4,5:1 Kontrast.
- `.sr-only` einmal global. Kein hartes `font-family: monospace` mehr.

## Was live daraus folgt

- E1-Prompts setzen den Arbeitsplatz ohne Wrapper und ohne Höhe ein.
- `/probe?archetyp=chat|dashboard|gefuehrt|bericht&scope=…&variant=…&viewer=1&gruppen=1`
  zeigt jede Kombination im Rahmen, für die Probe vor dem Tag.
- Bei Bericht und Geführt `hauptAnteil="gross"`, beim Dashboard `"gleich"` mitgeben.
- E3 D: `gruppen` an den Arbeitsplatz, `kontext` mit der Lebenslage.
- E4 D: Karten und Viewer in `.zweispaltig`.
- E5 Filter: ins Snippet `kopf`, Felder in `.werkzeug-flaeche.filterzeile`.

## Offen (nice, wenn Zeit bleibt)

- Counter-Reihe auch für den E2-Zähler statt Mono-Zeile.
- Tastatursprung von einer Markierung im Viewer zur Karte prüfen.
