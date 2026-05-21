#!/usr/bin/env python3
"""Regenerate data/keytrain-index.json entries from data/exams-index.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMS_INDEX = ROOT / "data" / "exams-index.json"
OUT = ROOT / "data" / "keytrain-index.json"
sys.path.insert(0, str(ROOT / "scripts"))
from question_bank.key_training_catalog import BY_ID  # noqa: E402

# Exams to include in KeyTrain vendor cloud/comptia (None = all non-keytraining)
ENABLED_VENDOR_EXAM_IDS: set[str] | None = None


def certificate_title(name: str) -> str:
    if name.startswith("AWS Certified "):
        rest = name[len("AWS Certified ") :]
        return f"KeyTrain Certified {rest}"
    if name.startswith("Microsoft "):
        return f"KeyTrain Certified {name.replace('Microsoft ', '')}"
    if name.startswith("Google "):
        return f"KeyTrain Certified {name.replace('Google ', '')}"
    return f"KeyTrain Certified {name}"


def level_for(exam: dict) -> str:
    n = exam["name"].lower()
    if "foundational" in n or "practitioner" in n and "professional" not in n:
        return "Foundational"
    if "fundamentals" in n or "digital leader" in n:
        return "Fundamentals"
    if "professional" in n or "expert" in n:
        return "Professional"
    if "specialty" in n:
        return "Specialty"
    if "associate" in n or "+" in exam.get("code", ""):
        return "Associate"
    return "Certification"


def is_key_training_exam(exam: dict) -> bool:
    return exam.get("vendor") == "keytraining" or exam.get("program") == "key-training"


def key_training_entry(exam: dict) -> dict:
    cat = BY_ID.get(exam["id"])
    title = cat.certificate_title if cat else certificate_title(exam["name"])
    level = cat.level if cat else "Core"
    return {
        "id": f"kt-{exam['id']}",
        "examId": exam["id"],
        "certificateTitle": title,
        "level": level,
        "group": "key-training",
    }


def main() -> int:
    exams = json.loads(EXAMS_INDEX.read_text(encoding="utf-8"))["exams"]
    certs = []
    for e in sorted(exams, key=lambda x: x["name"]):
        if is_key_training_exam(e):
            certs.append(key_training_entry(e))
            continue
        if ENABLED_VENDOR_EXAM_IDS is not None and e["id"] not in ENABLED_VENDOR_EXAM_IDS:
            continue
        certs.append(
            {
                "id": f"kt-{e['id']}",
                "examId": e["id"],
                "certificateTitle": certificate_title(e["name"]),
                "level": level_for(e),
                "group": "vendor",
            }
        )
    payload = {
        "brand": "KeyTrain",
        "tagline": "Formal certification assessments with pass/fail results and downloadable certificates.",
        "certifications": certs,
    }
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(certs)} KeyTrain programs -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
