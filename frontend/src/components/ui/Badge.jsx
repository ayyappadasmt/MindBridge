const colorMap = {
  brand:  "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-900",
  teal:   "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900",
  success:"bg-success-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900",
  warning:"bg-warning-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900",
  danger: "bg-danger-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900",
  neutral:"bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700",
  purple: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900",
};
export default function Badge({ children, color="neutral", dot=false, className="" }) {
  return (
    <span className={`badge border ${colorMap[color]??colorMap.neutral} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
