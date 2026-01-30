import { useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Building2, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompanies } from '@/hooks/useCompanies';
import { useSubmitClaim } from '@/hooks/useFounderClaims';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Company } from '@/types/company';

const claimSchema = z.object({
  companyId: z.string().min(1, 'Please select a company'),
  email: z.string().email('Please enter a valid email address'),
});

type ClaimFormData = z.infer<typeof claimSchema>;

interface ClaimCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClaimCompanyDialog({ open, onOpenChange }: ClaimCompanyDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { user } = useAuth();
  const { data: companies = [] } = useCompanies({ search });
  const submitClaim = useSubmitClaim();

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      companyId: '',
      email: user?.email || '',
    },
  });

  // Filter out already claimed companies
  const availableCompanies = useMemo(() => 
    companies.filter(c => !c.claimed_by),
    [companies]
  );

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    form.setValue('companyId', company.id);
  };

  const getExpectedDomain = (company: Company) => {
    if (!company.website_url) return null;
    try {
      const url = new URL(company.website_url);
      return url.hostname.replace('www.', '');
    } catch {
      return null;
    }
  };

  const onSubmit = async (data: ClaimFormData) => {
    try {
      const result = await submitClaim.mutateAsync({
        companyId: data.companyId,
        userEmail: data.email,
      });

      if (result.status === 'approved') {
        toast.success('Your company has been claimed! You can now edit your profile.');
      } else {
        toast.info('Claim submitted. An admin will review your request.');
      }
      
      onOpenChange(false);
      setSelectedCompany(null);
      setSearch('');
      form.reset();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('You have already submitted a claim for this company');
      } else {
        toast.error(error.message || 'Failed to submit claim');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Claim Your Company</DialogTitle>
          <DialogDescription>
            Find your company and verify ownership using your company email domain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Company Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search for your company</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Type company name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Company List */}
          {search.length >= 2 && (
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-2 space-y-1">
                {availableCompanies.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No unclaimed companies found
                  </p>
                ) : (
                  availableCompanies.slice(0, 10).map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => handleSelectCompany(company)}
                      className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors ${
                        selectedCompany?.id === company.id
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt=""
                          className="h-8 w-8 rounded-md object-contain bg-background"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{company.name}</p>
                        {company.headquarters && (
                          <p className="text-xs text-muted-foreground truncate">
                            {company.headquarters}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          )}

          {/* Selected Company & Claim Form */}
          {selectedCompany && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-3">
                    {selectedCompany.logo_url ? (
                      <img
                        src={selectedCompany.logo_url}
                        alt=""
                        className="h-10 w-10 rounded-md object-contain bg-background"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{selectedCompany.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCompany.website_url || 'No website'}
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your company email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@company.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {getExpectedDomain(selectedCompany) ? (
                          <>
                            Use your <span className="font-medium">@{getExpectedDomain(selectedCompany)}</span> email for instant verification
                          </>
                        ) : (
                          'Claims will be reviewed by an admin'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Domain match = instant approval</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>Other emails = admin review (24-48h)</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitClaim.isPending}
                >
                  {submitClaim.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Claim
                </Button>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
