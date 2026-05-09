from fastapi import APIRouter, Query
from app.services.bigquery_service import get_community_insights
from app.models.schemas import InsightSummary
from typing import List

router = APIRouter(prefix="/insights", tags=["Admin Insights"])


@router.get("/community", response_model=List[InsightSummary])
async def community_health(days: int = Query(default=7, ge=1, le=90)):
    """
    Admin-only endpoint: returns anonymized community stress trends.
    Used by Member 3's admin dashboard. No PII is returned.
    """
    data = get_community_insights(days=days)
    return [InsightSummary(**row) for row in data]
