import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const ForPatients = () => {
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
                Find Solutions to Your Health Challenges
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Tell us about your health concerns and we'll match you with relevant solutions and companies that address your specific needs.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center text-muted-foreground">
            <p>Problem-to-solution search interface coming soon...</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForPatients;
