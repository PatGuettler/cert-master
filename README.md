# PracticeCert (AWS Cert Master)

Unofficial **static** practice exams for **AWS**, **Microsoft Azure**, **Google Cloud**, and **CompTIA**. No login, no backend — content is plain **JSON** in `data/exams/`.

## Live site

**[https://practicecert.com/](https://practicecert.com/)** (GitHub Pages + `CNAME`)

## Open-source content model

| File | Purpose |
|------|---------|
| `data/exams/*.json` | **Source of truth** — domains, questions, explanations, doc links |
| `data/exams-index.json` | Menu manifest (one row per exam file) |
| `data/questions-slugs.json` | Optional map for per-question URLs in the app |

**CI does not run Python.** Deploy uploads the repo as-is. Contributors edit JSON directly and open a PR.

### Change one question

1. Edit `data/exams/<exam-id>.json` → `questions[]`.
2. Commit. No scripts required.

### Add or remove an exam

1. Add/delete `data/exams/<exam-id>.json`.
2. Update `data/exams-index.json` (or run `python3 scripts/build-exams-index.py` locally once).
3. Optionally run `python3 scripts/build-questions-slugs.py` if you use question deep links.

See **[data/exams/README.md](data/exams/README.md)** for the JSON schema.

## Exams (37)

The menu loads **`data/exams-index.json`**. Current vendors:

- **AWS** — 14 exams (Cloud Practitioner through Security / ML / Database specialty)
- **Microsoft Azure** — 9 exams (AZ-900, AZ-104, AZ-204, AZ-305, AZ-400, AZ-500, SC-900, DP-900, AI-900)
- **Google Cloud** — 6 exams (Digital Leader, ACE, PCA, PDE, PCSE, PCDO)
- **CompTIA** — 8 exams (A+, Network+, Security+, CySA+, Linux+, Cloud+, Data+, PenTest+)

Each file holds **70–150+** practice questions aligned to official exam domains, with links to **official vendor documentation**. These are **not** real exam items.

**CompTIA acronym study:** several CompTIA JSON files include an `acronyms` array; use **Study acronyms** on the exam page.

## Exam behavior

- **Weighted random** selection per official domain weights
- Shuffled question and answer order
- Scored vs unscored counts per exam config (where applicable)
- Timed mode (toggle in menu)
- Progress in **localStorage** only (export/import in menu)

## Question JSON shape

```json
{
  "id": "clf-q001",
  "domain": "cloud-concepts",
  "type": "multiple-choice",
  "text": "Question stem?",
  "options": [{ "id": "a", "text": "Answer A" }],
  "correct": ["a"],
  "explanation": "Why this is correct.",
  "docs": [{ "title": "Topic", "url": "https://docs.aws.amazon.com/..." }]
}
```

Top-level exam object: `id`, `name`, `code`, `vendor`, `exam`, `domains`, `questions`, optional `acronyms`, optional `guideUrl`.

## Optional maintainer scripts

Under `scripts/` — run **locally** only when bulk-regenerating from fact banks (not used in GitHub Actions):

| Script | When to use |
|--------|-------------|
| `build-exams-index.py` | Rescan `data/exams/*.json` → refresh `exams-index.json` |
| `build-questions-slugs.py` | Rebuild `data/questions-slugs.json` after exam changes |
| `generate_all_vendors.py` | Regenerate all vendor banks from Python catalogs |
| `build-question-pages.py` | Generate static HTML under `questions/` (SEO; optional) |

## Local preview

```bash
cd aws-cert-master
python3 -m http.server 8080
```

Open `http://localhost:8080/`. ES modules need HTTP (not `file://`).

## Deploy

Push to `main`. **`.github/workflows/pages.yml`** deploys the repository root with no build step.

## Ads

See **[docs/ADS_SETUP.md](docs/ADS_SETUP.md)** for AdSense, `ads.txt`, and `data/ads-config.json`.

## Disclaimer

Not affiliated with AWS, Microsoft, Google, or CompTIA. Community study aids only; scores are approximate. Use official exam guides and training for authoritative information.
