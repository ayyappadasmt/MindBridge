import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router-dom";
import Card, { CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import Toggle from "../components/ui/Toggle";
import Button from "../components/ui/Button";

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const item = { hidden:{opacity:0,y:14}, show:{opacity:1,y:0,transition:{duration:0.35}} };

export default function Settings() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState({ dailyReminder:true, weeklyInsight:true, milestones:true });

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">Settings</h2>
        <p className="text-sm text-surface-500 mt-0.5">Manage your account and preferences</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle>Account</CardTitle><CardDescription>Your profile information</CardDescription></CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-white">{(user?.displayName||user?.email||"U").charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{user?.displayName||"Anonymous User"}</p>
              <p className="text-xs text-surface-500">{user?.email||"Guest · No email"}</p>
              <p className="text-2xs text-surface-400 mt-0.5">{user?.isAnonymous?"Anonymous account":"Google account"}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize your visual experience</CardDescription></CardHeader>
          <Toggle checked={isDark} onChange={toggle} label="Dark mode" description="Use dark theme throughout the app" />
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Control what alerts you receive</CardDescription></CardHeader>
          <div className="space-y-4">
            <Toggle checked={notifs.dailyReminder} onChange={v=>setNotifs(p=>({...p,dailyReminder:v}))} label="Daily reminder" description="Get reminded to journal each day" />
            <div className="h-px bg-surface-100 dark:bg-surface-800" />
            <Toggle checked={notifs.weeklyInsight} onChange={v=>setNotifs(p=>({...p,weeklyInsight:v}))} label="Weekly insights" description="Receive your emotional pattern report" />
            <div className="h-px bg-surface-100 dark:bg-surface-800" />
            <Toggle checked={notifs.milestones} onChange={v=>setNotifs(p=>({...p,milestones:v}))} label="Milestone alerts" description="Be notified when you reach a milestone" />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-danger-100 dark:border-danger-900">
          <CardHeader><CardTitle>Danger Zone</CardTitle><CardDescription>Irreversible account actions</CardDescription></CardHeader>
          <Button onClick={handleLogout} variant="danger" size="sm" icon={LogOut}>Sign out</Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}
