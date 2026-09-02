# Archiv: Probelauf 4 (E1–E5), 2026-09-02

Vierter kompletter Testdurchlauf, wieder ein anderer Entscheidungspfad als die
ersten drei (siehe `docs/archiv/probelauf-2026-09-02/`,
`docs/archiv/probelauf-2-2026-09-02/`, `docs/archiv/probelauf-3-2026-09-02/`):

- E1 · A · Chat
- E2 · C · Beim Ermessen
- E3 · D · Nach Thema (Lebenslage)
- E4 · C · Markierung mit Frage
- E5 · Live-Crawl-Status (`LiveMonitor.svelte`)

Details siehe `docs/erkenntnisse.md`.

**Besonderheiten dieses Durchlaufs:**

- Erster Probelauf mit dem Chat-Archetyp (E1·A) im neuen Arbeitsplatz-Rahmen.
  `hauptAnteil` bleibt bewusst auf dem Default `'klein'` — Chat braucht anders
  als Geführt/Bericht (`'gross'`) oder Dashboard (`'gleich'`) keinen eigenen
  Anteil, weil das Panel darunter die eigentliche Arbeitsfläche bleibt.
- E2·C ("Beim Ermessen") und E4·C ("Markierung mit Frage") wurden zum ersten
  Mal gemeinsam durchgespielt: `scopeFor(finding, 'ermessen')` liefert für
  `machineDecidable`-Befunde weiterhin `vorschlag`, für Ermessensfragen
  `frage` und für `fromLegalSource` `markierung` — sichtbar am Beispiel
  "Bürgersprechstunden im September" (2 Vorschläge · 0 Markierungen ·
  4 Fragen).
- E3·D (Gruppierung nach Lebenslage) zum zweiten Mal gebaut (zuvor nur in
  `docs/entscheidungen.md` beschrieben, nicht durchgespielt) — funktioniert
  wie erwartet über `byLebenslage()` und die `gruppen`-Prop von
  `Arbeitsplatz.svelte`/`Sidebar.svelte`.
- Für E5 (Live-Crawl-Status) gab es noch keinen Lese-Endpunkt für
  `src/lib/data/live-status.json` (die Datei selbst entsteht erst am
  Webinartag durch `scripts/live-crawl.ts`, nicht angefasst). Neu gebaut:
  `src/routes/api/live-status/+server.ts` — liest die Datei, fällt per
  try/catch auf einen Demo-Status zurück, wenn sie fehlt. Das ist ein
  legitimer neuer Baustein (kein Rückfall, keine verbotene Zone) und bleibt
  im Projekt stehen, auch nach dem Zurücksetzen von `+page.svelte`.
- Rehearsal-Agent hatte diesmal keinen Architektur-Konflikt (im Gegensatz zu
  Probelauf 3) — `docs/erkenntnisse.md` wurde diesmal korrekt mitgegeben.

**Verifiziert:** `npm run check` → 0 Fehler/Warnungen (340 Dateien). Live im
Browser geprüft (eigener Dev-Server, Port 5178): Gruppierung nach Lebenslage
in der Sidebar, Zähler und Fragetexte korrekt je nach `mode`, LiveMonitor
zeigt Demo-Fortschritt, Chat sendet an `/api/chat` und bekommt eine Antwort
(200 OK), keine Konsolenfehler. **Keine Screenshots in diesem Ordner** —
anders als bei den ersten drei Probeläufen wurde diesmal nur per
Text-/Netzwerk-Inspektion verifiziert, nicht per Bild.

Inhalt:

- `+page.svelte` — der fertige Endstand dieses Durchlaufs. Nur Referenz,
  nicht der Ausgangspunkt für den echten Live-Build. `src/routes/+page.svelte`
  im Projekt ist wieder auf die leere Startseite (Stufe 0) zurückgesetzt.
- `live-status.+server.ts` — Kopie des neuen `/api/live-status`-Endpunkts.
  Der echte Endpunkt bleibt unter `src/routes/api/live-status/+server.ts`
  bestehen (kein Rückbau, siehe oben).
