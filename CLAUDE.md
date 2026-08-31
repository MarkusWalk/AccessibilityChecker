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

Die Leitreihenfolge für eine Interface-Entscheidung:

1. Komponente einfügen, sie erscheint roh auf der Seite
2. Zuschnitt und Platzierung im Layout
3. Farben und Typografie aus dem Theme
4. Interaktivität, sie tut etwas

Das ist eine Richtschnur, kein Zwang. Du darfst Stufen zusammenziehen oder
eine zusätzliche einschieben, wenn das Ergebnis dadurch schneller sichtbar
wird. Pflicht ist nur: **nach jedem sichtbaren Zwischenschritt speichern.**
Nie länger als 60 Sekunden ohne eine Änderung auf dem Bildschirm.

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
  machineDecidable: boolean       // E1: belegt oder Urteilssache
  fromLegalSource: boolean        // E1: stammt der Satz aus einem Gesetz
  legalSource: string | null      // E1: die Fundstelle, falls bekannt
  suggestion: string | null       // E4: fertiger Vorschlagstext
  suggestionAlt: string | null    // E4: zweite Variante
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

## Absicherung

Nach jeder angenommenen Entscheidung wird der Stand markiert:

```
npm run tag e1        # git tag live/e1, committet vorher alles
npm run rollback e1   # harter Rücksprung auf live/e1
```

`rollback` muss auf einen Tastendruck laufen und in unter fünf Sekunden fertig
sein. Das wird in der Probe geübt, sonst nützt es nichts.

Abbruchkriterium im Live-Betrieb: **150 Sekunden pro Bauschritt.** Danach
bricht Markus ab und geht zur nächsten Entscheidung.

## Die fünf Entscheidungen

Ausführlich in `docs/entscheidungen.md`, inklusive der Prompts, die Markus
live tippt. Kurzfassung:

| | Frage | Wirkt auf |
|---|---|---|
| E1 | Was tut das System bei einem unverständlichen Satz aus einem Gesetz? | Logik, Filterung, Anzeige der Befunde |
| E2 | Chat, Dashboard oder geführter Flow? | Der Archetyp der ganzen Oberfläche |
| E3 | Priorisierung nach Reichweite, Schwere, Aufwand oder Lebenslage? | Sortierung und Gruppierung |
| E4 | Fertiger Vorschlag, Vorschlag mit Begründung, nur Markierung, zwei Varianten? | Die Befund-Karte |
| E5 | Wildcard aus dem Publikum | Offen |

E5 ist unbekannt. Halte den Code so, dass ein zusätzliches sichtbares Feature
in vier Minuten dazukommen kann.

## Aufbau

```
src/
  lib/
    theme/          Unblock-AI-Tokens. Anfassen nur mit gutem Grund.
    assets/         Fertige Komponenten, noch nicht eingebunden.
                    Chat, Dashboard, LiveMonitor, Sidebar,
                    ScreenshotViewer, Button, FindingCard
    live/           Was während des Builds entsteht
    data/           Gecachte Bestände als JSON
    server/llm.ts   Modellanbindung, providerneutral, mit Plattencache
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

**Prüfdaten.** Hybrid. Zwei bis drei Bestände liegen fertig als JSON in
`src/lib/data/`. Zusätzlich läuft ab Minute 0 ein Crawl der vom Publikum
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
- Weiße Flächen, blaue Überschriften, klare Kanten, keine Schatten,
  keine Farbverläufe
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
