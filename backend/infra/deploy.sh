#!/usr/bin/env bash
# ============================================================
# MindBridge — Artifact Registry + Cloud Run Deployment
# Member 1: Infrastructure & Security
#
# Run this for initial deployment. After that, Cloud Build
# handles deploys automatically on git push.
#
# Usage:
#   export PROJECT_ID=your-gcp-project-id
#   bash infra/deploy.sh
# ============================================================

set -euo pipefail

: "${PROJECT_ID:?ERROR: Set PROJECT_ID}"

REGION="${REGION:-us-central1}"
REPO="mindbridge"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend"
SERVICE_NAME="mindbridge-backend"
SA_BACKEND="mindbridge-backend@${PROJECT_ID}.iam.gserviceaccount.com"

echo ">>> MindBridge Deployment"
echo "    Project : ${PROJECT_ID}"
echo "    Region  : ${REGION}"
echo "    Image   : ${IMAGE}"
echo ""

# ── 1. Create Artifact Registry repository ───────────────────────────────────
echo ">>> Creating Artifact Registry repository..."
gcloud artifacts repositories create "${REPO}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="MindBridge Docker images" \
  --project="${PROJECT_ID}" 2>/dev/null || echo "  Repository already exists."

# ── 2. Configure Docker auth ──────────────────────────────────────────────────
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# ── 3. Build and push Docker image ───────────────────────────────────────────
echo ">>> Building Docker image..."
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "manual")

docker build \
  --platform linux/amd64 \
  -t "${IMAGE}:${GIT_SHA}" \
  -t "${IMAGE}:latest" \
  .

echo ">>> Pushing image to Artifact Registry..."
docker push "${IMAGE}:${GIT_SHA}"
docker push "${IMAGE}:latest"

# ── 4. Deploy to Cloud Run ────────────────────────────────────────────────────
echo ">>> Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE}:${GIT_SHA}" \
  --region="${REGION}" \
  --platform=managed \
  --service-account="${SA_BACKEND}" \
  --set-secrets="FIREBASE_SERVICE_ACCOUNT_JSON=firebase-service-account:latest" \
  --set-env-vars="PROJECT_ID=${PROJECT_ID}" \
  --set-env-vars="REGION=${REGION}" \
  --set-env-vars="ENVIRONMENT=production" \
  --set-env-vars="BIGQUERY_DATASET=mindbridge_insights" \
  --set-env-vars="BIGQUERY_TABLE=distress_events" \
  --set-env-vars="VERTEX_AI_MODEL=gemini-1.5-flash-001" \
  --set-env-vars="FIREBASE_PROJECT_ID=${PROJECT_ID}" \
  --set-env-vars="ALLOWED_ORIGINS=https://mindbridge.app" \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=10 \
  --memory=512Mi \
  --cpu=1 \
  --timeout=30s \
  --concurrency=80 \
  --project="${PROJECT_ID}"

# ── 5. Print service URL ──────────────────────────────────────────────────────
echo ""
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)")

echo "✅ Deployment complete."
echo "   Service URL: ${SERVICE_URL}"
echo "   Health check: ${SERVICE_URL}/health"
