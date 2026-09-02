# AccessibilityChecker

Anwendung für den Live-Build im Webinar "Souveränität beginnt beim Prototyp"
(IBM iX, Unblock AI / Staat Next Level). Referent: Markus Walk.

Dieses Dokument ist die Anweisung für jeden Coding-Agenten in diesem Repo.
Lies es vollständig, bevor du eine Zeile änderst.

## Worum es geht

Das Werkzeug prüft den Webauftritt einer Behörde auf zwei Achsen:

- **Verständlichkeit.** Schachtelsätze, Passivketten, unerklärte Fachbegriffe,
  Paragrafenverweise ohne Erklärung.
- **Zugänglichkeit.** Fehlende Alternativtexte, Überschriftenstruktur ohne
  Ordnung, Linktexte wie "hier klicken", Text in Bildern.

Geprüft wird ein Bestand von vielen Seiten, nicht eine einzelne Seite. Der
Rahmen ist Unterstützung. Es gibt keine Note für ein Haus, es gibt eine
Arbeitsliste.

## Die Besonderheit dieses Projekts

Im Webinar bauen 20 Minuten lang **die Zuschauenden** mit. Sie treffen fünf
Entscheidungen per Umfrage. Markus tippt jede Entscheidung als Prompt an den
Coding-Agenten, und die Oberfläche verändert sich sichtbar, während schon die
nächste Abstimmung läuft.

Daraus folgen drei Regeln, die über allem stehen.

### Regel 1: Sichtbarer Fortschritt schlägt Vollständigkeit

Der Svelte-Dev-Server läuft die ganze Zeit. Jede Änderung erscheint sofort
per Hot Reload. Arbeite deshalb in kleinen Stufen und speichere nach jeder,
statt einen großen fertigen Wurf abzuliefern.

Die vier Stufen für jede Entscheidung, jede endet mit Speichern:

1. **Primitiv.** Etwas Rohes aus den echten Daten erscheint: eine schlichte
   Liste, eine Tabelle, ein Textblock. Ungestylt, absichtlich.
2. **Gestaltet.** Die vorbereitete Komponente aus `src/lib/assets/` löst das
   Rohe ab, das Theme greift.
3. **Besser.** Zuschnitt, Platz im Layout, Zähler, Zustände.
4. **Klug.** Logik aus `src/lib/live/` oder ein Endpunkt wird angeschlossen.

Der Weg vom Primitiven zum Klugen ist Teil der Vorführung. Die fertige
Lösung darf nie in einem Schritt auftauchen. Stufe 1 ist Pflicht, auch wenn
sie nur zehn Sekunden dauert. Pflicht ist außerdem: **nach jedem sichtbaren
Zwischenschritt speichern.** Nie länger als 60 Sekunden ohne eine Änderung
auf dem Bildschirm.

Ein Fehler auf dem Bildschirm ist besser als eine leere Seite. Wenn etwas
klemmt, liefere den kleinstmöglichen lauffähigen Zustand, statt weiter zu
bauen.

### Regel 2: Das Datenmodell trägt alle fünf Entscheidungen

Keine der fünf Entscheidungen darf live eine Änderung am Datenmodell
erzwingen. Jedes Feld, das irgendeine der Antwortoptionen braucht, existiert
vorher und ist gefüllt.

```ts
type Finding = {
  id: string
  pageUrl: string
  axis: 'verstaendlichkeit' | 'zugaenglichkeit'
  rule: string                    // z.B. 'satzlaenge', 'alt-text-fehlt'
  severity: 'hoch' | 'mittel' | 'niedrig'
  excerpt: string                 // die betroffene Stelle im Original
  selector: string | null         // CSS-Pfad für den Screenshot-Viewer
  box: { x, y, width, height } | null   // E4 D: Lage im Vollseiten-Screenshot
  machineDecidable: boolean       // E2: belegt oder Ermessensfrage
  fromLegalSource: boolean        // E2: stammt der Satz aus einem Gesetz
  legalSource: string | null      // E2: die Fundstelle, falls bekannt
  suggestion: string | null       // E4: fertiger Vorschlagstext
  suggestionAlt: string | null    // E5-Rückfall: zweite Variante
  rationale: string | null        // E4: Begründung mit Regelbezug
  effort: 'klein' | 'mittel' | 'gross'   // E3: Priorisierung nach Aufwand
}

type Page = {
  url: string
  title: string
  reach: number                   // E3: Zugriffe oder Klicktiefe als Ersatz
  lebenslage: string | null       // E3: thematische Bündelung
  screenshot: string              // Pfad zur PNG
  findings: Finding[]
}
```

