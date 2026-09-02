#!/usr/bin/env bash
# Harter Rücksprung auf einen zuvor gesetzten live/<name>-Tag.
# Aufruf: npm run rollback <name>   (oder direkt: scripts/rollback.sh <name>)
# Muss auf einen Tastendruck laufen und unter fünf Sekunden fertig sein.
set -euo pipefail

name="${1:-}"
if [[ -z "$name" ]]; then
	echo "Nutzung: npm run rollback <name>" >&2
	exit 1
fi

tag="live/${name}"
if ! git rev-parse "$tag" >/dev/null 2>&1; then
	echo "Kein Tag ${tag} gefunden. Verfügbare Tags:" >&2
	git tag -l 'live/*' >&2
	exit 1
fi

git reset --hard "$tag" -q
# -e-Ausschlüsse: der Live-Crawl (scripts/live-crawl.ts) schreibt live.json,
# live.raw.json und live-status.json direkt nach src/lib/data, und
# src/lib/server/llm.ts cacht dort unter .llm-cache/. Diese Dateien sind nie
# committet (siehe .gitignore) und sollen einen Rollback trotzdem überleben,
# damit der Hintergrund-Crawl am Webinartag nicht neu anlaufen muss.
git clean -fd -q \
	-e 'src/lib/data/live.json' \
	-e 'src/lib/data/live.raw.json' \
	-e 'src/lib/data/live-status.json' \
	-e 'src/lib/data/.llm-cache' \
	-e 'src/lib/data/.llm-cache/**' \
	-- src/lib/data src/routes src/lib/assets src/lib/live

echo "Zurückgesprungen auf ${tag}"
