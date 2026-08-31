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
git clean -fd -q -- src/lib/data src/routes src/lib/assets src/lib/live

echo "Zurückgesprungen auf ${tag}"
