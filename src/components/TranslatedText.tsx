import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

interface TranslatedTextProps {
  children: string;
  context?: string;
}

/**
 * Component that automatically translates its text content.
 * Usage: <T>Some English text</T>
 */
export function T({ children, context }: TranslatedTextProps) {
  const { t } = useLanguage();
  return <>{t(children)}</>;
}

/**
 * Hook to translate a batch of texts on mount/language change.
 * Returns a translate function for individual strings.
 */
export function useTranslation(texts?: string[], context?: string) {
  const { t, translateBatch, language, isTranslating } = useLanguage();

  useEffect(() => {
    if (texts && texts.length > 0 && language !== 'en') {
      translateBatch(texts, context);
    }
  }, [language, texts?.join(',')]);

  return { t, isTranslating, language };
}
