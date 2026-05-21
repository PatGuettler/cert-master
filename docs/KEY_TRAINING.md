# KeyTrain's Key Training

Hands-on cybersecurity practice aligned to the KeyTrain simulation domains (identity, email, data protection, endpoint, network, system hygiene, application, financial, physical, and compliance).

## Three ways to study

| Mode | Where | Behavior |
|------|--------|----------|
| **Practice test** | Browse → KeyTrain's Key Training, or `/key-training/` | Full timed-style bank, feedback optional, pause & resume |
| **Workshop** | `/key-training/workshops/` | ~1 question per sub-topic, immediate feedback, no timer |
| **KeyTrain certification** | KeyTrain hub → Key Training section, or `/keytrain/kt-keytrain-*` | Formal pass/fail, PDF certificate on pass |

## Categories (10)

1. Identity & Access Security  
2. Email Security  
3. Data Protection  
4. Endpoint Security  
5. Network Security  
6. System Hygiene  
7. Application Security  
8. Financial Security  
9. Physical Security  
10. Compliance & Governance  

## Regenerate content

```bash
python3 scripts/generate_key_training_exams.py
```

This writes `data/exams/keytrain-*.json`, rebuilds `data/exams-index.json`, and updates `data/keytrain-index.json` (with `"group": "key-training"`).

## Data

- Vendor: `keytraining` in exam JSON  
- Exam ids: `keytrain-identity-access`, `keytrain-email-security`, …  
- KeyTrain formal ids: `kt-keytrain-identity-access`, …
