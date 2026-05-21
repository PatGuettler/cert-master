#!/usr/bin/env python3
"""Dry-run vendor exam pools and write results to vendor-pool-check.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from question_bank.azure_catalog import AZURE_BY_ID, AZURE_EXAMS  # noqa: E402
from question_bank.cloud_factory import (  # noqa: E402
    AZURE_CONFIG,
    COMPTIA_CONFIG,
    GOOGLE_CONFIG,
    build_vendor_payload,
)
from question_bank.common import exam_domain_minimums, validate_pool  # noqa: E402
from question_bank.comptia_catalog import COMPTIA_BY_ID  # noqa: E402
from question_bank.gcp_catalog import GCP_BY_ID, GCP_EXAMS  # noqa: E402
from question_bank.multi_vendor_fact_banks import (  # noqa: E402
    AZURE_BANKS,
    COMPTIA_EXTRA_BANKS,
    GCP_BANKS,
)

CLOUD_FACTORY_COMPTIA = [
    "comptia-cloud-plus",
    "comptia-data-plus",
    "comptia-pentest-plus",
]

OUT = ROOT / "vendor-pool-check.json"


def check(exam_id: str, catalog, banks, cfg) -> dict:
    spec = catalog[exam_id]
    min_q = spec.get("min_questions", 70)
    try:
        payload = build_vendor_payload(exam_id, catalog, banks, cfg)
        validate_pool(payload["questions"], payload["domains"], min_q)
        return {"ok": True, "count": len(payload["questions"])}
    except SystemExit as e:
        return {"ok": False, "error": str(e)}
    except Exception as e:
        return {"ok": False, "error": repr(e)}


def main() -> int:
    results: dict[str, dict] = {}
    for exam in AZURE_EXAMS:
        results[exam["id"]] = check(exam["id"], AZURE_BY_ID, AZURE_BANKS, AZURE_CONFIG)
    for exam in GCP_EXAMS:
        results[exam["id"]] = check(exam["id"], GCP_BY_ID, GCP_BANKS, GOOGLE_CONFIG)
    for eid in CLOUD_FACTORY_COMPTIA:
        results[eid] = check(eid, COMPTIA_BY_ID, COMPTIA_EXTRA_BANKS, COMPTIA_CONFIG)

    OUT.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    failed = [k for k, v in results.items() if not v.get("ok")]
    print(f"Wrote {OUT}; failed: {failed or 'none'}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
