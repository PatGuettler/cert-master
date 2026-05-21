# Contributing to AWS Cert Master

Thank you for helping improve this free practice exam tool. The fastest way to add value is **new or better questions** in the JSON exam files.

## Adding a new certification

1. Copy `data/exams/cloud-practitioner.json` to `data/exams/your-exam-id.json`.
2. Update top-level fields: `id`, `name`, `code`, `exam`, `domains`, `questions`.
3. Ensure each domain `weight` sums to **100**.
4. Run `python3 scripts/build-exams-index.py` and commit both the new JSON and updated `data/exams-index.json`.
5. Open a pull request describing the exam code (e.g. SAA-C03) and question count.

No application code changes are required — the menu and features pick up new exams automatically.

## Adding or editing questions

Edit the cert file under `data/exams/`. Each question needs:

- `id` — unique within the file (e.g. `clf-q149`)
- `domain` — must match a `domains[].id`
- `type` — `multiple-choice` or `multiple-response`
- `text`, `options`, `correct`, `explanation`
- `docs` — optional array of `{ "title", "url" }` with **real** AWS documentation or Skill Builder links

Regenerate the CLF-C02 bank from Python sources (optional):

```bash
python3 scripts/generate-questions.py
```

## Quality guidelines

- Match the **official exam guide** domain weights and question style.
- Multiple-response questions must require **two or more** correct answers; say so in the stem.
- Explanations should teach *why* the answer is correct, not just restate it.
- Do not copy verbatim from paid practice tests or brain dumps.
- Link to official `aws.amazon.com`, `docs.aws.amazon.com`, `explore.skillbuilder.aws`, or `www.comptia.org` URLs only.
- Each `docs` link should match the topic of the question (service docs for service questions, exam objectives for CompTIA, etc.).

### Checking reference links

Before opening a PR that touches questions or generators:

```bash
python3 scripts/audit_doc_links.py --fix   # apply known URL fixes, then check
python3 scripts/audit_doc_links.py         # exit 1 if any URL fails HTTP check
```

To patch known stale URLs without a full regen:

```bash
python3 scripts/fix_doc_links.py
```

## Suggesting a question without a PR

Open a GitHub issue with:

- Certification (e.g. CLF-C02)
- Domain
- Question text and options
- Correct answer(s) and a short explanation
- Optional AWS doc link

## Code changes

Keep the site **static** (no backend). New features should use `localStorage` and stay optional via config files where possible.

See [README.md](README.md) for local preview and [docs/ADS_SETUP.md](docs/ADS_SETUP.md) for optional ads configuration.
