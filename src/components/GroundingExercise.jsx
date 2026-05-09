import { useState } from "react";

const STEPS = [
  { n: 5, sense: "things you can SEE",  emoji: "👁️" },
  { n: 4, sense: "things you can TOUCH", emoji: "✋" },
  { n: 3, sense: "things you can HEAR",  emoji: "👂" },
  { n: 2, sense: "things you can SMELL", emoji: "👃" },
  { n: 1, sense: "thing you can TASTE",  emoji: "👅" },
];

export default function GroundingExercise({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in text-center">
        <p className="text-xs text-slate-400 mb-2">5-4-3-2-1 grounding technique</p>
        <div className="text-5xl mb-4">{current.emoji}</div>
        <h2 className="text-4xl font-bold text-calm-600 mb-2">{current.n}</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8">{current.sense}</p>

        <div className="flex gap-2 justify-center mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition ${
                i === step ? "bg-calm-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="w-full py-3 bg-calm-600 hover:bg-calm-800 text-white rounded-xl font-medium transition"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition"
          >
            Done ✓
          </button>
        )}
        <button onClick={onClose} className="mt-3 text-xs text-slate-400 hover:text-slate-600 block w-full">
          Skip
        </button>
      </div>
    </div>
  );
}