import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const HelpButton = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        to="/contact"
        aria-label="Aide / Contact"
        className="fixed bottom-5 left-5 z-40 h-10 w-10 rounded-full glass border border-border/60 flex items-center justify-center hover:scale-110 hover:border-primary/60 transition-all shadow-elegant"
      >
        <HelpCircle className="h-5 w-5 text-foreground/80" />
      </Link>
    </TooltipTrigger>
    <TooltipContent side="right">Besoin d'aide ?</TooltipContent>
  </Tooltip>
);
