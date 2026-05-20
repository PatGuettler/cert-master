# AWS Cert Master

Unofficial **static** practice exams for AWS certifications, designed for [GitHub Pages](https://pages.github.com/). No login, no backend — each exam is a JSON file under `data/exams/`.

## Live site

After enabling GitHub Pages (see [Deploy](#deploy)), your site will be at:

`https://<your-github-username>.github.io/aws-cert-master/`

## Exams (dynamic list)

The hamburger menu loads exams from **`data/exams-index.json`**, which is built automatically from every `*.json` file in **`data/exams/`**.

| Exam | Code |
|------|------|
| AWS Certified Cloud Practitioner | CLF-C02 |
| AWS Certified AI Practitioner | AIF-C01 |
| AWS Certified Solutions Architect – Associate | SAA-C03 |
| AWS Certified Developer – Associate | DVA-C02 |
| AWS Certified Machine Learning Engineer – Associate | MLA-C01 |
| AWS Certified Data Engineer – Associate | DEA-C01 |
| AWS Certified CloudOps Engineer – Associate | SOA-C02 |
| AWS Certified Solutions Architect – Professional | SAP-C02 |
| AWS Certified DevOps Engineer – Professional | DOP-C02 |
| AWS Certified Generative AI Developer – Professional | AIP-C01 |
| AWS Certified Advanced Networking – Specialty | ANS-C01 |
| AWS Certified Security – Specialty | SCS-C02 |

Each cert has its own JSON under `data/exams/` (70–225+ practice questions per exam). Questions align with **official exam guide domains** and link to **AWS documentation** — they are **not** real exam items (AWS exam content is confidential).

**Regenerate all AWS banks:** `python3 scripts/generate_all_aws_exams.py`  
**Rebuild menu index:** `python3 scripts/build-exams-index.py`

**Add an exam:** drop `data/exams/my-exam.json` (valid exam schema, include `"vendor": "aws"`) → rebuild index → push.

**Remove an exam:** delete its JSON from `data/exams/` → rebuild the index → push.

GitHub Actions runs the index builder on every Pages deploy, so pushes that only change exam JSON still refresh the menu after deploy.

## Exam format (CLF-C02 example)

The practice test mirrors the official [CLF-C02 exam guide](https://docs.aws.amazon.com/aws-certification/latest/examguides/cloud-practitioner-02.html):

| Official domain | Weight | Questions per attempt |
|-----------------|--------|------------------------|
| Domain 1: Cloud Concepts | 24% | ~16 |
| Domain 2: Security and Compliance | 30% | ~20 |
| Domain 3: Cloud Technology and Services | 34% | ~22 |
| Domain 4: Billing, Pricing, and Support | 12% | ~8 |

Each attempt **randomly** selects 65 questions from the bank using those weights, then:

- **Shuffles** question order and answer option order
- Marks **50 scored** and **15 unscored** (like the real exam; unscored items do not affect your score)
- **90 minutes** (toggle off in the menu)
- **Passing score 700 / 1000** (scaled approximation from scored answers only)

The **home page** introduces the app, quick-start tiles, and a certification grid. Pick an exam to open its practice page (`#cert/<exam-id>`). **Menu → Home** returns to the app landing (no cert in the URL). **CompTIA** is a placeholder for future exams.

## Updating questions

1. Edit the exam file under **`data/exams/`** (e.g. `cloud-practitioner.json`).
2. Run `python3 scripts/build-exams-index.py` if you added or removed an exam file (not required for question-only edits).
3. Commit and push to `main`.

### Exam JSON shape (top level)

```json
{
  "id": "cloud-practitioner",
  "name": "AWS Certified Cloud Practitioner",
  "code": "CLF-C02",
  "exam": {
    "totalQuestions": 65,
    "scoredQuestions": 50,
    "timeLimitMinutes": 90,
    "passingScore": 700,
    "maxScore": 1000
  },
  "domains": [{ "id": "cloud-concepts", "name": "...", "weight": 24, "resources": [] }],
  "questions": []
}
```

Each question:

```json
{
  "id": "clf-q001",
  "domain": "cloud-concepts",
  "type": "multiple-choice",
  "text": "Question stem here?",
  "options": [{ "id": "a", "text": "Answer A" }],
  "correct": ["a"],
  "explanation": "Why this answer is correct.",
  "docs": [{ "title": "...", "url": "https://docs.aws.amazon.com/..." }]
}
```

- **`id`** (exam): must be unique across files; used in the menu and URL hash (`#cloud-practitioner`).
- **`domains[].weight`**: should sum to **100** for weighted random selection.
- **`scored`** on questions: optional; each attempt assigns 50 scored / 15 unscored at random.

### Regenerate the CLF-C02 question bank

```bash
python3 scripts/generate-questions.py
```

Writes `data/exams/cloud-practitioner.json` and refreshes `data/exams-index.json`.

## Project layout

```
index.html
css/styles.css
js/                     # cert-loader loads exams-index + exam JSON
data/
  exams-index.json      # Auto-generated manifest (commit this file)
  exams/
    cloud-practitioner.json
scripts/
  build-exams-index.py  # Scan data/exams/*.json → exams-index.json
  generate-questions.py
```

## Local preview

```bash
cd aws-cert-master
python3 scripts/build-exams-index.py   # if you changed data/exams/
python3 -m http.server 8080
```

Open `http://localhost:8080/`. ES modules require HTTP (not `file://`).

## Deploy

1. Push to GitHub on `main`.
2. Enable **GitHub Pages** (Actions workflow in `.github/workflows/pages.yml` runs `build-exams-index.py` before deploy).

Or use **Settings → Pages → Deploy from branch `main` / root** and run the index script locally before each push if you do not use Actions.

## Browser-only progress (localStorage)

Progress is saved **in this browser only** — no account required.

| Feature | Description |
|---------|-------------|
| **Progress dashboard** | Score trends, domain trends, weak areas, timing, and full history |
| **Resume exam** | Auto-saves every 30s; prompt on return (expires after 24h) |
| **Bookmarks** | Mark questions for review (like the real exam) |
| **Adaptive pool** | Missed questions appear more often over time |
| **Drill mode** | Up to 20 weak/missed questions after an exam |
| **My Data** (menu) | Export/import backup, clear history or everything |

Use **Export backup** in the menu before switching browsers or clearing site data.

## Optional ad bar

A small sponsored area (bottom or side) can be enabled without affecting the exam UI. Ads are **hidden during active exams**.

See **[docs/ADS_SETUP.md](docs/ADS_SETUP.md)** for Google AdSense integration, `ads.txt`, and `data/ads-config.json` options.

## Disclaimer

This project is **not affiliated with Amazon Web Services**. Questions are community-maintained study aids. Scores are approximate and do not guarantee exam results. Always use [official AWS exam guides](https://docs.aws.amazon.com/aws-certification/latest/examguides/cloud-practitioner-02.html) and [AWS Training](https://aws.amazon.com/training/) for authoritative information.
