import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { commonTranslations } from "@/i18n/commonTranslations";
import { farmerTranslations } from "@/i18n/farmerTranslations";
import { adminTranslations } from "@/i18n/adminTranslations";

export type Language = "en" | "ar";

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

const ADMIN_LANG_KEY = "language_admin";
const FARMER_LANG_KEY = "language_farmer";

const getStoredLang = (key: string): Language =>
  (localStorage.getItem(key) as Language) || "en";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [adminLang, setAdminLangState] = useState<Language>(() => getStoredLang(ADMIN_LANG_KEY));
  const [farmerLang, setFarmerLangState] = useState<Language>(() => getStoredLang(FARMER_LANG_KEY));

  const language = isAdminRoute ? adminLang : farmerLang;

  const setLanguage = useCallback((lang: Language) => {
    if (isAdminRoute) {
      setAdminLangState(lang);
      localStorage.setItem(ADMIN_LANG_KEY, lang);
    } else {
      setFarmerLangState(lang);
      localStorage.setItem(FARMER_LANG_KEY, lang);
    }
  }, [isAdminRoute]);

  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key;
  }, [language]);

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
