import { Heart } from 'lucide-react';
import { SubmitCompanyForm } from './SubmitCompanyForm';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              FemTech<span className="text-primary">DB</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Empowering discovery of women's health innovation.
            </p>
            <SubmitCompanyForm />
          </div>

          <p className="text-xs text-muted-foreground">
            Updated daily • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