Wenn du ein Feld brauchst, das hier fehlt, ergänze es **vor** dem Webinar,
nie währenddessen.

### Regel 3: Nichts umbauen, was schon läuft

Während des Live-Builds gilt:

- Keine Umbenennungen, keine Ordnerverschiebungen, kein Refactoring
- Keine neuen Abhängigkeiten, `npm install` ist tabu
- Keine Änderung an `scripts/`, `src/lib/data/` oder der Crawl-Pipeline
- Kein Aufräumen von Code, der nicht zur aktuellen Entscheidung gehört

Du darfst technisch alles anfassen. Die Absicherung läuft über Git. Aber jede
Änderung außerhalb der aktuellen Entscheidung ist ein Risiko ohne Gegenwert.

### Verhalten auf der Bühne

Gilt für jeden Prompt, der mit "Das Publikum hat entschieden" beginnt oder
erkennbar aus dem Live-Build stammt:

- Antworte auf Deutsch, eine kurze Statuszeile je Stufe, keine Erklärungen,
  keine Rückfragen. Der Verlauf ist für das Publikum sichtbar.
- Kein `git commit`, kein `git tag`. Markus sichert selbst mit
  `npm run tag`. Rollback-Punkte müssen sauber bleiben.
- Bei Zeitüberschreitung bleibt der Teilzustand stehen. Nichts zurückbauen.

## Absicherung

Nach jeder angenommenen Entscheidung wird der Stand markiert:

```
npm run tag e1        # git tag live/e1, committet vorher alles
npm run rollback e1   # harter Rücksprung auf live/e1
```

`rollback` muss auf einen Tastendruck laufen und in unter fünf Sekunden fertig
sein. Das wird in der Probe geübt, sonst nützt es nichts.

Abbruchkriterium im Live-Betrieb: **150 Sekunden pro Bauschritt.** Danach
bricht Markus ab und geht zur nächsten Entscheidung. Der Teilzustand bleibt
auf dem Schirm.

## Die fünf Entscheidungen

Ausführlich in `docs/entscheidungen.md`, inklusive der Prompts, die Markus
live tippt. Kurzfassung:

| | Frage | Wirkt auf |
|---|---|---|
| E1 | Sie öffnen das Werkzeug. Was sehen Sie zuerst? Chat, Dashboard, Geführt, Bericht | Der Archetyp der ganzen Oberfläche |
| E2 | Wo hört die Zuständigkeit des Systems auf? Nirgends, beim Gesetz, beim Ermessen, bei der Sprache | Modus je Befund: Vorschlag, Markierung, Frage |
| E3 | Wie arbeiten Mitarbeitende die Ergebnisse durch? Reichweite, Schwere, Aufwand, Thema | Sortierung und Gruppierung |
| E4 | Sie öffnen einen Befund. Welches Ergebnis liegt Ihnen vor? Text, Vorschlag mit Begründung, Markierung mit Frage, die Seite selbst mit Markierungen | Die Befund-Karte oder der Screenshot-Viewer |
| E5 | Wildcard. Wünschen Sie sich etwas, das diese Anwendung zehnmal besser macht! | Offen |

E5 ist unbekannt. Halte den Code so, dass ein zusätzliches sichtbares Feature
in vier Minuten dazukommen kann.

## Aufbau

