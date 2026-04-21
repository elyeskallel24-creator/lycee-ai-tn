import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Check } from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';
import { cn } from '@/lib/utils';

interface Task {
  id: string; title: string; status: string; is_daily_goal: boolean; daily_reset_date: string | null;
}

export default function MyDay() {
  useActivityLog('myday');
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  const load = async () => {
    if (!user) return;
    // Archive yesterday's daily goals
    await supabase.from('tasks').update({ is_daily_goal: false }).eq('user_id', user.id).eq('is_daily_goal', true).lt('daily_reset_date', today);
    const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).eq('is_daily_goal', true).eq('daily_reset_date', today).order('created_at');
    setTasks((data as Task[]) || []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !title.trim()) return;
    await supabase.from('tasks').insert({ user_id: user.id, title: title.trim(), is_daily_goal: true, daily_reset_date: today });
    setTitle(''); load();
  };
  const toggle = async (t: Task) => {
    const newStatus = t.status === 'done' ? 'todo' : 'done';
    setTasks(ts => ts.map(x => x.id === t.id ? { ...x, status: newStatus } : x));
    await supabase.from('tasks').update({ status: newStatus }).eq('id', t.id);
    const updated = tasks.map(x => x.id === t.id ? { ...x, status: newStatus } : x);
    if (updated.length > 0 && updated.every(x => x.status === 'done')) fireConfetti();
  };
  const del = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    load();
  };

  const done = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length ? (done / tasks.length) * 100 : 0;

  return (
    <PageShell title="My Day" subtitle={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}>
      <div className="bento-card mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">{done}/{tasks.length} tâches accomplies</div>
          <div className="font-mono text-sm">{Math.round(pct)}%</div>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div className="h-full gradient-primary" animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      <div className="bento-card mb-4 flex gap-2">
        <Input placeholder="Que veux-tu accomplir ?" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <Button variant="hero" onClick={add}>Ajouter</Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState emoji="🎯" title="Qu'est-ce que tu veux accomplir aujourd'hui ?" description="Ajoute ta première tâche au-dessus." />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map(t => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="bento-card flex items-center gap-3 !py-3"
              >
                <button onClick={() => toggle(t)} className={cn('h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors', t.status === 'done' ? 'bg-accent border-accent' : 'border-border hover:border-primary')}>
                  {t.status === 'done' && <Check className="h-4 w-4 text-accent-foreground" />}
                </button>
                <div className={cn('flex-1', t.status === 'done' && 'line-through text-muted-foreground')}>{t.title}</div>
                <Button variant="ghost" size="icon" onClick={() => del(t.id)}><Trash2 className="h-4 w-4" /></Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PageShell>
  );
}
