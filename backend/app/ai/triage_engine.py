"""
MindBridge — Triage Engine (Standalone Module)
Source: Member 1 (app/ai/triage_engine.py) + Member 2 (ai/triage_engine.py) — identical

Restored during frontend integration audit (was dropped in Phase 2 merge).

The canonical triage logic lives in app/services/ai_service.determine_pathway().
This file is kept for:
  - Backward compatibility (any external scripts importing from app.ai.triage_engine)
  - Explainability / documentation of the triage decision logic
  - Unit testing the pure score→pathway mapping in isolation

All functions here delegate to the integrated ai_service implementation.
"""

from app.services.ai_service import determine_pathway, process_user_state


def get_support_pathway(score: float, category: str) -> dict:
    """
    Map a distress score to a support pathway.
    Delegates to the integrated ai_service.determine_pathway().

    Args:
        score:    distress level 0.0–1.0
        category: emotion category e.g. "anxiety", "sadness"

    Returns:
        Pathway dict with pathway_type, triage_level, is_crisis, etc.
    """
    return determine_pathway(score, category)


# Module-level re-exports for backward compatibility
__all__ = ["get_support_pathway", "process_user_state"]


# ── Test block (run standalone: python -m app.ai.triage_engine) ───────────
if __name__ == "__main__":
    test_cases = [
        {"score": 0.92, "category": "anxiety"},
        {"score": 0.70, "category": "sadness"},
        {"score": 0.45, "category": "stress"},
        {"score": 0.10, "category": "neutral"},
    ]
    for tc in test_cases:
        result = get_support_pathway(tc["score"], tc["category"])
        print(f"score={tc['score']} cat={tc['category']!r:12} → "
              f"{result['pathway_type']:10} crisis={result['is_crisis']}")
