import { motion } from "framer-motion";
import { Bell, CheckCircle, AlertTriangle, Info, Heart } from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { format } from "date-fns";

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.06 } } };
const item = { hidden:{opacity:0,y:14}, show:{opacity:1,y:0,transition:{duration:0.35}} };

const NOTIFICATIONS = [
  { id:1, type:"reminder",  title:"Daily Check-in",       body:"Take a moment to journal how you're feeling today.",         time:new Date(Date.now()-3600000).toISOString(), read:false },
  { id:2, type:"insight",   title:"Weekly Insight Ready",  body:"Your emotional pattern report for this week is available.",  time:new Date(Date.now()-86400000).toISOString(), read:false },
  { id:3, type:"milestone", title:"3-Day Streak!",         body:"You've journaled for 3 days in a row. Keep it up.",          time:new Date(Date.now()-2*86400000).toISOString(), read:true },
  { id:4, type:"tip",       title:"Grounding Technique",   body:"Try the 5-4-3-2-1 method when feeling overwhelmed.",         time:new Date(Date.now()-3*86400000).toISOString(), read:true },
];

const typeConfig = {
  reminder:  { icon:Bell,         color:"brand",   bg:"bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400" },
  insight:   { icon:Info,         color:"teal",    bg:"bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400" },
  milestone: { icon:CheckCircle,  color:"success", bg:"bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400" },
  tip:       { icon:Heart,        color:"purple",  bg:"bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400" },
};

export default function Notifications() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">Notifications</h2>
        <p className="text-sm text-surface-500 mt-0.5">{NOTIFICATIONS.filter(n=>!n.read).length} unread</p>
      </motion.div>
      <div className="space-y-3">
        {NOTIFICATIONS.map(notif => {
          const cfg = typeConfig[notif.type] ?? typeConfig.tip;
          const Icon = cfg.icon;
          return (
            <motion.div key={notif.id} variants={item}>
              <Card className={`transition-all ${!notif.read?"border-brand-100 dark:border-brand-900/60":""}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}><Icon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{notif.title}</p>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{notif.body}</p>
                    <p className="text-xs text-surface-400 mt-1.5">{format(new Date(notif.time),"MMM d, h:mm a")}</p>
                  </div>
                  <Badge color={cfg.color}>{notif.type}</Badge>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
