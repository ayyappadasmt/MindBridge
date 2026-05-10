#!/usr/bin/env bash
# ============================================================
# MindBridge — Secret Manager Setup
# Member 1: Infrastructure & Security
#
# Stores the Firebase service account JSON in Secret Manager.
# Cloud Run then mounts it as an environment variable — no
# secret files ship inside the Docker image.
#
# Usage:
#   export PROJECT_ID=your-gcp-project-id
#   export FIREBASE_KEY_FILE=./serviceAccountKey.json
#   bash infra/setup_secrets.sh
# ============================================================

set -euo pipefail

: "${PROJECT_ID:?ERROR: Set PROJECT_ID}"
: "${FIREBASE_KEY_FILE:?ERROR: Set FIREBASE_KEY_FILE to path of your Firebase service account JSON}"

echo ">>> Storing secrets in Secret Manager for project: ${PROJECT_ID}"

# ── Firebase service account ─────────────────────────────────────────────────
gcloud secrets create firebase-service-account \
  --replication-policy="automatic" \
  --project="${PROJECT_ID}" 2>/dev/null || echo "  Secret already exists, adding new version."

gcloud secrets versions add firebase-service-account \
  --data-file="${FIREBASE_KEY_FILE}" \
  --project="${PROJECT_ID}"

echo "  'firebase-service-account' secret stored."

# ── Grant backend SA access to the secret ────────────────────────────────────
SA_BACKEND="mindbridge-backend@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:${SA_BACKEND}" \
  --role="roles/secretmanager.secretAccessor" \
  --project="${PROJECT_ID}"

echo "  Backend SA granted access to secret."
echo ""
echo "✅ Secrets setup complete."
echo ""
echo "Cloud Run will inject this secret as FIREBASE_SERVICE_ACCOUNT_JSON."
echo "The app/core/config.py and auth_middleware.py read it from that env var."
echo ""
echo "NEXT: Run infra/setup_artifact_registry.sh"
