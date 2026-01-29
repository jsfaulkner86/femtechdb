import type { Company } from '@/types/company';

interface CompletenessResult {
  score: number; // 0-100
  filledFields: number;
  totalFields: number;
  missingFields: string[];
}

const TRACKED_FIELDS: { key: keyof Company; label: string; weight: number }[] = [
  { key: 'name', label: 'Name', weight: 1 },
  { key: 'mission', label: 'Mission', weight: 1 },
  { key: 'problem', label: 'Problem', weight: 1 },
  { key: 'solution', label: 'Solution', weight: 1 },
  { key: 'category', label: 'Category', weight: 1 },
  { key: 'website_url', label: 'Website', weight: 1 },
  { key: 'headquarters', label: 'Headquarters', weight: 0.5 },
  { key: 'country', label: 'Country', weight: 0.5 },
  { key: 'founded_year', label: 'Founded Year', weight: 0.5 },
  { key: 'logo_url', label: 'Logo', weight: 0.5 },
  { key: 'source_url', label: 'Source', weight: 0.5 },
];

export function calculateCompleteness(company: Company): CompletenessResult {
  const missingFields: string[] = [];
  let filledWeight = 0;
  let totalWeight = 0;
  let filledCount = 0;

  for (const field of TRACKED_FIELDS) {
    totalWeight += field.weight;
    const value = company[field.key];
    
    // Check if field has a meaningful value
    const isFilled = value !== null && value !== undefined && value !== '';
    
    if (isFilled) {
      filledWeight += field.weight;
      filledCount++;
    } else {
      missingFields.push(field.label);
    }
  }

  const score = Math.round((filledWeight / totalWeight) * 100);

  return {
    score,
    filledFields: filledCount,
    totalFields: TRACKED_FIELDS.length,
    missingFields,
  };
}

export function getCompletenessColor(score: number): string {
  if (score >= 90) return 'text-sage';
  if (score >= 70) return 'text-primary';
  if (score >= 50) return 'text-amber-500';
  return 'text-muted-foreground';
}

export function getCompletenessLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Partial';
  return 'Basic';
}
