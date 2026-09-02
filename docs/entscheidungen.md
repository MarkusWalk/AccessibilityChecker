# Die fünf Entscheidungen

Was das Publikum im Webinar entscheidet, wie die Frage auf der Folie steht,
was das im Code bedeutet, und der Prompt, den Markus live tippt.

Stand: 2026-09-02, überarbeitete Fassung. Reihenfolge ist E1 bis E5 wie hier
nummeriert. Alle fünf müssen vor dem Webinar einmal durchgespielt sein. Jede
Antwortoption muss baubar sein, ohne dass das Datenmodell angefasst wird.

## Warum genau diese fünf

Das Webinar heißt "Souveränität beginnt beim Prototyp". Jede Frage macht
eine Entscheidung sichtbar, die ein gekauftes Produkt sonst per
Voreinstellung für das Haus trifft. Die Kriterien:

- Der Unterschied ist Sekunden nach der Abstimmung auf dem Schirm.
- Hinter jeder Option steckt eine Haltung, nicht nur Geschmack.
- Jede Option ist aus vorbereiteten Bausteinen in 150 Sekunden baubar.
- Die fünf sind unabhängig voneinander. Keine Wahl macht eine spätere
  unmöglich.

Die Achsen sind getrennt: E1 Form, E2 Zuständigkeit, E3 Reihenfolge,
E4 Ergebnisform, E5 offen.

## Der sichtbare Verlauf je Entscheidung

Live darf nicht einfach die fertige Lösung auftauchen. Jeder Bauschritt
zeigt den Weg vom Primitiven zum Klugen, in vier Stufen, nach jeder Stufe
wird gespeichert:

1. **Primitiv.** Etwas Rohes erscheint: eine schlichte Liste, eine Tabelle,
   ein Textblock aus den echten Daten. Ungestylt.
2. **Gestaltet.** Die vorbereitete Komponente aus `src/lib/assets/` löst das
   Rohe ab, das Theme greift.
3. **Besser.** Zuschnitt, Platz im Layout, Zähler, Zustände.
4. **Klug.** Die Logik aus `src/lib/live/` oder dem Endpunkt wird
   angeschlossen. Es tut etwas.

Die Prompts unten verlangen diese Stufen ausdrücklich.

---

## E1 · Sie öffnen das Werkzeug. Was sehen Sie zuerst?

- **A · Chat.** Ein Eingabefeld. Sie stellen Fragen an den Bestand, das
  System antwortet mit Befunden und Seiten.
- **B · Dashboard.** Alle geprüften Seiten auf einen Blick, mit Zahlen je
  Seite. Sie entscheiden selbst, wo Sie hinschauen.
- **C · Geführt.** Eine Seite nach der anderen, mit ihren Befunden. Das
  System gibt den Weg vor, Sie arbeiten ab.
- **D · Bericht.** Ein Dokument zum Lesen und Weiterleiten, wie man es aus
  Prüfungen kennt.

**Im Code.** Die größte sichtbare Veränderung. Bausteine: `Chat.svelte`,
`Dashboard.svelte`, `GuidedFlow.svelte`, `Report.svelte` — diese vier sind
**Vorlage, nicht Bauteil**: ihre Elemente werden in Stufe 2 abgeschrieben
und einzeln neu geschrieben, nicht per `import` in einer Zeile eingebunden.
Der Rahmen für alle vier ist `Arbeitsplatz.svelte`: Seitenliste links, der
Archetyp rechts oben, darunter ein Panel für Befundkarten — der Rahmen
selbst (wie `FindingCard`, `Sidebar` und die anderen Bausteine ohne eigene
Entscheidung) wird ganz normal importiert, nur er bringt keine Entscheidung
sichtbar mit. Der Rahmen braucht keine Höhe von außen und bringt Kopfzone
und Leerzustände mit (`docs/ux-prinzipien.md`). Bei C und D
`hauptAnteil="gross"` mitgeben, weil der Archetyp die Befunde selbst zeigt,
bei B `"gleich"`. Das Panel ist der Anker für E2 bis E4, egal welcher
Archetyp gewinnt. Die Daten kommen aus dem Layout-Loader (`data.bestand`
auf der Startseite). Bei A antwortet der vorbereitete Endpunkt `/api/chat`,
der Verlauf wird als `history` mitgeschickt.

