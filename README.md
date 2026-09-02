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

Ohne `ICA_API_URL`/`ICA_API_KEY` läuft die Modellanalyse automatisch über
den Mock-Adapter (offline, deterministisch). Für echte ICA-Anbindung:

```bash
export LLM_PROVIDER=ica
export ICA_API_URL=...
export ICA_API_KEY=...
export ICA_MODEL=...   # optional
```

Das genaue ICA-Request/Response-Schema ist in `src/lib/server/llm.ts`
(`IcaAdapter.complete`) als TODO markiert und muss dort einmal angepasst
werden.

## Absicherung während des Live-Builds

```bash
npm run tag <name>        # sichert den aktuellen Stand als live/<name>
npm run rollback <name>   # springt hart zurück
```

## Struktur

Siehe `CLAUDE.md`, Abschnitt "Aufbau".
