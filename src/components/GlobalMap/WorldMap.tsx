import { useState, useCallback, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  
  // Zoom and pan state
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 20],
    zoom: 1,
  });

  const handleZoomIn = useCallback(() => {
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
  }, []);

  const handleReset = useCallback(() => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  }, []);

  const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  }, []);

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
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomIn}
            className="h-9 w-9 bg-card/95 backdrop-blur-sm border border-border shadow-md hover:bg-accent/20 transition-all duration-200"
            title="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomOut}
            className="h-9 w-9 bg-card/95 backdrop-blur-sm border border-border shadow-md hover:bg-accent/20 transition-all duration-200"
            title="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleReset}
            className="h-9 w-9 bg-card/95 backdrop-blur-sm border border-border shadow-md hover:bg-accent/20 transition-all duration-200"
            title="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom level indicator */}
        <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border shadow-md">
          <p className="text-xs font-medium text-muted-foreground">
            Zoom: {position.zoom.toFixed(1)}x
          </p>
        </div>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 130,
            center: [0, 20],
          }}
          style={{ width: '100%', height: 'auto', aspectRatio: '2/1' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={8}
          >
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
                            ? 'hsl(var(--accent) / 0.15)' 
                            : 'hsl(var(--muted) / 0.3)',
                          stroke: 'hsl(var(--border) / 0.5)',
                          strokeWidth: 0.5,
                          outline: 'none',
                          cursor: hasCompanies ? 'pointer' : 'default',
                        },
                        hover: {
                          fill: hasCompanies 
                            ? 'hsl(var(--accent) / 0.35)' 
                            : 'hsl(var(--muted) / 0.4)',
                          stroke: 'hsl(var(--accent))',
                          strokeWidth: 1,
                          outline: 'none',
                          cursor: hasCompanies ? 'pointer' : 'default',
                        },
                        pressed: {
                          fill: 'hsl(var(--accent) / 0.5)',
                          stroke: 'hsl(var(--accent))',
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
                  r={4 / position.zoom}
                  fill="hsl(var(--accent))"
                  stroke="hsl(var(--background))"
                  strokeWidth={1.5 / position.zoom}
                  style={{
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  }}
                  className="transition-all duration-200"
                />
                <circle
                  r={8 / position.zoom}
                  fill="hsl(var(--accent) / 0.3)"
                  className="animate-ping"
                  style={{ animationDuration: '3s' }}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Hover tooltip for country */}
        {hoveredCountry && (
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-border shadow-lg animate-fade-in">
            <p className="text-sm font-medium">{hoveredCountry}</p>
            {data?.countryGroups.find(g => g.country === hoveredCountry) && (
              <p className="text-xs text-muted-foreground">
                {data.countryGroups.find(g => g.country === hoveredCountry)?.companies.length} companies
              </p>
            )}
          </div>
        )}

        {/* Instructions hint */}
        <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/50">
          <p className="text-xs text-muted-foreground">
            Drag to pan • Scroll to zoom
          </p>
        </div>
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