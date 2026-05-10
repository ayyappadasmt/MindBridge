# MindBridge — End-to-End Integration Test Report

**Integration Engineer:** Senior Full-Stack Integration  
**Date:** 2026-05-10  
**Status:** ✅ READY FOR FULL DEPLOYMENT (with conditions noted)

---

## Phase 1 — Frontend Audit Findings

### Framework & Stack
- **Framework:** React 19 + Vite 8 + TailwindCSS 3
- **Routing:** react-router-dom v7
- **State:** React Context (Auth, Journal, Mood, Offline)
- **Edge AI:** Custom keyword scoring in `edgeAI.js` (no TFLite model loaded — pure JS)
- **Offline:** localforage (IndexedDB wrapper)
- **Charts:** Recharts
- **Firebase:** firebase v12 (Auth + Firestore client SDK)

> **Note on TensorFlow:** `@tensorflow/tfjs` and `@tensorflow-models/toxicity` are in package.json but NOT imported anywhere in the codebase. The actual edge AI is a pure JS keyword scorer in `edgeAI.js`. TF packages add ~3MB to the bundle for no benefit. Recommend removing them or documenting their intended future use.

---

## Phase 2 — API Integration Mismatches Found & Fixed

| # | Severity | Mismatch | Fix Applied |
|---|----------|----------|-------------|
| 1 | 🔴 CRITICAL | Endpoint `/api/v1/distress-events` → doesn't exist | Fixed to `POST /pathway/analyze` |
| 2 | 🔴 CRITICAL | Payload missing `user_id`, `distress_score`, `distress_category` | Mapped `severity→distress_score`, `emotion→distress_category`, added `user_id` |
| 3 | 🔴 CRITICAL | `GET /api/v1/safety-plans` → doesn't exist | Fixed to `GET /safety-plan/{userId}` |
| 4 | 🔴 CRITICAL | SafetyPlan.jsx made zero API calls (offline-only) | Full CRUD wired: fetch, create, offline cache |
| 5 | 🟠 HIGH | SupportPathway response discarded by frontend | `PathwayCard` component added — shows AI message, tool, crisis hotline |
| 6 | 🟠 HIGH | `sendDistressMeta(meta)` missing `userId` arg | Fixed to `sendDistressMeta(meta, user.uid)` |
| 7 | 🟠 HIGH | `OfflineProvider` defined but never registered in App.jsx | Added to provider tree |
| 8 | 🟠 HIGH | `MoodProvider` defined but never registered in App.jsx | Added to provider tree (any `useMood()` call would have crashed) |
| 9 | 🟡 MEDIUM | Backend CORS blocks `localhost:5173` (dev) | Added localhost origins to `ALLOWED_ORIGINS` in `.env.example` |
| 10 | 🟡 MEDIUM | No token refresh on 401 | Added retry interceptor with `getIdToken(true)` |
| 11 | 🟡 MEDIUM | `.dockerignore` missing `.pem`, `.key`, `.p12`, `.env.*` | Restored from M1 original |
| 12 | 🟡 MEDIUM | `triage_engine.py` dropped during M1+M2 merge | Restored as backward-compat wrapper |
| 13 | 🟡 MEDIUM | `docs/DEPLOYMENT_GUIDE.md` dropped | Restored from M1 original |
| 14 | ℹ️ INFO | `@tensorflow/tfjs` in package.json but unused | Documented — not removed (may be planned) |
| 15 | ℹ️ INFO | `fetchCommunityInsights` not used in any page | Wired in `apiService.js`; Dashboard integration deferred to frontend team |

---

## Phase 3 — Firebase Integration Status

| Feature | Status | Notes |
|---------|--------|-------|
| Firebase config from env vars | ✅ | All 6 vars via `VITE_FIREBASE_*` |
| Google Sign-In | ✅ | `signInWithPopup` + `GoogleAuthProvider` |
| Anonymous Sign-In | ✅ | `signInAnonymously` |
| `onAuthStateChanged` listener | ✅ | Blocks render until auth state resolved |
| Firebase JWT on API requests | ✅ | Axios interceptor attaches Bearer token |
| JWT refresh on 401 | ✅ | Fixed — retry interceptor added |
| Firestore journal metadata | ✅ | `addDoc(collection(db, "journals"), entry)` — no raw text |
| Firestore offline fallback | ✅ | `saveJournalOffline()` on Firestore failure |
| FCM token registration | ✅ | `registerFcmToken()` in apiService.js |
| FCM frontend SDK | ⚠️ | `getMessaging()` not initialized — frontend can't receive FCM push yet |
| Protected routes | ✅ | `ProtectedRoute` redirects to `/login` |

---

## Phase 4 — AI & Safety Flow

### End-to-End Flow (verified)

