from google.cloud import bigquery
from google.oauth2 import service_account
from app.core.config import settings

credentials = service_account.Credentials.from_service_account_file(
    "serviceAccountKey.json"
)

client = bigquery.Client(credentials=credentials, project=settings.PROJECT_ID)


def log_distress_event(region_id: str, stress_category: str, distress_score: float):
    """Log anonymized event — NO user_id, NO PII ever enters BigQuery."""
    rows = [
        {
            "region_id": region_id,
            "stress_category": stress_category,
            "distress_score_bucket": round(distress_score, 1),  # bucketed, not exact
            "timestamp": "AUTO",  # BigQuery CURRENT_TIMESTAMP
        }
    ]
    errors = client.insert_rows_json(TABLE_REF, rows)
    if errors:
        raise RuntimeError(f"BigQuery insert errors: {errors}")


def get_community_insights(days: int = 7) -> list[dict]:
    """Fetch aggregated community stress trends for admin dashboard."""
    query = f"""
        SELECT
            region_id,
            stress_category,
            COUNT(*) as count,
            DATE(timestamp) as date
        FROM `{TABLE_REF}`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {days} DAY)
        GROUP BY region_id, stress_category, date
        ORDER BY date DESC
        LIMIT 200
    """
    results = client.query(query).result()
    return [dict(row) for row in results]
