import { Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SHARE_URL = 'https://femtechdb.lovable.app';
const SHARE_TEXT = 'Discover FemtechDB — the most comprehensive directory of femtech companies transforming women\'s health 🌸';

export function SocialShareButtons() {
  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleLinkedInShare}
        className="gap-2 text-muted-foreground hover:text-[#0A66C2] hover:border-[#0A66C2]/30"
      >
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleTwitterShare}
        className="gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/30"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>
    </div>
  );
}
