## Architecture

MindBridge uses a privacy-first architecture where sensitive journal content is processed locally in the browser. The backend receives only minimal distress metadata when additional support is needed.

```mermaid
flowchart LR
    subgraph Client["Client Layer"]
        USER[User]
        UI[React + Vite Frontend]
        EDGE[On-device Distress Scoring]
        FB_AUTH[Firebase Auth Client]
    end

    subgraph Backend["Backend Layer"]
        API[FastAPI Backend]
        AUTH_MW[Firebase Token Verification]
        PATHWAY[Pathway Service]
        SAFETY[Safety Plan Service]
        NOTIFY[Notification Service]
        INSIGHTS[Insights Service]
    end

    subgraph AI["AI Layer"]
        TRIAGE[Triage Engine]
        VERTEX[Vertex AI Gemini]
    end

    subgraph Data["Data Layer"]
        FIRESTORE[(Cloud Firestore)]
        BIGQUERY[(BigQuery)]
    end

    subgraph Messaging["Messaging Layer"]
        FCM[Firebase Cloud Messaging]
    end

    subgraph Cloud["Cloud Infrastructure"]
        DOCKER[Docker Container]
        CLOUDRUN[Google Cloud Run]
        APIGW[API Gateway]
        SECRETS[Secret Manager]
    end

    USER --> UI
    UI --> EDGE
    UI --> FB_AUTH

    EDGE -->|Raw journal text remains local| UI
    EDGE -->|Distress score + category only| API

    FB_AUTH -->|Firebase ID token| API
    API --> AUTH_MW

    AUTH_MW --> PATHWAY
    AUTH_MW --> SAFETY
    AUTH_MW --> NOTIFY
    AUTH_MW --> INSIGHTS

    PATHWAY --> TRIAGE
    TRIAGE --> VERTEX
    VERTEX --> PATHWAY

    SAFETY --> FIRESTORE
    INSIGHTS --> BIGQUERY
    NOTIFY --> FCM

    PATHWAY --> UI
    SAFETY --> UI
    INSIGHTS --> UI
    FCM --> UI

    API --> DOCKER
    DOCKER --> CLOUDRUN
    APIGW --> CLOUDRUN
    CLOUDRUN --> SECRETS

    style Client fill:#eff6ff,stroke:#2563eb,stroke-width:1px
    style Backend fill:#f0fdf4,stroke:#16a34a,stroke-width:1px
    style AI fill:#fffbeb,stroke:#d97706,stroke-width:1px
    style Data fill:#faf5ff,stroke:#9333ea,stroke-width:1px
    style Messaging fill:#fef2f2,stroke:#dc2626,stroke-width:1px
    style Cloud fill:#f8fafc,stroke:#475569,stroke-width:1px
```

### Data Flow

| Step | Description |
|---|---|
| 1 | The user interacts with the React frontend. |
| 2 | Journal text is analyzed locally using browser-side distress scoring. |
| 3 | Raw journal text remains on the device and is not sent to the backend. |
| 4 | If the distress threshold is reached, only distress metadata is sent to FastAPI. |
| 5 | Firebase ID tokens are verified by the backend middleware. |
| 6 | Vertex AI generates a structured support pathway through the triage service. |
| 7 | Firestore stores user-specific safety plan data. |
| 8 | BigQuery stores anonymized aggregate distress events. |
| 9 | Firebase Cloud Messaging sends notifications when required. |
| 10 | The backend runs as a Dockerized service on Google Cloud Run. |

### Component Responsibilities

| Component | Responsibility |
|---|---|
| React Frontend | User interface, authentication flow, local distress scoring, protected routes |
| Firebase Authentication | User sign-in, session handling, ID token generation |
| FastAPI Backend | API routing, request validation, service orchestration |
| Firebase Auth Middleware | Backend-side verification of Firebase ID tokens |
| Triage Engine | Converts distress metadata into structured AI prompts |
| Vertex AI | Generates personalized support pathway responses |
| Firestore | Stores user safety plans and user-specific structured data |
| BigQuery | Stores anonymized events for aggregate community insights |
| Firebase Cloud Messaging | Sends notification messages to registered clients |
| Cloud Run | Hosts the containerized FastAPI backend |
| API Gateway | Provides managed API routing for production deployment |
| Secret Manager | Stores production credentials and sensitive configuration |
