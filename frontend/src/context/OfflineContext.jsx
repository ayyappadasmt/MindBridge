import { createContext, useContext, useEffect, useState } from "react";
const OfflineContext = createContext({ isOffline: false });
export function OfflineProvider({ children }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return <OfflineContext.Provider value={{ isOffline }}>{children}</OfflineContext.Provider>;
}
export const useOffline = () => useContext(OfflineContext);
