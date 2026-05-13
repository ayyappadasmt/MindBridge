#!/usr/bin/env bash
# ============================================================
# MindBridge — Firebase Cloud Setup
# Member 1: Infrastructure & Security
#
# Configures Firebase Authentication, Firestore rules,
# and Firebase Cloud Messaging for production.
#
# Prerequisites:
#   npm install -g firebase-tools
#   firebase login
#   firebase use --add  (select your project)
# ============================================================

set -euo pipefail

: "${PROJECT_ID:?ERROR: Set PROJECT_ID}"

echo ">>> Firebase Cloud Setup for ${PROJECT_ID}"

# ── 1. Firestore Security Rules ───────────────────────────────────────────────
cat > /tmp/firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Safety Plans — users can only access their own plans
    match /safety_plans/{planId} {
      allow read, update, delete: if request.auth != null
        && resource.data.user_id == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.user_id == request.auth.uid;
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
EOF

echo ">>> Deploying Firestore Security Rules..."
firebase deploy --only firestore:rules \
  --project="${PROJECT_ID}" \
  --config /dev/null 2>/dev/null || {
  echo "  Firestore rules file written to /tmp/firestore.rules"
  echo "  Deploy manually: firebase deploy --only firestore:rules"
}

# ── 2. Enable Firebase Auth providers (via gcloud) ────────────────────────────
echo ""
echo ">>> Firebase Authentication providers to enable in Firebase Console:"
echo "    https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"
echo ""
echo "    Required providers:"
echo "      ✅ Google Sign-In (for member 3's frontend)"
echo "      ✅ Anonymous Sign-In (for guest users)"
echo "      ✅ Email/Password (optional)"
echo ""
echo "    Token expiry: Keep default (1 hour)"
echo "    Enable multi-factor authentication: Recommended for admin users"

# ── 3. Firebase Cloud Messaging (FCM) note ────────────────────────────────────
echo ""
echo ">>> Firebase Cloud Messaging (FCM):"
echo "    FCM v1 API is already used in fcm_service.py via HTTP + ADC tokens."
echo "    No additional setup needed — the backend SA has firebase.messaging scope."
echo ""
echo "    Member 3 (frontend) must:"
echo "      1. Initialize Firebase SDK with the web config from Firebase Console"
echo "      2. Request notification permission from users"
echo "      3. Obtain the FCM device token"
echo "      4. Send the token to POST /safety-plan/ or store in Firestore"

# ── 4. Firestore indexes ──────────────────────────────────────────────────────
cat > /tmp/firestore.indexes.json << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "safety_plans",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "updated_at", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF

echo ">>> Firestore composite index config written to /tmp/firestore.indexes.json"
echo "    Deploy with: firebase deploy --only firestore:indexes"
echo ""
echo "✅ Firebase setup steps complete."
