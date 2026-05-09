"""
MindBridge — Firestore Service
Member 1 fix: Initialize Firebase from Secret Manager JSON or ADC,
not a hardcoded file path that would fail in Cloud Run.
"""

import json
import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings
import uuid
from datetime import datetime, timezone


def _ensure_firebase_initialized():
    if firebase_admin._apps:
        return
    if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        cred_dict = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
        cred = credentials.Certificate(cred_dict)
    elif settings.FIREBASE_SERVICE_ACCOUNT_KEY:
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY)
    else:
        cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)


_ensure_firebase_initialized()
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
    docs = db.collection(COLLECTION).where("user_id", "==", user_id).limit(1).stream()
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
