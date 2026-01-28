export type FemtechCategory = 
  | 'fertility'
  | 'pregnancy'
  | 'postpartum'
  | 'menstrual_health'
  | 'menopause'
  | 'sexual_health'
  | 'mental_health'
  | 'general_wellness'
  | 'chronic_conditions'
  | 'diagnostics'
  | 'telehealth'
  | 'precision_medicine_ai'
  | 'investors'
  | 'resources_community'
  | 'other';

export interface Company {
  id: string;
  name: string;
  mission: string | null;
  problem: string | null;
  solution: string | null;
  category: FemtechCategory;
  website_url: string | null;
  logo_url: string | null;
  founded_year: number | null;
  headquarters: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const categoryLabels: Record<FemtechCategory, string> = {
  fertility: 'Fertility',
  pregnancy: 'Pregnancy',
  postpartum: 'Postpartum',
  menstrual_health: 'Menstrual Health',
  menopause: 'Menopause',
  sexual_health: 'Sexual Health',
  mental_health: 'Mental Health',
  general_wellness: 'General Wellness',
  chronic_conditions: 'Chronic Conditions',
  diagnostics: 'Diagnostics',
  telehealth: 'Telehealth',
  precision_medicine_ai: 'Precision Medicine & AI',
  investors: 'Investors & Funds',
  resources_community: 'Resources & Community',
  other: 'Other',
};

export const categoryColors: Record<FemtechCategory, string> = {
  fertility: 'bg-coral text-primary-foreground',
  pregnancy: 'bg-salmon text-primary-foreground',
  postpartum: 'bg-lavender text-foreground',
  menstrual_health: 'bg-accent text-accent-foreground',
  menopause: 'bg-sage text-primary-foreground',
  sexual_health: 'bg-teal text-primary-foreground',
  mental_health: 'bg-lavender text-foreground',
  general_wellness: 'bg-blush text-foreground',
  chronic_conditions: 'bg-muted text-foreground',
  diagnostics: 'bg-secondary text-secondary-foreground',
  telehealth: 'bg-teal text-primary-foreground',
  precision_medicine_ai: 'bg-primary text-primary-foreground',
  investors: 'bg-primary text-primary-foreground',
  resources_community: 'bg-accent text-accent-foreground',
  other: 'bg-muted text-muted-foreground',
};
