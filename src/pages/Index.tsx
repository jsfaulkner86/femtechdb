import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { GeographicFilter, type GeographicFilters } from '@/components/GeographicFilter';
import { CompanyGrid } from '@/components/CompanyGrid';
import { CompanyModal } from '@/components/CompanyModal';
import { FeaturedCompanies } from '@/components/FeaturedCompanies';
import { DatabaseStats } from '@/components/DatabaseStats';
import { AlphabetNav } from '@/components/AlphabetNav';
import { useCompanies } from '@/hooks/useCompanies';
import { Company, FemtechCategory } from '@/types/company';


const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FemtechCategory | 'all'>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [geoFilters, setGeoFilters] = useState<GeographicFilters>({
    continent: searchParams.get('continent'),
    country: searchParams.get('country'),
    state: searchParams.get('state'),
  });

  // Sync URL params with geo filters on mount and when URL changes
  useEffect(() => {
    const continent = searchParams.get('continent');
    const country = searchParams.get('country');
    const state = searchParams.get('state');
    
    if (continent || country || state) {
      setGeoFilters({ continent, country, state });
    }
  }, [searchParams]);

  // Update URL when geo filters change
  const handleGeoFiltersChange = (filters: GeographicFilters) => {
    setGeoFilters(filters);
    const params = new URLSearchParams();
    if (filters.continent) params.set('continent', filters.continent);
    if (filters.country) params.set('country', filters.country);
    if (filters.state) params.set('state', filters.state);
    setSearchParams(params, { replace: true });
  };

  const { data: companies, isLoading } = useCompanies({
    search: searchQuery,
    category: selectedCategory,
    continent: geoFilters.continent,
    country: geoFilters.country,
    state: geoFilters.state,
  });

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCompany(null), 200);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || geoFilters.continent || geoFilters.country || geoFilters.state;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <HeroSection 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Database Stats - shows freshness and verification info */}
        <div className="container mx-auto px-4 -mt-6 mb-6 relative z-10">
          <DatabaseStats />
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <GeographicFilter
          filters={geoFilters}
          onFiltersChange={handleGeoFiltersChange}
        />

        {/* Featured Companies - only show when no filters active */}
        {!hasActiveFilters && (
          <FeaturedCompanies onCompanyClick={handleCompanyClick} />
        )}
        
        <CompanyGrid
          companies={companies}
          isLoading={isLoading}
          onCompanyClick={handleCompanyClick}
        />
      </main>

      <Footer />

      <CompanyModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Index;
