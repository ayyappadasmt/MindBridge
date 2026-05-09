export default function Card({ children, className = "" }) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 ${className}`}>
        {children}
      </div>
    );
  }