#!/usr/bin/env python3
"""Generate remaining CompTIA/Azure/GCP exams and rebuild index. Writes finish-build.log."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOG = ROOT / "finish-build.log"


def log(msg: str) -> None:
    print(msg)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(msg + "\n")


def run(script: str) -> bool:
    log(f"=== {script} ===")
    r = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / script)],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    if r.stdout:
        log(r.stdout.strip())
    if r.stderr:
        log(r.stderr.strip())
    ok = r.returncode == 0
    log(f"exit {r.returncode}")
    return ok


def main() -> int:
    LOG.write_text("", encoding="utf-8")
    ok = True
    for script in (
        "check_vendor_pools.py",
        "generate_comptia_exams.py",
        "generate_azure_exams.py",
        "generate_gcp_exams.py",
        "build-exams-index.py",
    ):
        if not run(script):
            ok = False
    if ok:
        import json
        from collections import Counter

        data = json.loads((ROOT / "data/exams-index.json").read_text(encoding="utf-8"))
        c = Counter(e["vendor"] for e in data["exams"])
        log(f"TOTAL {len(data['exams'])}")
        for k, v in sorted(c.items()):
            log(f"  {k}: {v}")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
