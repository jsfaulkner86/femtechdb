import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CompanyGrid } from '@/components/CompanyGrid';
import { CompanyModal } from '@/components/CompanyModal';
import { SEO } from '@/components/SEO';
import { useCompanies } from '@/hooks/useCompanies';
import { Company } from '@/types/company';
import { useLanguage } from '@/contexts/LanguageContext';

const FertilityCompanies = () => {
  const { t } = useLanguage();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCompanies({
    category: 'fertility',
  });
  const companies = useMemo(() => data?.pages.flat() ?? [], [data]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Fertility Technology Companies & Startups — FemtechDB"
        description="Browse fertility technology companies and startups worldwide: IVF, egg freezing, fertility tracking, male fertility, and at-home testing. Free and updated daily."
        path="/category/fertility"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'FemtechDB', item: 'https://femtechdb.com/' },
              { '@type': 'ListItem', position: 2, name: 'Fertility Technology Companies', item: 'https://femtechdb.com/category/fertility' },
            ],
          })}
        </script>
      </Helmet>
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-subtle py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <nav className="text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-foreground">FemtechDB</Link> / {t('Fertility')}
            </nav>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t('Fertility Technology Companies')}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('Explore fertility startups and companies using technology to help people conceive — from fertility tracking and at-home hormone testing to IVF support, egg freezing, and male fertility care.')}
            </p>
          </div>
        </section>

        <CompanyGrid
          companies={companies}
          isLoading={isLoading}
          onCompanyClick={(c) => { setSelectedCompany(c); setIsModalOpen(true); }}
          activeLetter={null}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </main>

      <Footer />
      <CompanyModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setTimeout(() => setSelectedCompany(null), 200); }}
      />
    </div>
  );
};

export default FertilityCompanies;
