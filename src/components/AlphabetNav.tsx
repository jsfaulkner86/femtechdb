import { cn } from '@/lib/utils';

interface AlphabetNavProps {
  activeLetter: string | null;
  onLetterClick: (letter: string | null) => void;
}

const LETTERS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function AlphabetNav({ activeLetter, onLetterClick }: AlphabetNavProps) {
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
          {LETTERS.map(letter => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter === activeLetter ? null : letter)}
              className={cn(
                'w-7 h-7 text-xs font-semibold rounded-md transition-colors flex items-center justify-center',
                activeLetter === letter
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer'
              )}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
