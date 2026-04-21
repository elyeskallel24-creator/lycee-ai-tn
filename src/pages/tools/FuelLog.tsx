import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { Droplet, Coffee, Sandwich, Pizza, Apple } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Log {
  id?: string; log_date: string;
  water_1: boolean; water_2: boolean; water_3: boolean; water_4: boolean;
  breakfast: boolean; lunch: boolean; dinner: boolean; snack: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function FuelLog() {
  useActivityLog('fuel-log');
  const { user } = useAuth();
  const [log, setLog] = useState<Log | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('fuel_log').select('*').eq('user_id', user.id).eq('log_date', today()).maybeSingle();
      if (data) setLog(data as Log);
      else {
        const { data: created } = await supabase.from('fuel_log').insert({ user_id: user.id, log_date: today() }).select().single();
        setLog(created as Log);
      }
    })();
  }, [user]);

  const toggle = async (key: keyof Log) => {
    if (!log || !user) return;
    const newVal = !log[key];
    const next = { ...log, [key]: newVal } as Log;
    setLog(next);
    await supabase.from('fuel_log').update({ [key]: newVal } as any).eq('id', log.id!);
  };

  if (!log) return <PageShell title="Carnet d'énergie"><div /></PageShell>;

  const fields: (keyof Log)[] = ['water_1', 'water_2', 'water_3', 'water_4', 'breakfast', 'lunch', 'dinner', 'snack'];
  const done = fields.filter(f => log[f]).length;
  const pct = (done / 8) * 100;
  const message = pct === 0 ? "Pense à t'hydrater ! 💧"
    : pct <= 50 ? 'Bon début, continue ! 🌱'
    : pct <= 75 ? 'Tu es sur la bonne voie 💪'
    : 'Parfait ! Ton cerveau te remercie 🧠✨';

  return (
    <PageShell title="Carnet d'énergie" subtitle="Hydratation et repas du jour">
      <div className="bento-card mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-sm">{done}/8 complétés</div>
          <div className="font-mono text-sm">{Math.round(pct)}%</div>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
          <motion.div className="h-full gradient-primary" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
        </div>
        <div className="text-sm text-accent font-medium">{message}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bento-card">
          <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Hydratation</div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(n => {
              const k = `water_${n}` as keyof Log;
              const on = log[k];
              return (
                <button key={n} onClick={() => toggle(k)} className={cn('aspect-square rounded-2xl flex items-center justify-center transition-all', on ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white scale-105' : 'glass hover:scale-105')}>
                  <Droplet className={cn('h-7 w-7', on ? 'fill-current' : '')} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="bento-card">
          <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Repas</div>
          <div className="space-y-2">
            {([
              ['breakfast', 'Petit-déjeuner', Coffee],
              ['lunch', 'Déjeuner', Sandwich],
              ['dinner', 'Dîner', Pizza],
              ['snack', 'Snack', Apple],
            ] as [keyof Log, string, any][]).map(([k, label, Icon]) => (
              <button key={k} onClick={() => toggle(k)} className={cn('w-full flex items-center gap-3 p-2 rounded-xl transition-all', log[k] ? 'gradient-primary text-primary-foreground' : 'glass hover:bg-secondary/60')}>
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
                {log[k] && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
