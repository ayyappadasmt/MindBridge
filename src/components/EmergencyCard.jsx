export default function EmergencyCard() {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
        <h3 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
          <span>🆘</span> Crisis support
        </h3>
        <div className="space-y-2 text-sm text-red-600 dark:text-red-400">
          <p>📞 <strong>iCall (India):</strong> 9152987821</p>
          <p>📞 <strong>Vandrevala Foundation:</strong> 1860-2662-345</p>
          <p>💬 <strong>iCall Chat:</strong> icallhelpline.org</p>
        </div>
        <p className="mt-3 text-xs text-red-400">
          Available 24/7 — you are not alone.
        </p>
      </div>
    );
  }