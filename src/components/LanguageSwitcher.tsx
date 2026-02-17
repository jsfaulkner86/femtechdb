import { Globe, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage, languages, type LanguageCode } from '@/contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage, isTranslating } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      {isTranslating && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      <Select value={language} onValueChange={(val) => setLanguage(val as LanguageCode)}>
        <SelectTrigger className="w-auto gap-1.5 border-none bg-transparent shadow-none h-8 px-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <Globe className="h-3.5 w-3.5" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background z-[60]">
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.nativeLabel}</span>
                {lang.code !== 'en' && (
                  <span className="text-xs text-muted-foreground">({lang.label})</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
