import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings
import uuid
from datetime import datetime

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY)
    firebase_admin.initialize_app(cred)

db = firestore.client()

COLLECTION = "safety_plans"


def create_safety_plan(plan_data: dict) -> dict:
    plan_id = str(uuid.uuid4())
    plan_data["plan_id"] = plan_id
    plan_data["created_at"] = datetime.utcnow()
    plan_data["updated_at"] = datetime.utcnow()
    db.collection(COLLECTION).document(plan_id).set(plan_data)
    return plan_data


def get_safety_plan(user_id: str) -> dict | None:
    docs = db.collection(COLLECTION).where("user_id", "==", user_id).limit(1).stream()
    for doc in docs:
        return doc.to_dict()
    return None


def update_safety_plan(plan_id: str, updates: dict) -> dict:
    updates["updated_at"] = datetime.utcnow()
    db.collection(COLLECTION).document(plan_id).update(updates)
    return {"plan_id": plan_id, **updates}


def delete_safety_plan(plan_id: str) -> bool:
    db.collection(COLLECTION).document(plan_id).delete()
    return True
