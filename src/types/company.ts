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
  | 'reproductive_health'
  | 'maternal_health'
  | 'hormonal_health'
  | 'gynecological_health'
  | 'endometriosis'
  | 'heart_disease'
  | 'pelvic_health'
  | 'bone_health'
  | 'cancer'
  | 'mobile_apps'
  | 'other';

export type Continent = 
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Oceania';

export const continents: Continent[] = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
];

export const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
] as const;

export type USState = typeof usStates[number];

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
  continent: string | null;
  country: string | null;
  state: string | null;
  is_verified: boolean;
  source_url: string | null;
  claimed_by: string | null;
  created_at: string;
  updated_at: string;
}

export const categoryLabels: Record<FemtechCategory, string> = {
  fertility: 'Fertility',
  pregnancy: 'Pregnancy',
  postpartum: 'Postpartum',
  menstrual_health: 'Menstrual Health',
  menopause: 'Menopause',
  sexual_health: 'Sexual Wellness',
  mental_health: 'Mental Health',
  general_wellness: 'General Wellness',
  chronic_conditions: 'Chronic Conditions',
  diagnostics: 'Diagnostics',
  telehealth: 'Telehealth',
  precision_medicine_ai: 'Precision Medicine & AI',
  investors: 'Investors & Funds',
  resources_community: 'Resources & Community',
  reproductive_health: 'Reproductive Health',
  maternal_health: 'Maternal Health',
  hormonal_health: 'Hormonal Health',
  gynecological_health: 'Gynecological Health',
  endometriosis: 'Endometriosis',
  heart_disease: 'Heart Disease',
  pelvic_health: 'Pelvic Health',
  bone_health: 'Bone Health',
  cancer: 'Cancer',
  mobile_apps: 'Mobile Apps',
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
  reproductive_health: 'bg-coral text-primary-foreground',
  maternal_health: 'bg-salmon text-primary-foreground',
  hormonal_health: 'bg-sage text-primary-foreground',
  gynecological_health: 'bg-accent text-accent-foreground',
  endometriosis: 'bg-lavender text-foreground',
  heart_disease: 'bg-coral text-primary-foreground',
  pelvic_health: 'bg-teal text-primary-foreground',
  bone_health: 'bg-muted text-foreground',
  cancer: 'bg-secondary text-secondary-foreground',
  mobile_apps: 'bg-primary text-primary-foreground',
  other: 'bg-muted text-muted-foreground',
};
