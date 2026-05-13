"""
MindBridge — Firebase Authentication Middleware
Source: Member 1 (production-hardened)
Integration: Uses shared firebase_init module.

Every request to protected endpoints must include:
    Authorization: Bearer <firebase-id-token>

Public endpoints (health check, docs) are excluded.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from firebase_admin import auth as firebase_auth

# Shared init — ensures Firebase is initialized exactly once
import app.core.firebase_init  # noqa: F401  (side-effect import)

# ── Public paths that skip auth ───────────────────────────────────────────────
PUBLIC_PATHS = {
    "/health",
    "/docs",
    "/openapi.json",
    "/redoc",
    "/chat/message",
}


class FirebaseAuthMiddleware(BaseHTTPMiddleware):
    """Validates Firebase ID tokens on every non-public request."""

    async def dispatch(self, request: Request, call_next):
        # Skip CORS preflight and public paths
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
            # Attach decoded claims to request state for use in route handlers
            request.state.uid = decoded["uid"]
            request.state.email = decoded.get("email", "")
        except firebase_auth.ExpiredIdTokenError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "detail": "Firebase token has expired. Please re-authenticate."
                },
            )
        except firebase_auth.InvalidIdTokenError as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Invalid Firebase token: {str(e)}"},
            )
        except Exception:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Authentication service error."},
            )

        return await call_next(request)
