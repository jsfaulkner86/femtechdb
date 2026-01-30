import { Linkedin, Twitter, Facebook, Mail, Link2, MessageCircle, Instagram, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

const SHARE_URL = 'https://femtechdb.lovable.app';
const SHARE_TEXT = 'Discover FemtechDB — the most comprehensive directory of femtech companies transforming women\'s health 🌸';
const SHARE_HASHTAGS = '#femtech #womenshealth #healthtech';

export function SocialShareButtons() {
  const [copied, setCopied] = useState(false);

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailShare = () => {
    const subject = 'Check out FemtechDB - Global Femtech Directory';
    const body = `${SHARE_TEXT}\n\n${SHARE_URL}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleInstagramCopy = async () => {
    try {
      const instagramText = `${SHARE_TEXT}\n\n${SHARE_HASHTAGS}\n\n${SHARE_URL}`;
      await navigator.clipboard.writeText(instagramText);
      toast.success('Caption copied! Paste it in your Instagram post');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        onClick={handleLinkedInShare}
        className="h-8 w-8 text-muted-foreground hover:text-[#0A66C2] hover:border-[#0A66C2]/30"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleTwitterShare}
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:border-foreground/30"
        title="Share on X/Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleFacebookShare}
        className="h-8 w-8 text-muted-foreground hover:text-[#1877F2] hover:border-[#1877F2]/30"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleWhatsAppShare}
        className="h-8 w-8 text-muted-foreground hover:text-[#25D366] hover:border-[#25D366]/30"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleInstagramCopy}
        className="h-8 w-8 text-muted-foreground hover:text-[#E4405F] hover:border-[#E4405F]/30"
        title="Copy for Instagram"
      >
        <Instagram className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleEmailShare}
        className="h-8 w-8 text-muted-foreground hover:text-primary hover:border-primary/30"
        title="Share via Email"
      >
        <Mail className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopyLink}
        className="h-8 w-8 text-muted-foreground hover:text-primary hover:border-primary/30"
        title="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