**Prompt (Beispiel für A):**

> Das Publikum hat entschieden: Chat. Stufe 1: Zeig auf der Startseite erst
> eine rohe Liste der Seiten mit ihrer Befundzahl aus `data.bestand.pages`,
> speichern. Stufe 2: Setz `Arbeitsplatz.svelte` aus `src/lib/assets/` ein
> und schreib in den Bereich `haupt` Eingabefeld, Verlauf und Senden-Button
> einzeln nach dem Vorbild von `Chat.svelte` — nicht die Komponente
> importieren —, speichern. Stufe 3: Ins Panel darunter die Befunde der
> gewählten Seite als `FindingCard`-Liste, speichern. Stufe 4: `onSend` an
> `/api/chat` anbinden, mit `history`, Antworten erscheinen im Verlauf,
> speichern.

**Probelauf 2026-09-02:** 62 Sekunden ohne den Arbeitsplatz-Rahmen. Der
Rahmen kam danach dazu, damit E2 bis E4 nicht erst eine Kartenliste bauen
müssen. Diese Zeit galt noch für direktes Einbinden von `Chat.svelte` —
mit Vorlage-statt-Bauteil braucht Stufe 2 spürbar länger.

**Erwartete Bauzeit:** 150 bis 180 Sekunden (oberes Ende bzw. leicht über
dem alten Budget, weil Stufe 2 die Chat-Elemente einzeln schreibt statt
die Komponente einzubinden).

---

## E2 · Wo hört die Zuständigkeit des Systems auf?

- **A · Nirgends.** Es schlägt auch vor, wie ein Paragraf aus dem
  Baugesetzbuch besser klingt.
- **B · Beim Gesetz.** Zitate aus Gesetzen werden markiert, aber nie
  umgeschrieben.
- **C · Beim Ermessen.** Ob ein Bild einen Alternativtext hat, sagt es. Ob
  ein Satz zu lang ist, fragt es.
- **D · Bei der Sprache.** Es prüft Technik. Texte bleiben ganz bei
  Menschen.

**Im Code.** `src/lib/live/scope.ts` weist jedem Befund einen Modus zu:
`vorschlag`, `markierung` oder `frage`. Die Felder `fromLegalSource`,
`legalSource`, `machineDecidable` und `axis` sind gefüllt. Jeder Archetyp
und `FindingCard` nehmen `scopeOption` bzw. `mode` als Prop. Sichtbar wird
es über die Karte (Vorschlag verschwindet, Markierung oder Frage erscheint)
und über den Zähler: "N Vorschläge · M Markierungen · K Fragen".

Der Impact kommt aus A. Wählt der Raum A, steht ein umformulierter Paragraf
auf dem Schirm. Bei B bis D verschwinden ganze Gruppen von Vorschlägen.

**Prompt (Beispiel für B):**

> Das Publikum hat entschieden: Beim Gesetz hört es auf. Stufe 1: Schreib
> im Panel neben jeden Befund roh den Wert von `fromLegalSource`,
> speichern. Stufe 2: Gib jeder Karte `mode={scopeFor(finding, 'gesetz')}`
> aus `src/lib/live/scope.ts`, speichern. Stufe 3: Zeig, dass Karten im
> Modus `markierung` jetzt die Fundstelle aus `legalSource` als Tag tragen,
> speichern. Stufe 4: Zähler über dem Panel mit `countScopes` als
> `zaehler`-Prop am Arbeitsplatz, speichern.

**Moderation:** Stufe 3 kostet keinen Code, die Karte kann das schon. Das
ist ein bewusster Moment: "Das kam gratis mit, weil das Datenmodell die
Fundstelle kennt." Nicht als Pause wirken lassen.

**Probelauf 2026-09-02:** 149 Sekunden, davon 80 für den fehlenden
Kartenrahmen nach dem Chat-Archetyp. Mit `Arbeitsplatz.svelte` entfällt das.

**Erwartete Bauzeit:** 90 bis 120 Sekunden.

---

## E3 · Wie arbeiten Mitarbeitende die Ergebnisse durch?

- **A · Nach Reichweite.** Die Seiten zuerst, die die meisten Menschen
  aufrufen.
