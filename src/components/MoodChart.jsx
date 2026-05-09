import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
  } from "recharts";
  import { format } from "date-fns";
  
  export default function MoodChart({ data }) {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
          No mood data yet — start journaling!
        </div>
      );
    }
  
    const chartData = data.map(d => ({
      date:     format(new Date(d.timestamp), "MMM d"),
      severity: parseFloat((d.severity * 10).toFixed(1)),
      emotion:  d.emotion,
    })).reverse();
  
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v, _) => [`${v}/10`, "Distress level"]}
            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
          />
          <Line
            type="monotone"
            dataKey="severity"
            stroke="#3b6ef5"
            strokeWidth={2}
            dot={{ r: 4, fill: "#3b6ef5" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }