#!/usr/bin/env python3
"""Generate all vendor practice exams and rebuild the exams index."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"


def run(script: str) -> None:
    path = SCRIPTS / script
    print(f"\n=== {script} ===")
    subprocess.run([sys.executable, str(path)], check=True, cwd=str(ROOT))


def main() -> None:
    steps = [
        "generate_all_aws_exams.py",
        "generate_comptia_exams.py",
        "generate_azure_exams.py",
        "generate_gcp_exams.py",
    ]
    failed: list[str] = []
    for script in steps:
        print(f"\n=== {script} ===")
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / script)],
            cwd=str(ROOT),
        )
        if result.returncode != 0:
            failed.append(script)
            print(f"FAILED: {script} (exit {result.returncode})", file=sys.stderr)

    print("\n=== build-exams-index.py ===")
    subprocess.run([sys.executable, str(SCRIPTS / "build-exams-index.py")], check=True, cwd=str(ROOT))

    if failed:
        print("\nCompleted with failures:", ", ".join(failed), file=sys.stderr)
        raise SystemExit(1)
    print("\nAll vendor exams generated.")


if __name__ == "__main__":
    main()
