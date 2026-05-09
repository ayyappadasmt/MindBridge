import { useState, useEffect } from "react";
import Card          from "../components/ui/Card";
import EmergencyCard from "../components/EmergencyCard";
import { getCachedSafetyPlans, cacheSafetyPlans } from "../lib/offlineStorage";

const DEFAULT_PLANS = [
  {
    title: "Box breathing",
    desc:  "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 times.",
    emoji: "🌬️",
  },
  {
    title: "5-4-3-2-1 grounding",
    desc:  "Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
    emoji: "🌿",
  },
  {
    title: "Cold water",
    desc:  "Splash cold water on your face or hold an ice cube to reset your nervous system.",
    emoji: "💧",
  },
  {
    title: "Safe person",
    desc:  "Call or text someone you trust right now. You don't have to explain everything.",
    emoji: "🤝",
  },
  {
    title: "Body scan",
    desc:  "Lie down, close your eyes. Slowly notice each part of your body from toes to head.",
    emoji: "🧘",
  },
];

export default function SafetyPlan() {
  const [plans, setPlans] = useState(DEFAULT_PLANS);

  useEffect(() => {
    getCachedSafetyPlans().then(cached => {
      if (cached.length > 0) setPlans(cached);
      else cacheSafetyPlans(DEFAULT_PLANS);
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
          Safety plan
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          These are available offline — always here when you need them.
        </p>
      </div>

      <div className="space-y-4">
        {plans.map((plan, i) => (
          <Card key={i} className="flex gap-4 items-start">
            <span className="text-3xl">{plan.emoji}</span>
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                {plan.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {plan.desc}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <EmergencyCard />
    </div>
  );
}