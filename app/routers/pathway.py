"""
MindBridge — Pathway Controller Router
Source: Member 1 (base) + M2 triage_level/is_crisis fields forwarded in response

This is the core endpoint of MindBridge.
Flow:
  Frontend (edge AI score) → POST /pathway/analyze
    → determine_pathway() [M2 triage logic]
    → get_support_message() [Vertex AI Gemini]
    → log_distress_event() [BigQuery — anonymized]
    → SupportPathway response → Frontend
"""

from fastapi import APIRouter, HTTPException, Request
from app.models.schemas import DistressSignal, SupportPathway
from app.services.ai_service import determine_pathway, get_support_message
from app.services.bigquery_service import log_distress_event
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pathway", tags=["Pathway Controller"])


@router.post("/analyze", response_model=SupportPathway)
async def analyze_distress(signal: DistressSignal, request: Request):
    """
    Main endpoint: receives distress metadata from Member 3's frontend edge-AI.
    Returns the appropriate support pathway + AI-generated message.

    PRIVACY: Raw journal text NEVER reaches this endpoint.
    Only the distress score and category (e.g. "anxiety") are transmitted.
    """
    if not (0.0 <= signal.distress_score <= 1.0):
        raise HTTPException(
            status_code=400,
            detail="distress_score must be between 0.0 and 1.0.",
        )

    # 1. Triage: determine support pathway (M2 logic)
    pathway = determine_pathway(signal.distress_score, signal.distress_category)

    # 2. AI message: warm Gemini-generated response (non-clinical)
    try:
        ai_message = get_support_message(
            signal.distress_category, signal.distress_score
        )
    except Exception as e:
        logger.warning("AI message generation failed: %s", str(e))
        ai_message = (
            "You're doing great by checking in. "
            "Remember, it's okay to ask for help."
        )

    # 3. Analytics: log anonymized event to BigQuery (fire-and-forget)
    try:
        log_distress_event(
            region_id=signal.region_id or "unknown",
            stress_category=signal.distress_category,
            distress_score=signal.distress_score,
        )
    except Exception as e:
        # Never fail the user response due to analytics errors
        logger.warning("BigQuery logging failed (non-fatal): %s", str(e))

    # Build response — strip internal-only keys before returning
    response_data = {
        "pathway_type": pathway["pathway_type"],
        "tool_title": pathway["tool_title"],
        "tool_description": pathway["tool_description"],
        "tool_url": pathway.get("tool_url"),
        "crisis_hotline": pathway.get("crisis_hotline"),
        "ai_message": ai_message,
        "triage_level": pathway.get("triage_level"),
        "is_crisis": pathway.get("is_crisis", False),
    }
    return SupportPathway(**response_data)
