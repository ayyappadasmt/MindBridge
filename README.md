# MindBridge - AI Layer

This branch contains the AI Research & Data Engineering components for MindBridge.

## Features
- Vertex AI emotional support assistant
- AI safety filters
- Distress triage engine
- BigQuery schema for anonymized analytics

## Triage Thresholds
- >= 0.85 → crisis support
- >= 0.6 → grounding exercise
- >= 0.35 → journaling prompt
- < 0.35 → positive check-in

## BigQuery
Dataset: `mindbridge_insights`  
Table: `distress_events`

No personally identifiable information (PII) is stored.

## Files
- `ai/triage_engine.py`
- `ai/vertex_ai_config.py`
- `ai/system_prompt.txt`
- `schemas/distress_events_schema.json`
- `docs/member2_handoff.md`

## Member
Member 2 — AI Research & Data Engineer