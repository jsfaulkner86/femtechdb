import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type LanguageCode = 'en' | 'es' | 'fr' | 'pt' | 'ar' | 'zh' | 'hi' | 'de' | 'ja' | 'ko';

export const languages: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (text: string) => string;
  translateBatch: (texts: string[], context?: string) => Promise<void>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('femtechdb-language');
    return (saved as LanguageCode) || 'en';
  });
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const pendingTexts = useRef<Set<string>>(new Set());
  const batchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('femtechdb-language', lang);
    if (lang === 'en') {
      setTranslations({});
    }
    // Set dir attribute for RTL languages
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  // Set initial dir
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const fetchTranslations = useCallback(async (texts: string[], context?: string) => {
    if (language === 'en' || texts.length === 0) return;

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { texts, language, context: context || 'ui' },
      });

      if (error) {
        console.error('Translation error:', error);
        return;
      }

      if (data?.translations) {
        setTranslations(prev => ({ ...prev, ...data.translations }));
      }
    } catch (e) {
      console.error('Translation fetch error:', e);
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  const translateBatch = useCallback(async (texts: string[], context?: string) => {
    if (language === 'en') return;
    const newTexts = texts.filter(t => !translations[t] && t.trim());
    if (newTexts.length > 0) {
      await fetchTranslations(newTexts, context);
    }
  }, [language, translations, fetchTranslations]);

  // Auto-batch: collect texts and translate in batches
  const queueTranslation = useCallback((text: string) => {
    if (language === 'en' || translations[text] || !text.trim()) return;
    
    pendingTexts.current.add(text);
    
    if (batchTimer.current) clearTimeout(batchTimer.current);
    batchTimer.current = setTimeout(() => {
      const batch = Array.from(pendingTexts.current);
      pendingTexts.current.clear();
      if (batch.length > 0) {
        fetchTranslations(batch);
      }
    }, 100);
  }, [language, translations, fetchTranslations]);

  const t = useCallback((text: string): string => {
    if (language === 'en' || !text) return text;
    
    // Queue for translation if not cached
    if (!translations[text]) {
      queueTranslation(text);
      return text; // Return original while translating
    }
    
    return translations[text];
  }, [language, translations, queueTranslation]);

  // Clear translations when language changes
  useEffect(() => {
    if (language !== 'en') {
      setTranslations({});
      pendingTexts.current.clear();
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateBatch, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
