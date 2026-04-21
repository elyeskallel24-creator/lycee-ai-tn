import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Plan } from '@/lib/constants';
import { PLANS } from '@/lib/constants';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  requiredPlan: Plan;
  toolName?: string;
}

export const UpgradeModal = ({ open, onOpenChange, requiredPlan, toolName }: Props) => {
  const navigate = useNavigate();
  const plan = PLANS.find(p => p.key === requiredPlan)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/30 max-w-md">
        <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none rounded-2xl" />
        <DialogHeader className="relative">
          <div className="mx-auto h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 animate-pulse-glow">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-2xl font-display">
            Passe au plan <span className="gradient-text">{plan.name}</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            {toolName ? `${toolName} fait partie du plan ${plan.name}.` : `Cette fonctionnalité nécessite le plan ${plan.name}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="relative space-y-3 py-2">
          {plan.features.map(f => (
            <div key={f} className="flex items-center gap-3 text-sm">
              <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-accent" />
              </div>
              <span>{f}</span>
            </div>
          ))}
          <div className="pt-2 text-center">
            <span className="font-mono text-3xl font-bold">{plan.price}</span>
            <span className="text-muted-foreground ml-2">{plan.period}</span>
          </div>
        </div>
        <div className="relative flex flex-col gap-2">
          <Button onClick={() => { onOpenChange(false); navigate('/pricing'); }} variant="hero" size="lg">
            {plan.cta}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Plus tard</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
