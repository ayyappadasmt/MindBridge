"""
MindBridge — Admin Insights Router
Source: Member 1 (base)
Integration: Response schema updated to include distress_level from M2 BigQuery schema.

Returns anonymized community stress aggregates from BigQuery.
No PII is ever returned.
"""

from fastapi import APIRouter, Query
from app.services.bigquery_service import get_community_insights
from app.models.schemas import InsightSummary
from typing import List

router = APIRouter(prefix="/insights", tags=["Admin Insights"])


@router.get("/community", response_model=List[InsightSummary])
async def community_health(days: int = Query(default=7, ge=1, le=90)):
    """
    Admin endpoint: returns anonymized community stress trends from BigQuery.
    Used by Member 3's admin dashboard. NO PII returned — only aggregates.

    Query params:
        days: lookback window (1–90 days, default 7)
    """
    data = get_community_insights(days=days)
    return [InsightSummary(**row) for row in data]
