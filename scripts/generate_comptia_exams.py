#!/usr/bin/env python3
"""Generate CompTIA practice exam JSON files under data/exams/."""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMS_DIR = ROOT / "data" / "exams"
sys.path.insert(0, str(ROOT / "scripts"))

from question_bank.cloud_factory import COMPTIA_CONFIG, build_vendor_payload  # noqa: E402
from question_bank.common import validate_pool, write_exam  # noqa: E402
from question_bank.comptia_catalog import COMPTIA_BY_ID, COMPTIA_EXAMS  # noqa: E402
from question_bank.comptia_factory import build_comptia_payload  # noqa: E402
from question_bank.multi_vendor_fact_banks import COMPTIA_EXTRA_BANKS  # noqa: E402
from question_bank.official_docs import assert_official_exam  # noqa: E402

COMPTIA_LEGACY_IDS = [
    "comptia-a-plus",
    "comptia-network-plus",
    "comptia-security-plus",
    "comptia-cysa-plus",
    "comptia-linux-plus",
]
COMPTIA_CLOUD_FACTORY_IDS = [
    "comptia-cloud-plus",
    "comptia-data-plus",
    "comptia-pentest-plus",
]
COMPTIA_IDS = COMPTIA_LEGACY_IDS + COMPTIA_CLOUD_FACTORY_IDS


def rebuild_index() -> None:
    spec = importlib.util.spec_from_file_location(
        "build_exams_index",
        ROOT / "scripts" / "build-exams-index.py",
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.main()


def main() -> None:
    results: list[tuple[str, int, int]] = []
    for exam_id in COMPTIA_IDS:
        spec = COMPTIA_BY_ID[exam_id]
        if exam_id in COMPTIA_CLOUD_FACTORY_IDS:
            payload = build_vendor_payload(
                exam_id, COMPTIA_BY_ID, COMPTIA_EXTRA_BANKS, COMPTIA_CONFIG
            )
        else:
            payload = build_comptia_payload(exam_id)
        validate_pool(
            payload["questions"],
            payload["domains"],
            spec.get("min_questions", 75),
        )
        assert_official_exam(payload)
        out = EXAMS_DIR / f"{exam_id}.json"
        write_exam(out, payload)
        acr = len(payload.get("acronyms", []))
        q = len(payload["questions"])
        results.append((out.name, q, acr))
        print(f"Wrote {q} questions, {acr} acronyms -> {out}")

    rebuild_index()
    print("\nSummary:")
    for name, q, acr in results:
        print(f"  {name}: {q} questions, {acr} acronyms")


if __name__ == "__main__":
    main()
