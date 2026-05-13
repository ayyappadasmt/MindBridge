import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center"><Loader2 size={16} className="text-white animate-spin" /></div>
        <p className="text-sm text-surface-400">Loading…</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
