import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth }    from "../context/AuthContext";
import { useJournal } from "../context/JournalContext";
import Card           from "../components/ui/Card";
import StreakCounter  from "../components/StreakCounter";
import MoodChart      from "../components/MoodChart";
import EmergencyCard  from "../components/EmergencyCard";

export default function Dashboard() {
  const { user }                   = useAuth();
  const { journals, streak, loadJournals } = useJournal();

  useEffect(() => {
    if (user) loadJournals(user.uid);
  }, [user]);

  const displayName = user?.displayName || user?.email || "friend";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
          Hello, {displayName.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">How are you doing today?</p>
      </div>

      <StreakCounter streak={streak} />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/journal">
          <Card className="hover:shadow-md transition cursor-pointer text-center">
            <div className="text-3xl mb-2">📝</div>
            <p className="font-medium text-slate-700 dark:text-slate-200">Write today</p>
            <p className="text-xs text-slate-400 mt-1">Journal entry</p>
          </Card>
        </Link>
        <Link to="/safety">
          <Card className="hover:shadow-md transition cursor-pointer text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <p className="font-medium text-slate-700 dark:text-slate-200">Safety plan</p>
            <p className="text-xs text-slate-400 mt-1">Coping strategies</p>
          </Card>
        </Link>
      </div>

      {/* Mood chart */}
      <Card>
        <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Mood over time
        </h2>
        <MoodChart data={journals} />
      </Card>

      <EmergencyCard />
    </div>
  );
}