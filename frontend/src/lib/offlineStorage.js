const P = "mindbridge_";
const store = (key, data) => { try { localStorage.setItem(P + key, JSON.stringify(data)); } catch {} };
const load  = (key) => { try { const v = localStorage.getItem(P + key); return v ? JSON.parse(v) : null; } catch { return null; } };
export const cacheJournals        = d => store("journals", d);
export const getCachedJournals    = ()  => load("journals");
export const cacheSafetyPlans     = d => store("safety_plans", d);
export const getCachedSafetyPlans = ()  => load("safety_plans");
