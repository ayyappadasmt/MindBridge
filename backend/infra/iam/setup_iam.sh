#!/usr/bin/env bash
# ============================================================
# MindBridge — IAM Least-Privilege Setup
# Member 1: Cloud Infrastructure & Security
#
# Run once per GCP project to configure all service accounts
# and grant minimal required permissions.
#
# Usage:
#   export PROJECT_ID=your-gcp-project-id
#   bash infra/iam/setup_iam.sh
# ============================================================

set -euo pipefail

: "${PROJECT_ID:?ERROR: Set PROJECT_ID before running this script}"

REGION="${REGION:-us-central1}"
SA_BACKEND="mindbridge-backend@${PROJECT_ID}.iam.gserviceaccount.com"
SA_CICD="mindbridge-cicd@${PROJECT_ID}.iam.gserviceaccount.com"

echo ">>> Configuring IAM for project: ${PROJECT_ID}"

# ── Enable required APIs ──────────────────────────────────────────────────────
echo ">>> Enabling GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  bigquery.googleapis.com \
  firestore.googleapis.com \
  firebase.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project="${PROJECT_ID}"

# ── Service Account: Backend (Cloud Run) ─────────────────────────────────────
echo ">>> Creating backend service account..."
gcloud iam service-accounts create mindbridge-backend \
  --display-name="MindBridge Backend Cloud Run SA" \
  --project="${PROJECT_ID}" 2>/dev/null || echo "  (already exists)"

# Vertex AI — invoke models only
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_BACKEND}" \
  --role="roles/aiplatform.user" \
  --condition=None

# BigQuery — insert rows and run queries, no table admin
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_BACKEND}" \
  --role="roles/bigquery.dataEditor" \
  --condition=None

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_BACKEND}" \
  --role="roles/bigquery.jobUser" \
  --condition=None

# Firestore — read/write documents, no admin
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_BACKEND}" \
  --role="roles/datastore.user" \
  --condition=None

# Secret Manager — read secrets at runtime
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_BACKEND}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None

# Firebase Auth — verify tokens
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_BACKEND}" \
  --role="roles/firebase.sdkAdminServiceAgent" \
  --condition=None

echo ">>> Backend SA roles configured."

# ── Service Account: CI/CD (Cloud Build) ─────────────────────────────────────
echo ">>> Creating CI/CD service account..."
gcloud iam service-accounts create mindbridge-cicd \
  --display-name="MindBridge CI/CD Cloud Build SA" \
  --project="${PROJECT_ID}" 2>/dev/null || echo "  (already exists)"

# Cloud Run — deploy new revisions only
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_CICD}" \
  --role="roles/run.developer" \
  --condition=None

# Artifact Registry — push images
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_CICD}" \
  --role="roles/artifactregistry.writer" \
  --condition=None

# Allow Cloud Build SA to impersonate the backend SA for deploy
gcloud iam service-accounts add-iam-policy-binding "${SA_BACKEND}" \
  --member="serviceAccount:${SA_CICD}" \
  --role="roles/iam.serviceAccountUser" \
  --project="${PROJECT_ID}"

echo ">>> CI/CD SA roles configured."

echo ""
echo "✅ IAM setup complete."
echo "   Backend SA : ${SA_BACKEND}"
echo "   CI/CD SA   : ${SA_CICD}"
echo ""
echo "NEXT: Run infra/bigquery/setup_bigquery.sh"
