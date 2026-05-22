#!/usr/bin/env python3
"""Generate static SEO pages (questions, cert landings, browse) plus sitemap and slug index."""
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
CERT_DIR = ROOT / "cert"
BROWSE_DIR = ROOT / "browse"
ABOUT_DIR = ROOT / "about"
CONTACT_DIR = ROOT / "contact"
PRIVACY_DIR = ROOT / "privacy"
DATA_DIR = ROOT / "data"

CONTACT_EMAIL = "patguettlerpages@gmail.com"

VENDOR_LABELS = {
    "aws": "AWS",
    "azure": "Microsoft Azure",
    "google": "Google Cloud",
    "comptia": "CompTIA",
}

ADS_CLIENT = "ca-pub-3981092943886508"
ADS_SLOT = ""

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


def load_adsense_config() -> None:
    global ADS_CLIENT, ADS_SLOT
    path = DATA_DIR / "ads-config.json"
    if not path.exists():
        ADS_SLOT = "3180313241"
        return
    cfg = json.loads(path.read_text(encoding="utf-8"))
    ads = cfg.get("adsense") or {}
    ADS_CLIENT = ads.get("client") or ADS_CLIENT
    if cfg.get("enabled") and cfg.get("provider") == "adsense":
        ADS_SLOT = str(ads.get("slot") or "")


def render_ad_unit() -> str:
    if not ADS_SLOT:
        return ""
    return (
        '<aside class="ad-slot ad-slot--bar" aria-label="Advertisement">'
        '<div class="ad-container">'
        f'<ins class="adsbygoogle" style="display:block" '
        f'data-ad-client="{escape(ADS_CLIENT)}" data-ad-slot="{escape(ADS_SLOT)}" '
        'data-ad-format="horizontal" data-full-width-responsive="true"></ins>'
        "</div>"
        "<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>"
        "</aside>"
    )


def seo_body_class(extra: str = "") -> str:
    base = "seo-question-body has-ad-bar"
    return f"{base} {extra}".strip() if extra else base


def render_seo_footer(*, include_disclaimer: bool = True) -> str:
    home = site_url("/")
    browse = site_url("/browse/")
    questions = site_url("/questions/")
    about = site_url("/about/")
    contact = site_url("/contact/")
    privacy = site_url("/privacy/")
    links = (
        f'<nav class="site-footer-nav" aria-label="Site">'
        f'<a href="{escape(home)}">Home</a>'
        f'<a href="{escape(browse)}">Browse exams</a>'
        f'<a href="{escape(questions)}">Question library</a>'
        f'<a href="{escape(about)}">About</a>'
        f'<a href="{escape(contact)}">Contact</a>'
        f'<a href="{escape(privacy)}">Privacy</a>'
        f"</nav>"
    )
    disclaimer = ""
    if include_disclaimer:
        disclaimer = (
            '<p class="site-footer-disclaimer">'
            "Unofficial practice tool — not affiliated with AWS, Microsoft, Google, or CompTIA."
            "</p>"
        )
    return f'<footer class="site-footer site-footer--expanded">{links}{disclaimer}</footer>'


def render_seo_app_chrome(*, asset_prefix: str = "../") -> str:
    """Hamburger header + drawer for static pages (links to main app routes)."""
    home = site_url("/")
    browse = site_url("/browse/")
    keytrain = site_url("/keytrain/")
    about = site_url("/about/")
    contact = site_url("/contact/")
    privacy = site_url("/privacy/")
    js_href = f"{asset_prefix}js/static-menu.js"
    return f"""
    <header class="site-header">
      <button
        id="menu-btn"
        class="menu-btn"
        type="button"
        aria-label="Open menu"
        aria-expanded="false"
        aria-controls="drawer"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <h1 class="site-title"><a href="{escape(home)}">Cert Master</a></h1>
    </header>
    <div id="drawer-overlay" class="drawer-overlay" aria-hidden="true"></div>
    <aside id="drawer" class="drawer" aria-label="Menu">
      <div class="drawer-header">
        <h2>Menu</h2>
      </div>
      <div class="drawer-main">
        <nav class="drawer-nav" aria-label="Main navigation">
          <a href="{escape(home)}" class="drawer-nav-btn drawer-nav-link">Home</a>
          <a href="{escape(browse)}" class="drawer-nav-btn drawer-nav-link">Practice certifications</a>
          <a href="{escape(keytrain)}" class="drawer-nav-btn drawer-nav-link">KeyTrain</a>
          <a href="{escape(home)}" class="drawer-nav-btn drawer-nav-link">Your progress</a>
        </nav>
        <footer class="drawer-footer">
          <nav class="drawer-footer-links" aria-label="Site information">
            <a href="{escape(about)}">About</a>
            <a href="{escape(contact)}">Contact</a>
            <a href="{escape(privacy)}">Privacy</a>
          </nav>
        </footer>
      </div>
    </aside>
    <script type="module" src="{escape(js_href)}"></script>
    """


