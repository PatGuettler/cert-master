#!/usr/bin/env python3
"""Generate KeyTrain's Key Training exam JSON files under data/exams/."""
from __future__ import annotations

import importlib.util
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMS_DIR = ROOT / "data" / "exams"
sys.path.insert(0, str(ROOT / "scripts"))

from question_bank.common import write_exam  # noqa: E402
from question_bank.key_training_catalog import BY_ID, KEY_TRAINING_CATEGORIES  # noqa: E402
from question_bank.key_training_questions import QUESTIONS_BY_DOMAIN  # noqa: E402

DEFAULT_DOCS = [
    (
        "NIST Cybersecurity Framework",
        "https://www.nist.gov/cyberframework",
    ),
    (
        "CISA Cybersecurity Guidance",
        "https://www.cisa.gov/topics/cybersecurity-best-practices",
    ),
]

EXAM_TOTAL = 15
EXAM_SCORED = 15
EXAM_MINUTES = 40
PASSING = 700
MAX_SCORE = 1000


def _options(correct: str, wrong: list[str]) -> list[tuple[str, str]]:
    items = [(correct, correct)] + [(w, w) for w in wrong[:3]]
    random.shuffle(items)
    labels = ["a", "b", "c", "d"]
    return [(labels[i], text) for i, (_, text) in enumerate(items)]


def _correct_ids(opts: list[tuple[str, str]], correct_text: str) -> list[str]:
    for oid, text in opts:
        if text == correct_text:
            return [oid]
    return ["a"]


def validate_key_training_pool(questions: list[dict], domains: list[dict]) -> None:
    by_domain: dict[str, int] = {}
    for q in questions:
        by_domain[q["domain"]] = by_domain.get(q["domain"], 0) + 1
    errors: list[str] = []
    if len(questions) < EXAM_TOTAL:
        errors.append(f"pool has {len(questions)} questions, need at least {EXAM_TOTAL}")
    for d in domains:
        if by_domain.get(d["id"], 0) < 2:
            errors.append(f"{d['id']}: need at least 2 questions in bank")
    if errors:
        raise SystemExit("Question pool validation failed:\n" + "\n".join(errors))


def _supplement_domain(domain_id: str, domain_name: str, prefix: str, start_n: int) -> list[dict]:
    """Two additional scenario items per domain to deepen the bank."""
    extras = [
        (
            f"During a tabletop on {domain_name.lower()}, leadership asks for a measurable KPI. Which metric fits BEST?",
            f"Documented incidents or control failures tied to {domain_name.lower()} trending down quarter over quarter",
            [
                "Number of marketing emails sent",
                "Average desk chair height",
                "Total pages printed in color only",
            ],
            f"Effective {domain_name.lower()} programs use measurable outcomes, not vanity metrics.",
        ),
        (
            f"An audit sampling {domain_name.lower()} controls finds inconsistent enforcement between sites. What should you standardize FIRST?",
            f"Baseline configuration and mandatory procedures referenced in policy with periodic attestation",
            [
                "Allow each site to opt out silently",
                "Remove all logging to reduce findings",
                "Disable training to save time",
            ],
            f"Consistency requires written baselines and attestations for {domain_name.lower()}.",
        ),
    ]
    out: list[dict] = []
    n = start_n
    for stem, correct, wrong, explanation in extras:
        n += 1
        opts = _options(correct, wrong)
        out.append(
            {
                "id": f"{prefix}-q{n:03d}",
                "domain": domain_id,
                "type": "multiple-choice",
                "text": stem,
                "options": [{"id": oid, "text": text} for oid, text in opts],
                "correct": _correct_ids(opts, correct),
                "explanation": explanation,
                "docs": [{"title": t, "url": u} for t, u in DEFAULT_DOCS],
            }
        )
    return out


def build_questions_for_category(cat_id: str) -> list[dict]:
    cat = BY_ID[cat_id]
    prefix = cat.code.lower().replace("-", "")
    questions: list[dict] = []
    n = 0
    for domain in cat.domains:
        templates = QUESTIONS_BY_DOMAIN.get(domain.id, [])
        if not templates:
            raise SystemExit(f"Missing questions for domain {domain.id} in {cat_id}")
        for stem, correct, wrong, explanation in templates:
            n += 1
            opts = _options(correct, wrong)
            questions.append(
                {
                    "id": f"{prefix}-q{n:03d}",
                    "domain": domain.id,
                    "type": "multiple-choice",
                    "text": stem,
                    "options": [{"id": oid, "text": text} for oid, text in opts],
                    "correct": _correct_ids(opts, correct),
                    "explanation": explanation,
                    "docs": [{"title": t, "url": u} for t, u in DEFAULT_DOCS],
                }
            )
        questions.extend(
            _supplement_domain(domain.id, domain.name, prefix, n)
        )
    return questions


def build_payload(cat_id: str) -> dict:
    cat = BY_ID[cat_id]
    domains = [
        {
            "id": d.id,
            "name": d.name,
            "weight": d.weight,
            "resources": [{"title": t, "url": u} for t, u in DEFAULT_DOCS],
        }
        for d in cat.domains
    ]
    questions = build_questions_for_category(cat_id)
    return {
        "id": cat.id,
        "name": f"KeyTrain's Key Training — {cat.name}",
        "code": cat.code,
        "vendor": "keytraining",
        "program": "key-training",
        "exam": {
            "totalQuestions": EXAM_TOTAL,
            "scoredQuestions": EXAM_SCORED,
            "timeLimitMinutes": EXAM_MINUTES,
            "passingScore": PASSING,
            "maxScore": MAX_SCORE,
            "selectionMode": "weighted-random",
        },
        "domains": domains,
        "questions": questions,
    }


def rebuild_index() -> None:
    spec = importlib.util.spec_from_file_location(
        "build_exams_index",
        ROOT / "scripts" / "build-exams-index.py",
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.main()


def rebuild_keytrain_index() -> None:
    spec = importlib.util.spec_from_file_location(
        "build_keytrain_index",
        ROOT / "scripts" / "build-keytrain-index.py",
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.main()


def main() -> int:
    random.seed(42)
    for cat in KEY_TRAINING_CATEGORIES:
        payload = build_payload(cat.id)
        validate_key_training_pool(payload["questions"], payload["domains"])
        out = EXAMS_DIR / f"{cat.id}.json"
        write_exam(out, payload)
        print(f"Wrote {len(payload['questions'])} questions -> {out.name}")

    rebuild_index()
    rebuild_keytrain_index()
    print("Rebuilt exams-index.json and keytrain-index.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
