"""
MindBridge — Firebase Authentication Middleware
Member 1: Enforces Firebase ID token verification on protected routes.

Every request to protected endpoints must include:
    Authorization: Bearer <firebase-id-token>

Public endpoints (health check, docs) are excluded.
"""

import json
import os
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from app.core.config import settings

# ── Public paths that skip auth ───────────────────────────────────────────────
PUBLIC_PATHS = {
    "/health",
    "/docs",
    "/openapi.json",
    "/redoc",
}


def _init_firebase():
    """Initialize Firebase Admin SDK from Secret Manager env var or key file."""
    if firebase_admin._apps:
        return  # Already initialized

    if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        # Production: JSON string injected from Secret Manager
        cred_dict = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
        cred = credentials.Certificate(cred_dict)
    elif settings.FIREBASE_SERVICE_ACCOUNT_KEY:
        # Local dev: file path
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY)
    else:
        # Cloud Run with Workload Identity — use Application Default Credentials
        cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred)


_init_firebase()


class FirebaseAuthMiddleware(BaseHTTPMiddleware):
    """Validates Firebase ID tokens on every non-public request."""

    async def dispatch(self, request: Request, call_next):
        # Skip OPTIONS (CORS preflight) and public paths
        if request.method == "OPTIONS" or request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing or malformed Authorization header."},
            )

        token = auth_header.split("Bearer ", 1)[1].strip()
        try:
            decoded = firebase_auth.verify_id_token(token)
            # Attach uid to request state for use in route handlers
            request.state.uid = decoded["uid"]
            request.state.email = decoded.get("email", "")
        except firebase_auth.ExpiredIdTokenError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Firebase token has expired. Please re-authenticate."},
            )
        except firebase_auth.InvalidIdTokenError as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Invalid Firebase token: {str(e)}"},
            )
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Authentication service error."},
            )

        return await call_next(request)
