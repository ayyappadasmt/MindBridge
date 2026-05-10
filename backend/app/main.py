"""
MindBridge Backend API — Production Entry Point
Integration: Member 1 (hardened CORS, Firebase auth middleware, prod docs toggle)
             + Member 4 (all routers)

Startup order:
  1. firebase_init (imported via auth_middleware) — Firebase Admin SDK
  2. Vertex AI init (imported via ai_service on first request)
  3. BigQuery client (module-level in bigquery_service)
  4. FastAPI app with all routers registered
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.auth_middleware import FirebaseAuthMiddleware
from app.routers import pathway, safety_plan, notifications, insights, chat

app = FastAPI(
    title="MindBridge Backend API",
    description=(
        "Privacy-first distress triage and community support platform. "
        "Raw journal text never leaves the user's device — only anonymized "
        "distress metadata is processed here."
    ),
    version="1.0.0",
    # Disable interactive docs in production to reduce attack surface (Member 1)
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
)

# ── CORS — Explicit allowed origins only (Member 1 fix, replaces M4's wildcard) ─
allowed_origins = [
    o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

# ── Firebase ID Token Verification (Member 1) ─────────────────────────────────
app.add_middleware(FirebaseAuthMiddleware)

# ── Routers (Member 4) ────────────────────────────────────────────────────────
app.include_router(pathway.router)
app.include_router(safety_plan.router)
app.include_router(notifications.router)
app.include_router(insights.router)
app.include_router(chat.router)


@app.get("/health", tags=["Health"])
def health_check():
    """Public health endpoint for Cloud Run liveness and readiness probes."""
    return {
        "status": "ok",
        "service": "MindBridge Backend",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }
