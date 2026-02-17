import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProblemSearch } from '@/components/ProblemSearch';
import { useLanguage } from '@/contexts/LanguageContext';

const ForPatients = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-subtle py-20 md:py-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial opacity-30" />
          </div>

          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
                {t('Find Solutions to Your Health Challenges')}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t('Tell us about your health concerns and we\'ll match you with relevant solutions and companies that address your specific needs.')}
              </p>
              <ProblemSearch />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForPatients;
