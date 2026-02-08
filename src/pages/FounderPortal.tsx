import { useState } from 'react';
import { Building2, CheckCircle2, Clock, XCircle, LogOut, Plus, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { ClaimCompanyDialog } from '@/components/founder/ClaimCompanyDialog';
import { CreateCompanyDialog } from '@/components/founder/CreateCompanyDialog';
import { EditCompanyForm } from '@/components/founder/EditCompanyForm';
import { useAuth } from '@/hooks/useAuth';
import { useFounderClaims, useClaimedCompany } from '@/hooks/useFounderClaims';

const statusConfig = {
  pending: { icon: Clock, label: 'Pending Review', variant: 'secondary' as const },
  approved: { icon: CheckCircle2, label: 'Approved', variant: 'default' as const },
  rejected: { icon: XCircle, label: 'Rejected', variant: 'destructive' as const },
};

export default function FounderPortal() {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();
  
  const { data: claims = [], isLoading: claimsLoading } = useFounderClaims(user?.id);
  const { data: claimedCompany, isLoading: companyLoading } = useClaimedCompany(user?.id);

  const handleSignOut = async () => {
    await signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <Skeleton className="h-8 w-48" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero mb-4">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Founder Portal
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
              Claim and manage your company profile on FemtechDB
            </p>
            
            {/* How it works section */}
            {!user && (
              <div className="mt-8 rounded-xl border bg-card p-6 text-left max-w-lg mx-auto">
                <h2 className="text-sm font-semibold text-foreground mb-3">How verification works</h2>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">1</span>
                    <span><strong className="text-foreground">Create an account</strong> using your company email (e.g., you@yourcompany.com)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">2</span>
                    <span><strong className="text-foreground">Search for your company</strong> in our database and submit a claim</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">3</span>
                    <span><strong className="text-foreground">Get instant access</strong> if your email domain matches your company website</span>
                  </li>
                </ol>
              </div>
            )}
          </div>

          {!user ? (
            /* Not Logged In */
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Sign in to get started</CardTitle>
                <CardDescription>
                  Create an account or sign in to claim your company and manage its profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowAuthDialog(true)} size="lg" className="bg-primary hover:bg-primary/90">
                  Sign in or Create Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Logged In */
            <div className="space-y-6">
              {/* User Info Bar */}
              <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>

              {companyLoading || claimsLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ) : claimedCompany ? (
                /* Has Claimed Company - Show Edit Form */
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {claimedCompany.logo_url ? (
                        <img
                          src={claimedCompany.logo_url}
                          alt=""
                          className="h-12 w-12 rounded-lg object-contain bg-muted"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle>{claimedCompany.name}</CardTitle>
                        <CardDescription>
                          Edit your company profile below
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="ml-auto">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <EditCompanyForm company={claimedCompany} />
                  </CardContent>
                </Card>
              ) : (
              /* No Claimed Company */
                <div className="space-y-6">
                  {/* Create or Claim Options */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="text-center">
                      <CardHeader>
                        <CardTitle className="text-lg">Create New Profile</CardTitle>
                        <CardDescription>
                          Add your company to the FemtechDB directory
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => setShowCreateDialog(true)} className="w-full bg-primary hover:bg-primary/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Company
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="text-center">
                      <CardHeader>
                        <CardTitle className="text-lg">Claim Existing</CardTitle>
                        <CardDescription>
                          Find and claim your company if it's already listed
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => setShowClaimDialog(true)} variant="outline" className="w-full">
                          <Search className="mr-2 h-4 w-4" />
                          Search & Claim
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pending Claims */}
                  {claims.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Claims</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {claims.map((claim) => {
                            const config = statusConfig[claim.status as keyof typeof statusConfig];
                            const StatusIcon = config.icon;
                            return (
                              <div
                                key={claim.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div>
                                  <p className="text-sm font-medium">
                                    Claim submitted on{' '}
                                    {new Date(claim.created_at).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Email: {claim.user_email}
                                  </p>
                                </div>
                                <Badge variant={config.variant}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {config.label}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      <ClaimCompanyDialog open={showClaimDialog} onOpenChange={setShowClaimDialog} />
      <CreateCompanyDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
}
