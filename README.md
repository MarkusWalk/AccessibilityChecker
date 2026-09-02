# AccessibilityChecker

Anwendung für den Live-Build im Webinar "Souveränität beginnt beim Prototyp"
(IBM iX, Unblock AI / Staat Next Level). Referent: Markus Walk.

Details zum Projekt, den fünf Entscheidungen und den Regeln für den
Live-Build stehen in [`CLAUDE.md`](./CLAUDE.md). Der Vorbereitungsstand ist
in [`docs/aufbau-vor-dem-webinar.md`](./docs/aufbau-vor-dem-webinar.md)
protokolliert.

## Einrichten

```bash
npm install
npx playwright install chromium   # einmalig, für scripts/crawl.ts
npm run dev
```

Die App läuft dann unter `http://localhost:5173` (Port ggf. abweichend,
siehe Terminal-Ausgabe).

## Bestände neu erzeugen

```bash
npm run crawl -- <start-url> --max-pages 20 --name <bestand>
LLM_PROVIDER=mock npm run analyze -- <bestand>
npx tsx scripts/boxes.ts <bestand>
```

Der dritte Schritt ist ein zweiter, kurzer Playwright-Durchlauf
(`scripts/boxes.ts`): Er öffnet jede Seite des Bestands noch einmal, misst
für jeden in den Findings vorkommenden `selector` das
`getBoundingClientRect()` im echten Browser und trägt es als `box` ein
(Rechteck in CSS-Pixeln, Ursprung oben links, bezogen auf einen mit
`scripts/crawl.ts`-`VIEWPORT` (1280 Pixel breit) aufgenommenen
Vollseiten-Screenshot). Dabei wird der vorhandene Screenshot unter
`static/screenshots/<host>/` frisch überschrieben, damit Bild und Boxen
garantiert zueinander passen. `scripts/crawl.ts` nimmt Screenshots bereits
mit `fullPage: true` auf; `boxes.ts` tut das ebenso. robots.txt und der
Mindestabstand von 1 Sekunde (bzw. ein von der Seite per `Crawl-delay`
verlangter größerer Abstand) gelten für diesen zweiten Durchlauf genauso wie
für den Crawl selbst.

Weinheim ist der mitgelieferte Startbestand
(`npm run crawl -- https://www.weinheim.de --max-pages 50 --name weinheim`,
danach Analyse und Boxen wie oben). Theilheim, Eiterfeld und ein
Beispielbestand (`fallback`) liegen als weitere fertige Bestände unter
`src/lib/data/` bei — bei `fallback` sind die Boxen von Hand gegen den
Platzhalter-Screenshot unter `static/screenshots/fallback/` gesetzt, da die
Seite fiktiv ist und sich nicht crawlen lässt.

Ohne `ICA_API_URL`/`ICA_API_KEY`/`ICA_MODEL` läuft die Modellanalyse
automatisch über den Mock-Adapter (offline, deterministisch). Für echte
ICA-Anbindung (IBM Consulting Advantage, OpenAI-kompatibles
Chat-Completions-Schema, bestätigt 2026-09-02):

```bash
# .env, wird von vite.config.ts automatisch in process.env geladen —
# kein manuelles `export` bzw. `source .env` vor `npm run dev` nötig.
ICA_API_URL=https://api.nextgen-beta.ica.ibm.com/ica/v1
ICA_API_KEY=...
ICA_MODEL=ibm/granite-4-h-small   # oder eine andere ID aus GET {ICA_API_URL}/chat-models
```

`LLM_PROVIDER` muss nicht extra gesetzt werden: Ist `ICA_API_KEY` vorhanden,
wählt `src/lib/server/llm.ts` automatisch `ica`, sonst `mock`. Alle drei
ICA-Variablen sind Pflicht — `IcaAdapter` wirft sonst beim ersten Aufruf
einen Fehler (kein Absturz: `/api/chat` fällt auf den Datenpfad zurück,
`scripts/analyze.ts` bricht ab und nennt den fehlenden Wert).

## Absicherung während des Live-Builds

```bash
npm run tag <name>        # sichert den aktuellen Stand als live/<name>
npm run rollback <name>   # springt hart zurück
```

## Struktur

Siehe `CLAUDE.md`, Abschnitt "Aufbau".
