import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SocialShareButtons } from './SocialShareButtons';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              Femtech<span className="text-primary">DB</span>
            </span>
          </div>

          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">{t('About')}</Link>
            <Link to="/methodology" className="hover:text-foreground transition-colors">{t('Methodology')}</Link>
            <Link to="/global-map" className="hover:text-foreground transition-colors">{t('Global Map')}</Link>
          </nav>

          <div className="flex flex-col items-center md:items-end gap-3">
            <SocialShareButtons />
            <nav className="flex items-center gap-3 text-xs text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">{t('Privacy Policy')}</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-foreground transition-colors">{t('Terms of Service')}</Link>
            </nav>
            <p className="text-xs text-muted-foreground">
              {t('Updated daily')} • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
