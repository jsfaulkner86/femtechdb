import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, X } from 'lucide-react';
import { continents, usStates, type Continent } from '@/types/company';
import { useLanguage } from '@/contexts/LanguageContext';

// Common countries per continent
const countriesByContinent: Record<Continent, string[]> = {
  'Africa': ['Egypt', 'Kenya', 'Nigeria', 'South Africa', 'Morocco'],
  'Asia': ['China', 'India', 'Israel', 'Japan', 'Singapore', 'South Korea', 'United Arab Emirates'],
  'Europe': ['France', 'Germany', 'Netherlands', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'],
  'North America': ['Canada', 'Mexico', 'United States'],
  'South America': ['Argentina', 'Brazil', 'Chile', 'Colombia'],
  'Oceania': ['Australia', 'New Zealand'],
};

export interface GeographicFilters {
  continent: string | null;
  country: string | null;
  state: string | null;
}

interface GeographicFilterProps {
  filters: GeographicFilters;
  onFiltersChange: (filters: GeographicFilters) => void;
}

export function GeographicFilter({ filters, onFiltersChange }: GeographicFilterProps) {
  const { t } = useLanguage();
  const availableCountries = filters.continent 
    ? countriesByContinent[filters.continent as Continent] || []
    : [];

  const showStateFilter = filters.country === 'United States';

  const handleContinentChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ continent: null, country: null, state: null });
    } else {
      onFiltersChange({ continent: value, country: null, state: null });
    }
  };

  const handleCountryChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, country: null, state: null });
    } else {
      onFiltersChange({ ...filters, country: value, state: null });
    }
  };

  const handleStateChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, state: null });
    } else {
      onFiltersChange({ ...filters, state: value });
    }
  };

  const clearFilters = () => {
    onFiltersChange({ continent: null, country: null, state: null });
  };

  const hasActiveFilters = filters.continent || filters.country || filters.state;

  return (
    <div className="pb-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>{t('Filter by location')}:</span>
          </div>

          {/* Continent Select */}
          <Select
            value={filters.continent || 'all'}
            onValueChange={handleContinentChange}
          >
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Continent" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">{t('All Continents')}</SelectItem>
              {continents.map((continent) => (
                <SelectItem key={continent} value={continent}>
                  {continent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Country Select - only show if continent is selected */}
          {filters.continent && (
            <Select
              value={filters.country || 'all'}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">{t('All Countries')}</SelectItem>
                {availableCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* State Select - only show if country is United States */}
          {showStateFilter && (
            <Select
              value={filters.state || 'all'}
              onValueChange={handleStateChange}
            >
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-[300px]">
                <SelectItem value="all">{t('All States')}</SelectItem>
                {usStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              {t('Clear')}
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-sage" />
            <span className="text-muted-foreground">
              {t('Showing companies in')}:{' '}
              <span className="font-medium text-foreground">
                {[filters.state, filters.country, filters.continent]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}