import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Wind, Waves, Phone, Heart, Activity, CloudUpload, CheckCircle, Plus, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Card, { CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { fetchSafetyPlan, createSafetyPlan } from "../lib/apiService";
import { getCachedSafetyPlans, cacheSafetyPlans } from "../lib/offlineStorage";

const iconMap = { "Box breathing":Wind, "5-4-3-2-1 grounding":Waves, "Cold water":Waves, "Safe person":Phone, "Body scan":Activity, default:Heart };
const DEFAULT_PLANS = [
  { title:"Box breathing",        desc:"Inhale 4s, Hold 4s, Exhale 4s, Hold 4s. Repeat 4 cycles.", category:"breathe" },
  { title:"5-4-3-2-1 grounding", desc:"Name 5 things you see, 4 touch, 3 hear, 2 smell, 1 taste.", category:"ground" },
  { title:"Cold water",           desc:"Splash cold water on your face to reset your nervous system.", category:"sensory" },
  { title:"Safe person",          desc:"Call or text someone you trust. You don't have to explain everything.", category:"connect" },
  { title:"Body scan",            desc:"Lie down, close your eyes. Slowly observe each part of your body.", category:"mindful" },
];
const CRISIS_NUMBERS = [
  { label:"iCall",                 number:"9152987821" },
  { label:"Vandrevala Foundation", number:"1860-2662-345" },
  { label:"Crisis Text Line",      number:"Text HOME to 741741" },
  { label:"NIMHANS",               number:"080-46110007" },
];
const categoryColor = { breathe:"teal", ground:"brand", sensory:"neutral", connect:"success", mindful:"purple" };
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } };
const item = { hidden:{opacity:0,y:12}, show:{opacity:1,y:0,transition:{duration:0.35}} };

function CopingCard({ plan, onRemove, showRemove }) {
  const IconComp = iconMap[plan.title] ?? iconMap.default;
  return (
    <motion.div variants={item} layout>
      <Card className="group relative">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0"><IconComp size={18} /></div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1">{plan.title}</p>
                {plan.desc && <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{plan.desc}</p>}
              </div>
              {plan.category && <Badge color={categoryColor[plan.category]??"neutral"} className="flex-shrink-0">{plan.category}</Badge>}
            </div>
          </div>
          {showRemove && onRemove && (
            <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-all flex-shrink-0">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export default function SafetyPlan() {
  const { user } = useAuth();
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newPlan, setNewPlan] = useState({ title:"", desc:"" });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const serverPlan = await fetchSafetyPlan(user.uid);
        if (serverPlan?.coping_strategies?.length > 0) {
          const mapped = serverPlan.coping_strategies.map((s,i) => ({ title:s, desc:"", category:Object.keys(categoryColor)[i%5] }));
          setPlans(mapped); await cacheSafetyPlans(mapped); setSynced(true); setLoading(false); return;
        }
      } catch {}
      try {
        const cached = await getCachedSafetyPlans();
        if (cached?.length > 0) { setPlans(cached); setLoading(false); return; }
      } catch {}
      await cacheSafetyPlans(DEFAULT_PLANS);
      setPlans(DEFAULT_PLANS); setLoading(false);
    })();
  }, [user]);

  const handleSaveToCloud = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await createSafetyPlan({ user_id:user.uid, warning_signs:["feeling overwhelmed","isolating"], coping_strategies:plans.map(p=>p.title), support_contacts:[], crisis_numbers:CRISIS_NUMBERS.map(c=>`${c.label}: ${c.number}`) });
      setSynced(true);
    } catch {}
    setSaving(false);
  };

  const addPlan = () => {
    if (!newPlan.title.trim()) return;
    const updated = [...plans, { ...newPlan, category:"mindful" }];
    setPlans(updated); cacheSafetyPlans(updated); setNewPlan({ title:"", desc:"" }); setEditing(false);
  };

  const removePlan = (i) => {
    const updated = plans.filter((_,idx) => idx!==i);
    setPlans(updated); cacheSafetyPlans(updated);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center"><Shield size={15} /></div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">Safety Plan</h2>
          </div>
          <p className="text-sm text-surface-500 flex items-center gap-1.5">
            {synced ? <><CheckCircle size={13} className="text-green-500" />Synced · Available offline</> : "Always available offline — no internet required"}
          </p>
        </div>
        {user && <Button onClick={handleSaveToCloud} loading={saving} variant={synced?"secondary":"primary"} size="sm" icon={CloudUpload}>{synced?"Synced":"Save to cloud"}</Button>}
      </motion.div>

      <motion.div variants={item}>
        <div className="rounded-2xl border border-danger-200 dark:border-danger-900 bg-danger-50 dark:bg-danger-950/30 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger-800 dark:text-danger-300 mb-2">If you are in immediate danger</p>
              <div className="grid grid-cols-2 gap-2">
                {CRISIS_NUMBERS.map(({ label, number }) => (
                  <div key={label} className="text-xs">
                    <span className="text-danger-600 dark:text-danger-400 font-medium">{label}:</span>
                    <span className="text-danger-700 dark:text-danger-300 ml-1 font-mono">{number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader action={<Button onClick={()=>setEditing(v=>!v)} variant="ghost" size="sm" icon={Plus}>Add strategy</Button>}>
            <CardTitle>Coping Strategies</CardTitle>
            <CardDescription>{plans.length} strategies in your plan</CardDescription>
          </CardHeader>
          <AnimatePresence>
            {editing && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="mb-5 pb-5 border-b border-surface-100 dark:border-surface-800">
                <div className="space-y-3">
                  <input type="text" placeholder="Strategy title" value={newPlan.title} onChange={e=>setNewPlan(p=>({...p,title:e.target.value}))} className="input text-sm" />
                  <textarea placeholder="Optional description…" value={newPlan.desc} onChange={e=>setNewPlan(p=>({...p,desc:e.target.value}))} rows={2} className="input text-sm resize-none" />
                  <div className="flex gap-2">
                    <Button onClick={addPlan} size="sm" disabled={!newPlan.title.trim()}>Add</Button>
                    <Button onClick={()=>setEditing(false)} variant="ghost" size="sm">Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-20 rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse" />)}</div>
          ) : (
            <motion.div variants={stagger} className="space-y-3">
              {plans.map((plan, i) => <CopingCard key={`${plan.title}-${i}`} plan={plan} onRemove={()=>removePlan(i)} showRemove={editing} />)}
            </motion.div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-teal-100 dark:border-teal-900 bg-gradient-to-r from-teal-50/50 to-brand-50/30 dark:from-teal-950/30 dark:to-brand-950/20">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0"><Heart size={16} /></div>
            <div>
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1">Remember</p>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">This feeling is temporary. You have survived difficult moments before. Take one small step at a time. You don't have to face this alone.</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