def render_trust_shell(
    *,
    title: str,
    description: str,
    canonical: str,
    breadcrumb_label: str,
    main_html: str,
    json_ld: dict | None = None,
) -> str:
    home = site_url("/")
    head = render_seo_head(
        title=title,
        description=description,
        canonical=canonical,
        css_href="../css/styles.css",
        json_ld=json_ld,
    )
    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
{head}
  </head>
  <body class="{seo_body_class("seo-trust-body")}">
    {render_seo_app_chrome(asset_prefix="../")}
    <main class="seo-question-main seo-trust-main">
      <nav class="seo-breadcrumb" aria-label="Breadcrumb">
        <a href="{escape(home)}">Home</a> / {escape(breadcrumb_label)}
      </nav>
      {main_html}
    </main>
    {render_ad_unit()}
    {render_seo_footer()}
  </body>
</html>
"""


def render_about_page() -> str:
    title = "About Cert Master | Free certification practice"
    description = (
        "Cert Master offers original AWS, Azure, Google Cloud, and CompTIA practice exams "
        "plus KeyTrain cybersecurity workshops. Learn who we are and how we create study content."
    )
    canonical = site_url("/about/")
    body = f"""
      <article class="seo-trust-article">
        <h1>About Cert Master</h1>
        <p class="seo-hub-lead">
          Cert Master (<a href="{escape(site_url('/'))}">practicecert.com</a>) is a free study site for
          cloud and IT certification candidates. We publish <strong>original practice questions</strong>,
          timed exams, and interactive KeyTrain workshops — all designed to help you learn exam objectives,
          not to replace official training or vendor materials.
        </p>

        <section class="seo-trust-section">
          <h2>What we offer</h2>
          <ul>
            <li><strong>Practice exams</strong> — domain-weighted quizzes for AWS, Microsoft Azure, Google Cloud, and CompTIA certifications.</li>
            <li><strong>Question library</strong> — each question has its own page with explanations and links to official documentation.</li>
            <li><strong>KeyTrain</strong> — cybersecurity training paths with workshops, concept visuals, and certification-style exams.</li>
          </ul>
        </section>

        <section class="seo-trust-section">
          <h2>Original, people-first content</h2>
          <p>
            Questions and teaching notes are written for clarity and learning value. We do not scrape exam dumps,
            copy third-party banks, or publish restricted content (adult material, violence, hate speech, or other
            policy-violating topics). When you spot an error or outdated objective, please
            <a href="{escape(site_url('/contact/'))}">contact us</a> so we can correct it.
          </p>
        </section>

        <section class="seo-trust-section">
          <h2>Independence &amp; disclaimers</h2>
          <p>
            Cert Master is <strong>not affiliated with, endorsed by, or sponsored by</strong> Amazon Web Services (AWS),
            Microsoft, Google, CompTIA, or any certification vendor. Exam names and codes are used for identification only.
            Your results on this site do not guarantee success on an official exam.
          </p>
        </section>

        <section class="seo-trust-section">
          <h2>How we keep the site fresh</h2>
          <p>
            We expand question banks, refine distractors, and update workshops as exam guides change.
            New questions and workshop steps are added on an ongoing basis so returning learners see
            varied, up-to-date practice material.
          </p>
        </section>

        <p class="seo-cta-actions">
          <a class="btn btn-primary" href="{escape(site_url('/browse/'))}">Browse practice exams</a>
          <a class="btn btn-outline" href="{escape(site_url('/contact/'))}">Contact us</a>
        </p>
      </article>
    """
    json_ld = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": title,
        "description": description,
        "url": canonical,
        "isPartOf": {"@type": "WebSite", "name": "Cert Master", "url": site_url("/")},
    }
    return render_trust_shell(
        title=title,
        description=description,
        canonical=canonical,
        breadcrumb_label="About",
        main_html=body,
        json_ld=json_ld,
    )


def render_contact_page() -> str:
    title = "Contact Cert Master"
    description = (
        "Get in touch with Cert Master for feedback, content corrections, and privacy questions. "
        "We respond to legitimate inquiries promptly."
    )
    canonical = site_url("/contact/")
    mail = escape(CONTACT_EMAIL)
    body = f"""
      <article class="seo-trust-article">
        <h1>Contact us</h1>
        <p class="seo-hub-lead">
          We read every message. Use the email below for study feedback, broken links, privacy requests,
          or privacy questions.
        </p>

        <section class="seo-trust-section">
          <h2>Email</h2>
          <p>
            <a href="mailto:{mail}">{mail}</a>
          </p>
          <p>
            Please include the page URL and, for question issues, the exam code and question text.
            We typically reply within a few business days.
          </p>
        </section>

        <section class="seo-trust-section">
          <h2>What we can help with</h2>
          <ul>
            <li>Reporting inaccurate or outdated practice questions</li>
            <li>Suggesting new certifications or workshop topics</li>
            <li>Privacy, cookies, and advertising on this site (see our <a href="{escape(site_url('/privacy/'))}">Privacy policy</a>)</li>
          </ul>
        </section>

        <p><a href="{escape(site_url('/about/'))}">About Cert Master</a> ·
        <a href="{escape(site_url('/privacy/'))}">Privacy policy</a></p>
      </article>
    """
    json_ld = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": title,
        "description": description,
        "url": canonical,
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": CONTACT_EMAIL,
            "url": canonical,
        },
    }
    return render_trust_shell(
        title=title,
        description=description,
        canonical=canonical,
        breadcrumb_label="Contact",
        main_html=body,
        json_ld=json_ld,
    )


def render_privacy_page() -> str:
    title = "Privacy policy | Cert Master"
    description = (
        "How Cert Master handles browser storage, cookies, Google AdSense, and third-party services. "
        "No account required; progress stays on your device unless you clear it."
    )
    canonical = site_url("/privacy/")
    mail = escape(CONTACT_EMAIL)
    body = f"""
      <article class="seo-trust-article">
        <h1>Privacy policy</h1>
        <p class="seo-hub-lead">
          <em>Last updated: {datetime.now(timezone.utc).strftime("%B %d, %Y")} (UTC)</em>
        </p>
        <p>
          Cert Master respects your privacy. This policy explains what data we collect, how ads work,
          and how to reach us. By using practicecert.com you agree to this policy.
        </p>

        <section class="seo-trust-section">
          <h2>Information we collect</h2>
          <p>
            <strong>No account or login is required.</strong> Exam progress, settings, and KeyTrain state are stored
            in your browser&apos;s <code>localStorage</code> on your device. We do not operate a user database or
            sell personal information.
          </p>
          <p>
            Standard web server logs (IP address, browser type, pages requested) may be recorded by our hosting
            provider for security and operations. We do not use those logs to build marketing profiles.
          </p>
        </section>

        <section class="seo-trust-section">
          <h2>Cookies and advertising</h2>
          <p>
            We may display Google AdSense ads. Google and its partners may use cookies or similar technologies
            to serve and measure ads, including personalized advertising where permitted by law. You can learn more
            in <a href="https://policies.google.com/technologies/ads" rel="noopener noreferrer">How Google uses data when you use our partners&apos; sites or apps</a>
            and manage ad personalization at
            <a href="https://adssettings.google.com" rel="noopener noreferrer">Google Ads Settings</a>.
          </p>
          <p>
            We do not place ads in pop-ups, emails, or software downloads. Ads are not styled to look like navigation
            or download buttons. Please report deceptive ad placement to
            <a href="mailto:{mail}">{mail}</a>.
          </p>
        </section>

        <section class="seo-trust-section">
          <h2>Children</h2>
          <p>
            Cert Master is intended for certification candidates and adult learners. We do not knowingly collect
            personal information from children under 13. Contact us if you believe a child has submitted personal data.
          </p>
        </section>

        <section class="seo-trust-section">
          <h2>Your choices</h2>
          <ul>
            <li>Clear site data anytime via the menu &ldquo;Clear data&rdquo; options or your browser settings.</li>
            <li>Block cookies in your browser (some features or ads may not work as expected).</li>
            <li>Email <a href="mailto:{mail}">{mail}</a> for privacy questions or deletion requests related to correspondence you sent us.</li>
          </ul>
        </section>

        <section class="seo-trust-section">
          <h2>Changes</h2>
          <p>
            We may update this policy when our practices or legal requirements change. The &ldquo;Last updated&rdquo;
            date at the top will reflect the revision. Continued use of the site after changes constitutes acceptance.
          </p>
        </section>

        <p>Questions? <a href="mailto:{mail}">{mail}</a> or our <a href="{escape(site_url('/contact/'))}">Contact page</a>.</p>
      </article>
    """
    return render_trust_shell(
        title=title,
        description=description,
        canonical=canonical,
        breadcrumb_label="Privacy",
        main_html=body,
        json_ld={
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": description,
            "url": canonical,
        },
    )


def write_trust_pages() -> None:
    ABOUT_DIR.mkdir(parents=True, exist_ok=True)
    CONTACT_DIR.mkdir(parents=True, exist_ok=True)
    PRIVACY_DIR.mkdir(parents=True, exist_ok=True)
    (ABOUT_DIR / "index.html").write_text(render_about_page(), encoding="utf-8")
    (CONTACT_DIR / "index.html").write_text(render_contact_page(), encoding="utf-8")
    (PRIVACY_DIR / "index.html").write_text(render_privacy_page(), encoding="utf-8")


def render_seo_head(
    *,
    title: str,
    description: str,
    canonical: str,
    css_href: str,
    json_ld: dict | list | None = None,
    og_type: str = "website",
) -> str:
    ld = ""
    if json_ld is not None:
        ld = f'<script type="application/ld+json">{json.dumps(json_ld)}</script>'
    ads_js = (
        f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={escape(ADS_CLIENT)}" crossorigin="anonymous"></script>'
        if ADS_CLIENT
        else ""
    )
    return f"""    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{escape(description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="{escape(canonical)}" />
    <title>{escape(title)}</title>
    <meta property="og:title" content="{escape(title)}" />
    <meta property="og:description" content="{escape(description)}" />
    <meta property="og:url" content="{escape(canonical)}" />
    <meta property="og:type" content="{escape(og_type)}" />
    <meta property="og:site_name" content="Cert Master" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="{escape(title)}" />
    <meta name="twitter:description" content="{escape(description)}" />
    <link rel="stylesheet" href="{escape(css_href)}" />
    {ads_js}
    {ld}"""


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
    page_title = f"{meta['examCode']} Practice: {title_text} | Cert Master"
    vendor_label = VENDOR_LABELS.get(exam.get("vendor", ""), "cloud")
    description = (
        f"Free {meta['examName']} ({meta['examCode']}) practice question with "
        f"answer explanation, exam domain context, and official {vendor_label} documentation links. "
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
        "isPartOf": {"@type": "WebSite", "name": "Cert Master", "url": home_url},
    }
    head = render_seo_head(
        title=page_title,
        description=description,
        canonical=canonical,
        css_href=css_href,
        json_ld=json_ld,
        og_type="article",
    )

    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
{head}
  </head>
  <body class="{seo_body_class()}">
    <header class="site-header seo-question-header">
      <a href="{escape(home_url)}" class="seo-brand-link">Cert Master</a>
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

    </main>
    {render_ad_unit()}
    {render_seo_footer()}
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
        count = len(by_cert[cert_id])
        cert_url = site_url(f"/cert/{cert_id}/")
        sample_links = []
        for slug, meta in by_cert[cert_id][:12]:
            url = site_url(f"/questions/{slug}/")
            sample_links.append(
                f'<li><a href="{escape(url)}">{escape(meta["textPreview"])}</a></li>'
            )
        more = ""
        if count > 12:
            more = (
                f'<p class="seo-hub-more">+ {count - 12} more indexed — '
                f'<a href="{escape(cert_url)}">see exam overview</a></p>'
            )
        sections.append(
            f"<section><h2><a href=\"{escape(cert_url)}\">"
            f"{escape(exam.get('name', cert_id))}</a> "
            f"<span class=\"seo-hub-code\">({escape(exam.get('code', ''))})</span></h2>"
            f"<p>{count} practice questions with dedicated study pages.</p>"
            f"<ul class=\"seo-hub-list\">{''.join(sample_links)}</ul>{more}</section>"
        )

    home = site_url("/")
    browse = site_url("/browse/")
    canonical = site_url("/questions/")
    title = "Practice question library | Cert Master"
    description = (
        "Browse thousands of free AWS, Azure, Google Cloud, and CompTIA practice questions — "
        "each with its own crawlable page, explanation, and official documentation links."
    )
    head = render_seo_head(
        title=title,
        description=description,
        canonical=canonical,
        css_href="../css/styles.css",
        json_ld={
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": title,
            "description": description,
            "url": canonical,
        },
    )
    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
{head}
  </head>
  <body class="{seo_body_class()}">
    <header class="site-header seo-question-header">
      <a href="{escape(home)}" class="seo-brand-link">Cert Master</a>
    </header>
    <main class="seo-question-main seo-hub-main">
      <nav class="seo-breadcrumb" aria-label="Breadcrumb">
        <a href="{escape(home)}">Home</a>
        <span aria-hidden="true"> › </span>
        <a href="{escape(browse)}">Browse exams</a>
        <span aria-hidden="true"> › </span>
        <span>Question library</span>
      </nav>
      <h1>Practice question library</h1>
      <p class="seo-hub-lead">
        Every practice question has a dedicated URL for search and sharing — with the full stem,
        answer breakdown, and official documentation links.
      </p>
      {''.join(sections)}
    </main>
    {render_ad_unit()}
    {render_seo_footer()}
  </body>
</html>
"""


def render_cert_page(
    exam: dict,
    registry: dict,
    exams_by_id: dict,
) -> str:
    cert_id = exam["id"]
    meta_name = exam.get("name", cert_id)
    code = exam.get("code", "")
    vendor = exam.get("vendor", "aws")
    vendor_label = VENDOR_LABELS.get(vendor, vendor)
    qcount = len(exam.get("questions", []))
    domains = exam.get("domains", [])

    canonical = site_url(f"/cert/{cert_id}/")
    home = site_url("/")
    browse = site_url("/browse/")
    practice_url = f"{site_url('/')}?start={cert_id}"
    questions_hub = site_url("/questions/")

    title = f"{meta_name} ({code}) — Free Practice Exam | Cert Master"
    description = (
        f"Free {meta_name} practice exam: {qcount} original questions, domain-weighted quizzes, "
        f"timed mode, and official {vendor_label} study links. Exam code {code}."
    )

    domain_rows = []
    for d in domains:
        domain_rows.append(
            f"<tr><td>{escape(d.get('name', ''))}</td>"
            f"<td>{escape(str(d.get('weight', '')))}%</td></tr>"
        )
    domain_table = (
        "<table class=\"seo-cert-domains\"><thead><tr><th>Domain</th><th>Weight</th></tr></thead>"
        f"<tbody>{''.join(domain_rows)}</tbody></table>"
        if domain_rows
        else ""
    )

    by_cert = [
        (slug, registry["bySlug"][slug])
        for slug, m in registry["bySlug"].items()
        if m["certId"] == cert_id
    ]
    by_cert.sort(key=lambda x: x[0])
    q_links = []
    for slug, m in by_cert[:24]:
        q_links.append(
            f'<li><a href="{escape(site_url(f"/questions/{slug}/"))}">'
            f"{escape(m['textPreview'])}</a></li>"
        )
    q_section = ""
    if q_links:
        extra = len(by_cert) - len(q_links)
        extra_p = (
            f'<p class="seo-hub-more">Browse <a href="{escape(questions_hub)}">'
            f"all {len(by_cert)} indexed questions</a> for this exam.</p>"
            if extra > 0
            else ""
        )
        q_section = (
            "<section><h2>Sample practice questions</h2>"
            f'<ul class="seo-hub-list">{"".join(q_links)}</ul>{extra_p}</section>'
        )

    json_ld = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": meta_name,
        "description": description,
        "courseCode": code,
        "provider": {"@type": "Organization", "name": vendor_label},
        "url": canonical,
        "isAccessibleForFree": True,
        "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "courseWorkload": f"PT{exam.get('exam', {}).get('timeLimitMinutes', 90)}M",
        },
    }

    head = render_seo_head(
        title=title,
        description=description,
        canonical=canonical,
        css_href="../css/styles.css",
        json_ld=json_ld,
        og_type="website",
    )

    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
{head}
  </head>
  <body class="{seo_body_class()}">
    <header class="site-header seo-question-header">
      <a href="{escape(home)}" class="seo-brand-link">Cert Master</a>
    </header>
    <main class="seo-question-main">
      <nav class="seo-breadcrumb" aria-label="Breadcrumb">
        <a href="{escape(home)}">Home</a>
        <span aria-hidden="true"> › </span>
        <a href="{escape(browse)}">Browse exams</a>
        <span aria-hidden="true"> › </span>
        <span>{escape(meta_name)}</span>
      </nav>
      <article>
        <p class="seo-question-meta">
          <span class="seo-badge">{escape(code)}</span>
          <span class="seo-badge seo-badge-domain">{escape(vendor_label)}</span>
        </p>
        <h1>{escape(meta_name)} — free practice exam</h1>
        <p class="seo-hub-lead">
          {qcount} original practice questions aligned to official exam domains.
          Run a timed, domain-weighted quiz in your browser — no login required.
        </p>
        <div class="seo-cta-actions">
          <a class="btn btn-primary" href="{escape(practice_url)}">Start practice exam</a>
          <a class="btn btn-outline" href="{escape(questions_hub)}">Question library</a>
        </div>
        <section>
          <h2>Exam domains</h2>
          {domain_table}
        </section>
        {q_section}
      </article>
    </main>
    {render_ad_unit()}
    {render_seo_footer()}
  </body>
