# Erkenntnisse aus der Vorbereitung

Was beim Vorbauen am 2026-09-02 gelernt wurde. Für die Probe, für den Tag,
und für jeden Agenten, der hier weiterarbeitet.

## Über die fünf Entscheidungen

- **Eine gute Frage braucht vier Dinge.** Der Unterschied ist Sekunden nach
  der Abstimmung sichtbar. Hinter jeder Option steckt eine Haltung, nicht
  nur Geschmack. Jede Option ist aus Bausteinen in 150 Sekunden baubar. Die
  Fragen sind unabhängig, keine macht eine spätere unmöglich.
- **Achsen trennen.** E1 Form, E2 Zuständigkeit, E3 Reihenfolge, E4
  Ergebnisform. Eine Autonomie-Skala (zeigen, vorschlagen, ändern) hätte
  mehr Wucht gehabt, liegt aber auf derselben Achse wie E4. Verworfen.
- **Zwei Fragen dürfen nicht dieselben Daten leeren.** Eine Option, die
  Ermessensbefunde ganz ausblendet, hätte die halbe Verständlichkeits-Achse
  entfernt, und E3 und E4 wären auf einer leeren Liste gelaufen.
- **Rollback zeigt nicht die Alternative.** Er zeigt den Stand vor der
  Abstimmung. Wer die verworfene Option zeigen will, muss sie bauen.
- **Der Impact von E2 kommt aus Option A.** Ein umformulierter Paragraf auf
  dem Schirm erklärt Souveränität in einer Sekunde. Bei B bis D
  verschwinden Gruppen von Vorschlägen, dafür braucht es den Zähler.
- **Formulierungen, die durchgefallen sind:** "Womit fängt das Haus am
  Montag an", "Ihr Haus", "Finger weglassen". Was blieb: "Sie öffnen das
  Werkzeug. Was sehen Sie zuerst?", "Wo hört die Zuständigkeit des Systems
  auf?", "Wie arbeiten Mitarbeitende die Ergebnisse durch?", "Sie öffnen
  einen Befund. Welches Ergebnis liegt Ihnen vor?"

## Über den Live-Build

- **Die fertige Lösung darf nie in einem Schritt auftauchen.** Vier Stufen
  je Entscheidung, Primitiv, Gestaltet, Besser, Klug, nach jeder speichern.
  Stufe 1 ist Pflicht, auch wenn sie zehn Sekunden dauert.
- **Der Übergang zwischen zwei Entscheidungen ist die Gefahr, nicht die
  Entscheidung selbst.** Im Probelauf lief E1 Chat in 62 Sekunden. E2 danach
  brauchte 149, davon 80 nur, um neben dem Chat überhaupt Befundkarten mit
  Seitenauswahl aufzubauen. Darum gibt es jetzt `Arbeitsplatz.svelte`:
  Seitenliste links, Archetyp oben rechts, Panel für Karten darunter. Nach
  E1 ist das der Rahmen, egal welcher Archetyp gewinnt.
- **Flex ohne min-height 0 kollabiert.** Der Chat schrumpfte in einer
  Flex-Reihe auf null Pixel. Das ist in Chat, Sidebar und den Utilities
  `.werkzeug` und `.spalte` behoben. Live nie freihändig Layout bauen.
- **Stufen, die keinen Code kosten, brauchen einen Kommentar.** E2 Stufe 3
  (Fundstelle als Tag) kommt gratis mit der Karte. Auf der Bühne ist das ein
  bewusster Satz: "Das kam gratis mit, weil das Datenmodell die Fundstelle
  kennt." Sonst wirkt es wie eine Pause.
- **Prompts müssen den Ausgangszustand nennen.** "Zeig neben jedem Befund"
  setzt voraus, dass Befunde da sind. Nach dem Chat-Archetyp sind sie es
  nicht. Die Prompts in `docs/entscheidungen.md` nennen jetzt das Panel.
- **Der Agent committet und taggt nie.** Markus sichert selbst mit
  `npm run tag`. Bei Zeitüberschreitung bleibt der Teilzustand stehen.
