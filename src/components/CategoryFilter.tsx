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
  Users
} from 'lucide-react';

const categoryIcons: Record<FemtechCategory, React.ElementType> = {
  fertility: Flower2,
  pregnancy: Baby,
  postpartum: Heart,
  menstrual_health: Moon,
  menopause: Sparkles,
  sexual_health: Heart,
  mental_health: Brain,
  general_wellness: ActivitySquare,
  chronic_conditions: Pill,
  diagnostics: TestTube,
  telehealth: Video,
  investors: TrendingUp,
  resources_community: Users,
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
  investors: 'text-green-600',
  resources_community: 'text-violet-500',
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
    'pregnancy',
    'postpartum',
    'menstrual_health',
    'menopause',
    'sexual_health',
    'mental_health',
    'general_wellness',
    'chronic_conditions',
    'diagnostics',
    'telehealth',
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
