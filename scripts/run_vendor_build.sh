#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
LOG="${1:-vendor-build.log}"
python3 scripts/generate_all_vendors.py >"$LOG" 2>&1
echo "exit=$?" >>"$LOG"
