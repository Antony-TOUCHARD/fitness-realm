"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, TranslationKey } from "@/lib/translations";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr"); // Default to French
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("fitness-realm-lang") as Language;
    if (savedLang === "fr" || savedLang === "en") {
      setLanguageState(savedLang);
    } else {
      // Check browser language
      const browserLang = navigator.language.substring(0, 2);
      if (browserLang === "en") {
        setLanguageState("en");
      } else {
        setLanguageState("fr");
      }
    }
    setMounted(false); // We set mounted to true after we check local storage to prevent mismatch
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("fitness-realm-lang", lang);
  };

  const t = (key: TranslationKey, variables?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.fr;
    let text: string = langDict[key] || translations.fr[key] || String(key);

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
