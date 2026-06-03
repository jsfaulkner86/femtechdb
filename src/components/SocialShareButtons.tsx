import { Linkedin, ExternalLink } from 'lucide-react';
import backtableIcon from '@/assets/backtable-icon.png.asset.json';

export function SocialShareButtons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
      <a
        href="https://www.linkedin.com/in/johnathonfaulkner/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Linkedin className="h-3.5 w-3.5" />
        Johnathon Faulkner
      </a>
      <span className="text-border">•</span>
      <a
        href="https://www.linkedin.com/in/nicole-faulkner-d-o-1136a4370/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Linkedin className="h-3.5 w-3.5" />
        Nicole Faulkner
      </a>
      <span className="text-border">•</span>
      <a
        href="https://www.backtable.com/shows/obgyn"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <img src={backtableIcon.url} alt="" className="h-3.5 w-3.5 rounded-sm" />
        BackTable OBGYN
      </a>
      <span className="text-border">•</span>
      <a
        href="https://thefaulknergroupadvisors.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        The Faulkner Group
      </a>
    </div>
  );
}
