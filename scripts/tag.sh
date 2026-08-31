#!/usr/bin/env bash
# Sichert den aktuellen Stand: committet alles und setzt live/<name>.
# Aufruf: npm run tag <name>   (oder direkt: scripts/tag.sh <name>)
set -euo pipefail

name="${1:-}"
if [[ -z "$name" ]]; then
	echo "Nutzung: npm run tag <name>" >&2
	exit 1
fi

git add -A
# --allow-empty: auch wenn seit dem letzten Tag nichts geändert wurde, soll
# der Tag trotzdem sitzen (z.B. beim Üben).
git commit -m "live: ${name}" --allow-empty -q
git tag -f "live/${name}"

echo "Gesichert: live/${name}"
