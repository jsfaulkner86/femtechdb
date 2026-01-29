import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
              </div>
              
              <p className="text-sm text-muted-foreground mb-8">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using FemtechDB, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    FemtechDB is a free, publicly accessible directory of companies operating in the women's health technology sector. Our service provides informational resources for patients, researchers, investors, and industry professionals.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Accuracy of Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    While we strive to maintain accurate and up-to-date information, FemtechDB makes no warranties about the completeness, reliability, or accuracy of the information provided. Company listings are for informational purposes only and should not be considered endorsements.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Use of the Service</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree to use FemtechDB only for lawful purposes. You may not:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                    <li>Scrape or bulk download data without permission</li>
                    <li>Use automated systems to access the service in ways that send more requests than a human could reasonably produce</li>
                    <li>Misrepresent your affiliation with any company listed</li>
                    <li>Submit false or misleading company information</li>
                    <li>Attempt to interfere with the proper functioning of the service</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Company Submissions</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By submitting a company for inclusion in our database, you represent that the information provided is accurate to the best of your knowledge. We reserve the right to accept, reject, or remove any submission at our discretion.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Company names, logos, and trademarks displayed on FemtechDB belong to their respective owners. The FemtechDB platform, design, and curated database structure are our intellectual property.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    FemtechDB is provided "as is" without warranties of any kind. We are not responsible for any decisions made based on information in our directory. Users should conduct their own due diligence before engaging with any listed company.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Medical Disclaimer</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    FemtechDB is an informational directory and does not provide medical advice. Information about health-related products and services is for general awareness only. Always consult qualified healthcare professionals for medical decisions.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Modifications</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions about these terms, please contact us through our website.
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
