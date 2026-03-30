import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { commonTranslations } from "@/i18n/commonTranslations";
import { farmerTranslations } from "@/i18n/farmerTranslations";
import { adminTranslations } from "@/i18n/adminTranslations";

export type Language = "en" | "ar";

// Merge all translation modules into one object per language
const translations = {
  en: {
    ...commonTranslations.en,
    ...farmerTranslations.en,
    ...adminTranslations.en,
  },
  ar: {
    ...commonTranslations.ar,
    ...farmerTranslations.ar,
    ...adminTranslations.ar,
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
