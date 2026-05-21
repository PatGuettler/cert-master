"""Shared helpers for building practice exam JSON question pools."""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

# Raw tuple: domain, type, text, options, correct, explanation, docs
RawQuestion = tuple[
    str,
    str,
    str,
    list[tuple[str, str]],
    list[str],
    str,
    list[tuple[str, str]],
]


def build_questions(raw: list[RawQuestion], id_prefix: str) -> list[dict[str, Any]]:
    questions = []
    for i, row in enumerate(raw, start=1):
        domain, qtype, text, opts, correct, explanation, docs = row
        questions.append(
            {
                "id": f"{id_prefix}-q{i:03d}",
                "domain": domain,
                "type": qtype,
                "text": text,
                "options": [{"id": oid, "text": otext} for oid, otext in opts],
                "correct": correct,
                "explanation": explanation,
                "docs": [{"title": t, "url": u} for t, u in docs],
            }
        )
    return questions


def exam_domain_minimums(domains: list[dict], total: int) -> dict[str, int]:
    """Minimum pool size per domain for one weighted-random exam draw."""
    mins: dict[str, int] = {}
    for d in domains:
        share = max(1, math.ceil(total * d["weight"] / 100))
        mins[d["id"]] = share + 1
    return mins


def validate_pool(questions: list[dict], domains: list[dict], min_total: int) -> None:
    by_domain: dict[str, int] = {}
    for q in questions:
        by_domain[q["domain"]] = by_domain.get(q["domain"], 0) + 1

    errors: list[str] = []
    if len(questions) < min_total:
        errors.append(f"pool has {len(questions)} questions, need at least {min_total}")

    mins = exam_domain_minimums(domains, min_total)
    for domain_id, minimum in mins.items():
        count = by_domain.get(domain_id, 0)
        if count < minimum:
            errors.append(f"{domain_id}: have {count}, need {minimum}")

    if errors:
        raise SystemExit("Question pool validation failed:\n" + "\n".join(errors))


def dedupe_raw(raw: list[RawQuestion]) -> list[RawQuestion]:
    seen: set[str] = set()
    out: list[RawQuestion] = []
    for row in raw:
        key = row[2].strip()
        if key in seen:
            continue
        seen.add(key)
        out.append(row)
    return out


def write_exam(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
