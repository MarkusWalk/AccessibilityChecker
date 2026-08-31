# Was vor dem Webinar gebaut wird

Arbeitsliste für alles, was am Tag des Live-Builds fertig sein muss. Was hier
nicht steht, wird live gebaut.

Stand: durchgearbeitet vor dem Webinar (Abschnitte 1–7). Abschnitt 8 (Probe)
ist ein Termin mit Markus selbst, kein Code-Artefakt — siehe die Hinweise am
Ende dieser Datei.

## 1 Gerüst

- [x] SvelteKit-Projekt, Dev-Server läuft stabil mit Hot Reload
- [x] `src/lib/theme/` mit den Unblock-AI-Tokens als CSS-Variablen
- [x] IBM Plex Sans lokal eingebunden, kein Abruf von außen zur Laufzeit
- [x] Startseite zeigt einen weißen Canvas mit Kopfzeile und sonst nichts
      (plus einem schmalen Pixel-Band und einer kleinen Marke — sparsam,
      siehe CLAUDE.md/Gestaltung)

Der weiße Canvas ist der Startpunkt der zwanzig Minuten. Er muss leer
aussehen und trotzdem lauffähig sein.

## 2 Crawl mit Playwright

- [x] `scripts/crawl.ts`, nimmt eine Startadresse und eine Seitenzahl
- [x] Folgt internen Links bis zur gesetzten Grenze, Voreinstellung 50 Seiten
- [x] Beachtet `robots.txt`, mindestens eine Sekunde Abstand zwischen Abrufen
- [x] User-Agent nennt Zweck und eine Kontaktadresse
- [x] Schreibt je Seite einen Screenshot als PNG (`static/screenshots/`, damit
      im Browser erreichbar)
- [x] Schreibt `Page[]` als JSON nach `src/lib/data/` (`<bestand>.raw.json`,
      lokal, nicht committet — Zwischenformat vor der Analyse)
- [x] Läuft auch, wenn einzelne Seiten fehlschlagen, und protokolliert das

## 3 Rohanalyse

Ohne Modell, rein regelbasiert. Schnell und verlässlich. `scripts/lib/rules.ts`.

**Zugänglichkeit**

- [x] Bilder ohne Alternativtext
- [x] Leere oder nichtssagende Linktexte ("hier", "mehr", "klicken")
- [x] Sprünge in der Überschriftenebene
- [x] Formularfelder ohne Beschriftung
- [x] Tabellen ohne Kopfzeile
- [x] Fehlende Sprachauszeichnung

**Verständlichkeit**

- [x] Satzlänge über Schwellwert
- [x] Nebensatztiefe
- [x] Passivanteil
- [x] Nominalstil, Häufung von Wörtern auf -ung
- [x] Paragrafenverweise ohne begleitende Erklärung (erkennt § **und**
      Art./Artikel-Zitate, z.B. DSGVO-Verweise)

## 4 Modellanalyse

- [x] `src/lib/server/llm.ts`, providerneutral, Zugang über Umgebungsvariable
      (`LLM_PROVIDER=ica|mock`, `ICA_API_URL`, `ICA_API_KEY`, `ICA_MODEL`).
      Ohne ICA-Zugangsdaten läuft automatisch der Mock-Adapter — die
      Vorbereitung blockiert nie an fehlendem Zugang. Das ICA-Request/
      Response-Schema ist als TODO markiert und muss angepasst werden,
      sobald es vorliegt (Fundstelle: `IcaAdapter.complete` in `llm.ts`).
- [x] Plattencache je Anfrage (`src/lib/data/.llm-cache/`), ein zweiter Lauf
      ist sofort fertig
- [x] `scripts/analyze.ts` füllt die Felder, die Urteil verlangen:
  - `machineDecidable`
  - `fromLegalSource` und `legalSource`
  - `suggestion`, `suggestionAlt`, `rationale`
  - `effort`
  - `lebenslage` je Seite
- [x] Läuft über einen Bestand in unter fünf Minuten (Mock-Adapter: Sekunden;
      mit echtem ICA-Zugang vorher an einem kleinen Bestand prüfen)

`fromLegalSource` ist das Feld, an dem E1 hängt. Gezählt:

