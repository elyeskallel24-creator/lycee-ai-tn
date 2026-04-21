import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Timer, CalendarDays, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const KEY = 'lyceeai_onboarded';

export const OnboardingModal = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!profile) return;
    if (localStorage.getItem(KEY)) return;
    const created = new Date(profile.id ? (profile as any).created_at || 0 : 0).getTime();
    // fallback: rely on flag only — show on first visit if no flag
    const seen = localStorage.getItem(KEY);
    if (!seen) setOpen(true);
    void created;
  }, [profile]);

  const dismiss = () => { localStorage.setItem(KEY, '1'); setOpen(false); };
  const firstName = profile?.full_name?.split(' ')[0] || profile?.username || 'étudiant';

  const steps = [
    {
      title: `Bienvenue sur LyceeAI, ${firstName} ! 🎉`,
      body: "Ta plateforme tout-en-un pour étudier intelligemment : planning, focus, flashcards, ressources et bien plus.",
      visual: <div className="text-7xl">🎓</div>,
    },
    {
      title: '3 plans, 3 vitesses',
      body: '',
      visual: (
        <div className="grid grid-cols-3 gap-2 w-full">
          {[
            { n: 'Freemium', c: 'bg-muted', d: 'Planner · Pomodoro' },
            { n: 'Lite', c: 'bg-accent/30', d: 'Notes · Flashcards · Kanban' },
            { n: 'Premium', c: 'gradient-primary', d: 'Tout + temps réel' },
          ].map(p => (
            <div key={p.n} className={cn('p-3 rounded-2xl text-center', p.c)}>
              <div className="font-display font-bold text-sm">{p.n}</div>
              <div className="text-[10px] mt-1 opacity-80">{p.d}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Par où commencer ?',
      body: '',
      visual: (
        <div className="grid gap-2 w-full">
          <Button variant="hero" className="w-full justify-start gap-2" onClick={() => { dismiss(); navigate('/ressources'); }}><BookOpen className="h-4 w-4" /> Explorer les Ressources</Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { dismiss(); navigate('/tools/pomodoro'); }}><Timer className="h-4 w-4" /> Lancer le Pomodoro</Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { dismiss(); navigate('/tools/planner'); }}><CalendarDays className="h-4 w-4" /> Créer mon planning</Button>
        </div>
      ),
    },
  ];

  if (!open) return null;
  const cur = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="bento-card max-w-md w-full relative"
        >
          <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          <div className="flex items-center gap-1 text-xs text-accent mb-4"><Sparkles className="h-3 w-3" /> Onboarding</div>
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex justify-center min-h-[120px] items-center">{cur.visual}</div>
            <h2 className="font-display text-2xl font-bold text-center">{cur.title}</h2>
            {cur.body && <p className="text-muted-foreground text-center">{cur.body}</p>}
          </motion.div>

          <div className="flex justify-center gap-1.5 my-5">
            {steps.map((_, i) => (
              <div key={i} className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted')} />
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button onClick={dismiss} className="text-sm text-muted-foreground hover:text-foreground">Passer</button>
            {step < steps.length - 1 ? (
              <Button variant="hero" onClick={() => setStep(step + 1)}>Suivant →</Button>
            ) : (
              <Button variant="hero" onClick={dismiss}>C'est parti</Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
