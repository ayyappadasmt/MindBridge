import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Lock, Shield, Zap } from "lucide-react";
import { signInWithGoogle, signInAnon } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

const features = [
  { icon:Shield, text:"Your journal text never leaves your device" },
  { icon:Zap,    text:"AI-powered emotional insights, locally processed" },
  { icon:Lock,   text:"End-to-end privacy. Anonymous mode available" },
];

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const fadeUp = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0} };

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  useEffect(() => { if (user) navigate("/dashboard", { replace:true }); }, [user]);

  const handleGoogle = async () => {
    setLoading("google");
    try { await signInWithGoogle(); } catch {}
    finally { setLoading(null); }
  };
  const handleAnon = async () => {
    setLoading("anon");
    try { await signInAnon(); } catch {}
    finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col bg-surface-950 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background:"radial-gradient(at 40% 20%, rgba(59,91,219,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(20,184,166,0.1) 0px, transparent 50%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize:"32px 32px" }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl animate-breathe" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl animate-breathe" style={{ animationDelay:"2s" }} />
        <div className="relative flex flex-col h-full p-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center"><Activity size={16} className="text-white" /></div>
            <span className="text-sm font-bold text-white tracking-tight">MindBridge</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay:0.1 }}>
              <h2 className="text-3xl font-bold text-white leading-tight mb-4">
                A safer space to<br />
                <span className="bg-gradient-to-r from-brand-400 to-teal-400 bg-clip-text text-transparent">understand yourself.</span>
              </h2>
              <p className="text-surface-400 text-sm leading-relaxed mb-8 max-w-xs">
                MindBridge uses AI to help you track emotional patterns, build resilience, and access support — all with your privacy protected.
              </p>
              <div className="space-y-3">
                {features.map(({ icon:Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0"><Icon size={13} className="text-brand-400" /></div>
                    <p className="text-sm text-surface-400">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          <p className="text-2xs text-surface-600">MindBridge · Mental wellness platform · Not a substitute for professional care</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6 bg-white dark:bg-surface-950">
        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center"><Activity size={14} className="text-white" /></div>
            <span className="text-sm font-bold text-surface-900 dark:text-surface-100">MindBridge</span>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-brand-500/10 dark:bg-brand-500/20 animate-breathe" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center"><Activity size={14} className="text-white" /></div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">Welcome back</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Continue your wellness journey</p>
          </div>

          <div className="space-y-3">
            <button onClick={handleGoogle} disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-300 dark:hover:border-surface-600 transition-all duration-150 disabled:opacity-50">
              {loading==="google" ? <div className="w-4 h-4 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
              <span className="text-xs text-surface-400 flex-shrink-0">or</span>
              <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
            </div>
            <Button onClick={handleAnon} loading={loading==="anon"} variant="secondary" fullWidth iconRight={ArrowRight}>
              Continue anonymously
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-surface-400 dark:text-surface-500 leading-relaxed">
            Your journal text is processed only on this device. Only anonymized emotional metadata is synced.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