</html>
"""


def render_browse_page(index: dict) -> str:
    home = site_url("/")
    canonical = site_url("/browse/")
    title = "Browse certification practice exams | Cert Master"
    description = (
        "Free practice exams for AWS, Microsoft Azure, Google Cloud, and CompTIA certifications. "
        "Pick an exam, review domains, and start a timed practice test in your browser."
    )

    by_vendor: dict[str, list[dict]] = {}
    for entry in index.get("exams", []):
        by_vendor.setdefault(entry.get("vendor", "aws"), []).append(entry)

    sections = []
    for vendor in ("aws", "azure", "google", "comptia"):
        entries = by_vendor.get(vendor, [])
        if not entries:
            continue
        label = VENDOR_LABELS.get(vendor, vendor)
        lis = []
        for e in sorted(entries, key=lambda x: x.get("name", "")):
            cert_url = site_url(f"/cert/{e['id']}/")
            lis.append(
                f'<li><a href="{escape(cert_url)}"><strong>{escape(e.get("name", ""))}</strong></a> '
                f'<span class="seo-hub-code">({escape(e.get("code", ""))})</span> — '
                f'{e.get("questionCount", 0)} questions in bank</li>'
            )
        sections.append(f"<section><h2>{escape(label)}</h2><ul class=\"seo-hub-list\">{''.join(lis)}</ul></section>")

    json_ld = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": title,
        "description": description,
        "url": canonical,
        "numberOfItems": len(index.get("exams", [])),
    }

    head = render_seo_head(
        title=title,
        description=description,
        canonical=canonical,
        css_href="../css/styles.css",
        json_ld=json_ld,
    )

    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
{head}
  </head>
  <body class="{seo_body_class()}">
    <header class="site-header seo-question-header">
      <a href="{escape(home)}" class="seo-brand-link">Cert Master</a>
    </header>
    <main class="seo-question-main seo-hub-main">
      <h1>Browse certification practice exams</h1>
      <p class="seo-hub-lead">{escape(description)}</p>
      <p><a class="btn btn-primary" href="{escape(home)}">Open interactive exam picker</a></p>
      {''.join(sections)}
      <p><a href="{escape(site_url('/questions/'))}">Practice question library</a> — every question has its own SEO page.</p>
    </main>
    {render_ad_unit()}
    {render_seo_footer()}
  </body>
</html>
"""


