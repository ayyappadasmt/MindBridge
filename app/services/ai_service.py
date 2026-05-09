import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold,
)
from app.core.config import settings

vertexai.init(project=settings.PROJECT_ID, location=settings.REGION)

# Safety settings — block anything that could be harmful
SAFETY_SETTINGS = [
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    ),
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold=HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    ),
]

SYSTEM_INSTRUCTION = """
You are MindBridge, a compassionate mental wellness support companion.
STRICT RULES:
1. NEVER diagnose any mental illness or medical condition.
2. NEVER prescribe medication or treatments.
3. ALWAYS remind users that you are not a replacement for professional help.
4. Offer only evidence-based coping tools: breathing exercises, grounding techniques, journaling prompts.
5. If distress is severe, ALWAYS surface crisis hotline numbers.
6. Use warm, non-judgmental, simple language. Max 3 sentences.
"""


def get_support_message(distress_category: str, distress_score: float) -> str:
    model = GenerativeModel(
        settings.VERTEX_AI_MODEL,
        system_instruction=SYSTEM_INSTRUCTION,
    )
    prompt = f"""
    A user is experiencing {distress_category} with a distress level of {distress_score:.1f}/1.0.
    Provide a brief, warm, supportive message and suggest ONE specific coping tool they can try right now.
    Do not diagnose. Do not use clinical language.
    """
    response = model.generate_content(prompt, safety_settings=SAFETY_SETTINGS)
    return response.text


def determine_pathway(distress_score: float, distress_category: str) -> dict:
    """
    Core triage logic — maps distress score to a support pathway.
    This is the Pathway Controller engine.
    """
    if distress_score >= 0.85:
        return {
            "pathway_type": "crisis",
            "tool_title": "You're Not Alone — Immediate Support",
            "tool_description": "Your feelings matter. Please reach out to a crisis counselor right now.",
            "crisis_hotline": "iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345",
            "tool_url": "https://icallhelpline.org",
        }
    elif distress_score >= 0.65:
        return {
            "pathway_type": "peer_support",
            "tool_title": "Talk to Someone",
            "tool_description": "Sometimes sharing helps. Consider reaching out to a trusted friend or peer support group.",
            "tool_url": "https://7cups.com",
        }
    elif distress_score >= 0.40:
        return {
            "pathway_type": "breathing",
            "tool_title": "4-7-8 Breathing Exercise",
            "tool_description": "Inhale for 4 counts, hold for 7, exhale for 8. Repeat 3 times to calm your nervous system.",
            "tool_url": "https://mindbridge.app/tools/breathing",
        }
    else:
        return {
            "pathway_type": "grounding",
            "tool_title": "5-4-3-2-1 Grounding Technique",
            "tool_description": "Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
            "tool_url": "https://mindbridge.app/tools/grounding",
        }
