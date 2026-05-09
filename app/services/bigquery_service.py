"""
MindBridge — BigQuery Service
Member 1 fixes:
  - Removed hardcoded serviceAccountKey.json path
  - Fixed undefined TABLE_REF bug
  - Use Application Default Credentials (Workload Identity on Cloud Run)
  - Added proper timestamp (not the string "AUTO")
  - Ensures NO PII enters BigQuery per Member 2's schema spec
"""

from datetime import datetime, timezone
import uuid
from google.cloud import bigquery
from app.core.config import settings

# Application Default Credentials — works with Workload Identity on Cloud Run
# and with `gcloud auth application-default login` locally.
client = bigquery.Client(project=settings.PROJECT_ID)

# Resolved at module load so config is validated once
TABLE_REF = settings.bigquery_table_ref  # e.g. "my-project.mindbridge_insights.distress_events"


def log_distress_event(region_id: str, stress_category: str, distress_score: float) -> None:
    """
    Log an anonymized distress event.

    PRIVACY GUARANTEE:
      - No user_id, no email, no device ID — only aggregate metadata.
      - distress_score is bucketed to 1 decimal place to prevent re-identification.
    """
    rows = [
        {
            "event_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "region_id": region_id or "unknown",
            "stress_category": stress_category,
            # Member 2 schema uses distress_level (STRING), map score to bucket
            "distress_level": _score_to_level(distress_score),
            "platform": "cloud_run",
        }
    ]
    errors = client.insert_rows_json(TABLE_REF, rows)
    if errors:
        raise RuntimeError(f"BigQuery insert errors: {errors}")


def get_community_insights(days: int = 7) -> list[dict]:
    """Fetch aggregated community stress trends. Returns NO PII."""
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
    """Map float distress score to a categorical label (prevents precision re-ID)."""
    if score >= 0.85:
        return "crisis"
    elif score >= 0.65:
        return "high"
    elif score >= 0.40:
        return "moderate"
    else:
        return "low"
