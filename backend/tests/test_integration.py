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


# ── Safety Classifier Unit Tests ──────────────────────────────────────────────
class TestSafetyClassifier:
    """
    Pure-unit tests for the deterministic safety classifier.
    No mocks needed — the classifier has zero external dependencies.
    """

    def _classify(self, text: str):
        from app.services.safety_classifier import classify
        return classify(text)

    # SELF_HARM_IMMINENT
    def test_want_to_die(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I want to die") == SafetyCategory.SELF_HARM_IMMINENT

    def test_kill_myself(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I am going to kill myself") == SafetyCategory.SELF_HARM_IMMINENT

    def test_end_my_life(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I will end my life tonight") == SafetyCategory.SELF_HARM_IMMINENT

    def test_suicide_word(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I want to suicide") == SafetyCategory.SELF_HARM_IMMINENT

    def test_cant_live_anymore(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I can't live anymore") == SafetyCategory.SELF_HARM_IMMINENT

    # SELF_HARM_IDEATION
    def test_feel_like_dying(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("Sometimes I feel like dying") == SafetyCategory.SELF_HARM_IDEATION

    def test_wish_not_wake_up(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I wish I wouldn't wake up") == SafetyCategory.SELF_HARM_IDEATION

    def test_life_is_pointless(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("Life is pointless") == SafetyCategory.SELF_HARM_IDEATION

    def test_dont_want_to_exist(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I don't want to exist anymore") == SafetyCategory.SELF_HARM_IDEATION

    # VIOLENCE_INTENT
    def test_want_to_kill_someone(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I want to kill someone") == SafetyCategory.VIOLENCE_INTENT

    def test_going_to_hurt_him(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I am going to hurt him") == SafetyCategory.VIOLENCE_INTENT

    def test_want_to_murder_boss(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I want to murder my boss") == SafetyCategory.VIOLENCE_INTENT

    def test_will_stab_them(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I will stab them") == SafetyCategory.VIOLENCE_INTENT

    # VIOLENCE_CONFESSION
    def test_killed_someone(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I killed someone") == SafetyCategory.VIOLENCE_CONFESSION

    def test_murdered_someone(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I murdered someone last night") == SafetyCategory.VIOLENCE_CONFESSION

    def test_stabbed_him(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I stabbed him") == SafetyCategory.VIOLENCE_CONFESSION

    # EMERGENCY_OR_UNSAFE
    def test_blood_everywhere(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("There is blood everywhere") == SafetyCategory.EMERGENCY_OR_UNSAFE

    def test_someone_unconscious(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("Someone is unconscious") == SafetyCategory.EMERGENCY_OR_UNSAFE

    def test_have_a_weapon(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I have a weapon") == SafetyCategory.EMERGENCY_OR_UNSAFE

    # NORMAL_SUPPORT — must NOT be blocked
    def test_normal_stress(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I'm really stressed about my exams") == SafetyCategory.NORMAL_SUPPORT

    def test_normal_sadness(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I feel so sad and lonely today") == SafetyCategory.NORMAL_SUPPORT

    def test_normal_anxiety(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("I've been feeling very anxious at work") == SafetyCategory.NORMAL_SUPPORT

    def test_normal_breakup(self):
        from app.services.safety_classifier import SafetyCategory
        assert self._classify("My relationship ended and I feel heartbroken") == SafetyCategory.NORMAL_SUPPORT


# ── Safety Response Service Unit Tests ────────────────────────────────────────
class TestSafetyResponseService:
    """Verify that safety responses never include music recommendations."""

    def _get_response(self, category):
        from app.services.safety_response_service import get_safety_response
        return get_safety_response(category)

    def test_self_harm_imminent_no_music(self):
        from app.services.safety_classifier import SafetyCategory
        resp = self._get_response(SafetyCategory.SELF_HARM_IMMINENT)
        assert resp["music"] == []
        assert resp["is_crisis"] is True
        assert resp["reply"]  # non-empty reply

    def test_self_harm_ideation_no_music(self):
        from app.services.safety_classifier import SafetyCategory
        resp = self._get_response(SafetyCategory.SELF_HARM_IDEATION)
        assert resp["music"] == []
        assert resp["is_crisis"] is True

    def test_violence_intent_no_music(self):
        from app.services.safety_classifier import SafetyCategory
        resp = self._get_response(SafetyCategory.VIOLENCE_INTENT)
        assert resp["music"] == []
        assert resp["is_crisis"] is True

    def test_violence_confession_no_music(self):
        from app.services.safety_classifier import SafetyCategory
        resp = self._get_response(SafetyCategory.VIOLENCE_CONFESSION)
        assert resp["music"] == []
        assert resp["is_crisis"] is True

    def test_emergency_no_music(self):
        from app.services.safety_classifier import SafetyCategory
        resp = self._get_response(SafetyCategory.EMERGENCY_OR_UNSAFE)
        assert resp["music"] == []
        assert resp["is_crisis"] is True

    def test_crisis_resources_present(self):
        """iCall and Vandrevala numbers must appear in imminent crisis reply."""
        from app.services.safety_classifier import SafetyCategory
        resp = self._get_response(SafetyCategory.SELF_HARM_IMMINENT)
        assert "9152987821" in resp["reply"]
        assert "1860-2662-345" in resp["reply"]


# ── Chat Endpoint Safety Integration Tests ────────────────────────────────────
class TestChatSafetyIntegration:
    """
    End-to-end tests through the /chat/message endpoint.
    Verify that unsafe messages never trigger music recommendation.
    """

    HEADERS = {"Authorization": "Bearer fake-valid-token"}

    def _post(self, client, text: str):
        return client.post(
            "/chat/message",
            json={"messages": [{"role": "user", "content": text}]},
            headers=self.HEADERS,
        )

    def test_want_to_die_no_music(self, client):
        resp = self._post(client, "I want to die")
        assert resp.status_code == 200
        data = resp.json()
        assert data["music"] == []
        assert data["is_crisis"] is True

    def test_kill_myself_no_music(self, client):
        resp = self._post(client, "I am going to kill myself")
        assert resp.status_code == 200
        assert resp.json()["music"] == []

    def test_want_to_kill_someone_no_music(self, client):
        resp = self._post(client, "I want to kill someone")
        assert resp.status_code == 200
        data = resp.json()
        assert data["music"] == []
        assert data["is_crisis"] is True

    def test_killed_someone_no_music(self, client):
        resp = self._post(client, "I killed someone")
        assert resp.status_code == 200
        data = resp.json()
        assert data["music"] == []
        assert data["is_crisis"] is True

    def test_normal_stress_allows_music_pipeline(self, client):
        """
        Normal stress messages should pass through to the Gemini/emotion pipeline.
        We mock Gemini + Vertex to avoid real API calls; the important assertion
        is that the safety layer does NOT block the message.
        """
        mock_emotion = {"emotion": "Anxiety", "score": 0.91}
        mock_reply = MagicMock()
        mock_reply.text = "It sounds like you're under a lot of pressure. Try a breathing exercise."
        mock_chat = MagicMock()
        mock_chat.send_message.return_value = mock_reply
        mock_model = MagicMock()
        mock_model.start_chat.return_value = mock_chat

        with patch("app.routers.chat._get_model", return_value=mock_model), \
             patch("app.routers.chat.detect_emotion", return_value=mock_emotion):
            resp = self._post(client, "I've been really stressed about my exams")

        assert resp.status_code == 200
        data = resp.json()
        # Safety layer must not have blocked this
        assert data["emotion"] == "Anxiety"
        # Music should be present for Anxiety (not blocked)
        assert isinstance(data["music"], list)
