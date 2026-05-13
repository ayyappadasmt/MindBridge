"""
MindBridge — Safety Response Service
Generates structured crisis / de-escalation responses for unsafe messages.
Music and YouTube fields are always null/empty in these responses so that
the frontend never shows media recommendations during a crisis.

India-specific crisis resources are used by default; they can be overridden
via the CRISIS_RESOURCES dict below without touching response logic.
"""

from app.services.safety_classifier import SafetyCategory

# ── Configurable Crisis Resources ────────────────────────────────────────────
# Update these numbers/URLs for your deployment region.
CRISIS_RESOURCES = {
    "icall": {
        "name": "iCall (India)",
        "number": "9152987821",
        "url": "https://icallhelpline.org",
    },
    "vandrevala": {
        "name": "Vandrevala Foundation (India)",
        "number": "1860-2662-345",
        "url": "https://www.vandrevalafoundation.com",
    },
    "emergency": {
        "name": "Emergency Services (India)",
        "number": "112",
    },
}

_ICALL = (
    f"{CRISIS_RESOURCES['icall']['name']}: {CRISIS_RESOURCES['icall']['number']}"
)
_VANDREVALA = (
    f"{CRISIS_RESOURCES['vandrevala']['name']}: "
    f"{CRISIS_RESOURCES['vandrevala']['number']}"
)
_EMERGENCY = (
    f"{CRISIS_RESOURCES['emergency']['name']}: "
    f"{CRISIS_RESOURCES['emergency']['number']}"
)


# ── Response Templates ────────────────────────────────────────────────────────

_RESPONSES: dict[SafetyCategory, str] = {

    SafetyCategory.SELF_HARM_IMMINENT: (
        "I hear you, and I'm genuinely concerned about your safety right now. "
        "Please reach out to a crisis counsellor immediately — "
        f"you can call {_ICALL} or {_VANDREVALA}. "
        "If you are in immediate danger, please call emergency services ("
        f"{_EMERGENCY}) or go to your nearest hospital. "
        "You matter, and there are people who want to help you through this moment."
    ),

    SafetyCategory.SELF_HARM_IDEATION: (
        "Thank you for trusting me with how you're feeling. "
        "These thoughts can feel overwhelming, and you deserve real support. "
        "Please consider talking to someone you trust today, "
        "or reaching out to a counsellor — "
        f"{_ICALL} is available to listen without judgment. "
        "You don't have to carry this alone."
    ),

    SafetyCategory.VIOLENCE_INTENT: (
        "I can hear that you're in a very distressed place right now. "
        "Please step away from the situation and give yourself some space. "
        "If you feel you might act on these feelings, "
        f"call emergency services ({_EMERGENCY}) or a trusted person immediately. "
        "Reaching out for help is the strongest thing you can do right now."
    ),

    SafetyCategory.VIOLENCE_CONFESSION: (
        "Your safety and the safety of anyone involved is the most important thing right now. "
        f"Please contact emergency services ({_EMERGENCY}) immediately "
        "to make sure everyone gets the help they need. "
        "If you are injured or in danger, move to a safe place and call for help."
    ),

    SafetyCategory.EMERGENCY_OR_UNSAFE: (
        f"Please call emergency services right now ({_EMERGENCY}). "
        "If you can, move to a safe location away from any immediate danger. "
        "Stay on the line with the emergency operator — help is on the way."
    ),
}


# ── Public API ────────────────────────────────────────────────────────────────

def get_safety_response(category: SafetyCategory) -> dict:
    """
    Build a ChatResponse-compatible dict for an unsafe message.

    Music, emotion scores, and YouTube links are deliberately omitted
    (set to empty/null) so the frontend never shows media in a crisis.

    Args:
        category: The SafetyCategory returned by the classifier.

    Returns:
        A dict matching the ChatResponse schema used in routers/chat.py.
    """
    reply = _RESPONSES.get(
        category,
        (
            "I'm concerned about what you've shared. "
            "Please reach out to emergency services or a trusted person immediately."
        ),
    )

    return {
        "reply": reply,
        "is_crisis": True,
        "emotion": "",
        "emotion_score": 0.0,
        "music": [],
    }
