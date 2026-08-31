# Was vor dem Webinar gebaut wird

Arbeitsliste für alles, was am Tag des Live-Builds fertig sein muss. Was hier
nicht steht, wird live gebaut.

## 1 Gerüst

- [ ] SvelteKit-Projekt, Dev-Server läuft stabil mit Hot Reload
- [ ] `src/lib/theme/` mit den Unblock-AI-Tokens als CSS-Variablen
- [ ] IBM Plex Sans lokal eingebunden, kein Abruf von außen zur Laufzeit
- [ ] Startseite zeigt einen weißen Canvas mit Kopfzeile und sonst nichts

Der weiße Canvas ist der Startpunkt der zwanzig Minuten. Er muss leer
aussehen und trotzdem lauffähig sein.

## 2 Crawl mit Playwright

- [ ] `scripts/crawl.ts`, nimmt eine Startadresse und eine Seitenzahl
- [ ] Folgt internen Links bis zur gesetzten Grenze, Voreinstellung 50 Seiten
- [ ] Beachtet `robots.txt`, mindestens eine Sekunde Abstand zwischen Abrufen
- [ ] User-Agent nennt Zweck und eine Kontaktadresse
- [ ] Schreibt je Seite einen Screenshot als PNG
- [ ] Schreibt `Page[]` als JSON nach `src/lib/data/`
- [ ] Läuft auch, wenn einzelne Seiten fehlschlagen, und protokolliert das

## 3 Rohanalyse

Ohne Modell, rein regelbasiert. Schnell und verlässlich.

**Zugänglichkeit**

- [ ] Bilder ohne Alternativtext
- [ ] Leere oder nichtssagende Linktexte ("hier", "mehr", "klicken")
- [ ] Sprünge in der Überschriftenebene
- [ ] Formularfelder ohne Beschriftung
- [ ] Tabellen ohne Kopfzeile
- [ ] Fehlende Sprachauszeichnung

**Verständlichkeit**

- [ ] Satzlänge über Schwellwert
- [ ] Nebensatztiefe
- [ ] Passivanteil
- [ ] Nominalstil, Häufung von Wörtern auf -ung
- [ ] Paragrafenverweise ohne begleitende Erklärung

## 4 Modellanalyse

- [ ] `src/lib/server/llm.ts`, providerneutral, Zugang über Umgebungsvariable
- [ ] Plattencache je Anfrage, ein zweiter Lauf ist sofort fertig
- [ ] `scripts/analyze.ts` füllt die Felder, die Urteil verlangen:
  - `machineDecidable`
  - `fromLegalSource` und `legalSource`
  - `suggestion`, `suggestionAlt`, `rationale`
  - `effort`
  - `lebenslage` je Seite
- [ ] Läuft über einen Bestand in unter fünf Minuten

`fromLegalSource` ist das Feld, an dem E1 hängt. Es muss in den vorbereiteten
Beständen genug Treffer geben, sonst hat die wichtigste Entscheidung des
Abends keine sichtbare Wirkung. Vor dem Webinar zählen und notfalls den
Bestand wechseln.

## 5 Assets

Fertig gebaut, sauber, im Theme, aber **nicht eingebunden**. Sie liegen in
`src/lib/assets/` und warten.

- [ ] `Chat.svelte`
- [ ] `Dashboard.svelte`
- [ ] `GuidedFlow.svelte`
- [ ] `FindingCard.svelte` mit allen vier Anzeigevarianten aus E4
- [ ] `Sidebar.svelte`
- [ ] `LiveMonitor.svelte`
- [ ] `ScreenshotViewer.svelte`
- [ ] `Button.svelte` und die übrigen Grundbausteine

Jede Komponente nimmt ihre Daten über Eigenschaften entgegen und holt sich
nichts selbst. Sonst kostet das Einbinden live zu viel Zeit.

## 6 Absicherung

- [ ] `npm run tag <name>` committet und setzt `live/<name>`
- [ ] `npm run rollback <name>` springt hart zurück, in unter fünf Sekunden
- [ ] Beides auf eine Tastenkombination gelegt
- [ ] Einmal geübt, mit einem absichtlich zerstörten Zustand

## 7 Daten

- [ ] Zwei bis drei Bestände fertig gecacht, verschiedene Häuser, verschiedene
      Größen
- [ ] Ein Rückfallbestand, der garantiert gute Befunde auf beiden Achsen hat
- [ ] Hintergrund-Crawl der live genannten Adresse startklar, ohne dass die
      Oberfläche darauf wartet

## 8 Probe

- [ ] Alle vier planbaren Entscheidungen einmal in jeder Antwortoption gebaut,
      mit Zeitmessung
- [ ] Jede Option unter 150 Sekunden
- [ ] Zwei erfundene Wildcards durchgespielt
- [ ] Ein Bauschritt absichtlich scheitern lassen und den Rücksprung üben
- [ ] Bildschirmregie geprüft: zwei Fenster 40 zu 60, heller Hintergrund,
      Schrift ab 18 pt, Browser-Zoom 150
- [ ] Lesbarkeit in echter Teams-Auflösung geprüft
