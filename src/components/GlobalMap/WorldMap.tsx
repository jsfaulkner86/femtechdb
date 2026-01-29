import { useState, useCallback, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { useCompanyLocations, type CompanyLocation } from '@/hooks/useCompanyLocations';
import { CompanyTooltip } from './CompanyTooltip';
import { RegionStats } from './RegionStats';
import { categoryLabels } from '@/types/company';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface WorldMapProps {
  onRegionClick?: (continent: string | null, country: string | null) => void;
}

export const WorldMap = memo(function WorldMap({ onRegionClick }: WorldMapProps) {
  const { data, isLoading } = useCompanyLocations();
  const [tooltipContent, setTooltipContent] = useState<{
    company: CompanyLocation & { coordinates: [number, number] };
    position: { x: number; y: number };
  } | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const handleMarkerEnter = useCallback(
    (company: CompanyLocation & { coordinates: [number, number] }, event: React.MouseEvent) => {
      setTooltipContent({
        company,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  const handleMarkerLeave = useCallback(() => {
    setTooltipContent(null);
  }, []);

  const handleGeographyClick = useCallback(
    (geo: { properties: { name: string } }) => {
      const countryName = geo.properties.name;
      // Find the continent for this country
      const countryGroup = data?.countryGroups.find(g => g.country === countryName);
      onRegionClick?.(countryGroup?.continent || null, countryName);
    },
    [data, onRegionClick]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-card/50 rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading global map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <RegionStats
        totalCompanies={data?.totalCompanies || 0}
        totalCountries={data?.totalCountries || 0}
        countryGroups={data?.countryGroups || []}
      />
      
      <div className="relative bg-gradient-to-br from-card via-background to-card rounded-2xl border border-border/50 overflow-hidden shadow-xl">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 130,
            center: [0, 20],
          }}
          style={{ width: '100%', height: 'auto', aspectRatio: '2/1' }}
        >
          <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  const hasCompanies = data?.countryGroups.some(g => g.country === countryName);
                  const isHovered = hoveredCountry === countryName;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredCountry(countryName)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => handleGeographyClick(geo)}
                      style={{
                        default: {
                          fill: hasCompanies 
                            ? 'hsl(var(--primary) / 0.2)' 
                            : 'hsl(var(--muted) / 0.3)',
                          stroke: 'hsl(var(--border) / 0.5)',
                          strokeWidth: 0.5,
                          outline: 'none',
                          cursor: hasCompanies ? 'pointer' : 'default',
                        },
                        hover: {
                          fill: hasCompanies 
                            ? 'hsl(var(--primary) / 0.4)' 
                            : 'hsl(var(--muted) / 0.4)',
                          stroke: 'hsl(var(--primary))',
                          strokeWidth: 1,
                          outline: 'none',
                          cursor: hasCompanies ? 'pointer' : 'default',
                        },
                        pressed: {
                          fill: 'hsl(var(--primary) / 0.5)',
                          stroke: 'hsl(var(--primary))',
                          strokeWidth: 1.5,
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Company markers */}
            {data?.markers.map((marker) => (
              <Marker
                key={marker.id}
                coordinates={marker.coordinates}
                onMouseEnter={(e) => handleMarkerEnter(marker, e as unknown as React.MouseEvent)}
                onMouseLeave={handleMarkerLeave}
              >
                <circle
                  r={4}
                  fill="hsl(var(--coral))"
                  stroke="hsl(var(--background))"
                  strokeWidth={1.5}
                  style={{
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  }}
                  className="transition-all duration-200 hover:r-6"
                />
                <circle
                  r={8}
                  fill="hsl(var(--coral) / 0.3)"
                  className="animate-ping"
                  style={{ animationDuration: '3s' }}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Hover tooltip for country */}
        {hoveredCountry && (
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-border shadow-lg">
            <p className="text-sm font-medium">{hoveredCountry}</p>
            {data?.countryGroups.find(g => g.country === hoveredCountry) && (
              <p className="text-xs text-muted-foreground">
                {data.countryGroups.find(g => g.country === hoveredCountry)?.companies.length} companies
              </p>
            )}
          </div>
        )}
      </div>

      {/* Company tooltip */}
      {tooltipContent && (
        <CompanyTooltip
          company={tooltipContent.company}
          position={tooltipContent.position}
          categoryLabel={categoryLabels[tooltipContent.company.category as keyof typeof categoryLabels] || tooltipContent.company.category}
        />
      )}
    </div>
  );
});
