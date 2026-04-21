import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Mode = 'work' | 'break' | 'long_break';
const DURATIONS: Record<Mode, number> = { work: 25 * 60, break: 5 * 60, long_break: 15 * 60 };
const LABELS: Record<Mode, string> = { work: 'Concentration', break: 'Pause courte', long_break: 'Pause longue' };

export default function Pomodoro() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('work');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const sessionStart = useRef<Date | null>(null);

  // tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  // on finish
  useEffect(() => {
    if (secondsLeft !== 0 || !running) return;
    setRunning(false);
    if (mode === 'work') {
      const newCount = completed + 1;
      setCompleted(newCount);
      logSession();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🍅 Pomodoro terminé !', { body: 'Bon travail. Prends une pause.' });
      }
      toast.success('Pomodoro terminé ! 🎉');
      const next: Mode = newCount % 4 === 0 ? 'long_break' : 'break';
      setMode(next);
      setSecondsLeft(DURATIONS[next]);
    } else {
      toast('Pause finie. Au boulot !', { icon: '💪' });
      setMode('work');
      setSecondsLeft(DURATIONS.work);
    }
  }, [secondsLeft, running]);

  const logSession = async () => {
    if (!user || !sessionStart.current) return;
    const end = new Date();
    await supabase.from('study_sessions').insert({
      user_id: user.id,
      subject: 'Pomodoro',
      start_time: sessionStart.current.toISOString(),
      end_time: end.toISOString(),
      duration_minutes: 25,
    });
    await supabase.from('activity_log').insert({ user_id: user.id, activity_type: 'pomodoro' });
  };

  const start = () => {
    if (!sessionStart.current) sessionStart.current = new Date();
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setSecondsLeft(DURATIONS[mode]); sessionStart.current = null; };
  const skip = () => setSecondsLeft(0);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const total = DURATIONS[mode];
  const progress = ((total - secondsLeft) / total) * 100;
  const radius = 130;
  const circ = 2 * Math.PI * radius;

  const color = mode === 'work' ? 'hsl(var(--primary))' : mode === 'break' ? 'hsl(var(--accent))' : 'hsl(var(--coral))';

  return (
    <div className="container max-w-2xl py-12 md:py-20">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-bold">Pomodoro Focus</h1>
        <p className="text-muted-foreground">25 min de concentration. 5 min de pause. Répète.</p>
      </div>

      <div className="flex justify-center gap-2 mb-10">
        {(['work', 'break', 'long_break'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setSecondsLeft(DURATIONS[m]); setRunning(false); sessionStart.current = null; }}
            className={`pill-tab ${mode === m ? 'gradient-primary text-primary-foreground' : 'glass hover:bg-primary/10'}`}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mx-auto w-80 h-80 flex items-center justify-center"
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r={radius} stroke="hsl(var(--muted))" strokeWidth="14" fill="none" />
          <motion.circle
            cx="150" cy="150" r={radius}
            stroke={color}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (progress / 100) * circ}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s' }}
          />
        </svg>
        <div className="text-center">
          <div className="font-mono text-7xl font-bold tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mt-2">
            {mode === 'work' ? <Brain className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
            {LABELS[mode]}
          </div>
        </div>
      </motion.div>

      <div className="flex justify-center items-center gap-3 mt-10">
        <Button variant="outline" size="icon" onClick={reset}><RotateCcw className="h-4 w-4" /></Button>
        {running ? (
          <Button variant="hero" size="xl" onClick={pause} className="gap-2 min-w-40">
            <Pause className="h-5 w-5" /> Pause
          </Button>
        ) : (
          <Button variant="hero" size="xl" onClick={start} className="gap-2 min-w-40">
            <Play className="h-5 w-5" /> Démarrer
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={skip}><SkipForward className="h-4 w-4" /></Button>
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        Pomodoros complétés aujourd'hui : <span className="font-mono font-bold text-foreground">{completed}</span>
      </div>
    </div>
  );
}
