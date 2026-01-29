import { CircleDot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateCompleteness, getCompletenessColor, getCompletenessLabel } from '@/lib/completeness';
import type { Company } from '@/types/company';

interface CompletenessIndicatorProps {
  company: Company;
  showLabel?: boolean;
}

export function CompletenessIndicator({ company, showLabel = false }: CompletenessIndicatorProps) {
  const { score, filledFields, totalFields, missingFields } = calculateCompleteness(company);
  const colorClass = getCompletenessColor(score);
  const label = getCompletenessLabel(score);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-1.5 cursor-help ${colorClass}`}>
          <div className="relative h-4 w-4">
            {/* Background circle */}
            <svg className="h-4 w-4 -rotate-90" viewBox="0 0 16 16">
              <circle
                cx="8"
                cy="8"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-20"
              />
              <circle
                cx="8"
                cy="8"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${(score / 100) * 37.7} 37.7`}
                strokeLinecap="round"
              />
            </svg>
          </div>
          {showLabel && (
            <span className="text-xs font-medium">{score}%</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <p className="font-medium">Profile Completeness</p>
            <span className={`text-sm font-bold ${colorClass}`}>{score}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {filledFields} of {totalFields} fields completed • {label}
          </p>
          {missingFields.length > 0 && missingFields.length <= 4 && (
            <p className="text-xs text-muted-foreground">
              Missing: {missingFields.join(', ')}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
