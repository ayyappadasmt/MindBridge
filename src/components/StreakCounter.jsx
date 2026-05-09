export default function StreakCounter({ streak }) {
    return (
      <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl px-4 py-2">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Current streak</p>
          <p className="text-lg font-bold text-orange-500">
            {streak} {streak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>
    );
  }