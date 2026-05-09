export default function DistressAlert({ level, emotion, onBreathe }) {
    const colors = {
      critical: "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
      high:     "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800",
      moderate: "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800",
    };
  
    return (
      <div className={`rounded-2xl border p-4 mb-5 animate-fade-in ${colors[level] || colors.moderate}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">💙</span>
          <div className="flex-1">
            <p className="font-semibold">We noticed you might be feeling {emotion}.</p>
            <p className="text-sm mt-1 opacity-80">
              That's okay. You're not alone. Take a moment for yourself.
            </p>
            {level === "critical" && (
              <p className="text-sm mt-2 font-medium">
                If you're in crisis, please reach out: <strong>iCall: 9152987821</strong>
              </p>
            )}
            <button
              onClick={onBreathe}
              className="mt-3 text-sm underline hover:no-underline"
            >
              Try a breathing exercise →
            </button>
          </div>
        </div>
      </div>
    );
  }