def write_sitemap(slugs: list[str], cert_ids: list[str]) -> None:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    priority_urls = [
        (site_url("/"), "daily", "1.0"),
        (site_url("/browse/"), "weekly", "0.9"),
        (site_url("/questions/"), "weekly", "0.85"),
        (site_url("/about/"), "monthly", "0.7"),
        (site_url("/contact/"), "monthly", "0.65"),
        (site_url("/privacy/"), "yearly", "0.6"),
    ]
    for cid in cert_ids:
        priority_urls.append((site_url(f"/cert/{cid}/"), "weekly", "0.8"))

    entries = []
    for loc, changefreq, priority in priority_urls:
        entries.append(
            f"  <url><loc>{loc}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>{changefreq}</changefreq><priority>{priority}</priority></url>"
        )
    for s in slugs:
        loc = site_url(f"/questions/{s}/")
        entries.append(f"  <url><loc>{loc}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>")

    body = "\n".join(entries)
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n</urlset>\n"
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
    load_adsense_config()
    registry = build_slug_registry()
    slugs = sorted(registry["bySlug"].keys())

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    index_path = DATA_DIR / "questions-slugs.json"
    index_path.write_text(
        json.dumps(registry, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    exams_by_id = {e["id"]: e for e, _ in load_all_exams()}

    import shutil

    if QUESTIONS_DIR.exists():
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

    cert_ids = []
    if CERT_DIR.exists():
        for child in CERT_DIR.iterdir():
            if child.is_dir():
                shutil.rmtree(child)
            elif child.name != ".gitkeep":
                child.unlink()
    CERT_DIR.mkdir(parents=True, exist_ok=True)
    for exam, _path in load_all_exams():
        out = CERT_DIR / exam["id"]
        out.mkdir(parents=True, exist_ok=True)
        (out / "index.html").write_text(
            render_cert_page(exam, registry, exams_by_id),
            encoding="utf-8",
        )
        cert_ids.append(exam["id"])

    index_data = json.loads((DATA_DIR / "exams-index.json").read_text(encoding="utf-8"))
    BROWSE_DIR.mkdir(parents=True, exist_ok=True)
    (BROWSE_DIR / "index.html").write_text(
        render_browse_page(index_data),
        encoding="utf-8",
    )

    write_trust_pages()
    write_sitemap(slugs, sorted(cert_ids))
    write_robots()

    print(f"Wrote about/, contact/, privacy/")
    print(f"Wrote {count} question pages under questions/")
    print(f"Wrote {len(cert_ids)} cert landing pages under cert/")
    print(f"Wrote browse/index.html")
    print(f"Slug index: {index_path} ({len(slugs)} slugs)")
    print(f"Sitemap: {ROOT / 'sitemap.xml'} ({len(slugs) + len(cert_ids) + 6} URLs)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
