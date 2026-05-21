# Exam content (source of truth)

Each `*.json` file in this folder is one practice exam. The live site loads:

1. `data/exams-index.json` — menu list (one entry per file here)
2. `data/exams/<exam-id>.json` — full exam (domains, questions, optional `acronyms`)

## Edit a single question

Open the exam file (e.g. `cloud-practitioner.json`), find the question in the `questions` array by `id`, and change `text`, `options`, `correct`, `explanation`, or `docs`. Commit and push — **no build step required** for question-only edits.

```json
{
  "id": "clf-q001",
  "domain": "cloud-concepts",
  "type": "multiple-choice",
  "text": "Your question stem?",
  "options": [
    { "id": "a", "text": "Correct answer" },
    { "id": "b", "text": "Distractor" }
  ],
  "correct": ["a"],
  "explanation": "Why (a) is correct.",
  "docs": [
    {
      "title": "Official topic",
      "url": "https://docs.aws.amazon.com/..."
    }
  ]
}
```

## Add or remove an exam

1. Add or delete `data/exams/my-new-exam.json` (see top-level shape in the root README).
2. Update `data/exams-index.json`: add/remove an entry with `id`, `name`, `code`, `vendor`, `dataFile`, `questionCount`.
3. Optionally run `python3 scripts/build-exams-index.py` locally to regenerate the index from this folder.

## Vendors

Use `"vendor": "aws"`, `"azure"`, `"google"`, `"comptia"`, or `"keytraining"` (KeyTrain's Key Training). Every question should include `docs[]` with URLs only from official providers:

- Key Training → NIST, CISA, and other authoritative security guidance (see `scripts/generate_key_training_exams.py`)

- AWS → `docs.aws.amazon.com`, `aws.amazon.com`, Skill Builder
- Azure → `learn.microsoft.com`, `microsoft.com`
- Google Cloud → `cloud.google.com`
- CompTIA → `comptia.org`

See `scripts/question_bank/official_docs.py` if you use the optional generators.

## Bulk regeneration (optional)

Python scripts under `scripts/` can rebuild entire banks from fact catalogs. They are **not** run for exam JSON in CI — maintainers run them locally when adding hundreds of questions at once, then commit the JSON here.

## Pause and resume

Practice exams auto-save progress in the browser (localStorage) every 30 seconds and when you use **Pause & exit**. On the exam page, use **Continue exam** or **Start fresh** within seven days.

## Copyright and originality

Practice questions in this repo are **original** study items. Do **not** copy stems, answer choices, or explanations from AWS Skill Builder, certification exams, brain dumps, or other proprietary training banks. It is fine to cover the same **exam guide objectives** and link to **official AWS documentation**—rewrite scenarios in your own words.

## SEO pages (automatic on deploy)

CI runs `scripts/build-question-pages.py`, which generates crawlable HTML from these JSON files (`questions/`, `cert/`, `browse/`, `sitemap.xml`). See `docs/SEO.md`. The slug index `data/questions-slugs.json` is updated on each deploy build (committed copy is optional for local preview).
