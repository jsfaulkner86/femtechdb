import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}
export function HeroSection({
  searchQuery,
  onSearchChange
}: HeroSectionProps) {
  return <section className="relative overflow-hidden bg-gradient-subtle py-20 md:py-28">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-coral/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-float" style={{
        animationDelay: '2s'
      }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-lavender/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-full animate-fade-in">
            Discover Women's Health Innovation
          </span>
          
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-fade-in" style={{
          animationDelay: '0.1s'
        }}>
            The Global{' '}
            <span className="text-gradient">Femtech</span>
            {' '}Directory
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-fade-in" style={{
          animationDelay: '0.2s'
        }}>
            Explore innovative companies transforming women's health.
            <br />
            Find solutions for fertility, pregnancy, menopause, and beyond.
          </p>

          {/* Search Bar */}
          <div className="mt-10 animate-fade-in" style={{
          animationDelay: '0.3s'
        }}>
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input type="search" placeholder="Search companies, solutions, health areas..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} className="h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-border bg-card shadow-md focus:border-primary focus:shadow-glow transition-all duration-300" />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm animate-fade-in" style={{
          animationDelay: '0.4s'
        }}>
            <div className="text-center">
              <span className="block text-2xl font-bold text-foreground">650+</span>
              <span className="text-muted-foreground">Companies</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-foreground">23</span>
              <span className="text-muted-foreground">Categories</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-foreground">Daily</span>
              <span className="text-muted-foreground">Updates</span>
            </div>
          </div>
        </div>
      </div>
    </section>;
}