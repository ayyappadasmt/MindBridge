# MindBridge — Full-Stack Integration

AI-powered mental wellness support platform.

```
mindbridge/
├── backend/    FastAPI + Vertex AI + Firebase + BigQuery (Cloud Run)
└── frontend/   React + Vite + TailwindCSS + Firebase Auth + Edge AI
```

## Quick Start (Local Development)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env: set PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_KEY, ENVIRONMENT=development

gcloud auth application-default login   # for Vertex AI + BigQuery
uvicorn app.main:app --reload --port 8080

# API docs: http://localhost:8080/docs
```

### Frontend

```bash
cd frontend
npm install

cp .env.example .env
# Edit .env: set Firebase config values from Firebase Console
# VITE_API_BASE_URL=http://localhost:8080

npm run dev
# App: http://localhost:5173
```

## Architecture

```
Browser (React)
  ├── Edge AI (local keyword scoring — text NEVER leaves device)
  ├── Firebase Auth (Google / Anonymous sign-in)
  └── API calls (Firebase JWT attached to every request)
        │
        ▼
  API Gateway (GCP)
        │
        ▼
  Cloud Run (FastAPI backend)
  ├── POST /pathway/analyze    → Vertex AI Gemini → SupportPathway
  ├── CRUD /safety-plan/       → Firestore
  ├── POST /notifications/     → FCM
  └── GET  /insights/community → BigQuery (anonymized aggregates)
```

## Privacy Model

- Raw journal text **never leaves the user's browser**
- Edge AI runs 100% locally (keyword scoring in `edgeAI.js`)
- Only `distress_score` (float) and `distress_category` (string) are sent to the backend
- BigQuery stores only bucketed distress levels — no user IDs, no email, no raw text

## Team

| Member | Role |
|--------|------|
| 1 | Cloud Infrastructure, Docker, CI/CD, API Gateway, IAM |
| 2 | AI Orchestration, Vertex AI, Triage Logic, Safety Filters |
| 3 | Frontend, Edge AI, Firebase Auth, Offline Mode |
| 4 | FastAPI Backend, Firestore CRUD, Notifications, BigQuery |
