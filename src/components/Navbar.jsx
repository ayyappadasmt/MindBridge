import { Link, useLocation } from "react-router-dom";
import { useAuth }  from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";

const links = [
  { to: "/dashboard", label: "Home",    icon: "🏠" },
  { to: "/journal",   label: "Journal", icon: "📝" },
  { to: "/mood",      label: "Mood",    icon: "📊" },
  { to: "/safety",    label: "Safety",  icon: "🛡️" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const { isDark, toggle } = useTheme();

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="font-semibold text-calm-600 dark:text-calm-400 text-lg">
          MindBridge
        </Link>

        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-lg text-sm transition
                ${pathname === l.to
                  ? "bg-calm-100 dark:bg-calm-800/40 text-calm-600 dark:text-calm-400 font-medium"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              <span className="mr-1">{l.icon}</span>
              <span className="hidden sm:inline">{l.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {user && (
            <button
              onClick={logout}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}