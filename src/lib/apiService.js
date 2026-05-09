import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Attach Firebase JWT to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⚠️  ONLY sends distress metadata — NEVER raw journal text
export async function sendDistressMeta(metadata) {
  const payload = {
    emotion:   metadata.emotion,
    severity:  metadata.severity,
    timestamp: metadata.timestamp,
    // Raw text intentionally excluded
  };
  return api.post("/api/v1/distress-events", payload);
}

export async function fetchSafetyPlans() {
  return api.get("/api/v1/safety-plans");
}