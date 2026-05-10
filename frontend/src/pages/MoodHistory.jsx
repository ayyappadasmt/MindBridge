import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, BarChart2, Activity, Calendar, Filter } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useJournal } from "../context/JournalContext";
import Card, { CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import MoodChart from "../components/charts/MoodChart";
import { EmotionRadar, EmotionBarChart } from "../components/charts/EmotionCharts";
import { ListSkeleton } from "../components/ui/Skeleton";

const emotionColor = { anxiety:"warning", depression:"purple", anger:"danger", sadness:"brand", stress:"warning", neutral:"success", fear:"danger", numbness:"neutral" };
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.06 } } };
const item = { hidden:{opacity:0,y:14}, show:{opacity:1,y:0,transition:{duration:0.35}} };

function InsightCard({ icon:Icon, label, value, sub, color="brand" }) {
  const colorMap = {
    brand:"bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400",
    teal:"bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400",
    success:"bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400",
    warning:"bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400",
    danger:"bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400",
  };
  return (
    <motion.div variants={item}>
      <Card>
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">{label}</p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}><Icon size={14} /></div>
        </div>
        <p className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-1">{value}</p>
        <p className="text-xs text-surface-500">{sub}</p>
      </Card>
    </motion.div>
  );
}

export default function MoodHistory() {
  const { user } = useAuth();
  const { journals, loadJournals } = useJournal();
  const [loading, setLoading] = useState(true);
  const [filterEmotion, setFilterEmotion] = useState("all");

  useEffect(() => {
    if (user) loadJournals(user.uid).finally(() => setLoading(false));
    else setLoading(false);
  }, [user]);

  const emotions = [...new Set(journals.map(j => j.emotion).filter(Boolean))];
  const filtered = filterEmotion==="all" ? journals : journals.filter(j => j.emotion===filterEmotion);
  const totalEntries = journals.length;
  const avgSeverity = totalEntries ? journals.reduce((s,j) => s+(j.severity??0),0)/totalEntries : 0;
  const mostFrequent = (() => {
    const c = {}; journals.forEach(j => { if(j.emotion) c[j.emotion]=(c[j.emotion]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "—";
  })();
  const highDistressCount = journals.filter(j => (j.severity??0)>=0.65).length;

  const getObservation = () => {
    if (!totalEntries) return "Start journaling to receive AI-generated emotional observations.";
    if (avgSeverity>=0.65) return "Your recent entries show elevated distress patterns. Consider reaching out to your safety network or exploring coping strategies.";
    if (mostFrequent==="neutral") return "Most of your entries reflect a neutral emotional state. Consistent journaling helps build self-awareness over time.";
    return `Your most common emotional pattern is ${mostFrequent}. Regular check-ins help track how your emotional landscape shifts over time.`;
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">Emotional Insights</h2>
        <p className="text-sm text-surface-500 mt-0.5">Patterns and trends from your journal history</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard label="Total Entries"      value={totalEntries}                            sub="All time"           icon={Calendar}     color="brand" />
        <InsightCard label="Avg. Distress"      value={`${(avgSeverity*10).toFixed(1)}/10`}    sub="Across all entries" icon={Activity}     color="teal" />
        <InsightCard label="Most Common"        value={mostFrequent==="—"?"—":mostFrequent.charAt(0).toUpperCase()+mostFrequent.slice(1)} sub="Dominant emotion" icon={TrendingUp} color="success" />
        <InsightCard label="High Distress Days" value={highDistressCount}                       sub="Score above 6.5"   icon={TrendingDown} color="danger" />
      </div>

      <motion.div variants={item}>
        <Card className="border-brand-100 dark:border-brand-900 bg-gradient-to-r from-brand-50/50 to-teal-50/30 dark:from-brand-950/40 dark:to-teal-950/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0"><BarChart2 size={15} /></div>
            <div>
              <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-1">AI Observation</p>
              <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{getObservation()}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card>
            <CardHeader><CardTitle>Distress Over Time</CardTitle><CardDescription>Severity trend across entries</CardDescription></CardHeader>
            {loading ? <div className="h-44 rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse" /> : <MoodChart data={journals} height={180} />}
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardHeader><CardTitle>Emotion Frequency</CardTitle><CardDescription>Distribution by emotion type</CardDescription></CardHeader>
            {loading ? <div className="h-44 rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse" /> : <EmotionBarChart data={journals} />}
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle>Emotional Profile</CardTitle><CardDescription>Radar view of your emotional range</CardDescription></CardHeader>
          {loading ? <div className="h-52 rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse" /> : <EmotionRadar data={journals} />}
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader action={
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-surface-400" />
              <select value={filterEmotion} onChange={e=>setFilterEmotion(e.target.value)}
                className="text-xs bg-transparent text-surface-600 dark:text-surface-400 border-none outline-none cursor-pointer">
                <option value="all">All emotions</option>
                {emotions.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase()+e.slice(1)}</option>)}
              </select>
            </div>
          }>
            <CardTitle>Entry History</CardTitle>
            <CardDescription>{filtered.length} {filterEmotion==="all"?"total":filterEmotion} entries</CardDescription>
          </CardHeader>
          {loading ? <ListSkeleton rows={4} /> : filtered.length===0 ? (
            <div className="text-center py-12">
              <Activity size={24} className="text-surface-300 dark:text-surface-700 mx-auto mb-3" />
              <p className="text-sm text-surface-500">No entries match the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((j, i) => (
                <motion.div key={j.id||i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
                      <div className="w-full bg-brand-500 rounded-full" style={{ height:`${(j.severity??0)*100}%`, marginTop:"auto" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200 capitalize">{j.emotion||"Neutral"}</p>
                      <p className="text-xs text-surface-400">{j.timestamp ? format(new Date(j.timestamp),"MMM d, yyyy · h:mm a") : "—"}</p>
                    </div>
                  </div>
                  <Badge color={emotionColor[j.emotion]??"neutral"} dot>{((j.severity??0)*10).toFixed(1)}/10</Badge>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
