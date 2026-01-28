import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CompanyGrid } from '@/components/CompanyGrid';
import { CompanyModal } from '@/components/CompanyModal';
import { useCompanies } from '@/hooks/useCompanies';
import { Company, FemtechCategory } from '@/types/company';
import { useDebounce } from '@/hooks/useDebounce';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FemtechCategory | 'all'>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: companies, isLoading } = useCompanies({
    search: debouncedSearch,
    category: selectedCategory,
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
