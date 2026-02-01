import { useState, useCallback, memo, useMemo } from 'react';
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

// Pre-defined static styles to avoid recreating objects on each render
const geoStyleDefault = {
  fill: 'hsl(var(--muted) / 0.3)',
  stroke: 'hsl(var(--border) / 0.5)',
  strokeWidth: 0.5,
  outline: 'none',
  cursor: 'default',
};

const geoStyleDefaultWithCompanies = {
  ...geoStyleDefault,
  fill: 'hsl(var(--accent) / 0.15)',
  cursor: 'pointer',
};

const geoStyleHover = {
  fill: 'hsl(var(--muted) / 0.4)',
  stroke: 'hsl(var(--accent))',
  strokeWidth: 1,
  outline: 'none',
  cursor: 'default',
};

const geoStyleHoverWithCompanies = {
  ...geoStyleHover,
  fill: 'hsl(var(--accent) / 0.35)',
  cursor: 'pointer',
};

const geoStylePressed = {
  fill: 'hsl(var(--accent) / 0.5)',
  stroke: 'hsl(var(--accent))',
  strokeWidth: 1.5,
  outline: 'none',
};

interface WorldMapProps {
  onRegionClick?: (continent: string | null, country: string | null) => void;
  maxYear?: number;
}

// Memoized Geography component to prevent unnecessary re-renders
const MemoizedGeography = memo(function MemoizedGeography({
  geo,
  hasCompanies,
  onHover,
  onLeave,
  onClick,
}: {
  geo: any;
  hasCompanies: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <Geography
      geography={geo}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        default: hasCompanies ? geoStyleDefaultWithCompanies : geoStyleDefault,
        hover: hasCompanies ? geoStyleHoverWithCompanies : geoStyleHover,
        pressed: geoStylePressed,
      }}
    />
  );
});

// Memoized Marker component
const MemoizedMarker = memo(function MemoizedMarker({
  marker,
  onEnter,
  onLeave,
}: {
  marker: CompanyLocation & { coordinates: [number, number] };
  onEnter: (e: React.MouseEvent) => void;
  onLeave: () => void;
}) {
  return (
    <Marker
      coordinates={marker.coordinates}
      onMouseEnter={onEnter as any}
      onMouseLeave={onLeave}
    >
      <circle
        r={4}
        fill="hsl(var(--accent))"
        stroke="hsl(var(--background))"
        strokeWidth={1.5}
        style={{ cursor: 'pointer' }}
      />
    </Marker>
  );
});

export const WorldMap = memo(function WorldMap({ onRegionClick, maxYear }: WorldMapProps) {
  const { data, isLoading } = useCompanyLocations(maxYear);
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

  // Pre-compute country lookup set for O(1) checks
  const countriesWithCompanies = useMemo(() => {
    if (!data?.countryGroups) return new Set<string>();
    return new Set(data.countryGroups.map(g => g.country));
  }, [data?.countryGroups]);

  // Pre-compute country to data mapping
  const countryDataMap = useMemo(() => {
    if (!data?.countryGroups) return new Map<string, typeof data.countryGroups[0]>();
    return new Map(data.countryGroups.map(g => [g.country, g]));
  }, [data?.countryGroups]);

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
    (countryName: string) => {
      const countryGroup = countryDataMap.get(countryName);
      onRegionClick?.(countryGroup?.continent || null, countryName);
    },
    [countryDataMap, onRegionClick]
  );

  const handleCountryHover = useCallback((countryName: string) => {
    setHoveredCountry(countryName);
  }, []);

  const handleCountryLeave = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  // Get hovered country data
  const hoveredCountryData = hoveredCountry ? countryDataMap.get(hoveredCountry) : null;

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
                  const hasCompanies = countriesWithCompanies.has(countryName);
                  
                  return (
                    <MemoizedGeography
                      key={geo.rsmKey}
                      geo={geo}
                      hasCompanies={hasCompanies}
                      onHover={() => handleCountryHover(countryName)}
                      onLeave={handleCountryLeave}
                      onClick={() => handleGeographyClick(countryName)}
                    />
                  );
                })
              }
            </Geographies>

            {/* Company markers */}
            {data?.markers.map((marker) => (
              <MemoizedMarker
                key={marker.id}
                marker={marker}
                onEnter={(e) => handleMarkerEnter(marker, e)}
                onLeave={handleMarkerLeave}
              />
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Hover tooltip for country */}
        {hoveredCountry && (
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-border shadow-lg">
            <p className="text-sm font-medium">{hoveredCountry}</p>
            {hoveredCountryData && (
              <p className="text-xs text-muted-foreground">
                {hoveredCountryData.companies.length} companies
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