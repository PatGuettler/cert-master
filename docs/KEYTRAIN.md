# KeyTrain Certification

KeyTrain is a **formal assessment mode** separate from **Practice certifications**.

| | Practice | KeyTrain |
|---|----------|----------|
| Purpose | Study and review | Pass/fail certification attempt |
| Feedback | Optional during exam | None until submit |
| Pause & resume | Yes (7 days) | Disabled |
| Outcome | History and weak areas | Pass or fail |
| Certificate | No | PDF after pass (name entered by user) |

## Routes

- Hub: `/keytrain/`
- Assessment info: `/keytrain/{keytrain-id}/`
- Certificate form: `/keytrain/{keytrain-id}/certificate/` (after pass)

## Data

- Catalog: `data/keytrain-index.json` — maps `kt-*` ids to practice `examId` in `data/exams/`
- Regenerate catalog from exams index:

```bash
python3 scripts/build-keytrain-index.py
```

Edit `ENABLED_EXAM_IDS` in that script to limit which exams appear in KeyTrain.

## Issuance storage

Passed attempts and certificate metadata are stored in `localStorage` under `cert-master:keytrainIssued`. PDFs are generated client-side with jsPDF (loaded on demand).

## Disclaimer

KeyTrain certificates are issued by Cert Master for study purposes. They are not affiliated with AWS, Microsoft, Google, or CompTIA.
