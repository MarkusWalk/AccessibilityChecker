# AGENTS.md (Ask Mode)

This file provides guidance to agents when working with code in this repository.

## Codebase-Kontext

- `src/lib/assets/` — fertige Komponenten, die **absichtlich nicht eingebunden** sind (Webinar-Live-Material)
- `src/lib/live/` — vorbereitete Utilities (`sort.ts`, `export.ts`, `scope.ts`, `labels.ts`), noch ungenutzt
- `decisions/` — Protokoll der tatsächlichen Abstimmungsergebnisse (entsteht während des Webinars)
- `src/lib/data/*.raw.json` = Crawl-Output; `*.json` = analysierter Bestand (Page[])
- `src/lib/data/.llm-cache/` — gecachte LLM-Antworten als SHA256-benannte JSON-Dateien
- `docs/erkenntnisse.md` — laufendes Protokoll aller Architekturentscheidungen und Probeläufe; **Primärquelle** bei Fragen zu „Warum ist X so gebaut?"

## Nicht-offensichtliche Strukturen

- `src/routes/api/live-status/+server.ts` — liest `live-status.json` für den Hintergrund-Crawl-Status (Demo-Fallback eingebaut)
- `src/routes/archiv/` — Archiv vergangener Probeläufe (Snapshots, nicht Webinar-Inhalt)
- `src/routes/intro/` — tastengesteuerter Splash (Szenen in der URL, Reload startet nicht bei Null)
- `src/routes/probe/` — Testseite für alle vier E1-Archetypen mit URL-Parametern (`viewer`, `gruppen`, `scope`, etc.)
- `bestaende.ts` liest bei jedem Aufruf frisch von Platte — kein Neustart nötig, wenn ein Bestand fertig wird

## Entscheidungs-Mapping

Die fünf Webinar-Entscheidungen (E1–E5) sind dokumentiert in [`docs/entscheidungen.md`](docs/entscheidungen.md), inklusive der Prompts die live getippt werden und der erwarteten Bauzeiten.

## Datenmodell-Felder und ihre Herkunft

| Feld | Gesetzt von | Bedeutung |
|---|---|---|
| `fromLegalSource`, `legalSource` | `scripts/lib/rules.ts` (Regel `paragraf-ohne-erklaerung`) | E2 |
| `machineDecidable` | `scripts/lib/rules.ts` | E2 |
| `suggestion`, `suggestionAlt`, `rationale`, `effort` | `scripts/analyze.ts` via LLM | E3/E4 |
| `reach` | `scripts/analyze.ts` (heuristisch, kein echter Traffic) | E3 |
| `lebenslage` | `scripts/analyze.ts` via LLM (bereinigt durch `bereinigeLebenslage()`) | E3 |

## ICA-Zugang

- `ICA_API_URL`, `ICA_API_KEY`, `ICA_MODEL` — alle drei Pflicht für `LLM_PROVIDER=ica`
- Modell-ID aus `GET {ICA_API_URL}/chat-models`, z.B. `ibm/granite-4-h-small`; kein sinnvoller Default ratbar
- `.env` ohne manuelles `export` greift nur im Dev-Server (via `vite.config.ts`), **nicht** in `npm run analyze`
