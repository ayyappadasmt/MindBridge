"""
MindBridge — BigQuery Service
Source: Member 1 (production-hardened)

Fixes applied vs Member 4's version:
  - REMOVED: service_account.Credentials.from_service_account_file("serviceAccountKey.json")
    (hardcoded path that does not exist in Cloud Run)
  - REMOVED: undefined TABLE_REF bug (was referenced before assignment)
  - REMOVED: "AUTO" timestamp string (invalid for TIMESTAMP column type)
  - ADDED: Application Default Credentials (works with Workload Identity on Cloud Run)
  - ADDED: event_id for deduplication
  - ADDED: proper ISO 8601 timestamp
  - ADDED: distress_level bucketing (prevents float precision re-identification)
  - ADDED: parameterized query to prevent SQL injection

PRIVACY GUARANTEE:
  No user_id, email, device ID, or raw text ever enters BigQuery.
  Only: event_id, timestamp, region_id, stress_category, distress_level, platform
"""
import logging
from datetime import datetime, timezone
import uuid
from google.cloud import bigquery
from app.core.config import settings

logger = logging.getLogger(__name__)
# Application Default Credentials — Workload Identity on Cloud Run,
# or `gcloud auth application-default login` locally.
client = None

if settings.ENVIRONMENT != "development":
    client = bigquery.Client(project=settings.PROJECT_ID)

# Resolved at module load so config validation happens once at startup
TABLE_REF = settings.bigquery_table_ref  # e.g. "my-project.mindbridge_insights.distress_events"


def log_distress_event(
    region_id: str,
    stress_category: str,
    distress_score: float,
) -> None:
    """
    Log an anonymized distress event to BigQuery.

    Privacy: only bucketed distress_level is stored — not the raw float score.
    """
    rows = [
        {
            "event_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "region_id": region_id or "unknown",
            "stress_category": stress_category or "unknown",
            "distress_level": _score_to_level(distress_score),
            "platform": "cloud_run",
        }
    ]
    if client is None:
        logger.info("Skipping BigQuery logging in development mode")
        return
    errors = client.insert_rows_json(TABLE_REF, rows)
    if errors:
        raise RuntimeError(f"BigQuery insert errors: {errors}")


def get_community_insights(days: int = 7) -> list[dict]:
    """
    Fetch aggregated community stress trends.
    Returns NO PII — only regional/categorical aggregates.
    """
    query = f"""
        SELECT
            region_id,
            stress_category,
            distress_level,
            COUNT(*) AS count,
            DATE(timestamp) AS date
        FROM `{TABLE_REF}`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
        GROUP BY region_id, stress_category, distress_level, date
        ORDER BY date DESC
        LIMIT 500
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("days", "INT64", days)]
    )
    results = client.query(query, job_config=job_config).result()
    return [dict(row) for row in results]


def _score_to_level(score: float) -> str:
    """Map float distress score to categorical label (prevents precision re-identification)."""
    if score >= 0.85:
        return "crisis"
    elif score >= 0.60:
        return "high"
    elif score >= 0.35:
        return "moderate"
    else:
        return "low"
