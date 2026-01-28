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
  MoreHorizontal
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
  other: MoreHorizontal,
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
  ];

  return (
    <div className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => {
            const Icon = category === 'all' ? Stethoscope : categoryIcons[category];
            const isSelected = selectedCategory === category;
            
            return (
              <Button
                key={category}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className={`
                  rounded-full px-4 transition-all duration-200
                  ${isSelected 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-primary/10 hover:border-primary'
                  }
                `}
              >
                <Icon className="mr-2 h-4 w-4" />
                {category === 'all' ? 'All Categories' : categoryLabels[category]}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
