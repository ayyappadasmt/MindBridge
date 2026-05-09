import { useAuth }  from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import Card   from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Settings() {
  const { user, logout }   = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
        Settings
      </h1>

      {/* Theme */}
      <Card>
        <h2 className="font-medium text-slate-600 dark:text-slate-300 mb-4">
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
              {isDark ? "Dark mode" : "Light mode"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {isDark ? "Easy on the eyes at night" : "Bright and clear"}
            </p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none
              ${isDark ? "bg-calm-600" : "bg-slate-200"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300
                ${isDark ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>
      </Card>

      {/* Account */}
      <Card>
        <h2 className="font-medium text-slate-600 dark:text-slate-300 mb-4">
          Account
        </h2>
        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <p>Signed in as: <span className="font-medium text-slate-700 dark:text-slate-200">
            {user?.email || "Anonymous user"}
          </span></p>
          <p>User ID: <span className="font-mono text-xs break-all">{user?.uid}</span></p>
        </div>
        <div className="mt-6">
          <Button variant="danger" onClick={logout}>Sign out</Button>
        </div>
      </Card>

      {/* Privacy */}
      <Card>
        <h2 className="font-medium text-slate-600 dark:text-slate-300 mb-2">
          Privacy
        </h2>
        <p className="text-sm text-slate-400">
          Your journal text never leaves this device. Only anonymised emotional
          metadata (emotion category + severity score) is synced to our servers.
          Raw text is analysed locally and immediately discarded.
        </p>
      </Card>
    </div>
  );
}