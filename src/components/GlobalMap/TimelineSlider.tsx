import { useState, useEffect, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineSliderProps {
  minYear: number;
  maxYear: number;
  selectedYear: number;
  onYearChange: (year: number) => void;
  companiesUpToYear: number;
  totalCompanies: number;
}

export function TimelineSlider({
  minYear,
  maxYear,
  selectedYear,
  onYearChange,
  companiesUpToYear,
  totalCompanies,
}: TimelineSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const next = selectedYear + 1;
      if (next > maxYear) {
        setIsPlaying(false);
        onYearChange(maxYear);
      } else {
        onYearChange(next);
      }
    }, 150); // Speed of animation

    return () => clearInterval(interval);
  }, [isPlaying, maxYear, selectedYear, onYearChange]);

  const handlePlay = () => {
    if (selectedYear >= maxYear) {
      onYearChange(minYear);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    onYearChange(maxYear);
  };

  const percentage = totalCompanies > 0 
    ? Math.round((companiesUpToYear / totalCompanies) * 100) 
    : 0;

  // Generate decade markers
  const decadeMarkers = useMemo(() => {
    const markers: number[] = [];
    const startDecade = Math.ceil(minYear / 10) * 10;
    for (let year = startDecade; year <= maxYear; year += 10) {
      markers.push(year);
    }
    return markers;
  }, [minYear, maxYear]);

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">FemTech Growth Timeline</h3>
            <p className="text-sm text-muted-foreground">
              Slide to see companies founded up to each year
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePause}
              className="gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePlay}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Play
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            title="Reset to current year"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Year display and stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center">
          <span className="block text-4xl font-bold text-primary tabular-nums">
            {selectedYear}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Showing up to
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="block text-2xl font-bold text-foreground tabular-nums">
              {companiesUpToYear}
            </span>
            <span className="text-xs text-muted-foreground">
              Companies
            </span>
          </div>
          
          <div className="text-center">
            <span className="block text-2xl font-bold text-accent tabular-nums">
              {percentage}%
            </span>
            <span className="text-xs text-muted-foreground">
              of Total
            </span>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <Slider
          value={[selectedYear]}
          onValueChange={([value]) => onYearChange(value)}
          min={minYear}
          max={maxYear}
          step={1}
          className="w-full"
        />
        
        {/* Decade markers */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{minYear}</span>
          {decadeMarkers.filter(y => y > minYear && y < maxYear).slice(0, 5).map(year => (
            <span key={year} className="hidden sm:inline">{year}</span>
          ))}
          <span>{maxYear}</span>
        </div>
      </div>

      {/* Growth indicator bar */}
      <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
