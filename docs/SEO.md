# SEO and discoverability (Cert Master)

Production site: **https://practicecert.com/**

## What gets generated on deploy

GitHub Actions runs `scripts/build-question-pages.py` before Pages upload:

| Output | Purpose |
|--------|---------|
| `questions/{slug}/index.html` | One crawlable URL per practice question (~3k pages) |
| `questions/index.html` | Question library hub |
| `cert/{exam-id}/index.html` | Exam landing pages (domains, sample questions, CTA) |
| `browse/index.html` | Browse hub for crawlers (SPA still handles in-app navigation) |
| `data/questions-slugs.json` | Slug map for in-app links to study pages |
| `sitemap.xml` | All URLs for Google/Bing |
| `robots.txt` | Points to sitemap |

Generated paths are **gitignored**; they exist only on the deployed site artifact.

## Local preview

```bash
python3 scripts/build-question-pages.py
# optional: SITE_ORIGIN=https://practicecert.com
```

Serve the repo root with any static server and open `/questions/`, `/cert/cloud-practitioner/`, etc.

## Search best practices already in place

- Unique `<title>` and meta description per page
- Canonical URLs on `practicecert.com`
- Open Graph and Twitter card tags
- JSON-LD (`WebSite`, `Course`, `Quiz`, `CollectionPage`, `ItemList`)
- Internal links: home → browse → cert → questions
- `ads.txt` for AdSense verification
- Footer links to question library and sitemap

## Ads

Ad units render on static SEO pages (bottom slot from `data/ads-config.json`). The interactive app still hides ads during an active exam via `js/ads.js`.

After deploy, submit **https://practicecert.com/sitemap.xml** in [Google Search Console](https://search.google.com/search-console) and request indexing for `/`, `/browse/`, and a few `/cert/` URLs.

## Content updates

Edit `data/exams/*.json` and push. The next deploy rebuilds all SEO HTML from that JSON automatically.
