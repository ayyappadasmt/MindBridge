import { useState, useEffect } from "react";

const PHASES = [
  { label: "Breathe in",  duration: 4000, scale: 1.6 },
  { label: "Hold",        duration: 4000, scale: 1.6 },
  { label: "Breathe out", duration: 6000, scale: 1.0 },
];

export default function BreathingExercise({ onClose }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(p => (p + 1) % PHASES.length), PHASES[phase].duration);
    return () => clearTimeout(t);
  }, [phase]);

  const current = PHASES[phase];

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center max-w-sm w-full shadow-2xl animate-fade-in">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-8">
          Box breathing
        </h2>

        <div
          className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-calm-200 to-blue-300 transition-transform duration-[4000ms] ease-in-out"
          style={{ transform: `scale(${current.scale})` }}
        />

        <p className="mt-10 text-2xl font-light text-slate-600 dark:text-slate-300">
          {current.label}
        </p>

        <button
          onClick={onClose}
          className="mt-8 text-sm text-slate-400 hover:text-slate-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}