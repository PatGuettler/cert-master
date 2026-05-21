"""Slug generation and HTML helpers for programmatic question SEO pages."""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMS_DIR = ROOT / "data" / "exams"

# Default canonical site root (override with SITE_ORIGIN env in build script)
DEFAULT_SITE_ORIGIN = "https://practicecert.com"

STOP_WORDS = frozenset(
    """
    a an the and or but for nor so yet to of in on at by from with as is are was
    were be been being have has had do does did will would shall should may might
    must can could what which who whom whose when where why how this that these
    those it its they them their we you your most best least more less many much
    some any each every all both either neither not no nor only just also than
    then than into over under again further once here there when where why how
    aws amazon use using used uses make makes made take takes took need needs
    following according option options answer answers select one two three four
    five six seven eight nine ten first second third next previous new old other
    another such same different between among through during before after above
    below up down out off about than into onto upon within without across
    """.split()
)

VENDOR_PREFIX = {
    "aws": "aws",
    "azure": "azure",
    "google": "google",
    "comptia": "comptia",
}


def exam_code_slug(exam: dict) -> str:
    code = (exam.get("code") or "").strip().lower()
    if code:
        code = re.split(r"\s*/\s*", code)[0].strip()
        code = re.sub(r"[^a-z0-9]+", "-", code).strip("-")
        if code:
            return code
    eid = exam.get("id", "exam")
    return re.sub(r"^comptia-", "", eid).replace("_", "-")


def topic_keywords(text: str, limit: int = 4) -> list[str]:
    words = re.findall(r"[a-z][a-z0-9]{2,}", text.lower())
    out: list[str] = []
    for w in words:
        if w in STOP_WORDS or w in out:
            continue
        out.append(w[:32])
        if len(out) >= limit:
            break
    return out


def make_question_slug(
    exam: dict,
    domain: dict,
    question: dict,
    used: set[str],
) -> str:
    if question.get("slug"):
        slug = str(question["slug"]).strip().lower()
        slug = re.sub(r"[^a-z0-9-]+", "-", slug).strip("-")
        if slug and slug not in used:
            used.add(slug)
            return slug

    vendor = exam.get("vendor") or "aws"
    prefix = VENDOR_PREFIX.get(vendor, vendor)
    code = exam_code_slug(exam)
    base = f"{prefix}-{code}"

    keywords = topic_keywords(question.get("text", ""))
    if keywords:
        topic = "-".join(keywords[:3])
    else:
        topic = re.sub(r"[^a-z0-9]+", "-", domain.get("id", "general")).strip("-")

    qshort = question.get("id", "q").lower().replace("_", "-")
    qsuffix = qshort.split("-")[-1] if "-" in qshort else qshort

    candidate = f"{base}-{topic}"
    if candidate in used:
        candidate = f"{candidate}-{qsuffix}"
    if candidate in used:
        candidate = f"{candidate}-{qshort}"

    used.add(candidate)
    return candidate


def escape(s: str) -> str:
    return html.escape(s or "", quote=True)


def truncate(text: str, max_len: int = 155) -> str:
    t = re.sub(r"\s+", " ", (text or "").strip())
    if len(t) <= max_len:
        return t
    return t[: max_len - 1].rsplit(" ", 1)[0] + "…"


def load_all_exams() -> list[tuple[dict, Path]]:
    out: list[tuple[dict, Path]] = []
    for path in sorted(EXAMS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        out.append((data, path))
    return out


def domain_by_id(exam: dict) -> dict[str, dict]:
    return {d["id"]: d for d in exam.get("domains", [])}


def build_slug_registry() -> dict:
    """Build slug maps for all questions across exams."""
    used: set[str] = set()
    by_slug: dict[str, dict] = {}
    by_question_key: dict[str, str] = {}

    for exam, _path in load_all_exams():
        domains = domain_by_id(exam)
        vendor = exam.get("vendor") or "aws"
        code = exam.get("code", "")
        for q in exam.get("questions", []):
            domain = domains.get(q.get("domain", ""), {"id": "general", "name": "General"})
            slug = make_question_slug(exam, domain, q, used)
            key = f"{exam['id']}:{q['id']}"
            by_question_key[key] = slug
            by_slug[slug] = {
                "certId": exam["id"],
                "questionId": q["id"],
                "examName": exam.get("name", ""),
                "examCode": code,
                "vendor": vendor,
                "domainId": domain.get("id", ""),
                "domainName": domain.get("name", ""),
                "textPreview": truncate(q.get("text", ""), 120),
            }

    return {
        "version": 1,
        "generated": True,
        "bySlug": by_slug,
        "byQuestionKey": by_question_key,
    }
