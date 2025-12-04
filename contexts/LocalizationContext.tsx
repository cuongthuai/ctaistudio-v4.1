import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedLanguage = localStorage.getItem('ctai_language') as Language;
    if (storedLanguage && ['vi', 'en'].includes(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`);
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(`Could not load translations for language: ${language}`, error);
        // Fallback to Vietnamese if English fails
        if (language !== 'vi') {
          const fallbackResponse = await fetch(`/locales/vi.json`);
          const data = await fallbackResponse.json();
          setTranslations(data);
        }
      }
    };
    fetchTranslations();
    localStorage.setItem('ctai_language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {Object.keys(translations).length > 0 ? children : null}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
