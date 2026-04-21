import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward } from 'lucide-react';

export const STRETCHES = [
  { name: 'Roulements de cou', emoji: '🦒', duration: 30, instr: 'Roule lentement la tête en cercle, dans les deux sens.' },
  { name: 'Haussements d\'épaules', emoji: '🙆', duration: 30, instr: 'Monte les épaules vers les oreilles, relâche.' },
  { name: 'Ouverture de poitrine', emoji: '🦋', duration: 45, instr: 'Joins tes mains derrière le dos et soulève doucement.' },
  { name: 'Cercles de poignets', emoji: '✋', duration: 30, instr: 'Tourne les poignets dans les deux sens.' },
  { name: 'Torsion assise', emoji: '🌀', duration: 45, instr: 'Tourne le buste vers la droite, puis la gauche.' },
  { name: 'Étirement du psoas', emoji: '🧘', duration: 45, instr: 'Une jambe en arrière, hanches en avant, change de côté.' },
];

export default function Stretch() {
  useActivityLog('stretch');
  const [i, setI] = useState(0);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(STRETCHES[0].duration);

  useEffect(() => { setLeft(STRETCHES[i].duration); }, [i]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft(l => {
      if (l <= 1) {
        if (i < STRETCHES.length - 1) { setI(i + 1); return STRETCHES[i + 1].duration; }
        setRunning(false); return 0;
      }
      return l - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running, i]);

  const cur = STRETCHES[i];

  return (
    <PageShell title="Étirements" subtitle="Bouge un peu — ton corps te dira merci 🧘">
      <div className="bento-card text-center mb-6">
        <motion.div key={i} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl mb-2">{cur.emoji}</motion.div>
        <div className="font-display text-2xl font-semibold">{cur.name}</div>
        <div className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">{cur.instr}</div>
        <div className="font-mono text-5xl font-bold gradient-text mt-6">{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</div>
        <div className="flex justify-center gap-2 mt-6">
          {running ? (
            <Button variant="outline" onClick={() => setRunning(false)} className="gap-2"><Pause className="h-4 w-4" /> Pause</Button>
          ) : (
            <Button variant="hero" onClick={() => setRunning(true)} className="gap-2"><Play className="h-4 w-4" /> {i === 0 && left === cur.duration ? 'Commencer la session' : 'Reprendre'}</Button>
          )}
          <Button variant="outline" onClick={() => { if (i < STRETCHES.length - 1) setI(i + 1); }} className="gap-2"><SkipForward className="h-4 w-4" /> Suivant</Button>
        </div>
        <div className="text-xs text-muted-foreground mt-4">Exercice {i + 1} / {STRETCHES.length}</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STRETCHES.map((s, idx) => (
          <button key={s.name} onClick={() => { setI(idx); setRunning(false); }} className={`bento-card text-center transition-all ${idx === i ? 'ring-2 ring-primary' : ''}`}>
            <div className="text-3xl">{s.emoji}</div>
            <div className="text-xs font-medium mt-1">{s.name}</div>
            <div className="text-[10px] text-muted-foreground">{s.duration}s</div>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
