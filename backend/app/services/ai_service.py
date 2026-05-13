"""
MindBridge — AI Service
Gemini API version using google-generativeai
"""

import os
import google.generativeai as genai

from app.core.config import settings

# ── Configure Gemini API ─────────────────────────────────────────────────────

genai.configure(api_key=settings.GEMINI_API_KEY)


# ── System Prompt ────────────────────────────────────────────────────────────


def _load_system_prompt() -> str:
    """
    Load system prompt from file.
    Fallback to inline prompt if file missing.
    """

    prompt_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "ai",
        "system_prompt.txt",
    )

    try:
        with open(os.path.normpath(prompt_path), "r", encoding="utf-8") as f:
            return f.read().strip()

    except FileNotFoundError:
        pass

    return """
You are MindBridge, a compassionate emotional support assistant.

STRICT RULES:
- Never diagnose mental health conditions
- Never recommend medications or treatments
- Never claim to be a therapist or doctor
- If the user expresses self-harm or suicide thoughts,
  encourage immediate professional support

Tone:
Warm, gentle, calm, supportive.
Keep responses short and helpful.
"""


SYSTEM_INSTRUCTION = _load_system_prompt()


# ── Model Factory ────────────────────────────────────────────────────────────


def _get_model():

    return genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=SYSTEM_INSTRUCTION,
    )


# ── Support Message Generator ────────────────────────────────────────────────


def get_support_message(
    distress_category: str,
    distress_score: float,
) -> str:

    model = _get_model()

    prompt = (
        f"A user is experiencing {distress_category} "
        f"with distress level {distress_score:.1f}/1.0. "
        "Provide a warm supportive message and suggest "
        "one calming activity."
    )

    try:

        response = model.generate_content(prompt)

        return response.text

    except Exception as e:

        print("Gemini Error:", e)

        return "You're not alone. " "Take a slow breath and be gentle with yourself."


# ── Chat Response ────────────────────────────────────────────────────────────


def get_chat_response(messages: list) -> str:

    model = _get_model()

    history = []

    for msg in messages[:-1]:

        role = "model" if msg["role"] == "assistant" else "user"

        history.append(
            {
                "role": role,
                "parts": [msg["content"]],
            }
        )

    try:

        chat = model.start_chat(history=history)

        last_message = messages[-1]["content"]

        response = chat.send_message(last_message)

        return response.text

    except Exception as e:

        print("Gemini Chat Error:", e)

        return (
            "I'm here with you. "
            "Sometimes I have trouble connecting, "
            "but your feelings are important."
        )


# ── Pathway Logic ────────────────────────────────────────────────────────────


def determine_pathway(
    distress_score: float,
    distress_category: str,
) -> dict:

    score = max(0.0, min(1.0, distress_score))

    # Crisis
    if score >= 0.85:

        return {
            "pathway_type": "crisis",
            "tool_title": "You're Not Alone — Immediate Support",
            "tool_description": (
                "Please reach out to a crisis counselor right now. "
                "You deserve support."
            ),
            "crisis_hotline": (
                "iCall: 9152987821 | " "Vandrevala Foundation: 1860-2662-345"
            ),
            "tool_url": "https://icallhelpline.org",
            "triage_level": "crisis",
            "triage_action": "show_crisis_resources",
            "is_crisis": True,
        }

    # Moderate
    elif score >= 0.60:

        return {
            "pathway_type": "grounding",
            "tool_title": "5-4-3-2-1 Grounding Technique",
            "tool_description": (
                f"It seems you're dealing with {distress_category}. "
                "Notice 5 things you see, "
                "4 things you touch, "
                "3 things you hear, "
                "2 things you smell, "
                "1 thing you taste."
            ),
            "tool_url": "https://mindbridge.app/tools/grounding",
            "triage_level": "moderate",
            "triage_action": "grounding_exercise",
            "is_crisis": False,
        }

    # Mild
    elif score >= 0.35:

        return {
            "pathway_type": "breathing",
            "tool_title": "4-7-8 Breathing Exercise",
            "tool_description": (
                "Inhale for 4 counts, " "hold for 7, " "exhale for 8."
            ),
            "tool_url": "https://mindbridge.app/tools/breathing",
            "triage_level": "low_moderate",
            "triage_action": "breathing_exercise",
            "is_crisis": False,
        }

    # Low
    else:

        return {
            "pathway_type": "checkin",
            "tool_title": "Positive Check-In",
            "tool_description": (
                "You seem to be doing okay. " "Keep taking care of yourself."
            ),
            "tool_url": "https://mindbridge.app/tools/journal",
            "triage_level": "low",
            "triage_action": "positive_checkin",
            "is_crisis": False,
        }


# ── Backward Compatibility Wrapper ───────────────────────────────────────────


def process_user_state(payload: dict) -> dict:

    score = payload.get("score", 0.0)

    category = payload.get("category", "unknown")

    return determine_pathway(score, category)
