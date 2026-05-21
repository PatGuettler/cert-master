#!/usr/bin/env python3
"""Generate static SEO pages at questions/{slug}/index.html plus sitemap and slug index."""
from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

from question_seo import (
    DEFAULT_SITE_ORIGIN,
    build_slug_registry,
    domain_by_id,
    escape,
    load_all_exams,
    truncate,
)

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS_DIR = ROOT / "questions"
DATA_DIR = ROOT / "data"

SITE_ORIGIN = os.environ.get("SITE_ORIGIN", DEFAULT_SITE_ORIGIN).rstrip("/")
SITE_PATH = os.environ.get("SITE_PATH", "").rstrip("/")
if SITE_PATH == "/":
    SITE_PATH = ""
if SITE_PATH and not SITE_PATH.startswith("/"):
    SITE_PATH = "/" + SITE_PATH


def site_url(path: str = "") -> str:
    p = path if path.startswith("/") else f"/{path}" if path else ""
    if SITE_PATH:
        return f"{SITE_ORIGIN}{SITE_PATH}{p}"
    return f"{SITE_ORIGIN}{p}"


def rel_root(depth: int) -> str:
    return "/".join([".."] * depth) if depth else "."


def render_options(q: dict) -> str:
    items = []
    for opt in q.get("options", []):
        items.append(
            f'<li class="seo-option">'
            f'<span class="seo-option-id">{escape(opt.get("id", ""))}.</span> '
            f"{escape(opt.get('text', ''))}</li>"
        )
    return "\n".join(items)


def render_docs(q: dict, domain: dict) -> str:
    docs = list(q.get("docs") or [])
    seen = {d.get("url") for d in docs}
    for r in domain.get("resources") or []:
        if r.get("url") and r["url"] not in seen:
            docs.append(r)
            seen.add(r["url"])
    if not docs:
        return ""
    lis = "".join(
        f'<li><a href="{escape(d["url"])}" rel="noopener noreferrer">'
        f"{escape(d.get('title', 'Documentation'))}</a></li>"
        for d in docs[:8]
    )
    return f'<ul class="seo-doc-links">{lis}</ul>'


def render_breakdown(q: dict, domain: dict, correct_labels: list[str]) -> str:
    parts = []
    if q.get("explanation"):
        parts.append(f"<p>{escape(q['explanation'])}</p>")
    if correct_labels:
        parts.append(
            "<p><strong>Correct answer(s):</strong> "
            + escape(", ".join(correct_labels))
            + "</p>"
        )
    parts.append(
        f"<p><strong>Exam domain:</strong> {escape(domain.get('name', ''))} "
        f"({escape(str(domain.get('weight', '')))}% weight on the official guide).</p>"
    )
    docs_html = render_docs(q, domain)
    if docs_html:
        parts.append("<h3>Official documentation &amp; study links</h3>" + docs_html)
    return "\n".join(parts)


