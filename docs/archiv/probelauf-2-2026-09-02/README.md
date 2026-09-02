# Archiv: Probelauf 2 (E1–E5), 2026-09-02

Zweiter kompletter Testdurchlauf, mit anderen Beispieloptionen als der erste
Probelauf (siehe `docs/archiv/probelauf-2026-09-02/`):

- E1 · C · Geführt
- E2 · C · Beim Ermessen
- E3 · B · Nach Schwere
- E4 · C · Eine Markierung und eine Frage
- E5 · "Einschätzung"-Badge (Rückfallwunsch)

Details und Bewertung siehe `docs/erkenntnisse.md`, Abschnitt "Zweiter
Probelauf und der Wizard-Umbau (2026-09-02)".

**Besonderheit dieses Durchlaufs:** Er hat einen echten Architekturkonflikt
freigelegt — "Geführt" war nur eine andere Sortierung, kein Wizard, weil die
freie Sidebar-Navigation parallel aktiv blieb. Das wurde danach behoben:
`GuidedFlow.svelte`, `Sidebar.svelte` und `Arbeitsplatz.svelte` haben seither
einen echten Wizard-Modus (ein Befund pro Schritt, Sidebar als reine
Fortschrittsanzeige, Abschluss-Screen). Dieser Fix ist **kein** Rückfall und
bleibt im Live-Code — nur die Verdrahtung in `+page.svelte` aus diesem
Probelauf ist hier archiviert.

Inhalt:

- `+page.svelte` — der Endstand aus diesem Probelauf. **Nur Referenz, nicht
  der Ausgangspunkt für den echten Live-Build.** `src/routes/+page.svelte`
  im Projekt ist wieder auf die leere Startseite (Stufe 0) zurückgesetzt.
- `rehearsal2-e1.png` … `rehearsal2-e5.png` — je ein Screenshot vom Ende
  jeder Entscheidung.
