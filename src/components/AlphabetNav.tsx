import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Company } from '@/types/company';

interface AlphabetNavProps {
  companies: Company[] | undefined;
  activeLetter: string | null;
  onLetterClick: (letter: string | null) => void;
}

const LETTERS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function AlphabetNav({ companies, activeLetter, onLetterClick }: AlphabetNavProps) {
  const availableLetters = useMemo(() => {
    if (!companies) return new Set<string>();
    const letters = new Set<string>();
    companies.forEach(c => {
      if (!c.name) return;
      const first = c.name[0].toUpperCase();
      letters.add(/[A-Z]/.test(first) ? first : '#');
    });
    return letters;
  }, [companies]);

  return (
    <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-0.5 justify-center flex-wrap">
          <button
            onClick={() => onLetterClick(null)}
            className={cn(
              'px-2 py-1 text-xs font-semibold rounded-md transition-colors',
              activeLetter === null
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            All
          </button>
          {LETTERS.map(letter => {
            const hasCompanies = availableLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() => hasCompanies && onLetterClick(letter === activeLetter ? null : letter)}
                disabled={!hasCompanies}
                className={cn(
                  'w-7 h-7 text-xs font-semibold rounded-md transition-colors flex items-center justify-center',
                  activeLetter === letter
                    ? 'bg-primary text-primary-foreground'
                    : hasCompanies
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer'
                      : 'text-muted-foreground/30 cursor-not-allowed'
                )}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
