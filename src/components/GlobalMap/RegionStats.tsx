import { Globe, MapPin, Building2 } from 'lucide-react';
import type { LocationGroup } from '@/hooks/useCompanyLocations';

interface RegionStatsProps {
  totalCompanies: number;
  totalCountries: number;
  countryGroups: LocationGroup[];
}

export function RegionStats({ totalCompanies, totalCountries, countryGroups }: RegionStatsProps) {
  // Calculate continent breakdown
  const continentCounts: Record<string, number> = {};
  countryGroups.forEach(group => {
    if (group.continent) {
      continentCounts[group.continent] = (continentCounts[group.continent] || 0) + group.companies.length;
    }
  });

  const sortedContinents = Object.entries(continentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Companies</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalCompanies}</p>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Countries</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalCountries}</p>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/50 col-span-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">By Continent</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedContinents.map(([continent, count]) => (
              <span
                key={continent}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs"
              >
                <span className="font-medium text-foreground">{continent}</span>
                <span className="text-muted-foreground">({count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