```
User types in Journal textarea
  ↓ (debounced 1.5s, 100% local)
edgeAI.analyzeDistress(text)
  → { emotion: "anxiety", severity: 0.72, timestamp: "..." }
  ↓
severity >= THRESHOLD (0.65)?  YES
  ↓
POST /pathway/analyze
  { user_id, distress_score: 0.72, distress_category: "anxiety", region_id: "unknown" }
  ↓ Firebase JWT in header
Backend:
  1. determine_pathway(0.72, "anxiety") → { pathway_type: "grounding", is_crisis: false }
  2. get_support_message() → Vertex AI Gemini response
  3. log_distress_event() → BigQuery (anonymized, fire-and-forget)
  ↓
SupportPathway response → PathwayCard displayed in UI
```

### Crisis Escalation Flow (verified)

```
User types "kill myself" → severity = 0.92 (>= 0.85)
  ↓
POST /pathway/analyze → { pathway_type: "crisis", is_crisis: true }
Backend returns: crisis_hotline: "iCall: 9152987821 | Vandrevala: 1860-2662-345"
  ↓
PathwayCard shows crisis_hotline in red
DistressAlert shows iCall number (level="critical")
EmergencyCard always visible on SafetyPlan and Dashboard
```

### Safety Constraints Preserved

- ✅ Raw journal text never sent to any server
- ✅ AI system prompt has `NEVER diagnose` constraint
- ✅ Safety filters: BLOCK_LOW_AND_ABOVE for dangerous/harassment content
- ✅ Crisis hotlines hardcoded in 3 places: DistressAlert, EmergencyCard, PathwayCard
- ✅ BigQuery logs zero PII (no user_id, no email, no text)

---

## Phase 5 — Environment Config Integration

### Frontend `.env` Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase client SDK | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging | ✅ |
| `VITE_FIREBASE_APP_ID` | Firebase App | ✅ |
| `VITE_API_BASE_URL` | Backend URL | ✅ |
| `VITE_DISTRESS_THRESHOLD` | Edge AI sensitivity | ✅ (default: 0.65) |

### Backend `.env` Variables

See `backend/.env.example` — 9 variables, all documented.

Key change: `ALLOWED_ORIGINS` now includes `localhost:5173,localhost:4173` for dev.

---

## Phase 6 — Security Audit

| Check | Status | Notes |
|-------|--------|-------|
| No hardcoded API keys in frontend | ✅ | All via `import.meta.env.VITE_*` |
| No raw journal text in API calls | ✅ | Privacy guarantee preserved |
| Firebase JWT on every API request | ✅ | Axios interceptor |
| JWT refresh on token expiry | ✅ | 401 retry added |
| Backend auth middleware active | ✅ | `FirebaseAuthMiddleware` on all routes |
| CORS restricted to known origins | ✅ | No wildcard |
| Safety plan ownership check | ✅ | Backend verifies `uid == user_id` |
| Docs disabled in production | ✅ | `/docs` returns 404 when `ENVIRONMENT=production` |
| Docker non-root user | ✅ | `appuser` (uid 1001) |
| Secrets in Secret Manager | ✅ | Not in image or env |
| `.dockerignore` blocks key files | ✅ | Restored `.pem`, `.key`, `.env.*` |
| PII in BigQuery | ✅ | Only bucketed distress level stored |
| localforage (IndexedDB) — no secrets stored | ✅ | Only metadata (emotion + severity) |

---

## Phase 7 — Deployment Readiness

### Backend

| Item | Status |
|------|--------|
| `Dockerfile` valid (multi-stage, non-root) | ✅ |
| `requirements.txt` pinned | ✅ |
| `cloudbuild.yaml` correct | ✅ |
| `infra/deploy.sh` functional | ✅ |
| `infra/iam/setup_iam.sh` | ✅ |
| `infra/setup_secrets.sh` | ✅ |
| `infra/bigquery/setup_bigquery.sh` | ✅ |
| `infra/firebase/setup_firebase.sh` | ✅ |
| `infra/apigateway/openapi.yaml` | ✅ (needs REPLACE_HASH after first deploy) |
| `GET /health` health endpoint | ✅ |
| All 4 routers registered | ✅ |
| Firebase init singleton (no double-init) | ✅ |
| BigQuery ADC credentials | ✅ |

### Frontend

| Item | Status |
|------|--------|
| `npm run build` — no missing deps | ✅ |
| All routes defined | ✅ |
| All providers registered | ✅ (fixed) |
| Firebase config from env | ✅ |
| Offline fallback | ✅ |
| Error handling on API calls | ✅ |

---

## Remaining Work (Post-Integration)

1. **FCM frontend SDK** — `getMessaging()` not initialized in `firebase.js`. Frontend can't receive push notifications until this is added. Backend can send; frontend can't receive yet.
2. **Community Insights Dashboard** — `fetchCommunityInsights()` is wired but no page uses it. Wire into Dashboard or a dedicated Admin page.
3. **`VITE_API_BASE_URL` for production** — must be updated to API Gateway URL after first deploy.
4. **`@tensorflow/tfjs` in package.json** — unused (~3MB). Remove or document intent.
5. **Firestore security rules** — run `firebase deploy --only firestore:rules` after backend deploy.
6. **User plan FCM token storage** — no dedicated endpoint for updating FCM tokens (currently only via POST /notifications/checkin). Consider adding `PUT /users/{uid}/fcm-token`.
