# Maintainer scripts (optional, not run in CI)

Exam content shipped to users lives in **`data/exams/*.json`**. Edit those files directly for most contributions.

Use these scripts only when bulk-regenerating from Python fact banks or refreshing indexes:

```bash
python3 scripts/build-exams-index.py      # data/exams/*.json → exams-index.json
python3 scripts/build-questions-slugs.py  # exam JSON → questions-slugs.json
python3 scripts/generate_all_vendors.py   # rebuild all vendor banks (large diff)
python3 scripts/run_build_inplace.py      # same as generate_all_vendors + log file
```

`build-question-pages.py` generates static HTML under `questions/` for SEO; the practice app does not require it.
