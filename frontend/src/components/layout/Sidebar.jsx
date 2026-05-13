import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, BookOpen, BarChart2, Shield, Settings, Bell, Brain, ChevronLeft, ChevronRight, Sparkles, Activity, MapPin, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to:"/dashboard",     label:"Overview",     icon:LayoutDashboard },
  { to:"/journal",       label:"Journal",       icon:BookOpen },
  { to:"/mood",          label:"Insights",      icon:BarChart2 },
  { to:"/pathway",       label:"Pathway",       icon:MapPin },
  { to:"/assistant",     label:"AI Assistant",  icon:Brain },
  { to:"/safety",        label:"Safety Plan",   icon:Shield },
  { to:"/notifications", label:"Alerts",        icon:Bell },
];
const bottomItems = [{ to:"/settings", label:"Settings", icon:Settings }];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center h-16 px-4 flex-shrink-0 border-b border-surface-100 dark:border-surface-800 ${collapsed?"justify-center":"justify-between"}`}>
        {!collapsed && (
          <motion.div initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center"><Activity size={14} className="text-white" /></div>
            <span className="text-sm font-bold text-surface-900 dark:text-surface-100 tracking-tight">MindBridge</span>
          </motion.div>
        )}
        {collapsed && <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center"><Activity size={14} className="text-white" /></div>}
        <button onClick={onToggle} className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <button onClick={onMobileClose} className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-600 transition-colors"><X size={14} /></button>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-2.5 space-y-0.5">
        {!collapsed && <p className="section-label px-2 mb-3">Navigation</p>}
        {navItems.map(({ to, label, icon:Icon }) => (
          <NavLink key={to} to={to} onClick={onMobileClose}
            className={({ isActive:a }) => `nav-item ${a?"active":""} ${collapsed?"justify-center px-2":""}`}
            title={collapsed ? label : undefined}>
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && <motion.span initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.05}} className="flex-1 text-sm">{label}</motion.span>}
            {!collapsed && to==="/notifications" && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
          </NavLink>
        ))}
        {!collapsed && <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800"><p className="section-label px-2 mb-3">Account</p></div>}
        {collapsed && <div className="pt-2 mt-2 border-t border-surface-100 dark:border-surface-800" />}
        {bottomItems.map(({ to, label, icon:Icon }) => (
          <NavLink key={to} to={to} onClick={onMobileClose}
            className={({ isActive:a }) => `nav-item ${a?"active":""} ${collapsed?"justify-center px-2":""}`}
            title={collapsed ? label : undefined}>
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && <span className="flex-1 text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && user && (
        <div className="p-3 border-t border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-white">{(user.displayName||user.email||"U").charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-surface-800 dark:text-surface-200 truncate">{user.displayName||"Anonymous"}</p>
              <p className="text-2xs text-surface-400 truncate">{user.email||"Guest user"}</p>
            </div>
            <Sparkles size={12} className="text-surface-400 flex-shrink-0" />
          </div>
        </div>
      )}
      {collapsed && user && (
        <div className="p-2.5 border-t border-surface-100 dark:border-surface-800 flex justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{(user.displayName||user.email||"U").charAt(0).toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <motion.aside initial={false} animate={{ width: collapsed ? 64 : 240 }} transition={{ type:"spring", stiffness:300, damping:30 }}
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 overflow-hidden">
        <SidebarContent />
      </motion.aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onMobileClose} className="md:hidden fixed inset-0 z-40 bg-surface-950/60 backdrop-blur-sm" />
            <motion.aside initial={{x:-280}} animate={{x:0}} exit={{x:-280}} transition={{type:"spring",stiffness:300,damping:30}}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 z-50 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
