import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/constants';
import { Logo } from '@/components/shared/Logo';

export default function Pricing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background py-10 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />
      <div className="container relative">
        <div className="flex items-center justify-between mb-12">
          <Logo />
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
        </div>
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 text-balance">
            Choisis ton <span className="gradient-text">plan</span>
          </h1>
          <p className="text-muted-foreground text-lg">Annule à tout moment.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bento-card ${p.highlight ? 'border-primary/50 shadow-glow' : ''}`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
                  POPULAIRE
                </div>
              )}
              <div className="text-sm text-muted-foreground">{p.description}</div>
              <h3 className="font-display text-2xl font-bold mt-1">{p.name}</h3>
              <div className="mt-4 mb-6">
                <span className="font-mono text-5xl font-bold">{p.price}</span>
                <span className="text-muted-foreground ml-2">{p.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant={p.highlight ? 'hero' : 'glass'} size="lg" className="w-full" onClick={() => navigate('/auth?mode=signup')}>
                {p.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
