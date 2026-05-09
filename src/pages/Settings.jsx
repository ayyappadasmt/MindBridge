import { useAuth } from "../context/AuthContext";
import Card        from "../components/ui/Card";
import Button      from "../components/ui/Button";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
        Settings
      </h1>

      <Card>
        <h2 className="font-medium text-slate-600 dark:text-slate-300 mb-4">Account</h2>
        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <p>Signed in as: <span className="font-medium text-slate-700 dark:text-slate-200">
            {user?.email || "Anonymous user"}
          </span></p>
          <p>User ID: <span className="font-mono text-xs">{user?.uid}</span></p>
        </div>
        <div className="mt-6">
          <Button variant="danger" onClick={logout}>Sign out</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium text-slate-600 dark:text-slate-300 mb-2">Privacy</h2>
        <p className="text-sm text-slate-400">
          Your journal text never leaves this device. Only anonymised emotional
          metadata (emotion category + severity score) is synced to our servers.
          Raw text is analysed locally and immediately discarded.
        </p>
      </Card>
    </div>
  );
}