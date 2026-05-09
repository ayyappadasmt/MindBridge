"""
MindBridge — AI Service (Integrated)
Sources: Member 1 (ai_service.py) + Member 2 (vertex_ai_config.py, triage_engine.py)

Integration decisions:
  - Vertex AI initialized with PROJECT_ID from settings (not M2's hardcoded 'mindbridge-dev-member2')
  - Safety settings: combined M1 + M2 filters (M2 added HATE_SPEECH, kept BLOCK_LOW_AND_ABOVE
    for dangerous/harassment which is stricter — using M2's stricter thresholds)
  - System prompt: loaded from file (app/ai/system_prompt.txt) with inline fallback
  - Triage logic: M2's triage_engine merged inline and extended with M1's pathway details
  - determine_pathway() is the canonical triage function used by the pathway router

ETHICAL CONSTRAINTS (DO NOT WEAKEN):
  - Never diagnose mental health conditions
  - Never recommend medications or treatments
  - Crisis escalation always surfaces hotlines at score >= 0.85
  - Safety filters block dangerous/harmful content
"""

import os
import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold,
)
from app.core.config import settings

# ── Vertex AI Initialization ──────────────────────────────────────────────────
# Use PROJECT_ID from settings (not hardcoded dev project from M2)
vertexai.init(project=settings.PROJECT_ID, location=settings.REGION)

# ── Safety Settings (M2 stricter thresholds applied) ─────────────────────────
SAFETY_SETTINGS = [
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,  # M2: stricter than M1's MEDIUM
    ),
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold=HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,  # M2: stricter
    ),
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold=HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,  # M2 addition
    ),
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold=HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    ),
]

# ── System Prompt ─────────────────────────────────────────────────────────────
def _load_system_prompt() -> str:
    """Load system prompt from file; fall back to inline if file missing."""
    prompt_path = os.path.join(os.path.dirname(__file__), "..", "ai", "system_prompt.txt")
    try:
        with open(os.path.normpath(prompt_path), "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        pass

    # Inline fallback — identical to the file content
    return """You are MindBridge, a compassionate emotional support assistant.
Your role is to offer coping tools, grounding exercises, and
reflective prompts based on the user's current emotional state.

STRICT RULES you must never break:
- Never diagnose any mental health condition.
- Never recommend specific medications or treatments.
- Never claim to be a therapist or medical professional.
- If the user expresses thoughts of self-harm or suicide,
  immediately direct them to a crisis helpline
  (iCall India: 9152987821 | Vandrevala Foundation: 1860-2662-345).
- Always remind the user that a real professional can help more.

Your tone: warm, non-judgmental, gentle, and hopeful.
Response length: 2-3 sentences maximum."""


SYSTEM_INSTRUCTION = _load_system_prompt()


# ── Model Factory ─────────────────────────────────────────────────────────────
def _get_model() -> GenerativeModel:
    """Create a fresh model instance with system instruction and safety settings."""
    return GenerativeModel(
        settings.VERTEX_AI_MODEL,
        system_instruction=SYSTEM_INSTRUCTION,
        safety_settings=SAFETY_SETTINGS,
    )


# ── Public API: AI-generated supportive message ───────────────────────────────
def get_support_message(distress_category: str, distress_score: float) -> str:
    """
    Generate a compassionate, non-clinical support message via Vertex AI Gemini.

    Args:
        distress_category: e.g. "anxiety", "grief", "burnout"
        distress_score: float 0.0–1.0 from edge AI

    Returns:
        AI-generated support message string, or a safe fallback on error.
    """
    model = _get_model()
    prompt = (
        f"A user is experiencing {distress_category} with a distress level "
        f"of {distress_score:.1f}/1.0. "
        "Provide a brief, warm, supportive message and suggest ONE specific coping "
        "tool they can try right now. Do not diagnose. Do not use clinical language. "
        "Keep it to 2-3 sentences."
    )
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return (
            "You're doing great by checking in. "
            "Remember, it's okay to ask for help — you don't have to face this alone."
        )


# ── Public API: Triage + Pathway Logic ───────────────────────────────────────
def determine_pathway(distress_score: float, distress_category: str) -> dict:
    """
    Core triage logic (Member 2 engine merged with Member 1 pathway details).
    Maps distress score to a structured support pathway.

    Thresholds (from Member 2):
      >= 0.85 → crisis (immediate hotline)
      >= 0.60 → grounding exercise  [M2: 0.6, M1: 0.65 — using M2's lower trigger]
      >= 0.35 → breathing / peer    [M2: 0.35, M1: 0.40 — using M2's lower trigger]
      <  0.35 → positive check-in

    Returns a dict compatible with SupportPathway schema.
    """
    score = max(0.0, min(1.0, distress_score))

    if score >= 0.85:
        return {
            "pathway_type": "crisis",
            "tool_title": "You're Not Alone — Immediate Support",
            "tool_description": (
                "Your feelings matter. Please reach out to a crisis counselor right now. "
                "You deserve support."
            ),
            "crisis_hotline": "iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345",
            "tool_url": "https://icallhelpline.org",
            # M2 metadata for internal use
            "triage_level": "crisis",
            "triage_action": "show_crisis_resources",
            "is_crisis": True,
        }
    elif score >= 0.60:
        return {
            "pathway_type": "grounding",
            "tool_title": "5-4-3-2-1 Grounding Technique",
            "tool_description": (
                f"It seems you're dealing with some {distress_category}. "
                "Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste."
            ),
            "tool_url": "https://mindbridge.app/tools/grounding",
            "triage_level": "moderate",
            "triage_action": "grounding_exercise",
            "is_crisis": False,
        }
    elif score >= 0.35:
        return {
            "pathway_type": "breathing",
            "tool_title": "4-7-8 Breathing Exercise",
            "tool_description": (
                "Inhale for 4 counts, hold for 7, exhale for 8. "
                "Repeat 3 times to calm your nervous system."
            ),
            "tool_url": "https://mindbridge.app/tools/breathing",
            "triage_level": "low_moderate",
            "triage_action": "breathing_exercise",
            "is_crisis": False,
        }
    else:
        return {
            "pathway_type": "checkin",
            "tool_title": "Positive Check-In",
            "tool_description": "You seem to be doing okay. Keep going — you've got this.",
            "tool_url": "https://mindbridge.app/tools/journal",
            "triage_level": "low",
            "triage_action": "positive_checkin",
            "is_crisis": False,
        }


# ── Backward-compatible wrapper (M2 process_user_state interface) ─────────────
def process_user_state(payload: dict) -> dict:
    """
    M2-compatible wrapper. Used if any service passes the M2 payload format.
    """
    score = payload.get("score", 0.0)
    category = payload.get("category", "unknown")
    return determine_pathway(score, category)
