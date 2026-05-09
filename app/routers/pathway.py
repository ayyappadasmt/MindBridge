from fastapi import APIRouter, HTTPException
from app.models.schemas import DistressSignal, SupportPathway
from app.services.ai_service import determine_pathway, get_support_message
from app.services.bigquery_service import log_distress_event

router = APIRouter(prefix="/pathway", tags=["Pathway Controller"])


@router.post("/analyze", response_model=SupportPathway)
async def analyze_distress(signal: DistressSignal):
    """
    Main endpoint: receives distress metadata from Member 3's frontend.
    Returns the appropriate support pathway + AI-generated message.
    Raw journal text NEVER reaches this endpoint — only the score and category.
    """
    if not (0.0 <= signal.distress_score <= 1.0):
        raise HTTPException(
            status_code=400, detail="distress_score must be between 0.0 and 1.0"
        )

    # 1. Determine pathway based on score
    pathway = determine_pathway(signal.distress_score, signal.distress_category)

    # 2. Get AI-generated supportive message
    try:
        ai_message = get_support_message(
            signal.distress_category, signal.distress_score
        )
    except Exception:
        ai_message = (
            "You're doing great by checking in. Remember, it's okay to ask for help."
        )

    # 3. Log anonymized event to BigQuery (no PII)
    try:
        log_distress_event(
            region_id=signal.region_id or "unknown",
            stress_category=signal.distress_category,
            distress_score=signal.distress_score,
        )
    except Exception:
        pass  # Don't fail the response if analytics logging fails

    return SupportPathway(ai_message=ai_message, **pathway)
