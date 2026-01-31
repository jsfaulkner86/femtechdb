import { Button } from '@/components/ui/button';
import { FemtechCategory, categoryLabels } from '@/types/company';
import { 
  Baby, 
  Heart, 
  Brain, 
  Flower2, 
  Stethoscope, 
  ActivitySquare,
  Sparkles,
  Pill,
  Video,
  TestTube,
  Moon,
  MoreHorizontal,
  TrendingUp,
  Users,
  Cpu,
  HeartPulse,
  Bone,
  Ribbon,
  ShieldPlus,
  Droplets,
  CircleDot,
  Waves,
  Smartphone,
  Sprout,
  HeartHandshake,
  Dna,
  Target,
  Egg
} from 'lucide-react';

const categoryIcons: Record<FemtechCategory, React.ElementType> = {
  fertility: Flower2,
  pregnancy: Baby,
  postpartum: HeartHandshake,
  menstrual_health: Moon,
  menopause: Sparkles,
  sexual_health: Heart,
  mental_health: Brain,
  general_wellness: ActivitySquare,
  chronic_conditions: Pill,
  diagnostics: TestTube,
  telehealth: Video,
  precision_medicine_ai: Cpu,
  investors: TrendingUp,
  resources_community: Users,
  reproductive_health: Sprout,
  maternal_health: Dna,
  hormonal_health: Droplets,
  gynecological_health: ShieldPlus,
  endometriosis: Target,
  heart_disease: HeartPulse,
  pelvic_health: Waves,
  bone_health: Bone,
  cancer: Ribbon,
  mobile_apps: Smartphone,
  pcos: Egg,
  other: MoreHorizontal,
};

// Colorful icon colors for each category
const categoryIconColors: Record<FemtechCategory | 'all', string> = {
  all: 'text-teal',
  fertility: 'text-pink-500',
  pregnancy: 'text-coral',
  postpartum: 'text-rose-400',
  menstrual_health: 'text-purple-500',
  menopause: 'text-amber-500',
  sexual_health: 'text-red-400',
  mental_health: 'text-indigo-500',
  general_wellness: 'text-emerald-500',
  chronic_conditions: 'text-slate-500',
  diagnostics: 'text-cyan-500',
  telehealth: 'text-blue-500',
  precision_medicine_ai: 'text-fuchsia-500',
  investors: 'text-green-600',
  resources_community: 'text-violet-500',
  reproductive_health: 'text-pink-400',
  maternal_health: 'text-orange-400',
  hormonal_health: 'text-yellow-500',
  gynecological_health: 'text-teal-500',
  endometriosis: 'text-purple-400',
  heart_disease: 'text-red-500',
  pelvic_health: 'text-blue-400',
  bone_health: 'text-gray-500',
  cancer: 'text-pink-600',
  mobile_apps: 'text-sky-500',
  pcos: 'text-violet-500',
  other: 'text-gray-500',
};

interface CategoryFilterProps {
  selectedCategory: FemtechCategory | 'all';
  onCategoryChange: (category: FemtechCategory | 'all') => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories: (FemtechCategory | 'all')[] = [
    'all',
    'fertility',
    'reproductive_health',
    'pregnancy',
    'maternal_health',
    'postpartum',
    'menstrual_health',
    'menopause',
    'hormonal_health',
    'sexual_health',
    'mental_health',
    'gynecological_health',
    'endometriosis',
    'pelvic_health',
    'chronic_conditions',
    'heart_disease',
    'bone_health',
    'cancer',
    'general_wellness',
    'diagnostics',
    'telehealth',
    'precision_medicine_ai',
    'mobile_apps',
    'pcos',
    'investors',
    'resources_community',
  ];

  return (
    <div className="pt-0 pb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => {
            const Icon = category === 'all' ? Stethoscope : categoryIcons[category];
            const isSelected = selectedCategory === category;
            const iconColor = categoryIconColors[category];
            
            return (
              <Button
                key={category}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className={`
                  rounded-full px-4 transition-all duration-200
                  ${isSelected 
                    ? 'bg-lavender text-foreground shadow-md border-lavender hover:bg-lavender/90' 
                    : 'hover:bg-blush hover:border-lavender/50'
                  }
                `}
              >
                <Icon className={`mr-2 h-4 w-4 ${isSelected ? 'text-foreground' : iconColor}`} />
                {category === 'all' ? 'All Categories' : categoryLabels[category]}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
