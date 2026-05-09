import { useEffect } from "react";
import { useAuth }    from "../context/AuthContext";
import { useJournal } from "../context/JournalContext";
import Card           from "../components/ui/Card";
import Badge          from "../components/ui/Badge";
import MoodChart      from "../components/MoodChart";
import { format }     from "date-fns";

const emotionColor = {
  anxiety: "yellow", depression: "purple", anger: "red",
  sadness: "blue",   stress: "yellow",     neutral: "green",
  fear: "red",       numbness: "blue",
};

export default function MoodHistory() {
  const { user }                   = useAuth();
  const { journals, loadJournals } = useJournal();

  useEffect(() => {
    if (user) loadJournals(user.uid);
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
        Mood history
      </h1>

      <Card>
        <h2 className="font-medium text-slate-600 dark:text-slate-300 mb-4">
          Distress levels over time
        </h2>
        <MoodChart data={journals} />
      </Card>

      <div className="space-y-3">
        {journals.length === 0 && (
          <p className="text-center text-slate-400 py-10">
            No entries yet — start journaling to see your history.
          </p>
        )}
        {journals.map((j, i) => (
          <Card key={j.id || i} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {j.timestamp ? format(new Date(j.timestamp), "MMM d, yyyy · h:mm a") : "—"}
              </p>
              <Badge color={emotionColor[j.emotion] || "blue"}>
                {j.emotion || "neutral"}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Distress</p>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                {((j.severity || 0) * 10).toFixed(1)}/10
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}