- **Agentenstil auf der Bühne:** Deutsch, eine Statuszeile je Stufe, keine
  Erklärungen, keine Rückfragen. Der Verlauf ist für das Publikum sichtbar.

## Über die Daten

- **Navigation ist das größte Rauschen.** Weinheim hatte 2300 Befunde auf
  20 Seiten, 1771 davon nichtssagende Linktexte. Ursache war nicht nur die
  Linkregel, sondern dass das Mega-Menü als Fließtext gelesen wurde und auf
  jeder Seite dieselben Sätze erzeugte. Jetzt: nav, header, footer aus
  allen Regeln raus, siteweite Dubletten auf der Seite mit der höchsten
  Reichweite behalten. Ergebnis 352 Befunde auf 18 Seiten.
- **URL-Dubletten zusammenlegen.** `/datenschutz` und
  `/Funktionsseiten/datenschutz.html` sind dieselbe Seite. Zusammenlegung
  nur bei identischem Titel und Text, sonst bleiben sie getrennt.
- **`machineDecidable` war überall true.** Damit hätte E2 "beim Ermessen"
  nichts sichtbar verändert. Jetzt: Zugänglichkeitsregeln und
  Paragrafenverweis belegbar, die vier Sprachregeln Ermessen.
- **Lebenslage aus dem Mock war fast immer "Allgemein".** E3 "nach Thema"
  braucht Vielfalt. Jetzt Zuordnung nach Pfad und Titel, Weinheim hat fünf,
  Theilheim neun Lebenslagen.
- **Boxen für den Screenshot-Viewer** entstehen in einem zweiten
  Playwright-Lauf über die Selektoren (`npm run boxes -- <bestand>`).
  Selektoren driften zwischen zwei Läufen, Theilheim hat darum 85 Prozent.
  Befunde ohne Box erscheinen als Liste unter dem Bild.
- **weinheim.de verlangt Crawl-Delay 30 Sekunden.** 50 Seiten wären 30
  Minuten. 20 reichen, der Crawler speichert alle fünf Seiten zwischen.
  Satzungen und Ortsrecht kamen bei 20 Seiten nicht mehr dran, die 21
  Gesetzesbefunde stammen aus Datenschutz und Impressum.
- **Die Gesetzeszahlen je Bestand:** Weinheim 21, Theilheim 15, Eiterfeld
  2, Beispielbestand 3. Eiterfeld ist für E2 ungeeignet.

## Über Gerüst und Design

- **Der Foliensatz hat schwarze Headlines auf Weiß, nicht blaue.** Blau
  ist Kicker, Akzentwort, Linien und Flächen. CLAUDE.md ist angepasst.
- **Harte Versatzflächen sind kein Schatten.** Ein zweites Rechteck, acht
  Pixel versetzt, hellblau. Erlaubt, weil die Folien es so tun.
- **Zwei Blautöne kamen dazu**, `#002D9C` und `#A6C8FF`, beide aus der
  Carbon-Skala des Foliensatzes. Sonst keine neuen Farben.
- **IBM Plex Mono liegt nicht lokal.** Der Kicker fällt auf den
  System-Monospace zurück. Vor dem Tag die woff2-Dateien nach
  `src/lib/theme/fonts/` legen und in `fonts.css` eintragen.
- **Die Startseite bleibt leer, aber nicht stumm.** Eine Monospace-Zeile
  nennt Bestand, Seiten und Hinweise. So sieht man, dass Daten da sind, und
  der Canvas wirkt trotzdem als Startpunkt.
- **Splash unter `/intro`** ist tastengesteuert, damit das Tempo bei Markus
  liegt. Szene steht in der Adresse, ein Reload startet nicht bei Null.
  Alle Bewegung in `steps()`, damit es sich nach 8-Bit anfühlt.

## Ungeklärt: Dashboard dupliziert die Arbeitsplatz-Sidebar

Beim Nacharbeiten der vorgebauten Bausteine aufgefallen, nicht nur ein
Kosmetikfehler, sondern ein Widerspruch zwischen zwei Dokumenten.

