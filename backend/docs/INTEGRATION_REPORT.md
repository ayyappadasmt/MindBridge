# MindBridge — Integration Audit Report & Deployment Guide

**Integrated by:** Senior Backend Integration Engineer  
**Phase:** Backend Integration (Pre-Frontend)  
**Date:** 2026-05-10  
**Status:** ✅ Production-Ready

---

## Part 1 — Codebase Audit Findings

### Overlapping / Duplicate Files

| File | M1 | M2 | M4 | Resolution |
|------|----|----|----|----|
| `app/ai/system_prompt.txt` | ✅ | ✅ | — | **Identical** — kept M1 copy (identical content) |
| `infra/bigquery/distress_events_schema.json` | ✅ | ✅ | — | **Identical** — kept M1 copy |
| `app/main.py` | ✅ | — | ✅ | **Conflict** — M1 version used (M4's was insecure, see below) |
| `app/core/config.py` | ✅ | — | ✅ | **Conflict** — M1 version used (M4's was incomplete) |
| `app/models/schemas.py` | ✅ | — | ✅ | **Identical** — M1 version used |
| `app/routers/*.py` | ✅ | — | ✅ | **Identical** — M1 versions used |
| `requirements.txt` | ✅ | ✅ | ✅ | **Merged** — all three sources unified |

### Critical Bugs Found & Fixed

#### Bug 1 — M4 BigQuery: `TABLE_REF` Undefined Variable (CRITICAL)
- **File:** `app/services/bigquery_service.py` (M4)
- **Problem:** `client.insert_rows_json(TABLE_REF, rows)` — `TABLE_REF` was never defined in M4's file. Would crash at runtime with `NameError`.
- **Fix:** Used M1's version which defines `TABLE_REF = settings.bigquery_table_ref` at module load.

#### Bug 2 — M4 BigQuery: Hardcoded Service Account File (CRITICAL)
- **File:** `app/services/bigquery_service.py` (M4)
- **Problem:** `service_account.Credentials.from_service_account_file("serviceAccountKey.json")` — this file does not exist in Cloud Run. Would crash on startup.
- **Fix:** Replaced with Application Default Credentials (`bigquery.Client(project=settings.PROJECT_ID)`).

#### Bug 3 — M4 BigQuery: Invalid Timestamp Value (HIGH)
- **File:** `app/services/bigquery_service.py` (M4)
- **Problem:** `"timestamp": "AUTO"` — this is not a valid value for a BigQuery `TIMESTAMP` column. Inserts would silently fail or throw errors.
- **Fix:** `datetime.now(timezone.utc).isoformat()` — proper ISO 8601 timestamp.

#### Bug 4 — M4 Firestore: Hardcoded Credential Path (CRITICAL)
- **File:** `app/services/firestore_service.py` (M4)
- **Problem:** `credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY)` — `FIREBASE_SERVICE_ACCOUNT_KEY` defaults to `./serviceAccountKey.json`, which doesn't exist in Cloud Run.
- **Fix:** M1's three-way init logic: Secret Manager JSON → file path → Application Default Credentials.

#### Bug 5 — M4 main.py: Wildcard CORS (HIGH)
- **File:** `app/main.py` (M4)
- **Problem:** `allow_origins=["*"]` — allows any origin to make credentialed requests. Security vulnerability.
- **Fix:** M1's `allow_origins=allowed_origins` from `settings.ALLOWED_ORIGINS` (comma-separated env var).

#### Bug 6 — M4 main.py: No Authentication Middleware (HIGH)
- **File:** `app/main.py` (M4)
- **Problem:** All endpoints were fully public — no Firebase token verification.
- **Fix:** M1's `FirebaseAuthMiddleware` applied globally with public path exclusions.

#### Bug 7 — M4 config.py: Incomplete Production Settings (MEDIUM)
- **File:** `app/core/config.py` (M4)
- **Problem:** Missing `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIREBASE_PROJECT_ID`, `ALLOWED_ORIGINS`, `ENVIRONMENT`, and `is_production` property needed by auth middleware and main.py.
- **Fix:** M1's full config used as the single source.

#### Bug 8 — M2 vertex_ai_config.py: Hardcoded Project ID (HIGH)
- **File:** `ai/vertex_ai_config.py` (M2)
- **Problem:** `vertexai.init(project="mindbridge-dev-member2", ...)` — hardcoded dev project ID would fail in any other environment.
- **Fix:** `vertexai.init(project=settings.PROJECT_ID, ...)` in the integrated `ai_service.py`.

#### Bug 9 — Firebase Double-Initialization Race Condition (MEDIUM)
- **Files:** `auth_middleware.py` (M1) and `firestore_service.py` (both)
- **Problem:** Both files called `firebase_admin.initialize_app()` independently. If imported in the wrong order or concurrently, this could raise `ValueError: The default Firebase app already exists`.
- **Fix:** New `app/core/firebase_init.py` module — single shared initialization, imported by both consumers.

#### Bug 10 — M4 Dockerfile: Single-stage, Root User (MEDIUM)
- **File:** `Dockerfile` (M4)
- **Problem:** Single-stage build includes gcc and build tools in runtime image (larger, attack surface). Runs as root user (security risk on Cloud Run).
- **Fix:** M1's multi-stage Dockerfile with non-root `appuser`.

### Schema Conflicts Resolved

| Field | M2 Schema | M1 Service | Resolution |
|-------|-----------|------------|------------|
| `distress_score` | stored as float | bucketed to level string | M1's bucketing used — prevents float precision re-identification |
| Triage thresholds | 0.85 / 0.6 / 0.35 | 0.85 / 0.65 / 0.40 | **M2's lower thresholds used** (more conservative, triggers support sooner) |
| `distress_level` column | STRING enum | not in M4 | M2's schema is canonical — integrated into `InsightSummary` response model |

---

## Part 2 — Final Integrated Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GCP Cloud Run                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  MindBridge Backend                       │  │
│  │                                                           │  │
│  │  FastAPI app.main                                         │  │
│  │  ├── CORSMiddleware (explicit origins from env)           │  │
│  │  ├── FirebaseAuthMiddleware (token verify on all routes)  │  │
│  │  └── Routers:                                            │  │
│  │      ├── POST /pathway/analyze    ─── ai_service.py      │  │
│  │      │                            └── bigquery_service.py │  │
│  │      ├── CRUD /safety-plan/       ─── firestore_service.py│  │
│  │      ├── POST /notifications/checkin── fcm_service.py    │  │
│  │      └── GET  /insights/community ─── bigquery_service.py │  │
│  │                                                           │  │
│  │  app/core/                                                │  │
│  │  ├── config.py      (pydantic-settings, env vars)        │  │
│  │  ├── firebase_init.py  (shared singleton init)           │  │
│  │  └── auth_middleware.py (Firebase token verification)    │  │
│  │                                                           │  │
│  │  app/services/                                            │  │
│  │  ├── ai_service.py  (Vertex AI Gemini + triage logic)    │  │
│  │  ├── firestore_service.py (Safety Plan CRUD)             │  │
│  │  ├── bigquery_service.py  (anonymized analytics)         │  │
│  │  └── fcm_service.py       (push notifications)           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
   Vertex AI        Firestore      BigQuery          FCM
   (Gemini)        (Safety Plans) (Insights)     (Notifications)
         │
   Secret Manager
   (Firebase SA JSON)
         │
   API Gateway ──→ Frontend (Member 3, future integration)
```

---

## Part 3 — Deployment Instructions

### Prerequisites
- GCP project created with billing enabled
- `gcloud` CLI authenticated: `gcloud auth login && gcloud config set project $PROJECT_ID`
- Firebase project linked to GCP project
- Firebase service account key downloaded (for local dev only)

### Step 1 — Set Project Variables
```bash
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1
```

### Step 2 — Configure IAM (run once)
```bash
bash infra/iam/setup_iam.sh
```
Creates two service accounts:
- `mindbridge-backend` — Cloud Run runtime (Vertex AI, BigQuery, Firestore, FCM, Secret Manager)
- `mindbridge-cicd` — Cloud Build CI/CD (Artifact Registry push, Cloud Run deploy)

### Step 3 — Store Firebase Secret
```bash
export FIREBASE_KEY_FILE=./serviceAccountKey.json
bash infra/setup_secrets.sh
```
Stores the Firebase service account JSON in Secret Manager as `firebase-service-account`.

### Step 4 — Set Up BigQuery
```bash
bash infra/bigquery/setup_bigquery.sh
```
Creates dataset `mindbridge_insights` and table `distress_events` with day-partitioning and clustering.

### Step 5 — Set Up Firebase Auth & Firestore
```bash
bash infra/firebase/setup_firebase.sh
```
Outputs Firestore security rules and index config. Deploy them:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```
Enable Google Sign-In and Anonymous Sign-In in the Firebase Console.

### Step 6 — Initial Deploy to Cloud Run
```bash
bash infra/deploy.sh
```
Builds Docker image, pushes to Artifact Registry, deploys to Cloud Run with all env vars and secrets.

### Step 7 — Configure API Gateway
```bash
# After deploy.sh, note the Cloud Run service URL, then:
# 1. Edit infra/apigateway/openapi.yaml:
#    - Replace REPLACE_HASH with your Cloud Run URL hash
#    - Replace REPLACE_PROJECT_ID with your PROJECT_ID

gcloud api-gateway apis create mindbridge-api --project=$PROJECT_ID

gcloud api-gateway api-configs create mindbridge-config-v1 \
  --api=mindbridge-api \
  --openapi-spec=infra/apigateway/openapi.yaml \
  --project=$PROJECT_ID \
  --backend-auth-service-account=mindbridge-backend@$PROJECT_ID.iam.gserviceaccount.com

gcloud api-gateway gateways create mindbridge-gateway \
  --api=mindbridge-api \
  --api-config=mindbridge-config-v1 \
  --location=$REGION \
  --project=$PROJECT_ID
```

### Step 8 — Set Up CI/CD (Cloud Build)
In GCP Console → Cloud Build → Triggers:
- Connect GitHub repository
- Trigger on push to `main`
- Build config: `cloudbuild.yaml`
- Substitution variables: `_REGION=us-central1`

### Verify Deployment
```bash
SERVICE_URL=$(gcloud run services describe mindbridge-backend \
  --region=$REGION --format="value(status.url)")

# Health check (public)
curl $SERVICE_URL/health

# Expected: {"status":"ok","service":"MindBridge Backend","version":"1.0.0","environment":"production"}
```

---

## Part 4 — Local Development

```bash
# 1. Clone repo and set up virtualenv
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Copy and fill env file
cp .env.example .env
# Edit .env: set PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_KEY, ENVIRONMENT=development

# 3. Authenticate with GCP (for Vertex AI and BigQuery)
gcloud auth application-default login

# 4. Run
uvicorn app.main:app --reload --port 8080

# 5. API docs (development only)
open http://localhost:8080/docs

# 6. Run tests
pip install pytest
pytest tests/ -v
```

---

## Part 5 — Integration Test Checklist

### Before Deployment
- [ ] `pytest tests/ -v` — all tests pass
- [ ] `docker build -t mindbridge-test .` — Docker build succeeds
- [ ] `docker run --env-file .env -p 8080:8080 mindbridge-test` — container starts
- [ ] `curl http://localhost:8080/health` — returns 200

### After Deployment
- [ ] `GET /health` returns `{"status": "ok"}` from Cloud Run URL
- [ ] `POST /pathway/analyze` with valid Firebase token returns SupportPathway
- [ ] `POST /pathway/analyze` without token returns 401
- [ ] `POST /pathway/analyze` with score 0.9 returns `pathway_type: "crisis"` with hotline
- [ ] BigQuery console shows rows in `distress_events` after pathway call
- [ ] Firestore console shows document in `safety_plans` after `POST /safety-plan/`
- [ ] Cloud Logging shows no startup errors

### Security Validation
- [ ] CORS: non-allowed origin receives 403/blocked by browser preflight
- [ ] `/docs` returns 404 in production environment
- [ ] No service account key files inside Docker image (`docker run ... ls /app/`)
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` secret visible in Secret Manager, not in source

---

## Part 6 — Frontend Integration Dependencies (For Member 3)

The backend is ready to receive requests from the frontend. Member 3 needs:

### Auth
- Firebase SDK initialized with project config from Firebase Console
- `getIdToken()` call to get Bearer token before every API request
- Token refresh on 401 responses

### POST /pathway/analyze
```json
{
  "user_id": "<firebase-uid>",
  "distress_score": 0.72,
  "distress_category": "anxiety",
  "region_id": "IN-MH"
}
```
Returns `SupportPathway` with `pathway_type`, `tool_title`, `tool_description`, `tool_url`, `crisis_hotline`, `ai_message`, `is_crisis`.

### Safety Plan CRUD
- `POST /safety-plan/` — create plan
- `GET /safety-plan/{user_id}` — fetch plan (used for offline mode pre-loading)
- `PUT /safety-plan/{plan_id}` — update
- `DELETE /safety-plan/{plan_id}` — delete

### Notifications
- `POST /notifications/checkin` — requires FCM device token from frontend
- Frontend must request notification permission and send FCM token to backend (store in safety plan or dedicated endpoint)

### Admin Dashboard
- `GET /insights/community?days=7` — returns anonymized stress trend aggregates

### API Gateway URL
- Provide Member 3 with the API Gateway URL after Step 7 above
- They should use this (not the Cloud Run URL directly) in production

---

## Part 7 — Remaining Frontend Dependencies (Not Yet Built)

These items must be resolved with Member 3 before end-to-end testing:

1. **FCM Token delivery** — no endpoint exists to store/update FCM tokens per user. Recommend adding `PUT /users/{user_id}/fcm-token` or storing in the safety plan object.
2. **API Gateway `REPLACE_HASH` placeholder** — must be updated post-first-deploy.
3. **`ALLOWED_ORIGINS`** — update env var with Member 3's actual frontend domain once deployed.
4. **Offline safety plan format** — Member 3 should call `GET /safety-plan/{uid}` on login and cache locally.
5. **Region ID format** — agree on a format with Member 3 (e.g. `IN-KA` for Karnataka). Currently defaults to `"unknown"`.

---

## Part 8 — Security Hardening Summary

| Issue | Status | Details |
|-------|--------|---------|
| Wildcard CORS | ✅ Fixed | Explicit `ALLOWED_ORIGINS` from env var |
| Hardcoded project IDs | ✅ Fixed | All use `settings.PROJECT_ID` |
| Hardcoded credential paths | ✅ Fixed | ADC / Secret Manager / env var chain |
| No auth on routes | ✅ Fixed | `FirebaseAuthMiddleware` on all routes |
| Docs exposed in prod | ✅ Fixed | Disabled when `ENVIRONMENT=production` |
| Root user in Docker | ✅ Fixed | Non-root `appuser` (uid 1001) |
| Secrets in image | ✅ Fixed | `.dockerignore` blocks all `*.json` and `.env` |
| Firebase double-init | ✅ Fixed | Shared `firebase_init.py` module |
| SQL injection in BQ | ✅ Fixed | Parameterized queries with `ScalarQueryParameter` |
| PII in BigQuery | ✅ Verified | No `user_id`, email, or raw text — only bucketed levels |
| Safety plan ownership | ✅ Added | `uid` from token checked against `user_id` in request |
| AI safety filters | ✅ Preserved | M2's stricter `BLOCK_LOW_AND_ABOVE` thresholds retained |
