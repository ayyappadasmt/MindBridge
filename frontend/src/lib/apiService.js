import axios from "axios";
const BASE = import.meta.env.VITE_API_BASE_URL || "";
const api = axios.create({ baseURL: BASE, timeout: 10000 });
api.interceptors.response.use(r => r.data, e => { throw e; });
export const fetchSafetyPlan   = uid => api.get(`/safety-plan/${uid}`).catch(() => null);
export const createSafetyPlan  = data => api.post("/safety-plan", data).catch(() => null);
export const submitJournal     = data => api.post("/journal", data).catch(() => null);
export const fetchJournals     = uid  => api.get(`/journals/${uid}`).catch(() => []);
export const fetchPathway      = uid  => api.get(`/pathway/${uid}`).catch(() => null);

// ── AI Chat — routes through FastAPI backend (server-side Vertex AI) ─────────
// NEVER call api.anthropic.com from the browser — CORS-blocked by design.
// API keys must not be in frontend bundles.
import { auth } from "./firebase";

export async function sendChatMessage(messages) {
  const user = auth.currentUser;
  const headers = { "Content-Type": "application/json" };
  if (user) {
    const token = await user.getIdToken(false);
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || ""}/chat/message`,
    { method: "POST", headers, body: JSON.stringify({ messages }) }
  );
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
  return res.json(); // { reply: string, is_crisis: boolean }
}
