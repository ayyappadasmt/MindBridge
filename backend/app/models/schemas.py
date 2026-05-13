"""
MindBridge — Pydantic Schemas
Source: Member 1 (base) + M2 triage fields added to SupportPathway
Integration: InsightSummary updated to include distress_level column from M2 BigQuery schema.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Pathway Controller ────────────────────────────────────────────────────────
class DistressSignal(BaseModel):
    """
    Payload sent by Member 3's frontend edge-AI layer.
    Raw journal text NEVER reaches this schema — only anonymized metadata.
    """
    user_id: str
    distress_score: float         # 0.0 to 1.0 from TFLite/NL API on device
    distress_category: str        # e.g. "anxiety", "grief", "burnout", "neutral"
    region_id: Optional[str] = "unknown"  # Anonymized region — no city/address


class SupportPathway(BaseModel):
    """Response from /pathway/analyze."""
    pathway_type: str             # "grounding" | "breathing" | "checkin" | "crisis"
    tool_title: str
    tool_description: str
    tool_url: Optional[str] = None
    crisis_hotline: Optional[str] = None
    ai_message: str
    # M2 triage metadata — surfaced for frontend routing decisions
    triage_level: Optional[str] = None   # "crisis" | "moderate" | "low_moderate" | "low"
    is_crisis: bool = False


# ── Safety Plan CRUD ──────────────────────────────────────────────────────────
class SafetyPlanItem(BaseModel):
    user_id: str
    plan_id: Optional[str] = None
    warning_signs: List[str]
    coping_strategies: List[str]
    support_contacts: List[str]
    crisis_numbers: List[str] = [
        "iCall: 9152987821",
        "Vandrevala Foundation: 1860-2662-345",
    ]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class SafetyPlanResponse(SafetyPlanItem):
    plan_id: str


# ── Notifications ─────────────────────────────────────────────────────────────
class NotificationRequest(BaseModel):
    user_id: str
    fcm_token: str
    message_title: str = "MindBridge Check-in"
    message_body: str = "How are you feeling today? Take a moment to check in. 💙"


# ── Admin Insights ────────────────────────────────────────────────────────────
class InsightSummary(BaseModel):
    """
    Anonymized community health aggregate.
    Aligned with M2 BigQuery schema: event_id, timestamp, region_id,
    stress_category, distress_level, platform.
    NO PII fields.
    """
    region_id: str
    stress_category: str
    distress_level: Optional[str] = None  # M2 schema column: "crisis"|"high"|"moderate"|"low"
    count: int
    date: str
