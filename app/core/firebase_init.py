"""
MindBridge — Firebase Admin SDK Initialization
Integration fix: Single shared init module used by auth_middleware, firestore_service,
and any future Firebase-dependent service. Prevents double-initialization conflicts.

Priority order:
  1. FIREBASE_SERVICE_ACCOUNT_JSON env var  (Cloud Run / Secret Manager)
  2. FIREBASE_SERVICE_ACCOUNT_KEY file path (local dev)
  3. Application Default Credentials         (Workload Identity on Cloud Run)
"""

import json
import firebase_admin
from firebase_admin import credentials
from app.core.config import settings

_initialized = False


def ensure_firebase_initialized() -> None:
    """Initialize Firebase Admin SDK exactly once. Safe to call multiple times."""
    global _initialized
    if _initialized or firebase_admin._apps:
        _initialized = True
        return

    if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        # Production: JSON string injected from Secret Manager
        cred_dict = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
        cred = credentials.Certificate(cred_dict)
    elif settings.FIREBASE_SERVICE_ACCOUNT_KEY and settings.FIREBASE_SERVICE_ACCOUNT_KEY != "":
        # Local dev: file path (never committed to git)
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY)
    else:
        # Cloud Run with Workload Identity — use Application Default Credentials
        cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred)
    _initialized = True


# Initialize on import so all consumers share the same app instance
ensure_firebase_initialized()
