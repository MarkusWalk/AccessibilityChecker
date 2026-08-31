# Die fünf Entscheidungen

Was das Publikum im Webinar entscheidet, was das im Code bedeutet, und der
Prompt, den Markus live tippt.

Alle fünf müssen vor dem Webinar einmal durchgespielt sein. Jede der
Antwortoptionen muss baubar sein, ohne dass das Datenmodell angefasst wird.

---

## E1 Logik

**Was tut das System bei einem Satz, den es für unverständlich hält, wenn
dieser Satz wörtlich aus einem Gesetz stammt?**

- A Umformulierung vorschlagen
- B Markieren mit Hinweis auf die Rechtsquelle, ohne Vorschlag
- C Übergehen, Gesetzestext bleibt unangetastet
- D Erklärenden Zusatz vorschlagen, Originalsatz bleibt stehen

**Im Code.** Betrifft `fromLegalSource` und `legalSource` am Finding. Die
Felder sind in den Daten gefüllt. Gebaut wird die Behandlung: filtern,
kennzeichnen, oder zusätzlich anzeigen.

**Prompt, den Markus tippt (Beispiel für D):**

> Das Publikum hat entschieden: Bei Befunden mit `fromLegalSource: true`
> bleibt der Originalsatz unverändert stehen. Darunter erscheint ein
> vorgeschlagener erklärender Zusatz aus `suggestion`, sichtbar abgesetzt und
> als Zusatz gekennzeichnet, dazu die Fundstelle aus `legalSource`. Bau das
> in kleinen Schritten und speichere nach jedem, damit es auf dem Schirm
> nachwächst.

**Erwartete Bauzeit:** 90 bis 150 Sekunden.

---

## E2 Archetyp

**Wie begegnet man dem Ergebnis?**

- A Chat, man befragt den Bestand
- B Dashboard, alle Seiten mit Befunden auf einen Blick
- C Geführter Flow, eine Seite nach der anderen

**Im Code.** Die größte sichtbare Veränderung der zwanzig Minuten. Alle drei
Komponenten liegen fertig in `src/lib/assets/`. Gebaut wird das Einsetzen,
der Zuschnitt, die Theme-Anpassung und die Anbindung an die Daten.

Stufenfolge, hier besonders wichtig:

1. Komponente erscheint roh auf der Seite
2. Zuschnitt, sie füllt ihren Platz im Layout
3. Farben und Typografie aus dem Theme
4. Anbindung an die Befunde, sie zeigt echte Daten

**Prompt (Beispiel für A):**

> Das Publikum hat sich für Chat entschieden. Setz `Chat.svelte` aus
> `src/lib/assets/` in die Hauptansicht. Erst roh einfügen und speichern,
> dann Zuschnitt, dann Theme-Farben, dann an die Befunde anbinden. Nach jeder
> Stufe speichern.

**Erwartete Bauzeit:** 120 bis 150 Sekunden.

---

## E3 Priorisierung

**Womit fängt das Haus am Montag an?**

- A Reichweite, meistbesuchte Seiten zuerst
- B Schwere des Befunds
- C Aufwand, die schnellsten Korrekturen zuerst
- D Lebenslage, alles zu einem Thema zusammen

**Im Code.** Sortierung und Gruppierung. Die Felder `reach`, `severity`,
`effort` und `lebenslage` sind gefüllt. A bis C sind Sortierungen, D ist eine
Gruppierung und deshalb die aufwendigste Option. Wenn D gewinnt, zuerst die
Gruppenüberschriften sichtbar machen, dann die Inhalte einsortieren.

**Erwartete Bauzeit:** 60 bis 120 Sekunden. D eher 150.

---

## E4 Handlungsform

**Wie weit geht das System von sich aus?**

- A Fertiger Vorschlagstext, per Klick übernehmbar
- B Vorschlag mit Begründung und Regelbezug
- C Nur Markierung und eine Frage, keine Formulierung
- D Zwei Varianten zur Auswahl

**Im Code.** Betrifft ausschließlich `FindingCard.svelte`. Alle vier Optionen
sind Anzeigevarianten derselben Daten (`suggestion`, `suggestionAlt`,
`rationale`). Das ist die risikoärmste der vier planbaren Entscheidungen.

Bei C wird nichts hinzugefügt, sondern weggelassen. Das ist schnell und darf
laut kommentiert werden.

**Erwartete Bauzeit:** 60 bis 90 Sekunden.

---

## E5 Wildcard

**Ein Feature, das sich das Publikum wünscht.**

Freitext im Chat, die Moderation kuratiert drei Vorschläge, eine Kurzumfrage
entscheidet. Regel, laut gesagt: es muss etwas sein, das man sehen kann.

**Im Code.** Unbekannt. Vier bis fünf Minuten Bauzeit.

Vorbereitung dafür:

- `LiveMonitor.svelte` und `ScreenshotViewer.svelte` liegen ungenutzt bereit
  und decken zwei wahrscheinliche Wünsche ab
- Export als CSV oder Markdown ist in einer Minute baubar, wenn eine
  Hilfsfunktion vorbereitet ist
- Filter und Suche über die Befunde sind wahrscheinlich und sollten in einer
  Skizze existieren

Die Moderation hat drei eigene Vorschläge in der Hinterhand, falls der Chat
schweigt. Sie werden nicht als solche angekündigt.

---

## Nach jeder Entscheidung

```
npm run tag e1
```

Der Stand ist damit gesichert. `npm run rollback e1` springt zurück.

Das Protokoll der tatsächlichen Abstimmungsergebnisse wird während des
Webinars in `decisions/` mitgeschrieben. Diese Liste ist der eigentliche
Ertrag der zwanzig Minuten und geht danach an die Teilnehmenden.