- **B · Nach Schwere.** Die Hürden zuerst, die am meisten ausschließen.
- **C · Nach Aufwand.** Zuerst, was in fünf Minuten erledigt ist.
- **D · Nach Thema.** Alles zu einer Lebenslage, zum Beispiel Umzug, an
  einem Stück.

**Im Code.** `src/lib/live/sort.ts`. A bis C sortieren, D gruppiert und ist
darum die aufwendigste Option. Felder: `reach`, `severity`, `effort`,
`lebenslage`. Wenn D gewinnt, zuerst die Gruppenüberschriften sichtbar
machen, dann die Inhalte einsortieren.

**Prompt (Beispiel für D):**

> Das Publikum hat entschieden: Nach Thema. Stufe 1: Schreib über die Liste
> roh die vorkommenden Lebenslagen als Textzeile, speichern. Stufe 2:
> Gruppier mit `byLebenslage` aus `src/lib/live/sort.ts`, Überschriften je
> Gruppe, speichern. Stufe 3: Befunde unter ihre Gruppe einsortieren,
> speichern. Stufe 4: Gruppen einklappbar, Zähler je Gruppe, speichern.

**Erwartete Bauzeit:** 60 bis 120 Sekunden. D eher 150.

---

## E4 · Sie öffnen einen Befund. Welches Ergebnis liegt Ihnen vor?

- **A · Ein fertiger Text.** Übernehmen und weiter.
- **B · Ein Vorschlag mit Begründung.** Warum, und welche Regel gilt.
- **C · Eine Markierung und eine Frage.** Den Text schreiben Sie.
- **D · Die Seite selbst, mit den Stellen markiert.** Fahren Sie mit der
  Maus darüber, erscheint der Vorschlag.

**Im Code.** A bis C sind Anzeigevarianten von `FindingCard.svelte` über
`suggestion` und `rationale`. D ist `ScreenshotViewer.svelte` mit den
Rechtecken aus `box` und dem Vorschlag im Hover. Bei C wird nichts
hinzugefügt, sondern weggelassen. Das ist schnell und darf laut kommentiert
werden.

**Prompt (Beispiel für D):**

> Das Publikum hat entschieden: Die Seite selbst. Stufe 1: Zeig unter dem
> ersten Befund roh das Screenshot-Bild der Seite, speichern. Stufe 2: Setz
> `ScreenshotViewer.svelte` mit den Befunden der Seite ein, Rechtecke aus
> `box` erscheinen, speichern. Stufe 3: Viewer bekommt seinen Platz neben
> der Liste, speichern. Stufe 4: Hover auf ein Rechteck zeigt `suggestion`,
> Klick springt zur Karte, speichern.

**Erwartete Bauzeit:** 60 bis 120 Sekunden.

---

## E5 · Wildcard. Wünschen Sie sich etwas, das diese Anwendung zehnmal besser macht!

Freitext im Chat, die Moderation kuratiert drei Vorschläge, eine Kurzumfrage
entscheidet. Regel, laut gesagt: Es muss etwas sein, das man auf dem
Bildschirm sieht.

**Im Code.** Unbekannt. Vier bis fünf Minuten Bauzeit.

Rückfallwünsche der Moderation, alle in einem Speichern baubar, werden nicht
als Rückfall angekündigt:

- **"Einschätzung"-Badge** auf Ermessensbefunden über `machineDecidable`
- **Export** der Arbeitsliste als CSV oder Markdown, `src/lib/live/export.ts`
- **Suche und Filter** über die Befunde, nach Achse, Schwere, Regel
- **Live-Crawl-Monitor** für die vom Publikum genannte Adresse,
  `LiveMonitor.svelte`
- **Zwei Vorschläge zur Wahl** über `suggestionAlt`

---

## Abschluss

Das Protokoll aus `decisions/` wird am Ende als schlichte Seite gezeigt:
fünf Entscheidungen, die der Raum getroffen hat. Das ist der eigentliche
Ertrag der zwanzig Minuten und geht danach an die Teilnehmenden.

## Nach jeder Entscheidung

```
npm run tag e1
```

Markus tippt das selbst. Der Agent committet und taggt während des Live-Builds
nie. `npm run rollback e1` springt zurück. Bei Zeitüberschreitung (150
Sekunden) bleibt der Teilzustand stehen, es geht zur nächsten Entscheidung.
