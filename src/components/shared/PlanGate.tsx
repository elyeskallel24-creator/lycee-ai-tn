import { ReactNode, useState } from 'react';
import { usePlan } from '@/hooks/usePlan';
import type { Plan } from '@/lib/constants';
import { UpgradeModal } from './UpgradeModal';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  required: Plan;
  toolName?: string;
  children: ReactNode;
}

export const PlanGate = ({ required, toolName, children }: Props) => {
  const { can } = usePlan();
  const [open, setOpen] = useState(true);

  if (can(required)) return <>{children}</>;

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center p-6">
      <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />
      <div className="bento-card relative max-w-md text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 animate-pulse-glow">
          <Lock className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="font-display text-2xl mb-2">
          Réservé au plan <span className="gradient-text capitalize">{required}</span>
        </h2>
        <p className="text-muted-foreground mb-6">
          {toolName ?? 'Cet outil'} t'attend juste après l'upgrade.
        </p>
        <Button variant="hero" size="lg" onClick={() => setOpen(true)} className="gap-2">
          <Sparkles className="h-4 w-4" /> Voir les plans
        </Button>
      </div>
      <UpgradeModal open={open} onOpenChange={setOpen} requiredPlan={required} toolName={toolName} />
    </div>
  );
};
