#!/usr/bin/env python3
"""Verify professional-cloud-devops-engineer builds with official URLs only."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "verify-gcp-devops.json"
sys.path.insert(0, str(ROOT / "scripts"))

from question_bank.cloud_factory import GOOGLE_CONFIG, build_vendor_payload  # noqa: E402
from question_bank.common import validate_pool, write_exam  # noqa: E402
from question_bank.gcp_catalog import GCP_BY_ID  # noqa: E402
from question_bank.multi_vendor_fact_banks import GCP_BANKS  # noqa: E402
from question_bank.official_docs import assert_official_exam  # noqa: E402

EXAM_ID = "professional-cloud-devops-engineer"


def main() -> int:
    spec = GCP_BY_ID[EXAM_ID]
    payload = build_vendor_payload(EXAM_ID, GCP_BY_ID, GCP_BANKS, GOOGLE_CONFIG)
    validate_pool(payload["questions"], payload["domains"], spec.get("min_questions", 58))
    assert_official_exam(payload)
    out = ROOT / "data" / "exams" / f"{EXAM_ID}.json"
    write_exam(out, payload)
    result = {
        "ok": True,
        "exam_id": EXAM_ID,
        "question_count": len(payload["questions"]),
        "output": str(out),
        "optimization_urls": [
            r["url"]
            for d in payload["domains"]
            if d["id"] == "optimization"
            for r in d.get("resources", [])
        ],
    }
    OUT.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        OUT.write_text(json.dumps({"ok": False, "error": str(e)}, indent=2) + "\n")
        print(str(e), file=sys.stderr)
        raise SystemExit(1)
