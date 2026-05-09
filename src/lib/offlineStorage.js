import localforage from "localforage";

localforage.config({ name: "MindBridge", storeName: "offline_data" });

// Save a journal's metadata (never raw text) offline
export async function saveJournalOffline(entry) {
  const all = (await localforage.getItem("journals")) || [];
  all.push({ ...entry, offlineId: Date.now() });
  await localforage.setItem("journals", all);
}

export async function getOfflineJournals() {
  return (await localforage.getItem("journals")) || [];
}

// Cache safety plans for offline access
export async function cacheSafetyPlans(plans) {
  await localforage.setItem("safety_plans", plans);
}

export async function getCachedSafetyPlans() {
  return (await localforage.getItem("safety_plans")) || [];
}

// Pending sync queue
export async function getPendingSync() {
  return (await localforage.getItem("pending_sync")) || [];
}

export async function clearPendingSync() {
  await localforage.setItem("pending_sync", []);
}