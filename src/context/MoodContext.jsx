import { createContext, useContext, useState, useCallback } from "react";
import { db } from "../lib/firebase";
import {
  collection, addDoc, getDocs,
  query, where, orderBy, serverTimestamp
} from "firebase/firestore";

const MoodContext = createContext(null);

export function MoodProvider({ children }) {
  const [moods, setMoods] = useState([]);

  const logMood = useCallback(async (userId, mood) => {
    const entry = {
      userId,
      mood,
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, "moods"), entry);
    } catch (e) {
      console.error("Mood log failed", e);
    }
  }, []);

  const loadMoods = useCallback(async (userId) => {
    try {
      const q = query(
        collection(db, "moods"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setMoods(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Load moods failed", e);
    }
  }, []);

  return (
    <MoodContext.Provider value={{ moods, logMood, loadMoods }}>
      {children}
    </MoodContext.Provider>
  );
}

export const useMood = () => useContext(MoodContext);