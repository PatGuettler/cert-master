#!/usr/bin/env python3
"""Generate Microsoft Azure practice exams (original items; official doc links only)."""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMS_DIR = ROOT / "data" / "exams"
sys.path.insert(0, str(ROOT / "scripts"))

from question_bank.azure_catalog import AZURE_BY_ID, AZURE_EXAMS  # noqa: E402
from question_bank.cloud_factory import AZURE_CONFIG, build_vendor_payload  # noqa: E402
from question_bank.common import validate_pool, write_exam  # noqa: E402
from question_bank.multi_vendor_fact_banks import AZURE_BANKS  # noqa: E402
from question_bank.official_docs import assert_official_exam  # noqa: E402


def rebuild_index() -> None:
    spec = importlib.util.spec_from_file_location(
        "build_exams_index", ROOT / "scripts" / "build-exams-index.py"
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.main()


def main() -> int:
    errors: list[str] = []
    for exam in AZURE_EXAMS:
        exam_id = exam["id"]
        try:
            payload = build_vendor_payload(exam_id, AZURE_BY_ID, AZURE_BANKS, AZURE_CONFIG)
            validate_pool(payload["questions"], payload["domains"], exam.get("min_questions", 70))
            assert_official_exam(payload)
            out = EXAMS_DIR / f"{exam_id}.json"
            write_exam(out, payload)
            print(f"Wrote {len(payload['questions'])} questions -> {out}")
        except (SystemExit, Exception) as e:
            errors.append(f"{exam_id}: {e}")
            print(f"FAILED {exam_id}: {e}", file=sys.stderr)

    rebuild_index()
    if errors:
        for err in errors:
            print(err, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
