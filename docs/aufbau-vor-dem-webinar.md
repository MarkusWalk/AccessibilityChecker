# Was vor dem Webinar gebaut wird

Arbeitsliste für alles, was am Tag des Live-Builds fertig sein muss. Was hier
nicht steht, wird live gebaut.

Stand: 2026-09-02, nach der Überarbeitung der fünf Entscheidungen (siehe
`docs/entscheidungen.md`). Abschnitte 1 bis 7 sind durchgearbeitet. Abschnitt
8 (Probe) ist ein Termin mit Markus selbst, kein Code-Artefakt.

## 1 Gerüst

- [x] SvelteKit-Projekt, Dev-Server läuft stabil mit Hot Reload
- [x] `src/lib/theme/` mit den Unblock-AI-Tokens als CSS-Variablen
- [x] IBM Plex Sans lokal eingebunden, kein Abruf von außen zur Laufzeit
- [x] Startseite zeigt einen weißen Canvas mit Kopfzeile und sonst nichts
      (plus einem schmalen Pixel-Band und einer kleinen Marke — sparsam,
      siehe CLAUDE.md/Gestaltung). Eine Monospace-Zeile nennt den aktiven
      Bestand mit Seiten- und Hinweiszahl, damit man sieht, dass Daten da sind.
- [x] Design am Foliensatz ausgerichtet: Headlines in Ink mit blauem
      Akzentwort, Mono-Kicker, Pixelband in fünf Tönen, harte Versatzflächen
      (`.block-blau`), gestrichelte Hinweisflächen (`.block-gestrichelt`),
      Pixelreihe (`.pixelreihe`). Zwei Carbon-Blautöne ergänzt
      (`--color-blue-dark`, `--color-blue-light`).
- [ ] IBM Plex Mono liegt nicht lokal, der Kicker fällt auf den
      System-Monospace zurück. Vor dem Termin `IBMPlexMono-Regular.woff2`
      und `-Medium` nach `src/lib/theme/fonts/` legen und in `fonts.css`
      eintragen. Kein Abruf von außen zur Laufzeit.
- [x] Bestandsumschaltung in der Kopfleiste (`?bestand=<name>`), Loader in
      `src/routes/+layout.server.ts` über `src/lib/server/bestaende.ts`.
      Ein Bestand, der erst während des Webinars fertig wird, erscheint ohne
      Neustart. `data.bestand.pages` ist der Einstieg für den Live-Build.
- [x] Bauschritt-Anzeige oben rechts ("E0 / 5"), als Prop `schritt` an der
      Topbar. Live genügt ein Wert aus dem Layout.
- [x] Splash-Screen unter `/intro`: vier Szenen (Titel, Werkzeug, die fünf
      Entscheidungen, Spielregeln), Leertaste oder Pfeil rechts weiter,
      Pfeil links zurück, Enter auf Szene 4 führt auf `/`. Szene steht als
      `#1` bis `#4` in der Adresse. Ohne Kopf- und Fußzeile, kein Scrollen
      bei 1600×900 und 1280×720. Alle Bewegung in `steps()`, mit
      `prefers-reduced-motion` steht alles sofort.

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

- [x] `Chat.svelte` — E1 Archetyp A. Props: `messages`, `onSend`.
- [x] `Dashboard.svelte` — E1 Archetyp B. Props: `pages`, `variant` (E4-
      Anzeigevariante, an `FindingCard` weitergereicht, Default `'text'`),
      `onSelectPage`.
- [x] `GuidedFlow.svelte` — E1 Archetyp C. Props: `pages`, `variant`,
      `index`, `onIndexChange`.
- [x] `Report.svelte` — E1 Archetyp D. Props: `pages`, `bestandLabel`. Ein
      lesbares, druckbares Dokument (`@media print`): Kopf mit Datum,
      Zusammenfassung je Achse, dann je Seite eine Überschrift mit URL und
      die Befunde als Absätze. Trägt den BITV-Hinweis aus CLAUDE.md/"Was
      dieses Werkzeug nicht ist" im Fußtext.
