import { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Company, categoryLabels, categoryColors } from '@/types/company';
import { supabase } from '@/integrations/supabase/client';

interface MatchFactor {
  type: string;
  description: string;
}

interface MatchedCompany extends Company {
  relevanceScore: number;
  matchFactors: MatchFactor[];
}

export function ProblemSearch() {
  const [problemDescription, setProblemDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MatchedCompany[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!problemDescription.trim()) {
      setError('Please describe your health concern');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Call the edge function to match problems
      const { data, error: functionError } = await supabase.functions.invoke(
        'match-problem-to-companies',
        {
          body: { problemDescription }
        }
      );

      if (functionError) throw functionError;

      setResults(data.matches || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find matches';
      setError(message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Describe your health concern
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g., 'I'm struggling with pelvic pain during my postpartum recovery' or 'Help tracking my menstrual cycles and symptoms'"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-border bg-card shadow-md focus:border-primary focus:shadow-glow transition-all duration-300"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Be as specific as possible about your symptoms, concerns, or health goals
            </p>
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="w-full h-12 text-base font-medium bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding matches...
              </>
            ) : (
              'Find Solutions'
            )}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {hasSearched && !isLoading && (
        <div className="space-y-6">
          {results.length > 0 ? (
            <>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Found <span className="font-semibold text-foreground">{results.length}</span> relevant solutions
                </p>
              </div>

              <div className="max-w-4xl mx-auto grid gap-4">
                {results.map((company) => (
                  <Card key={company.id} className="p-6 hover:border-primary/50 transition-colors">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {company.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(company.categories || [company.category]).map((cat) => (
                            <Badge key={cat} className={categoryColors[cat]}>
                              {categoryLabels[cat]}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Match Factors - Why This Matches */}
                      {company.matchFactors && company.matchFactors.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                            Why this matches
                          </p>
                          <div className="space-y-2">
                            {company.matchFactors.map((factor, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <Badge 
                                  variant="outline" 
                                  className="shrink-0 text-[10px] capitalize border-accent/30 text-accent"
                                >
                                  {factor.type.replace(/_/g, ' ')}
                                </Badge>
                                <span className="text-sm text-foreground/80">{factor.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {company.mission && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                            Mission
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {company.mission}
                          </p>
                        </div>
                      )}

                      {company.solution && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                            How it helps
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {company.solution}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Match confidence</p>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
                                style={{ width: `${Math.round(company.relevanceScore * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-foreground">
                              {Math.round(company.relevanceScore * 100)}%
                            </span>
                          </div>
                        </div>
                        {company.website_url && (
                          <a
                            href={company.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-accent hover:underline"
                          >
                            Learn more →
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No companies matched your health concern. Try describing your symptoms or health goals differently.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
