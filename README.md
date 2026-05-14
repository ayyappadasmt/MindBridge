<div align="center">

  <img src="frontend/public/mindbridge-banner.png" alt="MindBridge Banner" width="100%" />


[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)](README.md)
[![Status](https://img.shields.io/badge/status-integrated-green.svg?style=for-the-badge)](README.md)
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB.svg?style=for-the-badge&logo=react&logoColor=white)](frontend/)
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](backend/)
[![Firebase](https://img.shields.io/badge/auth-Firebase-FFCA28.svg?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Cloud](https://img.shields.io/badge/cloud-Google%20Cloud-4285F4.svg?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/)
[![Vertex AI](https://img.shields.io/badge/AI-Vertex%20AI-8E75B2.svg?style=for-the-badge)](https://cloud.google.com/vertex-ai)

[About](#about) | [Architecture](#architecture) | [Tech Stack](#tech-stack) | [Getting Started](#getting-started) | [API](#api-reference) | [Deployment](#deployment) | [Security](#security-and-privacy)

</div>

---

## Table of Contents

- [About](#about)
- [What It Does](#what-it-does)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Security and Privacy](#security-and-privacy)
- [Testing](#testing)
- [Project Status](#project-status)
- [Developers](#developers)
- [License](#license)

---

## About

MindBridge is a privacy-first mental wellness support platform designed to help users reflect, identify distress patterns, and receive structured support pathways without exposing raw journal content to the backend.

The platform combines browser-side distress scoring, Firebase Authentication, FastAPI services, Vertex AI pathway generation, Firestore safety-plan storage, Firebase Cloud Messaging, and BigQuery-based anonymized community insights.

The core design principle is simple: raw journal text stays on the user's device. Only minimal distress metadata is sent to the backend when additional support is required.

---

## What It Does

- Allows users to reflect through a secure frontend interface
- Performs local distress scoring directly in the browser
- Keeps raw journal text on the user's device
- Sends only distress score, category, and minimal metadata to the backend
- Authenticates users through Firebase Authentication
- Generates AI-guided support pathways using Vertex AI
- Stores safety plans securely in Firestore
- Sends notification messages through Firebase Cloud Messaging
- Stores anonymized distress events in BigQuery for aggregate insights
- Runs the backend as a Dockerized FastAPI service on Google Cloud Run

---

## Architecture

```mermaid
graph TB
  USER[User] --> UI[React + Vite Frontend]

  UI --> AUTH[Firebase Authentication]
  UI --> EDGE[On-device Distress Scoring]
  UI --> ROUTES[Protected Routes]

  EDGE --> LOCAL[Local Browser Processing]
  LOCAL --> PRIVACY[Raw Journal Text Stays on Device]

  EDGE -->|Distress Score + Category Only| API[FastAPI Backend]

  AUTH -->|Firebase ID Token| API

  API --> MIDDLEWARE[Firebase Auth Middleware]

  MIDDLEWARE --> PATHWAY[Pathway Router]
  MIDDLEWARE --> SAFETY[Safety Plan Router]
  MIDDLEWARE --> NOTIFY[Notifications Router]
  MIDDLEWARE --> INSIGHTS[Insights Router]
  MIDDLEWARE --> CHAT[Chat Router]

  PATHWAY --> TRIAGE[Triage Engine]
  TRIAGE --> VERTEX[Vertex AI Gemini]
  VERTEX --> SUPPORT[Generated Support Pathway]

  SAFETY --> FIRESTORE[Cloud Firestore]
  NOTIFY --> FCM[Firebase Cloud Messaging]
  INSIGHTS --> BIGQUERY[BigQuery]
  CHAT --> AI_SERVICE[AI Service]

  BIGQUERY --> AGG[Anonymized Community Insights]
  FIRESTORE --> PLAN[User Safety Plans]
  FCM --> PUSH[Push Notifications]

  SUPPORT --> UI
  AGG --> UI
  PLAN --> UI
  PUSH --> UI

  API --> DOCKER[Docker Container]
  DOCKER --> CLOUDRUN[Google Cloud Run]
  CLOUDRUN --> APIGW[API Gateway]
  CLOUDRUN --> SECRETS[Secret Manager]

  style UI fill:#1e40af,stroke:#3b82f6,stroke-width:2px,color:#fff
  style EDGE fill:#0f766e,stroke:#14b8a6,stroke-width:2px,color:#fff
  style API fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
  style VERTEX fill:#92400e,stroke:#f59e0b,stroke-width:2px,color:#fff
  style FIRESTORE fill:#4c1d95,stroke:#8b5cf6,stroke-width:2px,color:#fff
  style BIGQUERY fill:#701a75,stroke:#d946ef,stroke-width:2px,color:#fff
  style FCM fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
  style CLOUDRUN fill:#1e3a8a,stroke:#6366f1,stroke-width:2px,color:#fff
```

### Architecture Flow

1. The user interacts with the React frontend.
2. The browser performs local distress scoring.
3. Raw journal text remains on the user's device.
4. If the distress threshold is reached, the frontend sends only distress score, category, and minimal metadata to the backend.
5. Firebase Authentication provides an ID token for protected requests.
6. The FastAPI backend verifies the token through Firebase Admin middleware.
7. The Pathway Router invokes the triage engine.
8. Vertex AI generates a structured support pathway.
9. Firestore stores user safety plans.
10. BigQuery stores anonymized events for aggregate insights.
11. Firebase Cloud Messaging handles notification delivery.
12. The backend runs as a Dockerized service on Google Cloud Run.

---

## Core Components

| Component | Responsibility |
|----------|----------------|
| React Frontend | User interface, protected routes, local distress scoring, Firebase client authentication |
| Edge Distress Scoring | Performs browser-side analysis without sending raw journal text to the backend |
| Firebase Authentication | Handles sign-in, session state, and ID token generation |
| FastAPI Backend | Provides protected API routes and orchestrates backend services |
| Firebase Auth Middleware | Verifies Firebase ID tokens on protected backend endpoints |
| Triage Engine | Converts distress metadata into structured prompts for AI pathway generation |
| Vertex AI | Generates personalized support pathways |
| Firestore Service | Stores and retrieves user safety plans |
| Firebase Cloud Messaging | Sends notification messages to registered clients |
| BigQuery Service | Stores anonymized distress events and powers aggregate insights |
| Google Cloud Run | Hosts the containerized backend service |
| API Gateway | Provides managed routing for production API access |
| Secret Manager | Stores sensitive production configuration |

---

## Tech Stack

### Frontend

| Tech | Purpose |
|------|---------|
| React | Component-based frontend framework |
| Vite | Frontend build tool and development server |
| Tailwind CSS | Utility-first styling |
| Firebase Authentication | Client-side authentication |
| React Router | Client-side routing |
| Axios | API request handling |
| Framer Motion | Interface animations |
| Recharts | Data visualization |
| Lucide React | Icon system |

### Backend

| Tech | Purpose |
|------|---------|
| Python | Backend programming language |
| FastAPI | API framework |
| Uvicorn | ASGI server |
| Firebase Admin SDK | Token verification and Firebase service access |
| Google Cloud Firestore | Safety plan persistence |
| Google Cloud BigQuery | Anonymized analytics and insights |
| Vertex AI | AI support pathway generation |
| Firebase Cloud Messaging | Notification delivery |
| Docker | Backend containerization |

### Cloud and Infrastructure

| Layer | Technology |
|------|------------|
| Backend Hosting | Google Cloud Run |
| API Routing | Google API Gateway |
| Build Pipeline | Google Cloud Build |
| Secrets | Google Secret Manager |
| Authentication | Firebase Authentication |
| Database | Firestore |
| Analytics | BigQuery |
| AI | Vertex AI |
| Notifications | Firebase Cloud Messaging |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm
- Python 3.10 or later
- Docker
- Google Cloud CLI
- Firebase project
- Google Cloud project with billing enabled

### Backend Setup

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

For Linux or macOS:

```bash
source .venv/bin/activate
```

For Windows PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the backend environment file:

```bash
cp .env.example .env
```

Authenticate Google Cloud locally:

```bash
gcloud auth application-default login
```

Run the backend:

```bash
uvicorn app.main:app --reload --port 8080
```

Backend URL:

```text
http://localhost:8080
```

Development API documentation:

```text
http://localhost:8080/docs
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create the frontend environment file:

```bash
cp .env.example .env
```

Run the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Configuration

### Backend Environment

```env
PROJECT_ID=your-gcp-project-id
REGION=us-central1

VERTEX_AI_MODEL=gemini-1.5-flash-001

BIGQUERY_DATASET=mindbridge_insights
BIGQUERY_TABLE=distress_events

FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
FIREBASE_SERVICE_ACCOUNT_JSON=

FIREBASE_PROJECT_ID=your-firebase-project-id

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173

ENVIRONMENT=development
```

### Backend Variable Reference

| Variable | Description |
|----------|-------------|
| `PROJECT_ID` | Google Cloud project ID |
| `REGION` | Google Cloud region used by backend services |
| `VERTEX_AI_MODEL` | Vertex AI model used for pathway generation |
| `BIGQUERY_DATASET` | BigQuery dataset for anonymized insight events |
| `BIGQUERY_TABLE` | BigQuery table for distress event records |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Local path to Firebase service account JSON |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase service account JSON string for production |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins |
| `ENVIRONMENT` | Runtime environment such as development or production |

### Frontend Environment

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

VITE_API_BASE_URL=http://localhost:8080

VITE_DISTRESS_THRESHOLD=0.65
```

### Frontend Variable Reference

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase application ID |
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_DISTRESS_THRESHOLD` | Minimum local distress score required to call backend pathway analysis |

---

## API Reference

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Cloud Run health and readiness check |

### Pathway

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/pathway` | Generate a structured support pathway from distress metadata |

### Safety Plan

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/safety-plan` | Retrieve the authenticated user's safety plan |
| `POST` | `/safety-plan` | Create or update a safety plan |
| `DELETE` | `/safety-plan` | Delete a safety plan |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/notifications/register` | Register a client device for notifications |
| `POST` | `/notifications/send` | Send a notification through Firebase Cloud Messaging |

### Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/insights` | Retrieve anonymized aggregate community insights |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Access AI-supported chat functionality |

### Example: Generate Pathway

```bash
curl -X POST http://localhost:8080/pathway \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "distress_score": 0.82,
    "distress_category": "high",
    "signals": ["hopelessness", "isolation"],
    "timestamp": "2026-05-14T10:00:00Z"
  }'
```

### Example: Get Safety Plan

```bash
curl -X GET http://localhost:8080/safety-plan \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

---

## Deployment

The backend includes infrastructure configuration for deployment to Google Cloud.

### Deployment Components

| Component | Purpose |
|----------|---------|
| `backend/Dockerfile` | Container definition for the FastAPI backend |
| `backend/cloudbuild.yaml` | Cloud Build configuration |
| `backend/infra/deploy.sh` | Deployment automation script |
| `backend/infra/apigateway/openapi.yaml` | API Gateway OpenAPI configuration |
| `backend/infra/bigquery/setup_bigquery.sh` | BigQuery dataset and table setup |
| `backend/infra/firebase/setup_firebase.sh` | Firebase-related setup |
| `backend/infra/iam/setup_iam.sh` | IAM role and service account setup |
| `backend/infra/setup_secrets.sh` | Secret Manager setup |

### Enable Required Google Cloud Services

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable apigateway.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### Configure Project

```bash
gcloud config set project YOUR_PROJECT_ID
```

### Run Infrastructure Setup

```bash
cd backend
bash infra/iam/setup_iam.sh
bash infra/bigquery/setup_bigquery.sh
bash infra/firebase/setup_firebase.sh
bash infra/setup_secrets.sh
```

### Build and Deploy

```bash
gcloud builds submit --config cloudbuild.yaml
```

Alternative deployment script:

```bash
bash infra/deploy.sh
```

---

## Project Structure

```text
MindBridge-final-integrated/
├── README.md
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── system_prompt.txt
│   │   │   └── triage_engine.py
│   │   ├── core/
│   │   │   ├── auth_middleware.py
│   │   │   ├── config.py
│   │   │   └── firebase_init.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   ├── routers/
│   │   │   ├── chat.py
│   │   │   ├── insights.py
│   │   │   ├── notifications.py
│   │   │   ├── pathway.py
│   │   │   └── safety_plan.py
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── bigquery_service.py
│   │   │   ├── fcm_service.py
│   │   │   └── firestore_service.py
│   │   └── main.py
│   ├── docs/
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   └── INTEGRATION_REPORT.md
│   ├── infra/
│   │   ├── apigateway/
│   │   ├── bigquery/
│   │   ├── firebase/
│   │   ├── iam/
│   │   ├── deploy.sh
│   │   └── setup_secrets.sh
│   ├── tests/
│   ├── Dockerfile
│   ├── cloudbuild.yaml
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── config/
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── docs/
    └── E2E_INTEGRATION_REPORT.md
```

---

## Routes

| Path | Page |
|------|------|
| `/` | Landing or home page |
| `/login` | User authentication page |
| `/dashboard` | Main user dashboard |
| `/journal` | Journal and reflection interface |
| `/pathway` | AI-generated support pathway view |
| `/safety-plan` | Safety plan management |
| `/insights` | Community insights and analytics |
| `/notifications` | Notification preferences or notification view |
| `/settings` | User and application settings |

---

## Security and Privacy

MindBridge is designed around minimal data exposure.

### Privacy Controls

- Raw journal text remains on the user's device.
- Raw journal text is not sent to the backend.
- Raw journal text is not stored in Firestore or BigQuery.
- The backend receives only distress score, distress category, and minimal metadata.
- BigQuery stores anonymized and bucketed distress events.
- Community insights are generated only from aggregate data.

### Security Controls

- Firebase Authentication protects user sessions.
- Firebase ID tokens are verified by backend middleware.
- CORS is restricted through an explicit allowlist.
- API documentation can be disabled in production.
- Production credentials can be stored in Secret Manager.
- Backend services are containerized with Docker.
- Cloud Run provides managed deployment isolation.
- IAM roles should follow least-privilege access.

### Recommended Production Practices

- Do not commit `.env` files.
- Do not commit Firebase service account keys.
- Use Secret Manager for production credentials.
- Restrict Cloud Run ingress when appropriate.
- Review API Gateway access controls.
- Rotate credentials periodically.
- Keep Firebase Authentication providers intentionally scoped.
- Review CORS origins before production deployment.

---

## Testing

### Backend Tests

```bash
cd backend
pytest
```

If `pytest` is not installed:

```bash
pip install pytest
```

### Frontend Linting

```bash
cd frontend
npm run lint
```

### Frontend Production Build

```bash
npm run build
```

---

## Project Status

MindBridge is an integrated full-stack prototype with a cloud-ready backend and privacy-first frontend workflow.

### Implemented

- React frontend structure
- Firebase Authentication integration
- Local distress scoring workflow
- Protected backend API calls
- FastAPI backend routing
- Firebase token verification middleware
- Vertex AI pathway generation
- Firestore safety plan operations
- Firebase Cloud Messaging service integration
- BigQuery aggregate insight support
- Dockerized backend
- Cloud Run deployment configuration
- API Gateway configuration
- Secret Manager setup scripts

### Planned Improvements

- Expanded safety-plan templates
- Improved analytics dashboard
- Enhanced notification scheduling
- More granular distress categories
- Additional frontend accessibility improvements
- End-to-end test coverage
- Production monitoring and alerting

---

## Developers
1. [Bhama M Namboodiri](https://github.com/BHAMA2004)
2. [Swathi B Raj](https://github.com/t0k1t00)
3. [Bhavana P H](https://github.com/bhavanaharshan)
4. [Ayyappadas M T](https://github.com/ayyappadasmt)

---

## License

This repository is intended for academic, demonstration, or internal project use. Add a license file before distributing or publishing the project publicly.

---

<div align="center">

MindBridge · Privacy-First Mental Wellness Support · Edge AI + Google Cloud

</div>
