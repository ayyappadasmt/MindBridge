import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

const emotionColors = {
  anxiety:"#f59e0b", depression:"#8b5cf6", anger:"#ef4444",
  sadness:"#3b82f6", stress:"#f97316", neutral:"#22c55e",
  fear:"#ec4899", numbness:"#94a3b8",
};

export function EmotionRadar({ data=[] }) {
  const counts = {};
  data.forEach(d => { const e = d.emotion||"neutral"; counts[e]=(counts[e]||0)+1; });
  const radarData = Object.entries(counts).map(([emotion,count]) => ({ emotion:emotion.charAt(0).toUpperCase()+emotion.slice(1), count }));
  if (!radarData.length) return <div className="flex items-center justify-center h-48 rounded-xl bg-surface-50 dark:bg-surface-800 border border-dashed border-surface-200 dark:border-surface-700"><p className="text-sm text-surface-400">No emotion data yet</p></div>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
        <PolarAngleAxis dataKey="emotion" tick={{ fontSize:11, fill:"currentColor", opacity:0.6 }} />
        <Radar dataKey="count" stroke="#3b5bdb" fill="#3b5bdb" fillOpacity={0.15} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-3 shadow-card"><p className="text-xs text-surface-500 capitalize mb-1">{label}</p><p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{payload[0].value} entries</p></div>;
};

export function EmotionBarChart({ data=[] }) {
  const counts = {};
  data.forEach(d => { const e = d.emotion||"neutral"; counts[e]=(counts[e]||0)+1; });
  const barData = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([emotion,count])=>({ emotion, count }));
  if (!barData.length) return <div className="flex items-center justify-center h-40 rounded-xl bg-surface-50 dark:bg-surface-800 border border-dashed border-surface-200 dark:border-surface-700"><p className="text-sm text-surface-400">No data yet</p></div>;
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={barData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
        <XAxis dataKey="emotion" tick={{ fontSize:11, fill:"currentColor", opacity:0.5 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize:11, fill:"currentColor", opacity:0.5 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomBarTooltip />} />
        <Bar dataKey="count" radius={[6,6,0,0]}>
          {barData.map((entry,i) => <Cell key={i} fill={emotionColors[entry.emotion]??"#3b5bdb"} fillOpacity={0.85} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
