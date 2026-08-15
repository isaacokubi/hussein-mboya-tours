import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    companyName: "Coherent Tours",
    supportEmail: "",
    supportPhone: "",
    currency: "KES",
    currencySymbol: "KSh",
    logo: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get("/settings");
        const data = response.data?.data || response.data || {};

        setSettings(prev => ({
          ...prev,
          ...data
        }));
      } catch (error) {
        console.error("Settings load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