- [x] `FindingCard.svelte` — E4. Props: `finding`, `variant: 'text' |
      'begruendung' | 'frage' | 'zwei'` (A/B/C/E5-Rückfall), optional
      `mode?: ScopeMode` aus `scope.ts` (E2, geht `variant` vor — bei
      `'markierung'`/`'frage'` zeigt die Karte unabhängig von `variant`
      keinen Vorschlag), `onAdopt`. Bei `variant="text"` löst der
      "Übernehmen"-Button (`Button.svelte`) `onAdopt(finding)` aus und zeigt
      danach "Übernommen".
- [x] `ScreenshotViewer.svelte` — E4 Variante D. Props: `page`, `findings`
      (Default `page.findings`), `onSelect`, `activeId`. Rechtecke aus
      `box` werden in Prozent der natürlichen Bildgröße positioniert (liest
      `naturalWidth`/`naturalHeight` per `onload`), Farbe Blau, bei
      `severity: 'hoch'` Magenta, Hover/Fokus zeigt Regel + Vorschlag als
      Tooltip, Klick ruft `onSelect`. Rechtecke sind Buttons mit
      `aria-label`, also tastaturbedienbar. Befunde ohne `box` (aktuell der
      Regelfall, siehe Abschnitt 5a) erscheinen als Liste unter dem Bild.
- [x] `Sidebar.svelte`
- [x] `LiveMonitor.svelte`
- [x] `Counter.svelte` — E5-Rückfall. Props: `label`, `value`, optional
      `of`. Große Zahl in Plex Sans Bold, Kicker in Monospace, optional eine
      Reihe kleiner Quadrate im Pixelstil (`value` von `of`, max. 20). Passt
      für den Kopfzeilen-Zähler aus E2 (`countScopes()`) und für einfache
      Kennzahlen ("17 Seiten").
- [x] `Button.svelte` und die übrigen Grundbausteine (`Badge.svelte`,
      `Tag.svelte`)

Jede Komponente nimmt ihre Daten über Eigenschaften entgegen und holt sich
nichts selbst. Alle wurden vor dem Commit einmal isoliert mit echten
Bestandsdaten gerendert und geprüft (Route `_probe` wieder entfernt), siehe
Abschnitt 5a.

## 5a Scope, Sortierung, Export und Chat-Endpunkt

Ebenfalls vorbereitet, ungenutzt bis zur jeweiligen Entscheidung.

**`src/lib/live/scope.ts` (E2).**

- `scopeFor(finding, option: ScopeOption): ScopeMode` — `ScopeOption` ist
  `'nirgends' | 'gesetz' | 'ermessen' | 'sprache'` (A–D aus E2),
  `ScopeMode` ist `'vorschlag' | 'markierung' | 'frage'`. Regeln, kurz
  kommentiert im Code: `nirgends` → immer `vorschlag`; `gesetz` →
  `fromLegalSource` entscheidet zwischen `markierung` und `vorschlag`;
  `ermessen` → Gesetzestext bleibt `markierung`, sonst entscheidet
  `machineDecidable` zwischen `vorschlag` und `frage`; `sprache` → nur die
  Achse Zugänglichkeit bekommt `vorschlag`, Verständlichkeit immer
  `markierung`.
- `countScopes(findings, option): Record<ScopeMode, number>` — für den
  Kopfzeilen-Zähler ("N Vorschläge · M Markierungen · K Fragen"), passend zu
  `Counter.svelte`.
- `questionFor(finding): string` — kurze, unterstützende Frage je Regel für
  Modus `'frage'`, mit achsenneutralem Rückfall für Regeln ohne eigene
  Formulierung.
- Aktueller Datenstand (`theilheim.json`): mit Option `'gesetz'` ergeben
  sich 380 `vorschlag` und 15 `markierung`, 0 `frage` — `machineDecidable`
  ist in allen drei Beständen bislang durchgängig `true`, Modus `'frage'`
  hat also noch keinen echten Datenfall (nur mit `mode` manuell in der
  Probe getestet). Für E2-Option `'ermessen'` ist das ohne Weiteres
  baubar, zeigt live aber ggf. keine `frage`-Karte, wenn sich das nicht
  vorher ändert.

