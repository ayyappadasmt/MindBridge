import { useEffect, useState } from "react";
import { getPendingSync, clearPendingSync } from "../lib/offlineStorage";
import { sendDistressMeta } from "../lib/apiService";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline  = async () => {
      setIsOnline(true);
      // Flush pending distress metadata to backend when back online
      const pending = await getPendingSync();
      for (const item of pending) {
        try { await sendDistressMeta(item); } catch { break; }
      }
      await clearPendingSync();
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return { isOnline };
}