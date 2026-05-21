#!/usr/bin/env python3
"""Run all vendor generators in-process; write vendor-build-test.log."""
from __future__ import annotations

import importlib.util
import io
import sys
from collections import Counter
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOG = ROOT / "vendor-build-test.log"
sys.path.insert(0, str(ROOT / "scripts"))


def load_main(script: str):
    spec = importlib.util.spec_from_file_location(script, ROOT / "scripts" / script)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.main


def run_step(name: str, lines: list[str]) -> bool:
    lines.append(f"\n=== {name} ===")
    buf = io.StringIO()
    try:
        with redirect_stdout(buf), redirect_stderr(buf):
            code = load_main(name)()
        if code is None:
            code = 0
        lines.append(buf.getvalue())
        if code != 0:
            lines.append(f"FAILED {name} (exit {code})")
            return False
        lines.append(f"OK {name}")
        return True
    except SystemExit as e:
        lines.append(buf.getvalue())
        lines.append(f"FAILED {name}: {e}")
        return False
    except Exception as e:
        lines.append(buf.getvalue())
        lines.append(f"FAILED {name}: {type(e).__name__}: {e}")
        return False


def main() -> int:
    lines: list[str] = []
    failed: list[str] = []
    for script in (
        "generate_all_aws_exams.py",
        "generate_comptia_exams.py",
        "generate_azure_exams.py",
        "generate_gcp_exams.py",
    ):
        if not run_step(script, lines):
            failed.append(script)

    lines.append("\n=== build-exams-index.py ===")
    buf = io.StringIO()
    with redirect_stdout(buf), redirect_stderr(buf):
        load_main("build-exams-index.py")()
    lines.append(buf.getvalue())

    import json

    index = json.loads((ROOT / "data" / "exams-index.json").read_text(encoding="utf-8"))
    vendors = Counter(e.get("vendor", "?") for e in index["exams"])
    lines.append(f"\nINDEX: {len(index['exams'])} exams")
    for v, n in sorted(vendors.items()):
        lines.append(f"  {v}: {n}")

    devops = ROOT / "data" / "exams" / "professional-cloud-devops-engineer.json"
    lines.append(f"professional-cloud-devops-engineer.json exists: {devops.is_file()}")

    if devops.is_file():
        data = json.loads(devops.read_text(encoding="utf-8"))
        bad = [
            q["id"]
            for q in data["questions"]
            for d in q.get("docs", [])
            if "sre.google" in (d.get("url") or "")
        ]
        lines.append(f"sre.google links in exam: {len(bad)}")

    exit_code = 1 if failed else 0
    lines.insert(0, f"exit_code={exit_code}")
    if failed:
        lines.append(f"\nCompleted with failures: {', '.join(failed)}")
    else:
        lines.append("\nAll vendor exams generated.")
    LOG.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(LOG.read_text(encoding="utf-8"))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
