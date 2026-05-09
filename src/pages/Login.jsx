import { signInWithGoogle, signInAnon } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Login() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  useEffect(() => { if (user) navigate("/dashboard"); }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 via-white to-blue-50 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 animate-fade-in">
        {/* Breathing orb decoration */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-calm-200 to-blue-300 animate-breathe opacity-80" />
        </div>

        <h1 className="text-3xl font-semibold text-center text-slate-800 dark:text-slate-100 mb-2">
          MindBridge
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-10 text-sm">
          A safe space to reflect. Your words stay on your device.
        </p>

        <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-slate-700 dark:text-slate-200"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
            Continue with Google
          </button>

          <button
            onClick={signInAnon}
            className="w-full py-3 px-6 rounded-xl bg-calm-600 hover:bg-calm-800 text-white font-medium transition"
          >
            Continue anonymously
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Your journal text never leaves this device. Only anonymised emotional metadata is synced.
        </p>
      </div>
    </div>
  );
}