"""
MindBridge — Safety Classifier
Deterministic phrase/regex-based classifier that runs BEFORE emotion
detection and music recommendation.

Categories (in priority order):
  SELF_HARM_IMMINENT   — immediate suicidal intent
  SELF_HARM_IDEATION   — passive suicidal / self-harm thoughts
  VIOLENCE_INTENT      — stated intent to harm another person
  VIOLENCE_CONFESSION  — confession of having harmed another person
  EMERGENCY_OR_UNSAFE  — active emergency / physical danger
  NORMAL_SUPPORT       — everyday emotional support (default)
"""

import re
from enum import Enum
from typing import Tuple


# ── Category Enum ─────────────────────────────────────────────────────────────

class SafetyCategory(str, Enum):
    SELF_HARM_IMMINENT = "SELF_HARM_IMMINENT"
    SELF_HARM_IDEATION = "SELF_HARM_IDEATION"
    VIOLENCE_INTENT = "VIOLENCE_INTENT"
    VIOLENCE_CONFESSION = "VIOLENCE_CONFESSION"
    EMERGENCY_OR_UNSAFE = "EMERGENCY_OR_UNSAFE"
    NORMAL_SUPPORT = "NORMAL_SUPPORT"


# ── Pattern Sets ──────────────────────────────────────────────────────────────
# Each tuple is (compiled_regex, SafetyCategory).
# Patterns are evaluated in order; the first match wins.
# Longer / more specific patterns come before shorter ones.

_PATTERNS: list[Tuple[re.Pattern, SafetyCategory]] = []


def _p(pattern: str, category: SafetyCategory) -> None:
    """Register a pattern (case-insensitive, word-boundary aware)."""
    _PATTERNS.append((re.compile(pattern, re.IGNORECASE), category))


# ── SELF_HARM_IMMINENT ────────────────────────────────────────────────────────
_p(r"\bi(?:'m| am| will| want to| m going to|'m going to)\b.{0,40}\b(kill|end|take)\b.{0,20}\b(myself|my life|my own life)\b", SafetyCategory.SELF_HARM_IMMINENT)
_p(r"\b(going to|gonna|will|want to|about to)\b.{0,30}\b(suicide|suicid|kill myself|end my life|take my life|hang myself|od myself|overdose myself)\b", SafetyCategory.SELF_HARM_IMMINENT)
_p(r"\b(i want to die|i wanna die)\b", SafetyCategory.SELF_HARM_IMMINENT)
_p(r"\b(i can'?t live anymore|i can'?t go on|i can'?t take it anymore)\b", SafetyCategory.SELF_HARM_IMMINENT)
_p(r"\b(end(?:ing)? my life|end(?:ing)? it all|end(?:ing)? everything tonight)\b", SafetyCategory.SELF_HARM_IMMINENT)
_p(r"\b(tonight|today|right now|this moment).{0,40}\b(kill|end|take)\b.{0,20}\b(myself|my life)\b", SafetyCategory.SELF_HARM_IMMINENT)
_p(r"\bsuicid(?:e|al|ing)\b", SafetyCategory.SELF_HARM_IMMINENT)

# ── SELF_HARM_IDEATION ────────────────────────────────────────────────────────
_p(r"\b(feel(?:ing)? like dying|wish(?:ed)? i was dead|wish(?:ed)? i were dead)\b", SafetyCategory.SELF_HARM_IDEATION)
_p(r"\b(wish i (wouldn'?t|would not|won'?t) wake up|wish i (never|didn'?t) wake up)\b", SafetyCategory.SELF_HARM_IDEATION)
_p(r"\b(life is (pointless|meaningless|worthless|useless)|no reason to live|no point in living)\b", SafetyCategory.SELF_HARM_IDEATION)
_p(r"\b(don'?t want to exist|don'?t want to be here|don'?t want to be alive)\b", SafetyCategory.SELF_HARM_IDEATION)
_p(r"\b(better off (dead|without me)|everyone (would be|is) better off without me)\b", SafetyCategory.SELF_HARM_IDEATION)
_p(r"\b(self.harm|cut(?:ting)? myself|hurt(?:ing)? myself|harm(?:ing)? myself)\b", SafetyCategory.SELF_HARM_IDEATION)
_p(r"\b(thinking about (suicide|killing myself|ending it))\b", SafetyCategory.SELF_HARM_IDEATION)

