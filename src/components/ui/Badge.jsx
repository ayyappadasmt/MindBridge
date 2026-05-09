export default function Badge({ children, color = "blue" }) {
    const colors = {
      blue:   "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      green:  "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      red:    "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    };
    return (
      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${colors[color]}`}>
        {children}
      </span>
    );
  }