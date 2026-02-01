import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WorldMap } from '@/components/GlobalMap';
import { Globe } from 'lucide-react';

export default function GlobalMapPage() {
  const navigate = useNavigate();

  const handleRegionClick = (continent: string | null, country: string | null) => {
    // Navigate to home with filters applied
    const params = new URLSearchParams();
    if (continent) params.set('continent', continent);
    if (country) params.set('country', country);
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-subtle py-12 md:py-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-coral/10 blur-3xl animate-float" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container relative z-10 mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-full animate-fade-in">
                <Globe className="h-4 w-4" />
                Interactive Global View
              </span>
              
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                FemTech Companies{' '}
                <span className="text-gradient">Worldwide</span>
              </h1>
              
              <p className="mt-4 text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Explore the global landscape of women's health innovation.
                <br />
                Click on any region to filter companies by location.
              </p>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <WorldMap onRegionClick={handleRegionClick} />
          </div>
        </section>

        {/* Top Countries Table */}
        <section className="pb-12">
          <div className="container mx-auto px-4">
            <TopCountriesTable onCountryClick={(country) => handleRegionClick(null, country)} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function TopCountriesTable({ onCountryClick }: { onCountryClick: (country: string) => void }) {
  const { data } = useCompanyLocationsForTable();

  if (!data) return null;

  const sortedCountries = [...data.countryGroups]
    .sort((a, b) => b.companies.length - a.companies.length)
    .slice(0, 10);

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50">
        <h2 className="text-lg font-semibold">Top Countries by Company Count</h2>
      </div>
      <div className="divide-y divide-border/50">
        {sortedCountries.map((group, index) => (
          <button
            key={group.country}
            onClick={() => onCountryClick(group.country)}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-foreground">{group.country}</p>
                <p className="text-xs text-muted-foreground">{group.continent}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-primary">
              {group.companies.length} companies
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Import the hook for the table
import { useCompanyLocations as useCompanyLocationsForTable } from '@/hooks/useCompanyLocations';
