import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import OfflineBanner from "./OfflineBanner";
export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <OfflineBanner />
      <Sidebar collapsed={collapsed} onToggle={()=>setCollapsed(v=>!v)} mobileOpen={mobileOpen} onMobileClose={()=>setMobileOpen(false)} />
      <Topbar onMenuClick={()=>setMobileOpen(true)} sidebarCollapsed={collapsed} />
      <motion.main animate={{ marginLeft: collapsed ? 64 : 240 }} transition={{ type:"spring", stiffness:300, damping:30 }} className="hidden md:block pt-16 min-h-screen">
        <div className="p-6 max-w-6xl mx-auto">{children}</div>
      </motion.main>
      <main className="md:hidden pt-16 min-h-screen"><div className="p-4">{children}</div></main>
    </div>
  );
}
