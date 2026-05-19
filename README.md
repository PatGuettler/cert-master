# AWS Cert Master

Unofficial **static** practice exams for AWS certifications, designed for [GitHub Pages](https://pages.github.com/). No login, no backend — questions live in JSON files you edit in this repo.

## Live site

After enabling GitHub Pages (see [Deploy](#deploy)), your site will be at:

`https://<your-github-username>.github.io/aws-cert-master/`

## Current certifications

| Cert | Code | Question file |
|------|------|----------------|
| AWS Certified Cloud Practitioner | CLF-C02 | [`data/cloud-practitioner.json`](data/cloud-practitioner.json) |

More certs can be added by creating a new JSON file and registering it in [`data/certs-registry.json`](data/certs-registry.json).

## Exam format (CLF-C02)

The practice test mirrors the official exam structure:

- **65 questions** (50 scored, 15 unscored in the real exam — unscored items are marked `"scored": false` in JSON)
- **90 minutes** (toggle off in the menu)
- **Passing score 700 / 1000** (scaled approximation from your scored answers)

Open the **hamburger menu** to:

- Switch certification (as more are added)
- Turn the **90-minute time limit** on or off
- Enable **feedback after each answer** (correct/incorrect + explanation)
- Toggle **AWS documentation links** in feedback

After the exam you get a **pass/fail report**, **domain breakdown**, optional **study plan** with official AWS Skill Builder, documentation, and whitepaper links for weak domains.

## Updating questions

1. Edit **`data/cloud-practitioner.json`** (or the JSON for another cert).
2. Commit and push to `main`.
3. GitHub Pages redeploys automatically; refresh the site to see changes.

### Question JSON shape

```json
{
  "id": "clf-q001",
  "domain": "cloud-concepts",
  "type": "multiple-choice",
  "scored": true,
  "text": "Question stem here?",
  "options": [
    { "id": "a", "text": "Answer A" },
    { "id": "b", "text": "Answer B" }
  ],
  "correct": ["a"],
  "explanation": "Why this answer is correct.",
  "docs": [
    {
      "title": "AWS Well-Architected Framework",
      "url": "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html"
    }
  ]
}
```

- **`type`**: `"multiple-choice"` (one correct) or `"multiple-response"` (two or more correct).
- **`domain`**: Must match a `domains[].id` in the same file.
- **`scored`**: Set `false` for practice-only questions (not counted toward pass/fail).

### Regenerate the sample bank

The repo includes a generator script with 65 starter questions:

```bash
python3 scripts/generate-questions.py
```

This overwrites `data/cloud-practitioner.json`. Prefer editing that file directly once you customize content.

## Project layout

```
index.html              # App shell
css/styles.css          # Styles
js/                     # ES modules (loader, exam, scoring, study plan)
data/
  certs-registry.json   # List of certs and JSON paths
  cloud-practitioner.json
scripts/
  generate-questions.py
```

## Local preview

GitHub Pages serves the repo root. Preview locally with any static server, for example:

```bash
cd aws-cert-master
python3 -m http.server 8080
```

Open `http://localhost:8080/`. ES modules require HTTP (not `file://`).

## Deploy

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **`main`** and folder **`/ (root)`**.
5. Save. The site updates within a few minutes after each push to `main`.

`.nojekyll` is included so GitHub Pages does not process the site with Jekyll (which can break paths).

## Adding another certification

1. Copy `data/cloud-practitioner.json` as a template (update `id`, `name`, `code`, `exam`, `domains`, `questions`).
2. Add an entry to `data/certs-registry.json` with `"available": true` and the correct `dataFile` path.
3. Commit and push.

## Disclaimer

This project is **not affiliated with Amazon Web Services**. Questions are community-maintained study aids. Scores are approximate and do not guarantee exam results. Always use [official AWS exam guides](https://docs.aws.amazon.com/aws-certification/latest/examguides/cloud-practitioner-02.html) and [AWS Training](https://aws.amazon.com/training/) for authoritative information.
