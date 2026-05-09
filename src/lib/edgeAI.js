import * as tf from "@tensorflow/tfjs";

// ─────────────────────────────────────────────
// Lightweight keyword + weighted-scoring model.
// All analysis is 100% local — nothing is sent
// to any server. Only the numeric score leaves
// this file (as distress metadata).
// ─────────────────────────────────────────────

const DISTRESS_KEYWORDS = {
  high: ["suicide", "kill myself", "end it", "hopeless", "worthless", "can't go on"],
  medium: ["depressed", "anxious", "panic", "overwhelmed", "crying", "exhausted", "scared"],
  low: ["sad", "tired", "stressed", "worried", "lonely", "frustrated"],
};

const EMOTION_MAP = {
  anxious: "anxiety", panic: "anxiety", worried: "anxiety",
  depressed: "depression", hopeless: "depression", worthless: "depression",
  angry: "anger", frustrated: "anger",
  sad: "sadness", crying: "sadness", lonely: "sadness",
  stressed: "stress", overwhelmed: "stress", exhausted: "stress",
};

export function analyzeDistress(text) {
  // ⚠️  TEXT IS NEVER RETURNED OR SENT ANYWHERE
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  let score = 0;
  let detectedEmotion = "neutral";

  // Score based on keyword tier
  for (const kw of DISTRESS_KEYWORDS.high) {
    if (lower.includes(kw)) { score = Math.max(score, 0.92); }
  }
  for (const kw of DISTRESS_KEYWORDS.medium) {
    if (lower.includes(kw)) { score = Math.max(score, 0.65); }
  }
  for (const kw of DISTRESS_KEYWORDS.low) {
    if (lower.includes(kw)) { score = Math.max(score, 0.35); }
  }

  // Detect dominant emotion from text
  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, "");
    if (EMOTION_MAP[clean]) {
      detectedEmotion = EMOTION_MAP[clean];
      break;
    }
  }

  // Intensity modifiers
  const negations = ["not", "never", "no", "don't"];
  let hasNegation = words.some(w => negations.includes(w));
  if (hasNegation) score *= 0.6;

  const intensifiers = ["very", "extremely", "really", "so", "deeply"];
  let hasIntensifier = words.some(w => intensifiers.includes(w));
  if (hasIntensifier) score = Math.min(1, score * 1.2);

  return {
    // Only these values ever leave this function
    emotion:   detectedEmotion,
    severity:  parseFloat(score.toFixed(3)),
    timestamp: new Date().toISOString(),
    // Raw text is deliberately NOT included
  };
}

export function getDistressLevel(severity) {
  if (severity >= 0.85) return "critical";
  if (severity >= 0.65) return "high";
  if (severity >= 0.35) return "moderate";
  return "low";
}