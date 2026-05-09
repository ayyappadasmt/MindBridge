import { useState, useCallback } from "react";
import { analyzeDistress, getDistressLevel } from "../lib/edgeAI";

const THRESHOLD = parseFloat(import.meta.env.VITE_DISTRESS_THRESHOLD || "0.65");

export function useEdgeAI() {
  const [result, setResult]     = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback((text) => {
    if (!text || text.trim().length < 10) return;
    setIsAnalyzing(true);

    // Async so it doesn't block the UI
    setTimeout(() => {
      const metadata = analyzeDistress(text);
      const level    = getDistressLevel(metadata.severity);

      setResult({
        ...metadata,
        level,
        shouldAlert: metadata.severity >= THRESHOLD,
      });
      setIsAnalyzing(false);
    }, 200);
  }, []);

  const reset = useCallback(() => setResult(null), []);

  return { analyze, result, isAnalyzing, reset };
}