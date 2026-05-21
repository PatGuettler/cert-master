"""Validate that question and domain links point to official provider documentation."""
from __future__ import annotations

from urllib.parse import urlparse

# Hostnames allowed per vendor (official exam guides, docs, product pages only)
OFFICIAL_HOSTS: dict[str, tuple[str, ...]] = {
    "aws": (
        "aws.amazon.com",
        "docs.aws.amazon.com",
        "explore.skillbuilder.aws",
        "d1.awsstatic.com",
        "awsstatic.com",
    ),
    "azure": (
        "learn.microsoft.com",
        "azure.microsoft.com",
        "docs.microsoft.com",
        "microsoft.com",
    ),
    "google": (
        "cloud.google.com",
        "developers.google.com",
    ),
    "comptia": (
        "www.comptia.org",
        "comptia.org",
    ),
}


def host_allowed(hostname: str, vendor: str) -> bool:
    host = (hostname or "").lower().removeprefix("www.")
    allowed = OFFICIAL_HOSTS.get(vendor, ())
    for pattern in allowed:
        p = pattern.removeprefix("www.")
        if host == p or host.endswith("." + p):
            return True
    return False


def is_official_url(url: str, vendor: str) -> bool:
    if not url or not url.startswith("https://"):
        return False
    parsed = urlparse(url)
    return host_allowed(parsed.hostname or "", vendor)


def validate_question_docs(questions: list[dict], vendor: str) -> list[str]:
    errors: list[str] = []
    for q in questions:
        docs = q.get("docs") or []
        if not docs:
            errors.append(f"{q.get('id', '?')}: missing docs[] reference links")
            continue
        for doc in docs:
            url = (doc.get("url") or "").strip()
            title = doc.get("title") or ""
            if not url:
                errors.append(f"{q.get('id')}: empty doc url")
            elif not is_official_url(url, vendor):
                errors.append(f"{q.get('id')}: non-official doc url {url!r}")
            if not title:
                errors.append(f"{q.get('id')}: missing doc title")
    return errors


def validate_domain_resources(domains: list[dict], vendor: str) -> list[str]:
    errors: list[str] = []
    for domain in domains:
        for res in domain.get("resources") or []:
            url = (res.get("url") or "").strip()
            if not is_official_url(url, vendor):
                errors.append(
                    f"domain {domain.get('id')}: non-official resource url {url!r}"
                )
    return errors


def assert_official_exam(payload: dict) -> None:
    vendor = payload.get("vendor") or "aws"
    errors = []
    errors.extend(validate_domain_resources(payload.get("domains", []), vendor))
    errors.extend(validate_question_docs(payload.get("questions", []), vendor))
    if errors:
        raise SystemExit(
            f"Official documentation validation failed for {payload.get('id')}:\n"
            + "\n".join(errors[:40])
            + (f"\n... and {len(errors) - 40} more" if len(errors) > 40 else "")
        )
