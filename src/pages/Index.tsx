import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { GeographicFilter, type GeographicFilters } from '@/components/GeographicFilter';
import { CompanyGrid } from '@/components/CompanyGrid';
import { CompanyModal } from '@/components/CompanyModal';
import { useCompanies } from '@/hooks/useCompanies';
import { Company, FemtechCategory } from '@/types/company';
import { useDebounce } from '@/hooks/useDebounce';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FemtechCategory | 'all'>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: companies, isLoading } = useCompanies({
    search: debouncedSearch,
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <HeroSection 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <GeographicFilter
          filters={geoFilters}
          onFiltersChange={handleGeoFiltersChange}
        />
        
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
