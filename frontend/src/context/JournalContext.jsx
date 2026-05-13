import { createContext, useContext, useState } from "react";
import { getCachedJournals, cacheJournals } from "../lib/offlineStorage";

const JournalContext = createContext(null);

// Demo seed data
const SEED = [
  { id:"1", emotion:"anxiety",    severity:0.72, timestamp: new Date(Date.now()-1*86400000).toISOString() },
  { id:"2", emotion:"stress",     severity:0.58, timestamp: new Date(Date.now()-2*86400000).toISOString() },
  { id:"3", emotion:"sadness",    severity:0.45, timestamp: new Date(Date.now()-3*86400000).toISOString() },
  { id:"4", emotion:"neutral",    severity:0.30, timestamp: new Date(Date.now()-4*86400000).toISOString() },
  { id:"5", emotion:"anxiety",    severity:0.65, timestamp: new Date(Date.now()-5*86400000).toISOString() },
  { id:"6", emotion:"stress",     severity:0.50, timestamp: new Date(Date.now()-6*86400000).toISOString() },
  { id:"7", emotion:"neutral",    severity:0.25, timestamp: new Date(Date.now()-7*86400000).toISOString() },
  { id:"8", emotion:"sadness",    severity:0.40, timestamp: new Date(Date.now()-8*86400000).toISOString() },
  { id:"9", emotion:"depression", severity:0.68, timestamp: new Date(Date.now()-9*86400000).toISOString() },
  { id:"10",emotion:"neutral",    severity:0.20, timestamp: new Date(Date.now()-10*86400000).toISOString()},
];

export function JournalProvider({ children }) {
  const [journals, setJournals] = useState([]);
  const [streak,   setStreak]   = useState(0);

  const loadJournals = async (uid) => {
    const cached = getCachedJournals();
    if (cached?.length) {
      setJournals(cached);
    } else {
      setJournals(SEED);
      cacheJournals(SEED);
    }
    setStreak(Math.floor(Math.random() * 7) + 1);
  };

  const addJournal = (entry) => {
    const updated = [entry, ...journals];
    setJournals(updated);
    cacheJournals(updated);
  };

  return (
    <JournalContext.Provider value={{ journals, streak, loadJournals, addJournal }}>
      {children}
    </JournalContext.Provider>
  );
}
export const useJournal = () => useContext(JournalContext);
