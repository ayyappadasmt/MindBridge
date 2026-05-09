"""
MindBridge — Firestore Service
Source: Member 1 (production-hardened) with timezone-aware datetimes.
Integration: Uses shared firebase_init module (no duplicate init).

Fixes applied vs Member 4's version:
  - Removed hardcoded credentials.Certificate('./serviceAccountKey.json')
  - datetime.utcnow() → datetime.now(timezone.utc) (deprecation fix)
  - Firebase initialized via shared firebase_init module
"""

from firebase_admin import firestore
from app.core import firebase_init  # noqa: F401  (ensures init runs before client())
import uuid
from datetime import datetime, timezone


db = firestore.client()
COLLECTION = "safety_plans"


def create_safety_plan(plan_data: dict) -> dict:
    plan_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    plan_data["plan_id"] = plan_id
    plan_data["created_at"] = now
    plan_data["updated_at"] = now
    db.collection(COLLECTION).document(plan_id).set(plan_data)
    return plan_data


def get_safety_plan(user_id: str) -> dict | None:
    docs = (
        db.collection(COLLECTION)
        .where("user_id", "==", user_id)
        .limit(1)
        .stream()
    )
    for doc in docs:
        return doc.to_dict()
    return None


def update_safety_plan(plan_id: str, updates: dict) -> dict:
    updates["updated_at"] = datetime.now(timezone.utc)
    db.collection(COLLECTION).document(plan_id).update(updates)
    return {"plan_id": plan_id, **updates}


def delete_safety_plan(plan_id: str) -> bool:
    db.collection(COLLECTION).document(plan_id).delete()
    return True
