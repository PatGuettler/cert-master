#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
LOG=build-vendor.log
{
  echo "=== $(date -Iseconds) ==="
  python3 scripts/generate_comptia_exams.py || true
  python3 scripts/generate_azure_exams.py || true
  python3 scripts/generate_gcp_exams.py || true
  python3 scripts/build-exams-index.py
  python3 -c "
import json
from collections import Counter
d = json.load(open('data/exams-index.json'))
c = Counter(e['vendor'] for e in d['exams'])
print('TOTAL', len(d['exams']))
for k, v in sorted(c.items()):
    print(k, v)
print('NEW:', [e['id'] for e in d['exams'] if e['id'].startswith(('az-','sc-','dp-','ai-9','cloud-digital','associate-cloud','professional-','comptia-cloud','comptia-data','comptia-pent'))])
"
} >> "$LOG" 2>&1
echo OK >> "$LOG"
