import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-3 shadow-card-md">
      <p className="text-xs text-surface-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{(payload[0].value*10).toFixed(1)}<span className="text-surface-400 font-normal">/10</span></p>
      {payload[0].payload?.emotion && <p className="text-xs text-surface-500 capitalize mt-0.5">{payload[0].payload.emotion}</p>}
    </div>
  );
};

export default function MoodChart({ data=[], height=200 }) {
  const chartData = data.filter(d=>d?.timestamp).slice(-14).map(d=>({
    date: (() => { try { return format(parseISO(d.timestamp),"MMM d"); } catch { return "—"; } })(),
    severity: d.severity??0, emotion: d.emotion,
  }));
  if (!chartData.length) return (
    <div className="flex items-center justify-center h-40 rounded-xl bg-surface-50 dark:bg-surface-800 border border-dashed border-surface-200 dark:border-surface-700">
      <p className="text-sm text-surface-400">No data yet — start journaling</p>
    </div>
  );
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top:4, right:4, left:-24, bottom:0 }}>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b5bdb" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize:11, fill:"currentColor", opacity:0.5 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0,1]} tick={{ fontSize:11, fill:"currentColor", opacity:0.5 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v*10).toFixed(0)}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="severity" stroke="#3b5bdb" strokeWidth={2} fill="url(#sg)" dot={{ fill:"#3b5bdb", r:3, strokeWidth:0 }} activeDot={{ r:5, fill:"#3b5bdb", strokeWidth:0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
