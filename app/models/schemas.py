from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# --- Pathway Controller ---
class DistressSignal(BaseModel):
    user_id: str
    distress_score: float  # 0.0 to 1.0 from Member 3's edge AI
    distress_category: str  # e.g. "anxiety", "grief", "burnout"
    region_id: Optional[str] = "unknown"  # anonymized region (no city name)


class SupportPathway(BaseModel):
    pathway_type: str  # "grounding", "breathing", "peer_support", "crisis"
    tool_title: str
    tool_description: str
    tool_url: Optional[str] = None
    crisis_hotline: Optional[str] = None
    ai_message: str


# --- Safety Plan ---
class SafetyPlanItem(BaseModel):
    user_id: str
    plan_id: Optional[str] = None
    warning_signs: List[str]
    coping_strategies: List[str]
    support_contacts: List[str]
    crisis_numbers: List[str] = ["iCall: 9152987821", "Vandrevala: 1860-2662-345"]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class SafetyPlanResponse(SafetyPlanItem):
    plan_id: str


# --- Notifications ---
class NotificationRequest(BaseModel):
    user_id: str
    fcm_token: str
    message_title: str = "MindBridge Check-in"
    message_body: str = "How are you feeling today? Take a moment to check in. 💙"


# --- Insights ---
class InsightSummary(BaseModel):
    region_id: str
    stress_category: str
    count: int
    date: str
