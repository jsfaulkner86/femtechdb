import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, ExternalLink, X } from 'lucide-react';
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
import { useUpdateCompany } from '@/hooks/useFounderClaims';
import { toast } from 'sonner';
import type { Company, FemtechCategory } from '@/types/company';
import { categoryLabels, categoryColors } from '@/types/company';
import { Constants } from '@/integrations/supabase/types';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  website_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  logo_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  headquarters: z.string().max(100).optional().or(z.literal('')),
  founded_year: z.coerce.number().min(1900).max(new Date().getFullYear()).optional().or(z.literal('')),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  mission: z.string().max(500, 'Mission must be under 500 characters').optional().or(z.literal('')),
  problem: z.string().max(1000, 'Problem description must be under 1000 characters').optional().or(z.literal('')),
  solution: z.string().max(1000, 'Solution description must be under 1000 characters').optional().or(z.literal('')),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface EditCompanyFormProps {
  company: Company;
}

export function EditCompanyForm({ company }: EditCompanyFormProps) {
  const updateCompany = useUpdateCompany();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company.name,
      website_url: company.website_url || '',
      logo_url: company.logo_url || '',
      headquarters: company.headquarters || '',
      founded_year: company.founded_year || '',
      categories: company.categories || [company.category],
      mission: company.mission || '',
      problem: company.problem || '',
      solution: company.solution || '',
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
    if (current.length > 1) {
      form.setValue('categories', current.filter(c => c !== category), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      const primaryCategory = data.categories[0] as FemtechCategory;
      await updateCompany.mutateAsync({
        companyId: company.id,
        updates: {
          name: data.name,
          website_url: data.website_url || null,
          logo_url: data.logo_url || null,
          headquarters: data.headquarters || null,
          founded_year: data.founded_year ? Number(data.founded_year) : null,
          category: primaryCategory, // Keep legacy field updated
          mission: data.mission || null,
          problem: data.problem || null,
          solution: data.solution || null,
        },
        categories: data.categories as FemtechCategory[],
      });
      toast.success('Company profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update company');
    }
  };

  const availableCategories = Constants.public.Enums.femtech_category.filter(
    cat => !selectedCategories.includes(cat as FemtechCategory)
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
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
                  <Input placeholder="https://example.com/logo.png" {...field} />
                </FormControl>
                <FormDescription>Direct link to your company logo</FormDescription>
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

          <FormField
            control={form.control}
            name="categories"
            render={() => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Categories</FormLabel>
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
                <FormDescription>
                  Click on a category to remove it. Companies can belong to multiple categories.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  rows={3}
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
                  rows={3}
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
                  rows={3}
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

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={updateCompany.isPending}>
            {updateCompany.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
          
          {company.website_url && (
            <Button variant="outline" asChild>
              <a 
                href={company.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Website
              </a>
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
