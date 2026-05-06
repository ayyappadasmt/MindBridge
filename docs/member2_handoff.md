# Member 2 Handoff

## Completed Tasks
- Vertex AI system prompt
- AI safety filters
- Distress triage engine
- BigQuery schema design

---

# 1. Triage Engine

File:
`ai/triage_engine.py`

## Purpose
Maps distress scores to support actions.

## Thresholds
- >= 0.85 → crisis support
- >= 0.6 → grounding exercise
- >= 0.35 → journaling prompt
- < 0.35 → positive check-in

## Usage

```python
from ai.triage_engine import process_user_state

payload = {
    "score": 0.82,
    "category": "anxiety"
}

result = process_user_state(payload)
print(result)