"""
MindBridge — AI Chat Router
Gemini API + Vertex AI Emotional Music Recommendations

Safety layer added: all incoming messages are classified BEFORE emotion
detection and music recommendation.  Unsafe messages (self-harm, violence,
emergency) return a crisis/de-escalation response immediately and never
receive music or YouTube recommendations.
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List
import logging

from app.services.ai_service import _get_model
from app.services.vertex_service import detect_emotion
from app.services.music_service import get_music_recommendations
from app.services.safety_classifier import classify, SafetyCategory
from app.services.safety_response_service import get_safety_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["AI Chat"])


# ── Request / Response Schemas ───────────────────────────────────────────────


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):

    reply: str

    is_crisis: bool = False

    emotion: str = ""

    emotion_score: float = 0.0

    music: list = []


# ── Endpoint ─────────────────────────────────────────────────────────────────


@router.post("/message", response_model=ChatResponse)
async def chat_message(body: ChatRequest, request: Request):

    if not body.messages:

        raise HTTPException(status_code=400, detail="messages list cannot be empty")

    # Latest user message
    last_msg = body.messages[-1]

    if last_msg.role != "user":

        raise HTTPException(status_code=400, detail="Last message must be from user")

    # ── Safety Classification (must run first) ───────────────────────────────
    # Classify the raw user text before any AI call or media recommendation.
    # Any category other than NORMAL_SUPPORT returns immediately without
    # calling emotion detection, music recommendation, or Gemini.

    safety_category = classify(last_msg.content)

    if safety_category != SafetyCategory.NORMAL_SUPPORT:

        logger.warning(
            "Safety classifier blocked message | category=%s",
            safety_category.value,
        )

        safe_payload = get_safety_response(safety_category)

        return ChatResponse(**safe_payload)

    # ── Normal Support Pipeline ──────────────────────────────────────────────

    model = _get_model()

    # Build Gemini history
    history = []

    for msg in body.messages[:-1]:

        role = "model" if msg.role == "assistant" else "user"

        history.append({"role": role, "parts": [msg.content]})

    try:

        # ── Vertex AI Emotion Detection ─────────────────────

        emotion_result = detect_emotion(last_msg.content)

        detected_emotion = emotion_result["emotion"]

        emotion_score = emotion_result["score"]

        # Only recommend music when the emotion warrants it
        # (avoid forcing Calm/meditation content for every neutral message)
        music = (
            get_music_recommendations(detected_emotion)
            if detected_emotion not in ("Neutral",)
            else []
        )

        # ── Gemini Chat ─────────────────────────────────────

        chat = model.start_chat(history=history)

        response = chat.send_message(last_msg.content)

        reply_text = response.text

        # Crisis keyword detection in Gemini reply (secondary signal)
        crisis_keywords = [
            "crisis",
            "9152987821",
            "1860-2662-345",
            "741741",
            "emergency",
            "immediate help",
            "call now",
            "suicide hotline",
        ]

        is_crisis = any(kw.lower() in reply_text.lower() for kw in crisis_keywords)

        return ChatResponse(
            reply=reply_text,
            is_crisis=is_crisis,
            emotion=detected_emotion,
            emotion_score=emotion_score,
            music=music,
        )

    except Exception as e:

        logger.warning("Gemini chat error: %s", str(e))

        return ChatResponse(
            reply=(
                "I'm here with you. "
                "Sometimes I have trouble connecting, "
                "but your feelings are valid and important."
            ),
            is_crisis=False,
            emotion="Unknown",
            emotion_score=0.0,
            music=[],
        )