**Der Widerspruch.** `docs/entscheidungen.md` sagt für E1: "Der Rahmen für
alle vier [Archetypen] ist `Arbeitsplatz.svelte`: Seitenliste links, der
Archetyp rechts oben." Das gilt unverändert auch für Option B, Dashboard.
Aber `Dashboard.svelte` bringt selbst eine Seitenliste mit — die Kachel-Spalte
"Alle Seiten" links im Baustein, mit eigenem `onSelectPage`. Gewinnt B, stehen
zwei Seitenlisten auf demselben Schirm, die nichts voneinander wissen: die
Arbeitsplatz-Sidebar links vom Rahmen, die Dashboard-Kacheln links im
Dashboard selbst.

**Warum das erst nach dem Rehearsal auffiel.** Der Probelauf hat E1 = Chat
gebaut. Chat hat keine eigene Seitenliste, der Widerspruch bleibt darum
unsichtbar, bis jemand testweise B durchspielt oder es live passiert.

**Zwei Wege, keiner schon entschieden:**

- **A · Dashboard schlank machen.** Die Kachel-Spalte aus `Dashboard.svelte`
  streichen, der Baustein zeigt nur noch Zusammenfassung und Befundraster.
  Seitenauswahl bleibt allein Sache der Arbeitsplatz-Sidebar. Kleinerer
  Eingriff, ändert nur einen Baustein, `docs/entscheidungen.md` bleibt
  unverändert richtig.
- **B · Dashboard bleibt vollständig, Arbeitsplatz-Rahmen wird für B zur
  Ausnahme.** Bei E1 = Dashboard keine Arbeitsplatz-Sidebar setzen, weil
  Dashboard laut eigener Beschreibung schon "alle geprüften Seiten auf einen
  Blick" zeigt — die äußere Sidebar wäre dann grundsätzlich überflüssig, nicht
  nur doppelt. Erfordert eine Ergänzung in `docs/entscheidungen.md` beim
  E1-Prompt für B ("Arbeitsplatz ohne Sidebar" oder Dashboard direkt ohne
  Rahmen).

**Entschieden am 2026-09-02: A.** `Dashboard.svelte` zeigt jetzt eine
Zähler-Reihe und das Befundraster, die Seitenliste kommt allein aus der
Arbeitsplatz-Sidebar. Die Prompts bleiben unverändert gültig.

## Über Usability, egal welcher Pfad

Der Probelauf sah nach fünf Entscheidungen verwirrend aus, obwohl jede
Stufe funktionierte: leerer Chat auf der halben Bühne, Arbeitsfläche unter
der Falz, rohe Regel-Kennungen, Filterleiste aus dem Bild, Viewer
unsichtbar. Die Lehre: **Usability lässt sich nicht live bauen, sie muss
im Rahmen stecken.** Was daraus verdrahtet wurde, steht in
`docs/ux-prinzipien.md`. Kern: das Arbeitsobjekt ist immer die Befundliste
der gewählten Seite, der Archetyp ist nur die Kopfzone darüber; der Rahmen
ist selbsttragend in der Höhe, hat eine feste Kopfzone und Leerzustände,
Grid-Kinder brechen nicht aus, Regeln stehen im Klartext.

## Über die Absicherung

- **`git clean` in rollback.sh hätte den Live-Crawl gelöscht.** Jetzt sind
  `live.json`, `live.raw.json`, `live-status.json` und `.llm-cache/`
  ausgenommen. Die echte Zeitmessung im Projekt-Repo steht noch aus.
- **Ein Subagent hat versehentlich `tag.sh` ausgeführt** und es selbst
  zurückgenommen. Lehre: Agenten während der Vorbereitung explizit "kein
  commit, kein tag" mitgeben, und den Git-Stand vor dem eigenen Commit
  prüfen.
- **Parallele Agenten brauchen getrennte Dateibesitzer.** Theme und Routen,
  Scripts und Daten, Assets und Logik. Gemeinsame Dinge wie
  `src/lib/server/bestaende.ts` und `types.ts` vorher selbst anlegen.

