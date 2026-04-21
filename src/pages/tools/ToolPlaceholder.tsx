import { Link } from 'react-router-dom';
import { Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';

export default function ToolPlaceholder({ name }: { name: string }) {
  const navigate = useNavigate();
  return (
    <div className="container py-12 flex items-center justify-center min-h-[60vh]">
      <div className="bento-card max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mb-3">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">{name}</h1>
        <p className="text-muted-foreground mb-6">Cet outil est en cours de finalisation. Le planificateur et le Pomodoro sont déjà 100% fonctionnels.</p>
        <Button variant="hero" onClick={() => navigate('/dashboard')}>Retour au dashboard</Button>
      </div>
    </div>
  );
}
