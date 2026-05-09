export default function Button({
    children, onClick, variant = "primary",
    disabled = false, className = "", type = "button"
  }) {
    const base = "px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-40";
    const variants = {
      primary:   "bg-calm-600 hover:bg-calm-800 text-white",
      secondary: "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
      danger:    "bg-red-500 hover:bg-red-600 text-white",
    };
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  }