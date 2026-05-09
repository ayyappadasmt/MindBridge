# MindBridge Backend — Member 4: Backend Logic & Integration

**Branch:** `feature/backend-api-member4`  
**Owner:** Ayyappa Das — AM.SC.U4CSE23209  
**Stack:** Python 3.11 · FastAPI · Firebase Firestore · Vertex AI · BigQuery · FCM · Cloud Run  

---

## What This Module Does

This is the core backend engine of MindBridge. It receives distress metadata from the frontend (Member 3), routes it through an AI triage pipeline (Member 2's Vertex AI), and returns the appropriate support tool — all without ever storing raw journal text.

```
Frontend (Member 3)
      │
      │  POST /pathway/analyze
      │  { distress_score: 0.75, distress_category: "anxiety" }
      ▼
Pathway Controller  ──► Vertex AI (Member 2)  ──► Support Message
      │
      ├──► Firestore: Safety Plan CRUD
      ├──► FCM: Push Notification Scheduler
      └──► BigQuery: Anonymized Community Insights (Admin Dashboard)
```

---

## Project Structure

```
mindbridge-backend/
├── app/
│   ├── main.py                     # FastAPI app entry point + CORS
│   ├── core/
│   │   └── config.py               # Env var loading via pydantic-settings
│   ├── models/
│   │   └── schemas.py              # All Pydantic request/response models
│   ├── routers/
│   │   ├── pathway.py              # POST /pathway/analyze
│   │   ├── safety_plan.py          # CRUD /safety-plan/
│   │   ├── notifications.py        # POST /notifications/checkin
│   │   └── insights.py             # GET /insights/community
│   └── services/
│       ├── ai_service.py           # Vertex AI orchestration + triage logic
│       ├── firestore_service.py    # Firestore read/write for safety plans
│       ├── fcm_service.py          # Firebase Cloud Messaging
│       └── bigquery_service.py     # BigQuery insert + query
├── Dockerfile                      # Optimized for Cloud Run cold starts
├── requirements.txt
└── .env                            # LOCAL ONLY — never committed
```

---

## API Endpoints

### 1. Pathway Controller — Core Feature
```
POST /pathway/analyze
```
Receives distress metadata from Member 3's edge AI. Returns a support tool recommendation and an AI-generated empathetic message.

**Request:**
```json
{
  "user_id": "firebase_uid_here",
  "distress_score": 0.75,
  "distress_category": "anxiety",
  "region_id": "kerala"
}
```

**Response:**
```json
{
  "pathway_type": "peer_support",
  "tool_title": "Talk to Someone",
  "tool_description": "Sometimes sharing helps...",
  "tool_url": "https://7cups.com",
  "crisis_hotline": null,
  "ai_message": "It sounds like you're carrying a lot right now..."
}
```

**Triage Logic (score → pathway):**

| Score Range | Pathway | Tool Returned |
|---|---|---|
| 0.00 – 0.39 | `grounding` | 5-4-3-2-1 technique |
| 0.40 – 0.64 | `breathing` | 4-7-8 breathing exercise |
| 0.65 – 0.84 | `peer_support` | 7cups / trusted contact |
| 0.85 – 1.00 | `crisis` | iCall + Vandrevala hotlines |

> **Privacy guarantee:** Raw journal text never reaches this endpoint. Only the score and category (produced on-device by Member 3) are transmitted.

---

### 2. Safety Plan CRUD

```
POST   /safety-plan/              # Create a new safety plan
GET    /safety-plan/{user_id}     # Fetch plan by Firebase UID
PUT    /safety-plan/{plan_id}     # Update existing plan
DELETE /safety-plan/{plan_id}     # Delete a plan
```

**Create request body:**
```json
{
  "user_id": "firebase_uid_here",
  "warning_signs": ["can't sleep", "feeling isolated"],
  "coping_strategies": ["call a friend", "go for a walk"],
  "support_contacts": ["Mom: 98765xxxxx"],
  "crisis_numbers": ["iCall: 9152987821"]
}
```

Stored in Firebase Firestore under the `safety_plans` collection. Member 3's frontend reads this for the offline safety plan feature.

---

### 3. Push Notification (FCM)

```
POST /notifications/checkin
```

**Request:**
```json
{
  "user_id": "firebase_uid_here",
  "fcm_token": "device_fcm_token_from_firebase",
  "message_title": "MindBridge Check-in",
  "message_body": "How are you feeling today? 💙"
}
```

Uses FCM HTTP v1 API with short-lived OAuth2 tokens (not legacy server keys). Member 3 needs to send their device's FCM token when registering.

---

### 4. Community Insights (Admin Dashboard)

```
GET /insights/community?days=7
```

Returns anonymized, aggregated BigQuery data for the admin dashboard. No user IDs or PII ever enter BigQuery — only `region_id`, `stress_category`, `distress_score_bucket`, and `timestamp`.

**Response:**
```json
[
  { "region_id": "kerala", "stress_category": "anxiety", "count": 42, "date": "2025-06-10" },
  { "region_id": "kerala", "stress_category": "burnout", "count": 18, "date": "2025-06-10" }
]
```

---

### 5. Health Check

```
GET /health
→ { "status": "ok", "service": "MindBridge Backend" }
```

---

## Local Setup (for teammates who want to run this)

**Prerequisites:** Python 3.11, pip, a `serviceAccountKey.json` from GCP

```bash
# 1. Clone and switch to this branch
git clone https://github.com/ayyappadasmt/MindBridge.git
cd MindBridge
git checkout feature/backend-api-member4
cd mindbridge-backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
.\venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env (ask Ayyappa for values)
cp .env.example .env

# 5. Run the server
uvicorn app.main:app --reload --port 8080

# 6. Open Swagger UI to test all endpoints
# → http://localhost:8080/docs
```

---

## Environment Variables

Create a `.env` file locally. **Never commit this file.**

```env
PROJECT_ID=your-gcp-project-id
REGION=us-central1
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
BIGQUERY_DATASET=mindbridge_insights
BIGQUERY_TABLE=distress_events
VERTEX_AI_MODEL=gemini-1.5-flash-001
```

For Cloud Run deployment, these are set as environment variables by Member 1 (do not hardcode them).

---

## Deployment

This service is containerized and deployed to Cloud Run by Member 1.

```bash
# Build image
docker build -t gcr.io/PROJECT_ID/mindbridge-backend .

# Push to registry
docker push gcr.io/PROJECT_ID/mindbridge-backend

# Deploy (Member 1 runs this)
gcloud run deploy mindbridge-backend \
  --image gcr.io/PROJECT_ID/mindbridge-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars PROJECT_ID=...,REGION=us-central1,...
```

After deployment, Cloud Run provides a public HTTPS URL — share it with Member 3 as the `BASE_URL`.

---

## Integration Notes by Teammate

---

### For Member 1 — Cloud Infrastructure

**IAM roles required** for the Cloud Run service account:

| Role | Purpose |
|---|---|
| `roles/datastore.user` | Firestore read/write for safety plans |
| `roles/bigquery.dataEditor` | Insert anonymized events |
| `roles/aiplatform.user` | Vertex AI text generation |
| `roles/firebase.sdkAdminServiceAgent` | FCM push notifications |

**BigQuery table to create before first deploy:**

```
Dataset:  mindbridge_insights
Table:    distress_events

Schema:
  region_id             STRING    REQUIRED
  stress_category       STRING    REQUIRED
  distress_score_bucket FLOAT64   REQUIRED
  timestamp             TIMESTAMP REQUIRED  (default: CURRENT_TIMESTAMP)
```

> Do NOT add `user_id` or any other user-identifiable column to this table. Privacy by design.

**Secret Manager:** Store `serviceAccountKey.json` as a secret, mount it at runtime instead of bundling in the image.

---

### For Member 2 — AI & Data Engineer

**Vertex AI model in use:**

```
gemini-1.5-flash-001
```

Update me if you're using a different model version — I'll change the `VERTEX_AI_MODEL` env var.

**System instruction lives in** `app/services/ai_service.py → SYSTEM_INSTRUCTION`. You can refine the wording, but these rules must be preserved:
- Never diagnose a mental illness
- Never recommend medication
- Always surface crisis resources at high distress scores
- Max 3 sentences in responses

**BigQuery schema I'm inserting** (confirm this matches your design):

```
region_id             STRING    (broad region, e.g. "kerala_south" — no city/street)
stress_category       STRING    (e.g. "anxiety", "grief", "burnout")
distress_score_bucket FLOAT64   (rounded to 1 decimal, e.g. 0.7 — not raw score)
timestamp             TIMESTAMP
```

---

### For Member 3 — Frontend & Edge AI

**Base URL** (available after Member 1 deploys):

```
https://mindbridge-backend-xxxx-uc.a.run.app
```

**The one endpoint your app calls on every journal analysis:**

```
POST {BASE_URL}/pathway/analyze
Content-Type: application/json

{
  "user_id": "<firebase_uid>",
  "distress_score": 0.75,          ← float from your TFLite model, 0.0–1.0
  "distress_category": "anxiety",  ← string label from your on-device classifier
  "region_id": "kerala"            ← broad region only (no street/city names)
}
```

> Only send the **metadata** from your on-device model. Raw journal text must never leave the device.

**Safety plan endpoints** (for offline safety plan UI):

```
GET  {BASE_URL}/safety-plan/{firebase_uid}   → load user's plan on app start
POST {BASE_URL}/safety-plan/                 → save new plan
PUT  {BASE_URL}/safety-plan/{plan_id}        → update plan
```

Cache the GET response locally (AsyncStorage / SharedPreferences) so the plan loads even without internet — this satisfies the offline mode requirement.

**FCM integration:**

```
POST {BASE_URL}/notifications/checkin
{
  "user_id": "<firebase_uid>",
  "fcm_token": "<device_fcm_token>",   ← get this from FirebaseMessaging.getToken()
  "message_title": "MindBridge Check-in",
  "message_body": "How are you feeling today? 💙"
}
```

Send me the FCM token when the user logs in or when it refreshes.

**Admin dashboard data** (if you're building the insights view):

```
GET {BASE_URL}/insights/community?days=7
```

Returns an array of `{ region_id, stress_category, count, date }` — no PII.

**Test all endpoints interactively:** `{BASE_URL}/docs`

---

## Safety & Privacy Design

| Principle | Implementation |
|---|---|
| Raw journal text stays on device | Pathway endpoint receives only score + category |
| No PII in BigQuery | Only region, category, bucketed score, timestamp |
| AI cannot diagnose | System instruction + Vertex AI safety filters block harmful output |
| Crisis resources always surface at high distress | Hard-coded threshold at score ≥ 0.85 |
| Firestore access scoped per user | Queries filter by `user_id` from Firebase Auth |

---

## SDG Alignment

- **SDG 3 – Good Health:** Early, non-clinical distress triage with escalating support pathways
- **SDG 10 – Reduced Inequalities:** Privacy-first design removes cost and stigma barriers; multilingual-ready API
- **SDG 9 – Innovation:** Serverless, scalable microservice architecture on GCP Cloud Run

---

## Contact

**Ayyappa Das** — AM.SC.U4CSE23209  
Branch: `feature/backend-api-member4`  
For questions about API contracts or integration, open a GitHub issue on this repo tagging `@ayyappadasmt`.
