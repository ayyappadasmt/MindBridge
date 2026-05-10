# MindBridge — Production Deployment Guide
**Source: Member 1 (Cloud Infrastructure & Security Architect)**

---

## Infrastructure Audit Summary

### Issues Found & Fixed

| File | Issue | Fix Applied |
|------|-------|-------------|
| `bigquery_service.py` | Hardcoded `serviceAccountKey.json`; undefined `TABLE_REF` | ADC credentials; `settings.bigquery_table_ref` |
| `firestore_service.py` | Hardcoded file path — fails in Cloud Run | ADC + Secret Manager JSON fallback |
| `main.py` | Wildcard CORS `allow_origins=["*"]` | Restricted to `ALLOWED_ORIGINS` env var |
| `main.py` | No authentication middleware | Firebase ID token middleware added |
| `vertex_ai_config.py` | Hardcoded `project="mindbridge-dev-member2"` | Reads from `PROJECT_ID` env var |
| `config.py` | No validation on `PROJECT_ID` | Pydantic validator raises on empty/default |
| `Dockerfile` | Single-stage, runs as root | Multi-stage build, non-root `appuser` |
| All services | Secrets shipped in image or env | Secret Manager + ADC |

---

## Architecture

```
                    ┌─────────────────────────────┐
                    │   Member 3 Frontend (React)  │
                    │   Edge AI: keyword scoring   │
                    │   Only sends: score+category │
                    └─────────────┬───────────────┘
                                  │ HTTPS (Firebase JWT)
                                  ▼
                    ┌─────────────────────────────┐
                    │     GCP API Gateway          │
                    │   Firebase Auth validation   │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │      Cloud Run               │
                    │   MindBridge Backend         │
                    │   FastAPI + Uvicorn          │
                    └──┬──────┬──────┬────────────┘
                       │      │      │
               ┌───────▼┐  ┌──▼──┐  ┌▼──────────┐
               │Vertex AI│  │ BQ  │  │ Firestore  │
               │(Gemini) │  │     │  │ + Auth     │
               └─────────┘  └─────┘  └───────────┘
```

---

## GCP Services Required

| Service | Purpose | Notes |
|---------|---------|-------|
| Cloud Run | Backend hosting | Min instances: 1 for production |
| Artifact Registry | Docker image storage | Region: us-central1 |
| API Gateway | Entry point, auth | Firebase JWT validation |
| Secret Manager | Firebase SA JSON | 1 secret: `firebase-service-account` |
| Vertex AI | Gemini LLM | Model: `gemini-1.5-flash-001` |
| BigQuery | Anonymized analytics | Dataset: `mindbridge_insights` |
| Firebase Auth | User authentication | Google + Anonymous sign-in |
| Firestore | Safety plans | Collection: `safety_plans` |
| Cloud Build | CI/CD | Trigger: push to `main` |

---

## Step-by-Step Deployment

### 1. Enable GCP APIs

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  apigateway.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  bigquery.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

### 2. Configure IAM

```bash
bash infra/iam/setup_iam.sh
```

Creates:
- `mindbridge-backend@$PROJECT_ID.iam.gserviceaccount.com` (Cloud Run runtime)
- `mindbridge-cicd@$PROJECT_ID.iam.gserviceaccount.com` (Cloud Build)

### 3. Store Firebase Credentials

```bash
export FIREBASE_KEY_FILE=./serviceAccountKey.json
bash infra/setup_secrets.sh
```

### 4. Deploy BigQuery Schema

```bash
bash infra/bigquery/setup_bigquery.sh
```

### 5. Deploy Firebase Rules

```bash
bash infra/firebase/setup_firebase.sh
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 6. Deploy to Cloud Run

```bash
export PROJECT_ID=your-project-id
export REGION=us-central1
bash infra/deploy.sh
```

### 7. Configure API Gateway

After deploy.sh, follow the steps in `docs/INTEGRATION_REPORT.md` Part 3 Step 7.

### 8. Set Up CI/CD (Cloud Build)

Connect GitHub repo in GCP Console → Cloud Build → Triggers.
Build config: `cloudbuild.yaml`. Trigger on push to `main`.

---

## Health Check

```bash
SERVICE_URL=$(gcloud run services describe mindbridge-backend \
  --region=$REGION --format="value(status.url)")
curl $SERVICE_URL/health
# Expected: {"status":"ok","service":"MindBridge Backend","version":"1.0.0"}
```

---

## Environment Variables Reference

See `.env.example` for complete list with documentation.

Key variables:
- `PROJECT_ID` — GCP project ID (required, validated at startup)
- `FIREBASE_SERVICE_ACCOUNT_JSON` — SA JSON from Secret Manager (production)
- `FIREBASE_SERVICE_ACCOUNT_KEY` — File path to SA key (local dev only)
- `ALLOWED_ORIGINS` — Comma-separated CORS origins (include frontend URL)
- `ENVIRONMENT` — `development` | `staging` | `production`
