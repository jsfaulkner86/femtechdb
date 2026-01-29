import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
              </div>
              
              <p className="text-sm text-muted-foreground mb-8">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    FemtechDB collects minimal information to provide our services. When you browse our directory, we may collect:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                    <li>Anonymous usage data (pages visited, time spent, general location)</li>
                    <li>Device and browser information for optimization purposes</li>
                    <li>Email address if you voluntarily submit a company suggestion</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. How We Use Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use collected information to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                    <li>Improve our directory and user experience</li>
                    <li>Respond to company submission requests</li>
                    <li>Generate aggregate statistics about femtech industry trends</li>
                    <li>Ensure security and prevent abuse</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Data Sources</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Company information in our database is gathered from publicly available sources including official company websites, press releases, Crunchbase, LinkedIn, and verified industry publications. We do not collect private or confidential business information.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may use third-party analytics services to understand usage patterns. These services have their own privacy policies. We do not sell personal information to third parties.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures to protect the information we collect. Our database is hosted on secure infrastructure with encryption in transit and at rest.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You have the right to request access to, correction of, or deletion of any personal information we hold about you. If you are a company representative and wish to update or remove your company's listing, please contact us.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For privacy-related inquiries, please reach out through our website contact form or submit a request via our company submission process.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
