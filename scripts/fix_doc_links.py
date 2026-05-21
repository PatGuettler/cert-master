#!/usr/bin/env python3
"""Apply known-good URL replacements across data/exams/*.json and Python sources."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMS_DIR = ROOT / "data" / "exams"
SOURCE_DIRS = [
    ROOT / "scripts",
    ROOT / "scripts" / "question_bank",
]

sys.path.insert(0, str(ROOT / "scripts"))
from doc_url_fixes import URL_REPLACEMENTS  # noqa: E402


def replace_in_obj(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "url" and isinstance(v, str) and v in URL_REPLACEMENTS:
                obj[k] = URL_REPLACEMENTS[v]
            else:
                replace_in_obj(v)
    elif isinstance(obj, list):
        for item in obj:
            replace_in_obj(item)


def patch_json_files() -> int:
    count = 0
    for path in sorted(EXAMS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        before = json.dumps(data)
        replace_in_obj(data)
        after = json.dumps(data)
        if before != after:
            path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
            count += 1
            print(f"Updated {path.name}")
    return count


def patch_python_sources() -> int:
    count = 0
    for d in SOURCE_DIRS:
        if not d.is_dir():
            continue
        for path in sorted(d.rglob("*.py")):
            text = path.read_text(encoding="utf-8")
            new = text
            for old, new_url in URL_REPLACEMENTS.items():
                new = new.replace(old, new_url)
            if new != text:
                path.write_text(new, encoding="utf-8")
                count += 1
                print(f"Updated {path.relative_to(ROOT)}")
    return count


def main() -> None:
    j = patch_json_files()
    p = patch_python_sources()
    print(f"\nPatched {j} JSON exam file(s), {p} Python file(s).")
    print("Run: python3 scripts/build-exams-index.py")


if __name__ == "__main__":
    main()
