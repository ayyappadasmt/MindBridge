"""
MindBridge — AI Chat Router
Fixes the CORS error caused by AIAssistant.jsx calling api.anthropic.com directly.

Root cause: Browsers cannot call api.anthropic.com — Anthropic's API has no
CORS headers by design. API keys must never be in frontend bundles.

Solution: This endpoint proxies the conversation through the FastAPI backend,
using the existing Vertex AI Gemini setup already wired in ai_service.py.
The frontend calls POST /chat/message (same origin as all other API calls),
this handler runs on the server, calls Vertex AI, and returns the reply.

Security properties preserved:
  - No API key in frontend bundle
  - Firebase JWT required (auth middleware)
  - Ethical system prompt enforced server-side
  - Safety filters applied (same BLOCK_LOW_AND_ABOVE settings)
  - Crisis escalation logic intact
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List
import logging

from app.services.ai_service import _get_model

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["AI Chat"])


# ── Request / Response schemas ────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str     # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    is_crisis: bool = False


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/message", response_model=ChatResponse)
async def chat_message(body: ChatRequest, request: Request):
    """
    Receive a conversation history from the frontend and return an AI reply.

    The frontend sends the full message history on each turn (stateless).
    We use the existing Vertex AI Gemini model with the MindBridge system prompt
    and safety filters — no new dependencies, no API keys in the browser.
    """
    if not body.messages:
        raise HTTPException(status_code=400, detail="messages list cannot be empty")

    # Vertex AI GenerativeModel with system prompt + safety filters (from ai_service)
    model = _get_model()

    # Build the chat history in Vertex AI format
    # Vertex AI uses "user" / "model" roles (not "assistant")
    history_for_vertex = []
    for msg in body.messages[:-1]:   # all but the last message → history
        role = "model" if msg.role == "assistant" else "user"
        history_for_vertex.append({"role": role, "parts": [msg.content]})

    # The last message is the new user turn
    last_msg = body.messages[-1]
    if last_msg.role != "user":
        raise HTTPException(status_code=400, detail="Last message must be from user")

    try:
        chat = model.start_chat(history=history_for_vertex)
        response = chat.send_message(last_msg.content)
        reply_text = response.text

        # Detect crisis keywords in reply for frontend escalation UI
        crisis_keywords = ["crisis", "9152987821", "1860-2662-345", "741741",
                           "emergency", "immediate help", "call now"]
        is_crisis = any(kw in reply_text.lower() for kw in crisis_keywords)

        return ChatResponse(reply=reply_text, is_crisis=is_crisis)

    except Exception as e:
        logger.warning("Vertex AI chat error: %s", str(e))
        # Return a safe, non-empty fallback — never a bare 500 to a wellness user
        return ChatResponse(
            reply=(
                "I'm here with you. Sometimes I have trouble connecting, but "
                "your feelings are valid and important. "
                "If you're in distress right now, please reach out to iCall: 9152987821."
            ),
            is_crisis=False,
        )
