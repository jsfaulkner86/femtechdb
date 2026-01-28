import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Search, 
  Bot, 
  CheckCircle, 
  Tag, 
  RefreshCw, 
  BadgeCheck,
  Database,
  Users,
  FileSearch,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Methodology() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sage/10 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block mb-4 px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-full animate-fade-in">
              Transparency & Trust
            </span>
            
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Our{' '}
              <span className="text-gradient">Methodology</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Learn how we discover, verify, and categorize femtech companies to ensure FemTechDB remains a trusted, comprehensive resource.
            </p>
          </div>
        </div>
      </section>

      {/* Discovery Process */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-teal/10">
                <Search className="h-6 w-6 text-teal" />
              </div>
              <h2 className="font-display text-3xl font-bold">How We Discover Companies</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <Bot className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">AI-Powered Research</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our automated discovery engine runs daily, using AI to scan industry publications, news sources, startup databases, and accelerator programs for new femtech companies.
                </p>
              </div>
              
              <div className="p-6 rounded-2xl bg-card border border-border">
                <Users className="h-8 w-8 text-coral mb-4" />
                <h3 className="font-semibold text-lg mb-2">Community Submissions</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Users can suggest companies through our submission form. Every suggestion is reviewed before being added to maintain data quality.
                </p>
              </div>
              
              <div className="p-6 rounded-2xl bg-card border border-border">
                <FileSearch className="h-8 w-8 text-sage mb-4" />
                <h3 className="font-semibold text-lg mb-2">Industry Sources</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We monitor Femtech Insider, Rock Health reports, accelerator cohorts (Y Combinator, Techstars), and LinkedIn for emerging companies.
                </p>
              </div>
              
              <div className="p-6 rounded-2xl bg-card border border-border">
                <RefreshCw className="h-8 w-8 text-violet-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Regular Updates</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our database is updated daily at 7 AM EST. We continuously refine our search patterns to capture companies with unique or non-obvious names.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-sage/20">
                <BadgeCheck className="h-6 w-6 text-sage" />
              </div>
              <h2 className="font-display text-3xl font-bold">Verification Standards</h2>
            </div>
            
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-muted-foreground leading-relaxed">
                Companies with the <span className="inline-flex items-center gap-1 text-sage font-medium"><BadgeCheck className="h-4 w-4" /> verified badge</span> have undergone additional review to confirm:
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <CheckCircle className="h-5 w-5 text-sage mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Active Operations</h4>
                  <p className="text-sm text-muted-foreground">The company has an active website, recent news coverage, or verifiable business activity within the past 12 months.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <CheckCircle className="h-5 w-5 text-sage mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Accurate Information</h4>
                  <p className="text-sm text-muted-foreground">Mission statement, problem/solution descriptions, and company details have been cross-referenced with official sources.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <CheckCircle className="h-5 w-5 text-sage mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Femtech Focus</h4>
                  <p className="text-sm text-muted-foreground">The company's primary product or service directly addresses women's health needs, not just incidentally.</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Unverified companies are not less legitimate—they simply haven't undergone our manual review process yet. We prioritize verification based on user interest and company prominence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorization */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-coral/10">
                <Tag className="h-6 w-6 text-coral" />
              </div>
              <h2 className="font-display text-3xl font-bold">Category Definitions</h2>
            </div>
            
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Companies are categorized based on their primary area of focus. Our 14 categories cover the full spectrum of women's health:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: 'Fertility', desc: 'Conception, IVF support, egg freezing, fertility tracking' },
                { name: 'Pregnancy', desc: 'Prenatal care, pregnancy monitoring, birth preparation' },
                { name: 'Postpartum', desc: 'Recovery, breastfeeding support, pelvic floor health' },
                { name: 'Menstrual Health', desc: 'Period tracking, menstrual products, cycle education' },
                { name: 'Menopause', desc: 'Symptom management, hormone therapy, menopause support' },
                { name: 'Sexual Health', desc: 'Intimacy, sexual wellness, contraception' },
                { name: 'Mental Health', desc: 'Maternal mental health, therapy, stress management' },
                { name: 'General Wellness', desc: 'Holistic health, nutrition, fitness for women' },
                { name: 'Chronic Conditions', desc: 'Endometriosis, PCOS, autoimmune conditions' },
                { name: 'Diagnostics', desc: 'At-home testing, screening, biomarker analysis' },
                { name: 'Telehealth', desc: 'Virtual care, remote consultations, digital clinics' },
                { name: 'Precision Medicine & AI', desc: 'Personalized treatments, AI diagnostics, genomics' },
                { name: 'Investors & Funds', desc: 'VCs and funds focused on femtech investments' },
                { name: 'Resources & Community', desc: 'Educational platforms, advocacy, support networks' },
              ].map((cat) => (
                <div key={cat.name} className="p-4 rounded-xl bg-card border border-border">
                  <h4 className="font-semibold text-sm">{cat.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Integrity */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-violet-500/10">
                <Shield className="h-6 w-6 text-violet-500" />
              </div>
              <h2 className="font-display text-3xl font-bold">Data Integrity</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">What We Include</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sage mt-1 flex-shrink-0" />
                    <span>Companies with products/services focused on women's health</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sage mt-1 flex-shrink-0" />
                    <span>Startups, established companies, and research initiatives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sage mt-1 flex-shrink-0" />
                    <span>Investment funds dedicated to femtech</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-sage mt-1 flex-shrink-0" />
                    <span>Community resources and educational platforms</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">What We Exclude</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 text-destructive/60 mt-1 flex-shrink-0">✕</span>
                    <span>Companies that have ceased operations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 text-destructive/60 mt-1 flex-shrink-0">✕</span>
                    <span>General health companies without specific women's focus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 text-destructive/60 mt-1 flex-shrink-0">✕</span>
                    <span>Products without technology component</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 text-destructive/60 mt-1 flex-shrink-0">✕</span>
                    <span>Unverifiable or anonymous submissions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Database className="h-12 w-12 text-primary-foreground mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Explore the Database
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Now that you understand how we build and maintain FemTechDB, start exploring the companies transforming women's health.
            </p>
            <Button size="lg" variant="secondary" className="rounded-full px-8" asChild>
              <Link to="/">Browse Companies</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
