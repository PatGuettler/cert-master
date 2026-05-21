#!/usr/bin/env python3
"""Run generate_all_vendors.py and write full log to vendor-build-test.log."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOG = ROOT / "vendor-build-test.log"


def main() -> int:
    LOG.write_text("", encoding="utf-8")
    proc = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "generate_all_vendors.py")],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    body = (proc.stdout or "") + (proc.stderr or "")
    LOG.write_text(
        f"exit_code={proc.returncode}\n\n{body}",
        encoding="utf-8",
    )
    return proc.returncode


if __name__ == "__main__":
    raise SystemExit(main())
