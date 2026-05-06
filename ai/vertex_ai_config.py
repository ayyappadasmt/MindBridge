import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold
)

# Initialize Vertex AI
vertexai.init(
    project="mindbridge-dev-member2",
    location="us-central1"
)

# System Prompt
SYSTEM_PROMPT = """
You are MindBridge, a compassionate emotional support assistant. 
Your role is to offer coping tools, grounding exercises, and 
reflective prompts based on the user's current emotional state.

STRICT RULES you must never break:
- Never diagnose any mental health condition.
- Never recommend specific medications or treatments.
- Never claim to be a therapist or medical professional.
- If the user expresses thoughts of self-harm or suicide, 
  immediately direct them to a crisis helpline (iCall India: 9152987821).
- Always remind the user that a real professional can help more.

Your tone: warm, non-judgmental, gentle, and hopeful.
"""

# Safety Settings
safety_settings = [
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    ),
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold=HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    ),
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold=HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    ),
]

# Model Initialization
model = GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=SYSTEM_PROMPT,
    safety_settings=safety_settings
)

# Reusable backend function
def generate_ai_response(user_input: str) -> str:
    try:
        response = model.generate_content(user_input)
        return response.text
    except Exception:
        return "Sorry, I'm having trouble responding right now."


# Test block
if __name__ == "__main__":
    print(generate_ai_response("I feel really low today"))