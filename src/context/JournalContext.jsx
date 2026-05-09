import { createContext, useContext, useState, useCallback } from "react";
import { db } from "../lib/firebase";
import {
  collection, addDoc, getDocs, query,
  where, orderBy, serverTimestamp
} from "firebase/firestore";
import { saveJournalOffline, getOfflineJournals } from "../lib/offlineStorage";

const JournalContext = createContext(null);

export function JournalProvider({ children }) {
  const [journals, setJournals] = useState([]);
  const [streak, setStreak]     = useState(0);

  // Save a journal — note: only metadata is saved to Firestore, NOT the raw entry text
  const saveJournal = useCallback(async (userId, distressMeta) => {
    const entry = {
      userId,
      ...distressMeta,  // { emotion, severity, timestamp } — no raw text
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "journals"), entry);
    } catch {
      // Offline fallback
      await saveJournalOffline(entry);
    }
  }, []);

  const loadJournals = useCallback(async (userId) => {
    try {
      const q   = query(
        collection(db, "journals"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setJournals(data);
      calculateStreak(data);
    } catch {
      const offline = await getOfflineJournals();
      setJournals(offline);
    }
  }, []);

  const calculateStreak = (data) => {
    if (!data.length) return setStreak(0);
    const dates = [...new Set(
      data.map(j => new Date(j.timestamp).toDateString())
    )].sort((a, b) => new Date(b) - new Date(a));

    let count = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (d.toDateString() === expected.toDateString()) count++;
      else break;
    }
    setStreak(count);
  };

  return (
    <JournalContext.Provider value={{ journals, streak, saveJournal, loadJournals }}>
      {children}
    </JournalContext.Provider>
  );
}

export const useJournal = () => useContext(JournalContext);