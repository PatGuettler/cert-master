#!/usr/bin/env python3
"""Audit docs/resources URLs in exam JSON; optionally apply fixes from doc_url_fixes."""
from __future__ import annotations

import argparse
import json
import ssl
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMS_DIR = ROOT / "data" / "exams"
sys.path.insert(0, str(ROOT / "scripts"))

from doc_url_fixes import URL_REPLACEMENTS  # noqa: E402

USER_AGENT = "AWS-Cert-Master-LinkAudit/1.0"
TIMEOUT = 25
MAX_WORKERS = 12


def check_url(url: str) -> tuple[str, int, str]:
    ctx = ssl.create_default_context()
    for method in ("HEAD", "GET"):
        req = urllib.request.Request(
            url, method=method, headers={"User-Agent": USER_AGENT}
        )
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
                return url, resp.status, resp.geturl()
        except urllib.error.HTTPError as e:
            if e.code == 405 and method == "HEAD":
                continue
            return url, e.code, str(e.reason)
        except Exception as e:
            if method == "GET":
                return url, 0, str(e)
    return url, 0, "unreachable"


def collect_links() -> dict[str, list[dict]]:
    by_url: dict[str, list[dict]] = defaultdict(list)
    for path in sorted(EXAMS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        exam_id = data.get("id", path.stem)
        for domain in data.get("domains", []):
            for res in domain.get("resources", []):
                url = (res.get("url") or "").strip()
                if url:
                    by_url[url].append(
                        {
                            "exam": exam_id,
                            "ctx": f"domain:{domain.get('id')}",
                            "title": res.get("title", ""),
                        }
                    )
        for q in data.get("questions", []):
            for doc in q.get("docs") or []:
                url = (doc.get("url") or "").strip()
                if url:
                    by_url[url].append(
                        {
                            "exam": exam_id,
                            "ctx": f"question:{q.get('id')}",
                            "title": doc.get("title", ""),
                            "text": (q.get("text") or "")[:80],
                        }
                    )
    return by_url


def replace_in_obj(obj) -> bool:
    changed = False
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "url" and isinstance(v, str) and v in URL_REPLACEMENTS:
                obj[k] = URL_REPLACEMENTS[v]
                changed = True
            elif replace_in_obj(v):
                changed = True
    elif isinstance(obj, list):
        for item in obj:
            if replace_in_obj(item):
                changed = True
    return changed


def patch_exam_files() -> int:
    n = 0
    for path in sorted(EXAMS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if replace_in_obj(data):
            path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
            n += 1
            print(f"Patched {path.name}")
    return n


def patch_python_sources() -> int:
    n = 0
    for d in (ROOT / "scripts", ROOT / "scripts" / "question_bank"):
        for path in sorted(d.rglob("*.py")):
            if path.name == "audit_doc_links.py":
                continue
            text = path.read_text(encoding="utf-8")
            new = text
            for old, new_url in URL_REPLACEMENTS.items():
                new = new.replace(old, new_url)
            if new != text:
                path.write_text(new, encoding="utf-8")
                n += 1
                print(f"Patched {path.relative_to(ROOT)}")
    return n


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Apply URL_REPLACEMENTS to JSON and Python sources before audit",
    )
    args = parser.parse_args()

    if args.fix:
        j = patch_exam_files()
        p = patch_python_sources()
        print(f"Applied fixes: {j} exam file(s), {p} Python file(s)\n")

    if not EXAMS_DIR.is_dir():
        print(f"Missing {EXAMS_DIR}", file=sys.stderr)
        return 1

    by_url = collect_links()
    urls = sorted(by_url.keys())
    print(f"Checking {len(urls)} unique URLs...\n")

    broken = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(check_url, u): u for u in urls}
        for fut in as_completed(futures):
            url, status, detail = fut.result()
            ok = 200 <= status < 400
            mark = "OK" if ok else "FAIL"
            print(f"{status:>3} {mark} {url}")
            if not ok:
                broken.append((url, status, detail, by_url[url]))

    print(f"\n{len(urls) - len(broken)} OK, {len(broken)} failed")
    if broken:
        print("\n--- Failed URLs ---")
        for url, status, detail, refs in broken:
            print(f"\n{status} {url} ({detail})")
            for ref in refs[:2]:
                extra = f" — {ref['text']}..." if ref.get("text") else ""
                print(f"  {ref['exam']} {ref['ctx']} [{ref['title']}]{extra}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
