# AGENTS.md (Ask Mode)

This file provides guidance to agents when working with code in this repository.

## Codebase-Kontext

- `src/lib/assets/` — fertige Komponenten, die **absichtlich nicht eingebunden** sind (Webinar-Live-Material)
- `src/lib/live/` — vorbereitete Utilities (`sort.ts`, `export.ts`), noch ungenutzt
- `decisions/` — Protokoll der tatsächlichen Abstimmungsergebnisse (entsteht während des Webinars)
- `src/lib/data/*.raw.json` = Crawl-Output; `*.json` = analysierter Bestand (Page[])
- `src/lib/data/.llm-cache/` — gecachte LLM-Antworten als SHA256-benannte JSON-Dateien

## Entscheidungs-Mapping

Die fünf Webinar-Entscheidungen (E1–E5) sind exakt dokumentiert in [`docs/entscheidungen.md`](docs/entscheidungen.md), inklusive der Prompts die live getippt werden und der erwarteten Bauzeiten.

## Datenmodell-Felder und ihre Herkunft

| Feld | Gesetzt von | Bedeutung |
|---|---|---|
| `fromLegalSource`, `legalSource` | `scripts/lib/rules.ts` (Regel `paragraf-ohne-erklaerung`) | E1 |
| `suggestion`, `suggestionAlt`, `rationale`, `effort` | `scripts/analyze.ts` via LLM | E3/E4 |
| `reach` | `scripts/analyze.ts` (heuristisch, kein echter Traffic) | E3 |
| `lebenslage` | `scripts/analyze.ts` via LLM | E3 |
| `machineDecidable` | `scripts/lib/rules.ts` | E1 |
