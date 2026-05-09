import { useState, useCallback, useRef } from "react";
import { useEdgeAI }   from "../hooks/useEdgeAI";
import { useJournal }  from "../context/JournalContext";
import { useAuth }     from "../context/AuthContext";
import { sendDistressMeta } from "../lib/apiService";
import DistressAlert       from "../components/DistressAlert";
import BreathingExercise   from "../components/BreathingExercise";

export default function Journal() {
  const [text, setText]       = useState("");
  const [saved, setSaved]     = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const { analyze, result, reset } = useEdgeAI();
  const { saveJournal }        = useJournal();
  const { user }               = useAuth();
  const debounceRef            = useRef(null);

  // Debounced edge-AI analysis — runs locally every 1.5s while typing
  const handleChange = useCallback((e) => {
    setText(e.target.value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      analyze(e.target.value);  // 100% local — text never leaves browser
    }, 1500);
  }, [analyze]);

  const handleSave = async () => {
    if (!text.trim()) return;
    if (!result) analyze(text);

    const meta = result || { emotion: "neutral", severity: 0, timestamp: new Date().toISOString() };

    // 1. Save metadata to Firestore (NOT the text)
    await saveJournal(user?.uid, meta);

    // 2. If above threshold, send to backend (metadata only)
    if (meta.severity >= parseFloat(import.meta.env.VITE_DISTRESS_THRESHOLD || "0.65")) {
      try { await sendDistressMeta(meta); } catch { /* queued offline */ }
    }

    // 3. Clear local text — it was never sent
    setText("");
    reset();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-1">
        How are you feeling today?
      </h1>
      <p className="text-sm text-slate-400 mb-6">
        Your words stay here — only emotional signals are recorded.
      </p>

      {/* Distress alert (shows when score is high) */}
      {result?.shouldAlert && (
        <DistressAlert
          level={result.level}
          emotion={result.emotion}
          onBreathe={() => setShowBreathing(true)}
        />
      )}

      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Write freely… this is your space."
        rows={10}
        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-calm-400 resize-none text-base leading-relaxed shadow-sm"
      />

      {/* Live sentiment indicator */}
      {result && !result.shouldAlert && (
        <p className="text-xs text-slate-400 mt-2">
          Detected mood: <span className="font-medium capitalize">{result.emotion}</span>
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="flex-1 py-3 rounded-xl bg-calm-600 hover:bg-calm-800 disabled:opacity-40 text-white font-medium transition"
        >
          {saved ? "✓ Saved" : "Save entry"}
        </button>
        <button
          onClick={() => { setText(""); reset(); }}
          className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Clear
        </button>
      </div>

      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
    </div>
  );
}