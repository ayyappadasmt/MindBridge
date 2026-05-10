import { motion } from "framer-motion";
import { MapPin, CheckCircle, Circle, Lock, Star, ChevronRight, Zap } from "lucide-react";
import Card, { CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } };
const item = { hidden:{opacity:0,y:14}, show:{opacity:1,y:0,transition:{duration:0.35}} };

const MILESTONES = [
  { id:1, title:"First Journal Entry",    desc:"You took the first step by sharing your thoughts.",                        status:"complete", xp:50  },
  { id:2, title:"3-Day Streak",            desc:"Consistency is key to emotional awareness.",                               status:"complete", xp:100 },
  { id:3, title:"Identify Your Triggers",  desc:"Reflect on patterns in your emotional responses.",                        status:"active",   xp:150 },
  { id:4, title:"Practice Grounding",      desc:"Complete a grounding exercise from your safety plan.",                    status:"locked",   xp:200 },
  { id:5, title:"7-Day Streak",            desc:"A week of consistent check-ins builds lasting habits.",                   status:"locked",   xp:250 },
  { id:6, title:"Share With Support",      desc:"Connect with someone you trust about your journey.",                      status:"locked",   xp:300 },
  { id:7, title:"30-Day Journey",          desc:"A month of mindful self-reflection and growth.",                          status:"locked",   xp:500 },
];

const statusConfig = {
  complete: { icon:CheckCircle, color:"text-green-500", bg:"bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900", badge:"success" },
  active:   { icon:Circle,      color:"text-brand-500", bg:"bg-brand-50 dark:bg-brand-950/30 border-brand-200 dark:border-brand-900", badge:"brand" },
  locked:   { icon:Lock,        color:"text-surface-400", bg:"bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700", badge:"neutral" },
};

export default function Pathway() {
  const totalXP = MILESTONES.filter(m=>m.status==="complete").reduce((s,m)=>s+m.xp, 0);
  const nextXP = MILESTONES.find(m=>m.status==="active")?.xp ?? 0;
  const progress = (totalXP / (totalXP + nextXP)) * 100;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={item}>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center"><MapPin size={15} /></div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">My Pathway</h2>
        </div>
        <p className="text-sm text-surface-500">Your personalized recovery and growth journey</p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-brand-50/60 to-teal-50/40 dark:from-brand-950/40 dark:to-teal-950/20 border-brand-100 dark:border-brand-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-0.5">Total XP Earned</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{totalXP} <span className="text-sm font-normal text-surface-500">points</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center shadow-md">
              <Star size={20} className="text-white" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-surface-500 mb-1.5">
              <span>Progress to next milestone</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
              <motion.div initial={{width:0}} animate={{width:`${progress}%`}} transition={{duration:1,ease:"easeOut"}}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-400" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        {MILESTONES.map((milestone, idx) => {
          const cfg = statusConfig[milestone.status];
          const Icon = cfg.icon;
          return (
            <div key={milestone.id} className="relative">
              {idx < MILESTONES.length - 1 && (
                <div className={`absolute left-[21px] top-[52px] w-0.5 h-6 ${milestone.status==="complete"?"bg-green-200 dark:bg-green-900":"bg-surface-200 dark:bg-surface-700"}`} />
              )}
              <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-150 ${cfg.bg} ${milestone.status!=="locked"?"cursor-pointer hover:shadow-card-md":""}`}>
                <div className="flex-shrink-0 mt-0.5"><Icon size={18} className={cfg.color} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-semibold ${milestone.status==="locked"?"text-surface-400 dark:text-surface-600":"text-surface-900 dark:text-surface-100"}`}>{milestone.title}</p>
                    <Badge color={cfg.badge}>{milestone.status==="complete"?"Done":milestone.status==="active"?"In Progress":"Locked"}</Badge>
                  </div>
                  <p className={`text-xs leading-relaxed ${milestone.status==="locked"?"text-surface-400 dark:text-surface-600":"text-surface-500 dark:text-surface-400"}`}>{milestone.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Zap size={12} className={milestone.status==="complete"?"text-green-500":"text-surface-400"} />
                  <span className={`text-xs font-semibold ${milestone.status==="complete"?"text-green-600 dark:text-green-400":"text-surface-400"}`}>{milestone.xp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
