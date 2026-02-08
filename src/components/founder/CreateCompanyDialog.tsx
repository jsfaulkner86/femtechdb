import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCompany } from '@/hooks/useFounderClaims';
import { toast } from 'sonner';
import type { FemtechCategory } from '@/types/company';
import { categoryLabels, categoryColors } from '@/types/company';
import { Constants } from '@/integrations/supabase/types';

const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  website_url: z.string().url('Please enter a valid URL'),
  logo_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  headquarters: z.string().max(100).optional().or(z.literal('')),
  founded_year: z.coerce.number().min(1900).max(new Date().getFullYear()).optional().or(z.literal('')),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  mission: z.string().max(500, 'Mission must be under 500 characters').optional().or(z.literal('')),
  problem: z.string().max(1000, 'Problem description must be under 1000 characters').optional().or(z.literal('')),
  solution: z.string().max(1000, 'Solution description must be under 1000 characters').optional().or(z.literal('')),
});

type CreateCompanyFormData = z.infer<typeof createCompanySchema>;

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompanyDialog({ open, onOpenChange }: CreateCompanyDialogProps) {
  const createCompany = useCreateCompany();

  const form = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      website_url: '',
      logo_url: '',
      headquarters: '',
      founded_year: '',
      categories: [],
      mission: '',
      problem: '',
      solution: '',
    },
  });

  const selectedCategories = form.watch('categories') as FemtechCategory[];

  const addCategory = (category: string) => {
    const current = form.getValues('categories');
    if (!current.includes(category)) {
      form.setValue('categories', [...current, category], { shouldValidate: true });
    }
  };

  const removeCategory = (category: string) => {
    const current = form.getValues('categories');
    form.setValue('categories', current.filter(c => c !== category), { shouldValidate: true });
  };

  const onSubmit = async (data: CreateCompanyFormData) => {
    try {
      await createCompany.mutateAsync({
        name: data.name,
        website_url: data.website_url,
        logo_url: data.logo_url || null,
        headquarters: data.headquarters || null,
        founded_year: data.founded_year ? Number(data.founded_year) : null,
        categories: data.categories as FemtechCategory[],
        mission: data.mission || null,
        problem: data.problem || null,
        solution: data.solution || null,
      });
      toast.success('Company profile created successfully! You can now edit it anytime.');
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create company');
    }
  };

  const availableCategories = Constants.public.Enums.femtech_category.filter(
    cat => !selectedCategories.includes(cat as FemtechCategory)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Your Company Profile</DialogTitle>
          <DialogDescription>
            Add your company to the FemtechDB directory. Your profile will be immediately available for editing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourcompany.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headquarters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headquarters</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="founded_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founded Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <FormLabel>Categories *</FormLabel>
                  <div className="space-y-3">
                    {/* Selected categories */}
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                      {selectedCategories.map((cat) => (
                        <Badge 
                          key={cat} 
                          className={`${categoryColors[cat]} cursor-pointer flex items-center gap-1`}
                          onClick={() => removeCategory(cat)}
                        >
                          {categoryLabels[cat]}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                      {selectedCategories.length === 0 && (
                        <span className="text-sm text-muted-foreground">Select at least one category</span>
                      )}
                    </div>
                    
                    {/* Add category dropdown */}
                    {availableCategories.length > 0 && (
                      <Select onValueChange={addCategory} value="">
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Add a category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {categoryLabels[cat as FemtechCategory]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission Statement</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is your company's mission?"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="problem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What problem does your company solve?"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/1000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="solution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solution</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How does your company solve this problem?"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/1000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCompany.isPending}>
                {createCompany.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Company
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
