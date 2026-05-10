import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Menu, Moon, Sun, LogOut, Settings, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";

const pageLabels = {
  "/dashboard":"/dashboard","/journal":"Journal","/mood":"Emotional Insights",
  "/pathway":"Recovery Pathway","/assistant":"AI Assistant",
  "/safety":"Safety Plan","/notifications":"Notifications","/settings":"Settings",
};
const PAGE_MAP = {
  "/dashboard":"Overview","/journal":"Journal","/mood":"Emotional Insights",
  "/pathway":"Recovery Pathway","/assistant":"AI Companion",
  "/safety":"Safety Plan","/notifications":"Notifications","/settings":"Settings",
};

export default function Topbar({ onMenuClick, sidebarCollapsed }) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const label = PAGE_MAP[pathname] ?? "MindBridge";

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <header className="fixed top-0 right-0 z-20 h-16 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 flex items-center gap-4 px-4 md:px-6 transition-all duration-300"
      style={{ left:0, paddingLeft: sidebarCollapsed ? "80px" : "256px" }}>
      <button onClick={onMenuClick} className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
        <Menu size={18} />
      </button>
      <div className="md:hidden"><span className="text-sm font-semibold text-surface-900 dark:text-surface-100">{label}</span></div>
      <div className="hidden md:block"><h1 className="text-base font-semibold text-surface-900 dark:text-surface-100">{label}</h1></div>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5">
        <button onClick={toggle} className="w-9 h-9 rounded-xl flex items-center justify-center text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <Link to="/notifications" className="relative w-9 h-9 rounded-xl flex items-center justify-center text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-500" />
        </Link>
        <div className="relative">
          <button onClick={() => setProfileOpen(v=>!v)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">{(user?.displayName||user?.email||"U").charAt(0).toUpperCase()}</span>
            </div>
            <ChevronDown size={12} className="text-surface-400" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div initial={{opacity:0,y:8,scale:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:0.96}} transition={{duration:0.15}}
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-card-md py-1.5 z-50">
                <div className="px-3.5 py-2.5 border-b border-surface-100 dark:border-surface-800">
                  <p className="text-xs font-medium text-surface-800 dark:text-surface-200 truncate">{user?.displayName||"Anonymous User"}</p>
                  <p className="text-xs text-surface-400 truncate">{user?.email||"Guest"}</p>
                </div>
                <div className="py-1">
                  <Link to="/settings" onClick={()=>setProfileOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-colors">
                    <Settings size={14} />Settings
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors">
                    <LogOut size={14} />Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
