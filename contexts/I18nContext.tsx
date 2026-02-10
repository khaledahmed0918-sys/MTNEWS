
import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { Lang } from '../types';
import { translations } from '../constants';
import { useLocalStorage } from '../hooks';

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof translations.en | string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children?: React.ReactNode }) => {
  const [lang, setLang] = useLocalStorage<Lang>('mtnews-lang', 'en');
  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = useCallback((key: keyof typeof translations.en | string) => {
    // @ts-ignore
    return translations[lang][key] || translations.en[key] || key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, dir }), [lang, t, dir, setLang]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
};
