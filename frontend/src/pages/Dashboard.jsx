import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BookOpen, Shield, Brain, MapPin, Activity, Flame, Calendar, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useJournal } from "../context/JournalContext";
import Card, { CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import MoodChart from "../components/charts/MoodChart";
import { MetricSkeleton } from "../components/ui/Skeleton";
import { format } from "date-fns";

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const item = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0,transition:{duration:0.4,ease:[0.4,0,0.2,1]}} };

const emotionColor = { anxiety:"warning", depression:"purple", anger:"danger", sadness:"brand", stress:"warning", neutral:"success", fear:"danger", numbness:"neutral" };

function MetricCard({ label, value, sub, icon:Icon, trend, color="brand", loading }) {
  if (loading) return <MetricSkeleton />;
  const TrendIcon = trend==="up" ? TrendingUp : trend==="down" ? TrendingDown : Minus;
  const colorStyles = {
    brand:  "bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400",
    teal:   "bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400",
    success:"bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400",
    warning:"bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400",
  };
  return (
    <motion.div variants={item}>
      <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">{label}</p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorStyles[color]}`}><Icon size={15} /></div>
        </div>
        <div className="mb-1.5"><span className="text-2xl font-bold text-surface-900 dark:text-surface-100">{value}</span></div>
        <div className="flex items-center gap-1.5">
          <TrendIcon size={12} className="text-surface-400" />
          <p className="text-xs text-surface-500 dark:text-surface-400">{sub}</p>
        </div>
      </Card>
    </motion.div>
  );
}

function QuickAction({ to, icon:Icon, label, description, accent=false }) {
  return (
    <motion.div variants={item}>
      <Link to={to}>
        <Card className={`group cursor-pointer transition-all duration-200 ${accent ? "bg-brand-500 dark:bg-brand-600 border-brand-500 hover:bg-brand-600 dark:hover:bg-brand-700" : "hover:border-brand-200 dark:hover:border-brand-800"}`} hover>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? "bg-white/20" : "bg-surface-100 dark:bg-surface-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/60"}`}>
              <Icon size={16} className={accent ? "text-white" : "text-surface-600 dark:text-surface-400 group-hover:text-brand-600 dark:group-hover:text-brand-400"} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${accent ? "text-white" : "text-surface-800 dark:text-surface-200"}`}>{label}</p>
              <p className={`text-xs ${accent ? "text-white/70" : "text-surface-500"}`}>{description}</p>
            </div>
            <ChevronRight size={14} className={`flex-shrink-0 ${accent ? "text-white/60" : "text-surface-400"}`} />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { journals, streak, loadJournals } = useJournal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadJournals(user.uid).finally(() => setLoading(false));
    else setLoading(false);
  }, [user]);

  const name = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const recentEntries = journals.slice(0, 5);
  const avgSeverity = journals.length ? journals.reduce((s,j) => s+(j.severity??0), 0)/journals.length : 0;
  const latestEmotion = journals[0]?.emotion ?? "—";
  const lastEntry = journals[0]?.timestamp ? format(new Date(journals[0].timestamp), "MMM d") : "Never";

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">{greeting}, {name}</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{format(new Date(), "EEEE, MMMM d")} · How are you feeling today?</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <Flame size={14} className="text-orange-500" />
          <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">{streak}</span>
          <span className="text-xs text-surface-500">day streak</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Journal Entries" value={journals.length} sub={`Last entry ${lastEntry}`} icon={BookOpen} trend={journals.length>3?"up":"neutral"} color="brand" loading={loading} />
        <MetricCard label="Avg. Distress" value={`${(avgSeverity*10).toFixed(1)}/10`} sub="14-day rolling avg." icon={Activity} trend={avgSeverity>0.5?"up":"down"} color="teal" loading={loading} />
        <MetricCard label="Active Streak" value={`${streak}d`} sub="Keep it up" icon={Flame} trend="up" color="warning" loading={loading} />
        <MetricCard label="Latest Mood" value={latestEmotion==="—"?"—":latestEmotion.charAt(0).toUpperCase()+latestEmotion.slice(1)} sub="Most recent entry" icon={Calendar} trend="neutral" color="success" loading={loading} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <motion.div variants={item} className="lg:col-span-3">
          <Card>
            <CardHeader action={<Link to="/mood"><Button variant="ghost" size="xs">View all</Button></Link>}>
              <CardTitle>Distress Trend</CardTitle>
              <CardDescription>Last 14 journal entries</CardDescription>
            </CardHeader>
            <MoodChart data={journals} height={180} />
          </Card>
        </motion.div>
        <motion.div variants={item} className="lg:col-span-2 space-y-3">
          <p className="section-label">Quick Actions</p>
          <QuickAction to="/journal"   icon={BookOpen} label="Write today"    description="Journal entry"        accent />
          <QuickAction to="/assistant" icon={Brain}    label="AI Companion"   description="Chat with MindBridge" />
          <QuickAction to="/safety"    icon={Shield}   label="Safety Plan"    description="Coping strategies"    />
          <QuickAction to="/pathway"   icon={MapPin}   label="My Pathway"     description="Recovery journey"     />
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card>
          <CardHeader action={<Link to="/mood"><Button variant="ghost" size="xs" iconRight={ChevronRight}>See all</Button></Link>}>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Your last {recentEntries.length} journal sessions</CardDescription>
          </CardHeader>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-14 rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse" />)}</div>
          ) : recentEntries.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-3"><BookOpen size={18} className="text-surface-400" /></div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">No entries yet</p>
              <p className="text-xs text-surface-400 mt-1">Write your first journal entry to get started</p>
              <Link to="/journal" className="mt-4 inline-block"><Button size="sm" icon={BookOpen}>Start journaling</Button></Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry, i) => (
                <div key={entry.id||i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center"><Activity size={13} className="text-surface-500" /></div>
                    <div>
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200 capitalize">{entry.emotion||"Neutral"}</p>
                      <p className="text-xs text-surface-400">{entry.timestamp ? format(new Date(entry.timestamp),"MMM d, h:mm a") : "Unknown time"}</p>
                    </div>
                  </div>
                  <Badge color={emotionColor[entry.emotion]??"neutral"} dot>{((entry.severity??0)*10).toFixed(1)}/10</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
