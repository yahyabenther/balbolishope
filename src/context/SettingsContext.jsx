import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const SettingsContext = createContext(null);

// A single shared document everyone reads from — admin changes here are
// visible in real time to every customer's browser, unlike localStorage
// which was only ever visible to the admin's own browser.
const SETTINGS_DOC = doc(db, "settings", "store");

const DEFAULT_SETTINGS = {
  deliveryFee: 7,
  freeDeliveryThreshold: 150,
  pickupEnabled: true,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      SETTINGS_DOC,
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
        } else {
          // First run ever: seed Firestore with the defaults so there's
          // one canonical document going forward.
          setDoc(SETTINGS_DOC, DEFAULT_SETTINGS).catch((err) =>
            console.error("Failed to seed settings:", err)
          );
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching settings:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  async function updateSettings(partial) {
    const next = { ...settings, ...partial };
    setSettings(next); // optimistic update so the admin's UI feels instant
    try {
      await setDoc(SETTINGS_DOC, next, { merge: true });
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Roll back the optimistic update if the write failed.
      setSettings(settings);
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}