def render_question_page(
    exam: dict,
    q: dict,
    domain: dict,
    slug: str,
    registry: dict,
) -> str:
    meta = registry["bySlug"][slug]
    title_text = truncate(q.get("text", ""), 70)
    page_title = f"{meta['examCode']} Practice: {title_text} | AWS Cert Master"
    description = (
        f"Free {meta['examName']} ({meta['examCode']}) practice question with "
        f"answer explanation, domain context, and official AWS/CompTIA doc links. "
        + truncate(q.get("text", ""), 100)
    )
    canonical = site_url(f"/questions/{slug}/")

    opt_by_id = {o["id"]: o for o in q.get("options", [])}
    correct_labels = [
        f"{cid}. {opt_by_id[cid]['text']}"
        for cid in q.get("correct", [])
        if cid in opt_by_id
    ]

    qtype = q.get("type", "multiple-choice")
    type_label = (
        "Multiple response — select two or more answers"
        if qtype == "multiple-response"
        else "Multiple choice — select one answer"
    )

    cert_url = site_url(f"/cert/{exam['id']}/")
    browse_url = site_url("/browse/")
    home_url = site_url("/")
    practice_url = f"{site_url('/')}?start={exam['id']}"

    css_href = f"{rel_root(2)}/css/styles.css"
    json_ld = {
        "@context": "https://schema.org",
        "@type": "Quiz",
        "name": page_title,
        "description": description,
        "educationalLevel": meta.get("examCode", ""),
        "about": meta.get("examName", ""),
        "url": canonical,
    }

    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{escape(description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="{escape(canonical)}" />
    <title>{escape(page_title)}</title>
    <meta property="og:title" content="{escape(page_title)}" />
    <meta property="og:description" content="{escape(description)}" />
    <meta property="og:url" content="{escape(canonical)}" />
    <meta property="og:type" content="article" />
    <link rel="stylesheet" href="{css_href}" />
    <script type="application/ld+json">{json.dumps(json_ld)}</script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3981092943886508" crossorigin="anonymous"></script>
  </head>
  <body class="seo-question-body">
    <header class="site-header seo-question-header">
      <a href="{escape(home_url)}" class="seo-brand-link">AWS Cert Master</a>
    </header>
    <main class="seo-question-main">
      <nav class="seo-breadcrumb" aria-label="Breadcrumb">
        <a href="{escape(home_url)}">Home</a>
        <span aria-hidden="true"> › </span>
        <a href="{escape(browse_url)}">Browse exams</a>
        <span aria-hidden="true"> › </span>
        <a href="{escape(cert_url)}">{escape(meta['examName'])}</a>
        <span aria-hidden="true"> › </span>
        <span>Question</span>
      </nav>

      <article class="seo-question-article" itemscope itemtype="https://schema.org/Question">
        <p class="seo-question-meta">
          <span class="seo-badge">{escape(meta['examCode'])}</span>
          <span class="seo-badge seo-badge-domain">{escape(domain.get('name', ''))}</span>
        </p>
        <h1 itemprop="name">{escape(q.get('text', ''))}</h1>
        <p class="seo-question-type">{escape(type_label)}</p>

        <section aria-label="Answer choices">
          <h2 class="seo-sr-only">Answer choices</h2>
          <ol class="seo-options-list">
            {render_options(q)}
          </ol>
        </section>

        <section class="seo-breakdown" aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading">Architectural breakdown &amp; explanation</h2>
          {render_breakdown(q, domain, correct_labels)}
        </section>

        <section class="seo-cta">
          <h2>Practice this certification</h2>
          <p>
            This page is one question from the <strong>{escape(meta['examName'])}</strong>
            bank. Run a full timed practice exam with domain-weighted random questions in your browser.
          </p>
          <div class="seo-cta-actions">
            <a class="btn btn-primary" href="{escape(practice_url)}">Start practice exam</a>
            <a class="btn btn-outline" href="{escape(cert_url)}">View exam overview</a>
            <a class="btn btn-outline" href="{escape(browse_url)}">All certifications</a>
          </div>
        </section>
      </article>

      <aside class="ad-slot ad-slot--inline" aria-label="Advertisement">
        <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3981092943886508" data-ad-slot="" data-ad-format="auto" data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({{}});</script>
      </aside>
    </main>
    <footer class="site-footer">
      <p>
        Unofficial practice tool — not affiliated with AWS or CompTIA.
        <a href="{escape(home_url)}">Back to AWS Cert Master</a>
      </p>
    </footer>
  </body>
</html>
"""


def render_questions_hub(registry: dict, exams_by_id: dict) -> str:
    sections = []
    by_cert: dict[str, list[tuple[str, dict]]] = {}
    for slug, meta in sorted(registry["bySlug"].items(), key=lambda x: (x[1]["examName"], x[0])):
        by_cert.setdefault(meta["certId"], []).append((slug, meta))

    for cert_id in sorted(by_cert.keys(), key=lambda c: exams_by_id.get(c, {}).get("name", c)):
        exam = exams_by_id.get(cert_id, {})
        links = []
        for slug, meta in by_cert[cert_id][:500]:
            url = site_url(f"/questions/{slug}/")
            links.append(
                f'<li><a href="{escape(url)}">{escape(meta["textPreview"])}</a></li>'
            )
        sections.append(
            f"<section><h2>{escape(exam.get('name', cert_id))} "
            f"<span class=\"seo-hub-code\">({escape(exam.get('code', ''))})</span></h2>"
            f"<ul class=\"seo-hub-list\">{''.join(links)}</ul></section>"
        )

    home = site_url("/")
    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Browse free AWS and CompTIA certification practice questions — each with its own page, explanation, and study links." />
    <link rel="canonical" href="{escape(site_url('/questions/'))}" />
    <title>Practice question library | AWS Cert Master</title>
    <link rel="stylesheet" href="../css/styles.css" />
  </head>
  <body class="seo-question-body">
    <header class="site-header seo-question-header">
      <a href="{escape(home)}" class="seo-brand-link">AWS Cert Master</a>
    </header>
    <main class="seo-question-main seo-hub-main">
      <h1>Practice question library</h1>
      <p class="seo-hub-lead">
        Every practice question has a dedicated URL for search and sharing — with the full stem,
        answer breakdown, and official documentation links.
      </p>
      {''.join(sections)}
    </main>
    <footer class="site-footer"><p><a href="{escape(home)}">Home</a></p></footer>
  </body>
</html>
"""


def write_sitemap(slugs: list[str]) -> None:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    urls = [
        site_url("/"),
        site_url("/browse/"),
        site_url("/questions/"),
    ]
    urls.extend(site_url(f"/questions/{s}/") for s in slugs)

    entries = "\n".join(
        f"  <url><loc>{loc}</loc><lastmod>{today}</lastmod></url>" for loc in urls
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{entries}\n</urlset>\n"
    )
    (ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")


def write_robots() -> None:
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        f"Sitemap: {site_url('/sitemap.xml')}\n"
    )
    (ROOT / "robots.txt").write_text(content, encoding="utf-8")


def main() -> int:
    registry = build_slug_registry()
    slugs = sorted(registry["bySlug"].keys())

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    index_path = DATA_DIR / "questions-slugs.json"
    index_path.write_text(
        json.dumps(registry, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    exams_by_id = {e["id"]: e for e, _ in load_all_exams()}

    if QUESTIONS_DIR.exists():
        import shutil
        for child in QUESTIONS_DIR.iterdir():
            if child.is_dir():
                shutil.rmtree(child)
            elif child.name != ".gitkeep":
                child.unlink()

    count = 0
    for exam, _path in load_all_exams():
        domains = domain_by_id(exam)
        for q in exam.get("questions", []):
            key = f"{exam['id']}:{q['id']}"
            slug = registry["byQuestionKey"].get(key)
            if not slug:
                continue
            domain = domains.get(q.get("domain", ""), {"id": "general", "name": "General"})
            out_dir = QUESTIONS_DIR / slug
            out_dir.mkdir(parents=True, exist_ok=True)
            html = render_question_page(exam, q, domain, slug, registry)
            (out_dir / "index.html").write_text(html, encoding="utf-8")
            count += 1

    QUESTIONS_DIR.mkdir(parents=True, exist_ok=True)
    (QUESTIONS_DIR / "index.html").write_text(
        render_questions_hub(registry, exams_by_id),
        encoding="utf-8",
    )

    write_sitemap(slugs)
    write_robots()

    print(f"Wrote {count} question pages under questions/")
    print(f"Slug index: {index_path} ({len(slugs)} slugs)")
    print(f"Sitemap: {ROOT / 'sitemap.xml'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
