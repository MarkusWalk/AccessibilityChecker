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
```

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
