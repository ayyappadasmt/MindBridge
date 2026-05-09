import { useOfflineSync } from "../hooks/useOfflineSync";

export default function OfflineBanner() {
  const { isOnline } = useOfflineSync();
  if (isOnline) return null;
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-400 text-amber-900 text-center text-sm py-2 font-medium">
      📡 You're offline — entries are saved locally and will sync when you reconnect.
    </div>
  );
}