# ── VIOLENCE_INTENT ───────────────────────────────────────────────────────────
_p(r"\b(going to|gonna|want to|will|i'?m going to|i'?m gonna)\b.{0,30}\b(kill|murder|stab|shoot|beat up|attack|hurt|harm|destroy)\b.{0,30}\b(him|her|them|someone|my|the)\b", SafetyCategory.VIOLENCE_INTENT)
_p(r"\b(i want to kill|i want to murder|i want to stab|i want to shoot|i want to hurt)\b.{0,40}\b(someone|him|her|them|my|the)\b", SafetyCategory.VIOLENCE_INTENT)
_p(r"\b(i'?m going to (kill|murder|hurt|stab|attack|destroy))\b", SafetyCategory.VIOLENCE_INTENT)
_p(r"\b(want to (kill|murder|strangle|harm) (my|his|her|their|the|a)\b)", SafetyCategory.VIOLENCE_INTENT)
_p(r"\b(planning to (hurt|kill|attack|harm|stab|shoot) (someone|him|her|them))\b", SafetyCategory.VIOLENCE_INTENT)

# ── VIOLENCE_CONFESSION ───────────────────────────────────────────────────────
_p(r"\b(i (killed|murdered|stabbed|shot|attacked|beat|choked|strangled|poisoned|hurt) (someone|him|her|them|a person|my))\b", SafetyCategory.VIOLENCE_CONFESSION)
_p(r"\b(i have (killed|murdered|hurt|stabbed|shot) (someone|him|her|a person))\b", SafetyCategory.VIOLENCE_CONFESSION)
_p(r"\b(just (killed|murdered|stabbed|shot|hurt) (someone|him|her|them|a person))\b", SafetyCategory.VIOLENCE_CONFESSION)
_p(r"\b(i hurt someone (badly|seriously|really bad))\b", SafetyCategory.VIOLENCE_CONFESSION)

# ── EMERGENCY_OR_UNSAFE ───────────────────────────────────────────────────────
_p(r"\b(blood (everywhere|all over|is pouring)|there('?s| is) blood\b)", SafetyCategory.EMERGENCY_OR_UNSAFE)
_p(r"\b(someone is (unconscious|not breathing|unresponsive|dying|having a seizure))\b", SafetyCategory.EMERGENCY_OR_UNSAFE)
_p(r"\b(i have a (gun|knife|weapon|blade))\b", SafetyCategory.EMERGENCY_OR_UNSAFE)
_p(r"\b(i'?m in danger|i am in danger|someone is (threatening|chasing|attacking) me)\b", SafetyCategory.EMERGENCY_OR_UNSAFE)
_p(r"\b(call (the police|an ambulance|911|100|112)|need (an ambulance|emergency help))\b", SafetyCategory.EMERGENCY_OR_UNSAFE)
_p(r"\b(overdos(?:ed|ing)|took too many (pills|tablets|medicines))\b", SafetyCategory.EMERGENCY_OR_UNSAFE)


# ── Public API ────────────────────────────────────────────────────────────────

def classify(message: str) -> SafetyCategory:
    """
    Classify a user message into a SafetyCategory.

    Args:
        message: Raw text from the user.

    Returns:
        The highest-priority SafetyCategory that matches,
        or NORMAL_SUPPORT if no unsafe pattern is found.
    """
    for pattern, category in _PATTERNS:
        if pattern.search(message):
            return category
    return SafetyCategory.NORMAL_SUPPORT


def is_unsafe(message: str) -> bool:
    """Return True when the message falls into any non-normal category."""
    return classify(message) != SafetyCategory.NORMAL_SUPPORT