```
src/
  lib/
    theme/          Unblock-AI-Tokens. Anfassen nur mit gutem Grund.
    assets/         Fertige Komponenten, noch nicht eingebunden.
                    Chat, Dashboard, GuidedFlow, Report, LiveMonitor,
                    Sidebar, ScreenshotViewer, FindingCard, Counter,
                    Button, Badge, Tag
    live/           Vorbereitete Logik für die Stufe "Klug":
                    sort.ts (E3), scope.ts (E2), export.ts (E5)
    data/           Gecachte Bestände als JSON, Weinheim ist der Start
    server/llm.ts   Modellanbindung, providerneutral, mit Plattencache
    server/bestaende.ts   Zugriff auf Bestände, für Layout und /api/chat
  routes/
    +layout.server.ts     lädt den gewählten Bestand, ?bestand=<name>
    api/chat/             Endpunkt für E1 A, nutzt llm.ts mit Cache
  routes/
scripts/
  crawl.ts          Playwright-Crawl, schreibt Page[] und Screenshots
  analyze.ts        LLM-Analyse, füllt die Finding-Felder
  tag.sh
  rollback.sh
decisions/          Protokoll der fünf Entscheidungen aus dem Webinar
docs/
```

Die Komponenten unter `src/lib/assets/` sind gebaut, aber noch nicht
zugeschnitten. Genau daraus besteht die Live-Arbeit. Sie liegen dort
absichtlich unbenutzt.

## Technik

**Frontend.** SvelteKit. Dev-Server läuft während des ganzen Webinars.

**Crawl.** Playwright headless. Liefert gerendertes DOM und einen Screenshot
je Seite. `robots.txt` wird beachtet, Abstand zwischen Abrufen mindestens
eine Sekunde, User-Agent nennt Zweck und Kontakt.

**Prüfdaten.** Hybrid. Weinheim, Theilheim, Eiterfeld und ein Beispielbestand
liegen fertig als JSON in `src/lib/data/`. Weinheim ist der Startbestand, die
Umschaltung sitzt in der Kopfleiste. Zusätzlich läuft ab Minute 0 ein Crawl der vom Publikum
genannten Adresse im Hintergrund. Was rechtzeitig fertig wird, kommt rein.
Die Oberfläche muss mit beiden Quellen umgehen, ohne dass etwas umgebaut wird.

**LLM.** Eine Datei, `src/lib/server/llm.ts`, providerneutral, Zugang über
Umgebungsvariable. Jede Antwort wird auf Platte gecacht, damit ein zweiter
Lauf sofort fertig ist. Keine Modellaufrufe im Render-Pfad der Oberfläche.

## Gestaltung

Das Unblock-AI-Theme aus dem Foliensatz gilt. Es liegt in `src/lib/theme/`.

- Schrift: IBM Plex Sans
- Ink `#161616`, Blau `#0F62FE`, Teal `#009D9A`, Purple `#8A3FFC`,
  Magenta `#9F1853`, Linie `#E0E0E0`, Tint `#EDF5FF`
- Weiße Flächen, Überschriften in Ink mit blauem Akzentwort, Kicker in
  IBM Plex Mono, Versalien, gesperrt, blau. Klare Kanten, keine weichen
  Schatten, keine Farbverläufe. Blaue Blockflächen dürfen einen harten
  hellblauen Versatz haben, wie im Foliensatz.
- Zusätzlich zur Palette nur die zwei Carbon-Blautöne `--color-blue-dark`
  `#002D9C` und `--color-blue-light` `#A6C8FF` aus dem Foliensatz.
- Pixel- und 8-Bit-Elemente sind das Erkennungszeichen. Sparsam einsetzen,
  als Band oder Marke, nie als Dekoration über die ganze Fläche.

Neue Farben werden nicht erfunden. Wenn ein Zustand eine Farbe braucht, kommt
sie aus dieser Liste.

## Sprache in der Oberfläche

Deutsch, geschlechtsneutral. Nutzende statt Nutzer, Bietende statt Bieter,
Doppelnennung bei Entwicklerinnen und Entwicklern, sonst Umformulierung ohne
Personalpronomen.

Der Ton ist unterstützend. Ein Befund ist ein Hinweis, kein Vorwurf. Keine
Noten, keine Punktzahlen für ein Haus, keine Wörter wie "Fehler" oder
"Verstoß" in der Oberfläche.

## Was dieses Werkzeug nicht ist

Es ist kein Konformitätsnachweis nach BITV und ersetzt keine Prüfung durch
eine Überwachungsstelle. Das steht in der Oberfläche und wird nicht
weggelassen.
