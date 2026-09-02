# Archiv: Probelauf 3 (E1–E5), 2026-09-02

Dritter kompletter Testdurchlauf, wieder mit anderen Beispieloptionen als die
ersten beiden (siehe `docs/archiv/probelauf-2026-09-02/` und
`docs/archiv/probelauf-2-2026-09-02/`):

- E1 · B · Dashboard
- E2 · A · Nirgends
- E3 · A · Nach Reichweite
- E4 · A · Ein fertiger Text
- E5 · Export (Markdown/CSV)

Details und Bewertung siehe `docs/erkenntnisse.md`, Abschnitt "Dritter
Probelauf und das Dashboard-Prioritäten-Muster (2026-09-02)".

**Besonderheiten dieses Durchlaufs:**

- Der Bau-Agent hatte `Dashboard.svelte` selbst umgebaut und eine eigene
  Seiten-Kachelliste ergänzt — das dupliziert die Arbeitsplatz-Sidebar und
  dreht eine schon am selben Tag getroffene Entscheidung zurück, weil der
  Agent nur `CLAUDE.md`/`docs/entscheidungen.md` kannte, nicht
  `docs/erkenntnisse.md`. Wurde korrigiert, `Dashboard.svelte` blieb
  unverändert in seiner API.
- Aus der anschließenden UX-Diskussion ("was macht ein gutes Dashboard aus")
  ist in `Dashboard.svelte` ein **Prioritäten-Block** entstanden
  (Schwere-×-Aufwand-Matrix, Schwere je Achse, Reichweite Top 5). Das ist
  **kein Rückfall** und bleibt im Live-Code — genau wie beim Wizard-Fix aus
  Probelauf 2.
- `hauptAnteil="gleich"` fehlte zunächst (von `docs/entscheidungen.md` für
  Dashboard vorgeschrieben, aber vom Agenten übersehen) und wurde nachträglich
  ergänzt, zusammen mit einer aufgeräumten Kopfzeile (Kicker/Headline/Export-
  Buttons statt loser Debug-Zeilen).

Inhalt:

- `+page.svelte` — der **fertige, aufgeräumte** Endstand nach der
  Layout-Korrektur. **Nur Referenz, nicht der Ausgangspunkt für den echten
  Live-Build.** `src/routes/+page.svelte` im Projekt ist wieder auf die leere
  Startseite (Stufe 0) zurückgesetzt.
- `rehearsal3-e1.png` … `rehearsal3-e5.png` — Screenshots vom
  Subagenten-Durchlauf selbst, **vor** der späteren Layout-Korrektur (zeigen
  noch die rohe Stufe-1-Debug-Zeile und das ungesetzte `hauptAnteil`). Der
  archivierte `+page.svelte`-Stand ist neuer als diese Bilder.
