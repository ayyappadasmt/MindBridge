#!/usr/bin/env bash
# ============================================================
# MindBridge — BigQuery Dataset & Table Setup
# Member 1: Infrastructure & Security
#
# Creates the anonymized insights dataset and table.
# Based on Member 2's distress_events_schema.json.
#
# Usage:
#   export PROJECT_ID=your-gcp-project-id
#   bash infra/bigquery/setup_bigquery.sh
# ============================================================

set -euo pipefail

: "${PROJECT_ID:?ERROR: Set PROJECT_ID}"

DATASET="mindbridge_insights"
TABLE="distress_events"
REGION="${REGION:-US}"   # BigQuery dataset location

echo ">>> Setting up BigQuery for project: ${PROJECT_ID}"

# ── Create dataset if it doesn't exist ───────────────────────────────────────
bq --location="${REGION}" mk \
  --dataset \
  --description="MindBridge anonymized community mental wellness insights. NO PII." \
  --default_table_expiration=0 \
  "${PROJECT_ID}:${DATASET}" 2>/dev/null && echo "  Dataset created." \
  || echo "  Dataset already exists."

# ── Create table with schema ──────────────────────────────────────────────────
# Schema aligns with Member 2's distress_events_schema.json
# Added: event_id (deduplication), distress_level (bucketed string — not raw float)
bq mk \
  --table \
  --description="Anonymized distress events. No user identifiers ever stored." \
  --time_partitioning_field=timestamp \
  --time_partitioning_type=DAY \
  --clustering_fields=stress_category,region_id \
  "${PROJECT_ID}:${DATASET}.${TABLE}" \
  event_id:STRING,timestamp:TIMESTAMP,region_id:STRING,stress_category:STRING,distress_level:STRING,platform:STRING \
  2>/dev/null && echo "  Table '${TABLE}' created." \
  || echo "  Table already exists."

# ── Apply row-level access policy (data analysts read-only) ──────────────────
echo ">>> Granting read-only access to analysts group (if set)..."
if [ -n "${ANALYST_GROUP:-}" ]; then
  bq add-iam-policy-binding \
    --member="group:${ANALYST_GROUP}" \
    --role="roles/bigquery.dataViewer" \
    "${PROJECT_ID}:${DATASET}"
  echo "  Analyst group granted dataViewer on dataset."
else
  echo "  ANALYST_GROUP not set — skipping analyst binding."
fi

echo ""
echo "✅ BigQuery setup complete."
echo "   Table: ${PROJECT_ID}.${DATASET}.${TABLE}"
echo ""
echo "  PRIVACY NOTE: This table stores ONLY:"
echo "    event_id, timestamp, region_id, stress_category, distress_level, platform"
echo "  NO user IDs, emails, device identifiers, or raw text are ever stored."
