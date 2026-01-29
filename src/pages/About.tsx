import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Heart, Target, Users, Sparkles, Globe, TrendingUp, Lightbulb } from 'lucide-react';
import { SubmitCompanyForm } from '@/components/SubmitCompanyForm';

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-coral/10 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block mb-4 px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-full animate-fade-in">
              About FemTechDB
            </span>
            
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Empowering{' '}
              <span className="text-gradient">Women's Health</span>
              {' '}Innovation
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
              FemTechDB is the most comprehensive directory of companies dedicated to transforming women's health through technology and innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-coral/10 text-coral">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Our Mission</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Connecting the FemTech Ecosystem
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We believe that women's health has been underserved for far too long. FemTechDB exists to shine a light on the incredible companies working to change this reality.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our mission is to create the most comprehensive, accessible, and up-to-date resource for discovering femtech solutions—whether you're a patient seeking care, an investor looking for opportunities, or a founder building in this space.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                <Globe className="h-10 w-10 text-teal mb-4" />
                <h3 className="font-semibold text-lg mb-2">Global Coverage</h3>
                <p className="text-sm text-muted-foreground">Companies from 40+ countries worldwide</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                <TrendingUp className="h-10 w-10 text-emerald-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Daily Updates</h3>
                <p className="text-sm text-muted-foreground">AI-powered research adds new companies daily</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                <Sparkles className="h-10 w-10 text-amber-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">24 Categories</h3>
                <p className="text-sm text-muted-foreground">Covering every aspect of women's health</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                <Users className="h-10 w-10 text-violet-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Community Driven</h3>
                <p className="text-sm text-muted-foreground">Built with input from the femtech community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is FemTech Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-lavender/20 text-foreground">
              <Lightbulb className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-medium">Understanding FemTech</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              What is FemTech?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              FemTech (female technology) refers to software, diagnostics, products, and services that use technology to address women's health needs. The term was coined in 2016 by Ida Tin, founder of the period-tracking app Clue.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-card border border-border">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-coral/10 mb-6">
                <Heart className="h-8 w-8 text-coral" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Reproductive Health</h3>
              <p className="text-muted-foreground">
                Fertility tracking, pregnancy care, contraception, and menstrual health solutions
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-card border border-border">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-sage/20 mb-6">
                <Sparkles className="h-8 w-8 text-sage" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Life Stages</h3>
              <p className="text-muted-foreground">
                Menopause management, postpartum support, and healthy aging technologies
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-card border border-border">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-teal/20 mb-6">
                <TrendingUp className="h-8 w-8 text-teal" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Wellness & Diagnostics</h3>
              <p className="text-muted-foreground">
                Mental health, chronic conditions, telehealth, and diagnostic innovations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Why FemTech Matters
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-coral/10 flex items-center justify-center">
                    <span className="font-bold text-coral">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Closing the Gender Health Gap</h3>
                    <p className="text-muted-foreground">Women have historically been underrepresented in medical research, leading to gaps in understanding and treating women's health conditions.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-coral/10 flex items-center justify-center">
                    <span className="font-bold text-coral">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">$1 Trillion Market Opportunity</h3>
                    <p className="text-muted-foreground">The global femtech market is projected to reach $1 trillion by 2027, representing massive potential for innovation and investment.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-coral/10 flex items-center justify-center">
                    <span className="font-bold text-coral">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Empowering Women</h3>
                    <p className="text-muted-foreground">FemTech solutions give women more control over their health decisions with data-driven insights and personalized care options.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-coral/10 flex items-center justify-center">
                    <span className="font-bold text-coral">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Breaking Taboos</h3>
                    <p className="text-muted-foreground">FemTech is helping normalize conversations around topics like menstruation, menopause, and sexual health that were once considered taboo.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Have a Company to Add?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Know a femtech company that should be in our directory? We'd love to hear about it. Our AI-powered system reviews and adds new companies daily.
            </p>
            <SubmitCompanyForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
