"""
MindBridge Backend API — Production Entry Point
Member 1 additions: hardened CORS, Firebase auth middleware, rate-limit headers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.auth_middleware import FirebaseAuthMiddleware
from app.routers import pathway, safety_plan, notifications, insights

app = FastAPI(
    title="MindBridge Backend API",
    description="Privacy-first distress triage and community support platform.",
    version="1.0.0",
    # Disable docs in production to reduce attack surface
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
)

# ── CORS — Restricted to known frontend origins (Member 1 fix) ────────────────
# Replace wildcard "*" from original code with explicit allowed origins.
allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

# ── Firebase ID Token Verification (Member 1 addition) ────────────────────────
app.add_middleware(FirebaseAuthMiddleware)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(pathway.router)
app.include_router(safety_plan.router)
app.include_router(notifications.router)
app.include_router(insights.router)


@app.get("/health", tags=["Health"])
def health_check():
    """Public health endpoint for Cloud Run liveness probe."""
    return {
        "status": "ok",
        "service": "MindBridge Backend",
        "environment": settings.ENVIRONMENT,
    }
