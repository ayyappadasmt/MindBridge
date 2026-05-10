import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Send, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useJournal } from "../context/JournalContext";
import Card, { CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

const EMOTIONS = ["anxiety","stress","sadness","depression","anger","fear","numbness","neutral"];
const emotionColor = { anxiety:"warning", depression:"purple", anger:"danger", sadness:"brand", stress:"warning", neutral:"success", fear:"danger", numbness:"neutral" };
const PROMPTS = [
  "What is weighing on your mind right now?",
  "Describe a moment today when you felt at ease.",
  "What emotion has been most present today, and why?",
  "What is one small thing you can do to support yourself right now?",
  "What are you grateful for today, even if things feel difficult?",
];

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const item = { hidden:{opacity:0,y:14}, show:{opacity:1,y:0,transition:{duration:0.35}} };

export default function Journal() {
  const { user } = useAuth();
  const { addJournal } = useJournal();
  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState("");
  const [severity, setSeverity] = useState(5);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  const handleSubmit = async () => {
    if (!text.trim() || !emotion) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    addJournal({
      id: Date.now().toString(),
      text,
      emotion,
      severity: severity / 10,
      timestamp: new Date().toISOString(),
      user_id: user?.uid || "anon",
    });
    setLoading(false);
    setSuccess(true);
    setText(""); setEmotion(""); setSeverity(5);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">Journal</h2>
        <p className="text-sm text-surface-500 mt-0.5">Express yourself freely. This is your private space.</p>
      </motion.div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
            className="flex items-center gap-2.5 p-3.5 rounded-xl bg-success-50 dark:bg-green-950/30 border border-success-200 dark:border-green-900">
            <CheckCircle size={15} className="text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Entry saved successfully</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={item}>
        <Card>
          <div className="flex items-start gap-3 mb-5 p-3.5 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900">
            <Sparkles size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-brand-700 dark:text-brand-300 italic leading-relaxed">{prompt}</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Your thoughts</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write whatever comes to mind…"
                rows={6}
                className="input resize-none leading-relaxed"
              />
              <div className="flex justify-end mt-1.5">
                <span className="text-2xs text-surface-400">{text.length} characters</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2.5">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map(e => (
                  <button key={e} onClick={() => setEmotion(e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150
                      ${emotion===e
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700 hover:border-brand-200 dark:hover:border-brand-800 hover:text-brand-600 dark:hover:text-brand-400"
                      }`}>
                    {e.charAt(0).toUpperCase()+e.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Distress level</label>
                <Badge color={severity>=7?"danger":severity>=4?"warning":"success"}>{severity}/10</Badge>
              </div>
              <input type="range" min={0} max={10} value={severity} onChange={e=>setSeverity(Number(e.target.value))}
                className="w-full h-2 rounded-full bg-surface-200 dark:bg-surface-700 accent-brand-500 cursor-pointer" />
              <div className="flex justify-between mt-1">
                <span className="text-2xs text-surface-400">Calm</span>
                <span className="text-2xs text-surface-400">Distressed</span>
              </div>
            </div>

            <Button onClick={handleSubmit} loading={loading} disabled={!text.trim()||!emotion} icon={Send} fullWidth>
              Save Entry
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
