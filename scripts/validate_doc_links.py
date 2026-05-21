#!/usr/bin/env python3
"""Check HTTP status of all docs/resources URLs in data/exams/*.json."""
from __future__ import annotations

import json
import ssl
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMS_DIR = ROOT / "data" / "exams"
import sys

sys.path.insert(0, str(ROOT / "scripts"))
from doc_url_fixes import URL_REPLACEMENTS  # noqa: E402

USER_AGENT = "AWS-Cert-Master-LinkChecker/1.0"
TIMEOUT = 20


def fetch_status(url: str) -> tuple[int, str]:
    req = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": USER_AGENT},
    )
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
            return resp.status, resp.geturl()
    except urllib.error.HTTPError as e:
        if e.code in (405, 403):
            return fetch_status_get(url)
        return e.code, getattr(e, "reason", str(e))
    except Exception as e:
        return fetch_status_get(url, str(e))


def fetch_status_get(url: str, prior: str = "") -> tuple[int, str]:
    req = urllib.request.Request(
        url,
        method="GET",
        headers={"User-Agent": USER_AGENT},
    )
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
            return resp.status, resp.geturl()
    except urllib.error.HTTPError as e:
        return e.code, prior or getattr(e, "reason", str(e))
    except Exception as e:
        return 0, prior or str(e)


def collect_links() -> dict[str, list[dict]]:
    by_url: dict[str, list[dict]] = defaultdict(list)
    for path in sorted(EXAMS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        exam_id = data.get("id", path.stem)
        for domain in data.get("domains", []):
            for res in domain.get("resources", []):
                url = res.get("url", "").strip()
                if url:
                    by_url[url].append(
                        {
                            "exam": exam_id,
                            "ctx": f"domain:{domain.get('id')}",
                            "title": res.get("title", ""),
                        }
                    )
        for q in data.get("questions", []):
            for doc in q.get("docs", []) or []:
                url = doc.get("url", "").strip()
                if url:
                    by_url[url].append(
                        {
                            "exam": exam_id,
                            "ctx": f"question:{q.get('id')}",
                            "title": doc.get("title", ""),
                        }
                    )
    return by_url


def main() -> int:
    if not EXAMS_DIR.is_dir():
        print(f"Missing {EXAMS_DIR}", file=sys.stderr)
        return 1

    by_url = collect_links()
    print(f"Checking {len(by_url)} unique URLs...\n")

    broken = []
    ok = 0
    for i, url in enumerate(sorted(by_url.keys()), 1):
        status, detail = fetch_status(url)
        label = "OK" if 200 <= status < 400 else "FAIL"
        if label == "OK":
            ok += 1
        else:
            broken.append((url, status, detail, by_url[url]))
        print(f"[{i}/{len(by_url)}] {status:>3} {label} {url}")
        if detail and detail != url and status:
            print(f"         -> {detail}")

    print(f"\nSummary: {ok} OK, {len(broken)} failed, {len(by_url)} total")
    if broken:
        print("\n--- Broken URLs (sample contexts) ---")
        for url, status, detail, refs in broken:
            print(f"\n{status} {url}")
            if detail:
                print(f"  detail: {detail}")
            for ref in refs[:3]:
                print(f"  - {ref['exam']} {ref['ctx']} ({ref['title']})")
            if len(refs) > 3:
                print(f"  ... +{len(refs) - 3} more")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