## Über den Chat

- **Kein Modellaufruf im Render-Pfad heißt nicht kein Modell.** Ein
  Endpunkt auf Klick ist erlaubt, muss aber vor dem Tag existieren.
- **Der Mock muss überzeugen**, weil die Probe ohne ICA läuft. Der Endpunkt
  beantwortet typische Fragen direkt aus den Daten (meiste Hinweise, Anzahl,
  Schwere, Gesetzestext, Aufwand, Achse, Startseite). Mit echtem Provider
  ist das der Rückfall bei Fehlern.
- **ICA-Schema ist noch TODO** in `IcaAdapter.complete`. Sobald
  Zugangsdaten da sind: Adapter fertigstellen, Weinheim einmal analysieren,
  Cache füllen, dann ist der zweite Lauf sofort.

## Über den Komplett-Probelauf (2026-09-02)

Ein Subagent hat E1 bis E5 sequenziell auf einem Codestand durchgebaut, mit
den Beispieloptionen aus `docs/entscheidungen.md` (A Chat, B Gesetz, D Thema,
D Screenshot, "Suche und Filter"), Screenshot je Entscheidung.

- **Keine Überraschungen bei den Bausteinen.** Alle Props von `Arbeitsplatz`,
  `Chat`, `FindingCard`, `ScreenshotViewer`, `scope.ts`, `sort.ts` stimmten
  exakt mit der Doku überein. `npm run check`: 0 Fehler, 0 Warnungen, 332
  Dateien. In keiner der fünf Stufen ein JS-Fehler in der Konsole.
- **E3 ist ein zweiter "kam gratis mit"-Moment, stärker als E2.** Die
  Gruppierung, das Einklappen und der Zähler je Gruppe stecken schon fertig
  in `Sidebar.svelte`. Für "Nach Thema" reichte eine Zeile (`gruppen`-Prop),
  keine der vier Stufen brauchte eigenen Aufbau. Auf der Bühne genauso
  ansagen wie den E2-Moment, sonst wirkt es wie eine Pause.
- **E5 "Suche und Filter" hat eine Falle beim Vorführen, nicht im Code.**
  Die Suche matcht gegen Klartext (`ruleLabel()`, `excerpt`), nicht gegen
  den rohen `rule`-Schlüssel. "alt-text-fehlt" trifft nichts, "alternativ"
  oder "hier klicken" schon. Vor der Bühne einen Klartext-Suchbegriff
  festlegen, sonst droht ein "0 Treffer"-Moment live vor Publikum.
- **Zwei parallel laufende Sessions blockierten sich gegenseitig.** Eine
  zweite Claude-Session hatte Port 5173 und den Playwright-MCP-Browser schon
  belegt; der Testagent musste auf den fremden Vite-Server ausweichen und
  sich ein eigenes Wegwerf-Playwright-Skript bauen. Vor dem echten Webinar:
  alle anderen Claude-Sessions auf diesem Repo schließen, sonst blockiert
  das den Aufbau am Tag selbst.
- **Zeitrahmen hält.** Der Ablauf wirkt in ca. 150 Sekunden je Entscheidung
  machbar, tendenziell schneller als veranschlagt (siehe E3).

## Offen vor dem Tag

- Plex Mono lokal einbinden
- ICA-Zugang, Adapter, Analyse mit echtem Modell
- ~~Alle Optionen mit Zeitmessung durchspielen, Screenshots je Entscheidung~~
  erledigt 2026-09-02, siehe oben
- E5-Suchbegriff für die Vorführung vorab festlegen (Klartext, kein Regel-Schlüssel)
- Vor dem Webinar alle anderen Claude-Sessions auf dem Repo schließen (Port/Browser-Konflikt)
- Rollback im echten Repo messen, Terminal-Alias für tag und rollback
- Bildschirmregie und Lesbarkeit in Teams
- Alle vier E1-Archetypen im neuen Rahmen einmal durchspielen (`docs/ux-prinzipien.md`)
