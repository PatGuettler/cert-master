#!/usr/bin/env python3
"""Generate AWS practice exam JSON files under data/exams/ (not real exam items)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMS_DIR = ROOT / "data" / "exams"
sys.path.insert(0, str(ROOT / "scripts"))

from question_bank.cloud_factory import AWS_CONFIG, build_vendor_payload  # noqa: E402
from question_bank.common import validate_pool, write_exam  # noqa: E402
from question_bank.exam_catalog import EXAM_BY_ID, EXAMS  # noqa: E402
from question_bank.multi_vendor_fact_banks import AWS_EXTRA_BANKS  # noqa: E402
from question_bank.official_docs import assert_official_exam  # noqa: E402
from question_bank.question_factory import build_exam_payload  # noqa: E402

GENERATE_IDS = [
    "ai-practitioner",
    "solutions-architect-associate",
    "developer-associate",
    "machine-learning-engineer-associate",
    "data-engineer-associate",
    "cloudops-engineer-associate",
    "solutions-architect-professional",
    "devops-engineer-professional",
    "generative-ai-developer-professional",
    "advanced-networking-specialty",
    "security-specialty",
    "database-specialty",
    "machine-learning-specialty",
]

CLOUD_FACTORY_AWS_IDS = frozenset({"database-specialty", "machine-learning-specialty"})

CLF_PATH = EXAMS_DIR / "cloud-practitioner.json"


def patch_cloud_practitioner_vendor() -> int:
    """Add vendor:aws to existing CLF file without regenerating questions."""
    if not CLF_PATH.is_file():
        print(f"Skip CLF patch: {CLF_PATH} not found")
        return 0
    data = json.loads(CLF_PATH.read_text(encoding="utf-8"))
    if data.get("vendor") == "aws":
        print(f"cloud-practitioner.json already has vendor:aws ({len(data['questions'])} questions)")
        return len(data["questions"])
    # Insert vendor after code to match schema order
    ordered: dict = {}
    for key in ("id", "name", "code", "vendor", "exam", "domains", "questions"):
        if key == "vendor":
            ordered["vendor"] = "aws"
        elif key in data:
            ordered[key] = data[key]
    for key, value in data.items():
        if key not in ordered:
            ordered[key] = value
    write_exam(CLF_PATH, ordered)
    print(f"Patched cloud-practitioner.json: added vendor:aws ({len(ordered['questions'])} questions)")
    return len(ordered["questions"])


def generate_exam(exam_id: str) -> tuple[Path, int]:
    spec = EXAM_BY_ID[exam_id]
    if exam_id in CLOUD_FACTORY_AWS_IDS:
        payload = build_vendor_payload(exam_id, EXAM_BY_ID, AWS_EXTRA_BANKS, AWS_CONFIG)
    else:
        payload = build_exam_payload(exam_id)
    validate_pool(payload["questions"], payload["domains"], spec.get("min_questions", 70))
    assert_official_exam(payload)
    out = EXAMS_DIR / f"{exam_id}.json"
    write_exam(out, payload)
    return out, len(payload["questions"])


def main() -> int:
    results: list[tuple[str, int]] = []

    clf_count = patch_cloud_practitioner_vendor()
    if clf_count:
        results.append(("cloud-practitioner.json", clf_count))

    for exam_id in GENERATE_IDS:
        path, count = generate_exam(exam_id)
        results.append((path.name, count))
        print(f"Wrote {count} questions -> {path}")

    import importlib.util

    index_script = ROOT / "scripts" / "build-exams-index.py"
    spec = importlib.util.spec_from_file_location("build_exams_index", index_script)
    if spec is None or spec.loader is None:
        raise SystemExit(f"Cannot load {index_script}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    print()
    module.main()

    print("\n=== Summary ===")
    for name, count in results:
        print(f"  {name}: {count} questions")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