**`src/lib/live/sort.ts` (E3).** Exporte umbenannt auf die in
`docs/entscheidungen.md` referenzierten Namen: `byReach(pages)`,
`bySeverity(pages)`, `byEffort(pages)` (alle `Page[] -> Page[]`),
`byLebenslage(pages): Record<string, Page[]>` (Gruppierung, Schlüssel
`page.lebenslage ?? 'Ohne Zuordnung'`).

**`src/lib/live/export.ts` (E5-Rückfall).** `toCsv(pages)`,
`toMarkdown(pages)` unverändert in der Logik, nur umbenannt (vorher
`alsCsv`/`alsMarkdown`). Neu: `download(filename, text)` — löst über einen
unsichtbaren `<a download>` einen Browser-Download aus, läuft nur
clientseitig (no-op ohne `document`, z.B. während SSR-Import).

**`src/routes/api/chat/+server.ts` (E1, Stufe 4 von Chat).**
`POST { bestand: string, question: string, history?: {role, text}[] }` →
`200 { answer: string, provider: string, error?: string }`. Lädt den
Bestand über `resolveBestand()`, baut je Seite einen kompakten Kontext
(Titel, URL, Befundzahl je Achse, die fünf schwersten Befunde mit Regel und
Auszug, insgesamt auf ca. 12.000 Zeichen gekürzt), formuliert eine deutsche
Systemanweisung (unterstützender Ton, antwortet nur aus dem Bestand, nennt
Seiten mit URL, keine Noten, keine Wörter wie "Fehler"/"Verstoß") und ruft
`complete()` aus `src/lib/server/llm.ts` auf — der Plattencache dort greift
automatisch, ein zweiter Lauf mit derselben Frage antwortet sofort. Jeder
Fehlerfall (leere Frage, ungültiges JSON, Adapterfehler) kommt mit Status
200 und `answer: "Das System kann diese Frage gerade nicht beantworten."`
plus Feld `error` zurück, der Chat bleibt also nie in einem rohen
Fehlerzustand hängen. `GET` auf denselben Pfad liefert eine kurze
JSON-Beschreibung des Endpunkts.

Getestet mit `LLM_PROVIDER=mock` gegen den laufenden Dev-Server (Port
5174): `GET`/`POST` liefern die erwartete Form, der Cache greift beim
zweiten identischen Aufruf (~20 ms statt eines vollen Requests), History
und ein unbekannter Bestandsname (Rückfall über `resolveBestand`) laufen
sauber durch. Der `MockAdapter` in `llm.ts` ist auf die Prompt-Form von
`scripts/analyze.ts` zugeschnitten (er sucht `Regel:`/`Originalsatz:` im
Prompt) und liefert für Chat-Prompts darum nur einen generischen
Platzhaltertext ("[Mock] Kein Vorlagen-Eintrag …") statt einer sinnvollen
Antwort — der Endpunkt selbst arbeitet korrekt, das ist eine Einschränkung
des Mocks, die `llm.ts` gehört (dort nicht angefasst, siehe CLAUDE.md).
Mit `LLM_PROVIDER=ica` und echtem Zugang antwortet derselbe Endpunkt ohne
Codeänderung sinnvoll.

## 6 Absicherung

- [x] `npm run tag <name>` committet und setzt `live/<name>`
- [x] `npm run rollback <name>` springt hart zurück
- [x] Geprüft: Rollback lief in ~240 ms (deutlich unter 5 Sekunden)
- [x] Live-Dateien überleben den Rollback: `live.json`, `live.raw.json`,
      `live-status.json` und `.llm-cache/` sind vom `git clean` ausgenommen
- [x] Der Agent committet und taggt während des Live-Builds nie. Markus
      sichert selbst mit `npm run tag`. Bei Zeitüberschreitung bleibt der
      Teilzustand stehen.
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

- [ ] Splash unter `/intro` einmal durchklicken, dann `/` öffnen
- [ ] Alle vier planbaren Entscheidungen (E1–E4) einmal in jeder
      Antwortoption bauen, mit Zeitmessung, in den vier Stufen aus
      CLAUDE.md (Primitiv, Gestaltet, Besser, Klug)
- [ ] ICA-Zugangsdaten und Request-Schema eintragen, `IcaAdapter.complete`
      in `src/lib/server/llm.ts` fertigstellen, Weinheim einmal mit echtem
      Modell analysieren, Cache füllen
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