- **theilheim.json**: 15 von 395 Befunden mit `fromLegalSource: true`
  (BauGB-Bekanntmachungen, DSGVO-Verweise in der Datenschutzerklärung)
- **eiterfeld.json**: 2 von 592 Befunden — knapp, im Livebetrieb ggf. auf
  `fallback.json` oder `theilheim.json` ausweichen, wenn E1 wenig sichtbare
  Wirkung zeigt
- **fallback.json**: 3 von 12 Befunden, gezielt mit Gesetzeszitaten gebaut —
  der garantierte Rückfall für E1

## 5 Assets

Fertig gebaut, sauber, im Theme, aber **nicht eingebunden**. Sie liegen in
`src/lib/assets/` und warten.

- [x] `Chat.svelte`
- [x] `Dashboard.svelte`
- [x] `GuidedFlow.svelte`
- [x] `FindingCard.svelte` mit allen vier Anzeigevarianten aus E4
- [x] `Sidebar.svelte`
- [x] `LiveMonitor.svelte`
- [x] `ScreenshotViewer.svelte`
- [x] `Button.svelte` und die übrigen Grundbausteine (`Badge.svelte`,
      `Tag.svelte`)

Jede Komponente nimmt ihre Daten über Eigenschaften entgegen und holt sich
nichts selbst. Alle acht wurden vor dem Commit einmal isoliert mit echten
Bestandsdaten gerendert und geprüft (Route wieder entfernt).

Zusätzlich als Skizze für E3/E5 vorbereitet, ebenfalls ungenutzt:

- [x] `src/lib/live/sort.ts` — die vier Sortier-/Gruppierfunktionen aus E3
- [x] `src/lib/live/export.ts` — CSV- und Markdown-Export der Befunde

## 6 Absicherung

- [x] `npm run tag <name>` committet und setzt `live/<name>`
- [x] `npm run rollback <name>` springt hart zurück
- [x] Geprüft: Rollback lief in ~240 ms (deutlich unter 5 Sekunden)
- [x] Einmal geübt, mit einem absichtlich zerstörten Zustand (kaputte
      Syntax + Stördatei) — beides war nach dem Rollback weg
- [ ] Auf eine Tastenkombination gelegt — das ist eine
      Terminal-/OS-Einstellung, kein Code. Empfehlung: ein Shell-Alias
      (z.B. `alias t='npm run tag'; alias r='npm run rollback'`) oder ein
      Snippet im genutzten Terminal/Editor. In der Probe einrichten.

## 7 Daten

- [x] Zwei Bestände fertig gecacht, verschiedene Häuser, verschiedene Größen
      (`theilheim.json`: 17 Seiten/395 Befunde, `eiterfeld.json`: 19
      Seiten/592 Befunde — echte Crawls, robots.txt-konform)
- [x] Ein Rückfallbestand, der garantiert gute Befunde auf beiden Achsen hat
      (`fallback.json`, handgebaut, 3 Seiten/12 Befunde, 3× `fromLegalSource`)
- [x] Hintergrund-Crawl der live genannten Adresse startklar
      (`scripts/live-crawl.ts` / `npm run live-crawl -- <url>`), ohne dass
      die Oberfläche darauf wartet — schreibt Status nach
      `src/lib/data/live-status.json`, den `LiveMonitor.svelte` anzeigen kann

## 8 Probe

Nicht von einem Coding-Agenten automatisierbar — ein Termin mit Markus
selbst, kurz vor dem Webinar:

- [ ] Alle vier planbaren Entscheidungen (E1–E4) einmal in jeder
      Antwortoption bauen, mit Zeitmessung
- [ ] Jede Option unter 150 Sekunden
- [ ] Zwei erfundene Wildcards (E5) durchspielen
- [ ] Einen Bauschritt absichtlich scheitern lassen und den Rücksprung üben
      (Mechanik ist geprüft, siehe Abschnitt 6 — hier geht es um die Übung
      unter Zeitdruck)
- [ ] Bildschirmregie geprüft: zwei Fenster 40 zu 60, heller Hintergrund,
      Schrift ab 18 pt, Browser-Zoom 150
- [ ] Lesbarkeit in echter Teams-Auflösung geprüft
- [ ] Terminal-Alias für `npm run tag` / `npm run rollback` einrichten
      (siehe Abschnitt 6) und in die Zeitmessung mit aufnehmen
