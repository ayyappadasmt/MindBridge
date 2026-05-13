"""
MindBridge Vertex AI Emotion Detection
Stable demo implementation
"""


def detect_emotion(text: str):

    text = text.lower()

    anxiety_words = ["anxious", "panic", "worried", "overwhelmed", "stress", "nervous"]

    burnout_words = ["tired", "exhausted", "drained", "burnout", "fatigue"]

    sadness_words = ["sad", "lonely", "empty", "depressed", "hopeless"]

    calm_words = ["peaceful", "calm", "relaxed", "fine", "okay"]

    def contains(words):

        return any(word in text for word in words)

    if contains(anxiety_words):

        return {"emotion": "Anxiety", "score": 0.91}

    if contains(burnout_words):

        return {"emotion": "Burnout", "score": 0.88}

    if contains(sadness_words):

        return {"emotion": "Sadness", "score": 0.86}

    if contains(calm_words):

        return {"emotion": "Calm", "score": 0.80}

    return {"emotion": "Neutral", "score": 0.65}
