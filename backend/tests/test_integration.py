"""
MindBridge — Integration Test Suite
Tests that can run locally without GCP credentials (using mocks).
Run with: pytest tests/ -v
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


# ── Mock Firebase before any app imports ─────────────────────────────────────
@pytest.fixture(autouse=True, scope="session")
def mock_firebase():
    """Mock Firebase Admin SDK initialization for all tests."""
    with patch("firebase_admin.initialize_app"), \
         patch("firebase_admin._apps", {"[DEFAULT]": MagicMock()}), \
         patch("firebase_admin.auth.verify_id_token", return_value={"uid": "test-user-123", "email": "test@example.com"}), \
         patch("firebase_admin.firestore.client", return_value=MagicMock()):
        yield


@pytest.fixture(scope="session")
def client(mock_firebase):
    # Set required env vars before importing app
    import os
    os.environ.setdefault("PROJECT_ID", "mindbridge-test")
    os.environ.setdefault("ENVIRONMENT", "development")
    os.environ.setdefault("FIREBASE_PROJECT_ID", "mindbridge-test")

    with patch("app.core.firebase_init.ensure_firebase_initialized"):
        with patch("vertexai.init"):
            with patch("google.cloud.bigquery.Client"):
                from app.main import app
                with TestClient(app) as c:
                    yield c


# ── Health Check ──────────────────────────────────────────────────────────────
class TestHealth:
    def test_health_returns_ok(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "MindBridge Backend"
        assert "environment" in data


# ── Pathway Analyze ───────────────────────────────────────────────────────────
class TestPathwayAnalyze:
    HEADERS = {"Authorization": "Bearer fake-valid-token"}

    def test_crisis_pathway_high_score(self, client):
        with patch("app.services.ai_service.get_support_message", return_value="You're not alone."), \
             patch("app.services.bigquery_service.log_distress_event"):
            response = client.post(
                "/pathway/analyze",
                json={"user_id": "u1", "distress_score": 0.9, "distress_category": "anxiety"},
                headers=self.HEADERS,
            )
        assert response.status_code == 200
        data = response.json()
        assert data["pathway_type"] == "crisis"
        assert data["is_crisis"] is True
        assert "crisis_hotline" in data
        assert data["crisis_hotline"] is not None

    def test_grounding_pathway_moderate_score(self, client):
        with patch("app.services.ai_service.get_support_message", return_value="Try this exercise."), \
             patch("app.services.bigquery_service.log_distress_event"):
            response = client.post(
                "/pathway/analyze",
                json={"user_id": "u1", "distress_score": 0.65, "distress_category": "sadness"},
                headers=self.HEADERS,
            )
        assert response.status_code == 200
        data = response.json()
        assert data["pathway_type"] == "grounding"
        assert data["is_crisis"] is False

    def test_breathing_pathway_low_moderate(self, client):
        with patch("app.services.ai_service.get_support_message", return_value="Breathe."), \
             patch("app.services.bigquery_service.log_distress_event"):
            response = client.post(
                "/pathway/analyze",
                json={"user_id": "u1", "distress_score": 0.45, "distress_category": "stress"},
                headers=self.HEADERS,
            )
        assert response.status_code == 200
        assert response.json()["pathway_type"] == "breathing"

    def test_checkin_pathway_low_score(self, client):
        with patch("app.services.ai_service.get_support_message", return_value="Keep going!"), \
             patch("app.services.bigquery_service.log_distress_event"):
            response = client.post(
                "/pathway/analyze",
                json={"user_id": "u1", "distress_score": 0.1, "distress_category": "neutral"},
                headers=self.HEADERS,
            )
        assert response.status_code == 200
        assert response.json()["pathway_type"] == "checkin"

    def test_invalid_score_rejected(self, client):
        response = client.post(
            "/pathway/analyze",
            json={"user_id": "u1", "distress_score": 1.5, "distress_category": "anxiety"},
            headers=self.HEADERS,
        )
        assert response.status_code == 400

    def test_requires_auth(self, client):
        response = client.post(
            "/pathway/analyze",
            json={"user_id": "u1", "distress_score": 0.5, "distress_category": "anxiety"},
        )
        assert response.status_code == 401


# ── Triage Logic Unit Tests ───────────────────────────────────────────────────
class TestTriageLogic:
    def test_crisis_threshold(self):
        from app.services.ai_service import determine_pathway
        result = determine_pathway(0.85, "anxiety")
        assert result["pathway_type"] == "crisis"
        assert result["is_crisis"] is True
        assert "9152987821" in result.get("crisis_hotline", "")

    def test_grounding_threshold(self):
        from app.services.ai_service import determine_pathway
        result = determine_pathway(0.60, "sadness")
        assert result["pathway_type"] == "grounding"
        assert result["is_crisis"] is False

    def test_breathing_threshold(self):
        from app.services.ai_service import determine_pathway
        result = determine_pathway(0.35, "stress")
        assert result["pathway_type"] == "breathing"

    def test_score_clamping(self):
        from app.services.ai_service import determine_pathway
        # Score > 1.0 should still return crisis (clamped to 1.0)
        result = determine_pathway(2.0, "panic")
        assert result["pathway_type"] == "crisis"

    def test_m2_process_user_state_compat(self):
        from app.services.ai_service import process_user_state
        result = process_user_state({"score": 0.9, "category": "anxiety"})
        assert result["is_crisis"] is True


# ── BigQuery Privacy Tests ────────────────────────────────────────────────────
class TestBigQueryPrivacy:
    def test_score_to_level_bucketing(self):
        from app.services.bigquery_service import _score_to_level
        assert _score_to_level(0.9) == "crisis"
        assert _score_to_level(0.7) == "high"
        assert _score_to_level(0.5) == "moderate"
        assert _score_to_level(0.1) == "low"

    def test_log_event_no_pii(self):
        """Verify that log_distress_event never receives user_id or email."""
        import inspect
        from app.services.bigquery_service import log_distress_event
        sig = inspect.signature(log_distress_event)
        param_names = list(sig.parameters.keys())
        assert "user_id" not in param_names, "user_id must never be a parameter of log_distress_event"
        assert "email" not in param_names, "email must never be a parameter of log_distress_event"
