import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { AlertCircle } from 'lucide-react';

interface State { hasError: boolean; }
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: unknown) { console.error('ErrorBoundary caught:', err); }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />
        <div className="bento-card max-w-md w-full text-center relative">
          <Logo to="" className="justify-center mb-6" />
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 glow-primary">
            <AlertCircle className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Quelque chose s'est mal passé 😕</h1>
          <p className="text-muted-foreground mb-6">Une erreur inattendue s'est produite.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="hero" className="flex-1" onClick={() => window.location.reload()}>Réessayer</Button>
            <Button variant="outline" className="flex-1" onClick={() => { window.location.href = '/dashboard'; }}>Tableau de bord</Button>
          </div>
        </div>
      </div>
    );
  }
}
