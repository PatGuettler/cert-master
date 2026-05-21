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
        "build-exams-index.py",
    ]
    failed: list[str] = []
    for script in steps:
        try:
            run(script)
        except subprocess.CalledProcessError:
            failed.append(script)
            print(f"WARNING: {script} failed — continuing with remaining steps")
    if failed:
        print("\nCompleted with failures:", ", ".join(failed))
        raise SystemExit(1)
    print("\nAll vendor exams generated.")


if __name__ == "__main__":
    main()
