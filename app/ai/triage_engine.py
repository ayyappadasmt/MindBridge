def get_support_pathway(score: float, category: str) -> dict:
    """
    Input:  score = distress level (0.0 to 1.0)
            category = e.g., "anxiety", "sadness", "anger"
    Output: recommended support action
    """

    # Clamp score to valid range
    score = max(0.0, min(1.0, score))

    # HIGH distress — crisis support
    if score >= 0.85:
        return {
            "level": "crisis",
            "action": "show_crisis_resources",
            "message": "I'm really sorry you're feeling this way. Please reach out to someone immediately—you don’t have to handle this alone.",
            "resource": "iCall India: 9152987821 | Vandrevala Foundation: 1860-2662-345",
            "priority": "urgent",
            "is_crisis": True
        }

    # MODERATE distress — grounding
    elif score >= 0.6:
        return {
            "level": "moderate",
            "action": "grounding_exercise",
            "message": f"It seems you're dealing with {category}. Let's try a quick grounding exercise.",
            "exercise": "5-4-3-2-1 Senses technique",
            "is_crisis": False
        }

    # LOW-MODERATE — journaling
    elif score >= 0.35:
        return {
            "level": "low_moderate",
            "action": "journaling_prompt",
            "message": "Would you like to explore what you're feeling a bit more?",
            "prompt": "What's one small thing that felt okay today?",
            "is_crisis": False
        }

    # LOW distress — positive check-in
    else:
        return {
            "level": "low",
            "action": "positive_checkin",
            "message": "You seem to be doing okay! Keep going.",
            "is_crisis": False
        }


def process_user_state(payload: dict) -> dict:
    """
    Wrapper function for backend integration
    """

    score = payload.get("score", 0.0)
    category = payload.get("category", "unknown")

    return get_support_pathway(score, category)


# Test block
if __name__ == "__main__":
    test_payloads = [
        {"score": 0.9, "category": "anxiety"},
        {"score": 0.7, "category": "sadness"},
        {"score": 0.4, "category": "anger"},
        {"score": 0.1, "category": "neutral"},
    ]

    for p in test_payloads:
        result = process_user_state(p)
        print(f"Input {p} → {result['level']}: {result['action']}")