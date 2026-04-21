import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PLAN_LABELS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { CountUp } from '@/components/shared/CountUp';
import { Clock, CheckCircle2, Flame, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<{ hours: number; tasks: number; streak: number; reviews: number } | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: ses }, { count: tasks }, { data: acts }, { data: cards }] = await Promise.all([
        supabase.from('study_sessions').select('duration_minutes').eq('user_id', profile.id),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('status', 'done'),
        supabase.from('activity_log').select('activity_date').eq('user_id', profile.id).order('activity_date', { ascending: false }).limit(400),
        supabase.from('flashcards').select('repetitions').eq('user_id', profile.id),
      ]);
      const totalMin = (ses || []).reduce((s, r: any) => s + (r.duration_minutes || 0), 0);
      const reviews = (cards || []).reduce((s, r: any) => s + (r.repetitions || 0), 0);
      let streak = 0;
      if (acts && acts.length) {
        const set = new Set(acts.map((a: any) => a.activity_date));
        const cur = new Date();
        while (set.has(cur.toISOString().slice(0, 10))) { streak++; cur.setDate(cur.getDate() - 1); }
      }
      setStats({ hours: Math.round(totalMin / 60), tasks: tasks ?? 0, streak, reviews });
    })();
  }, [profile]);

  if (!profile) return null;

  const initials = (profile.full_name || profile.username).split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const planColor = profile.plan === 'premium' ? 'gradient-primary text-primary-foreground' : profile.plan === 'lite' ? 'bg-accent text-accent-foreground' : 'bg-muted';
  const memberSince = new Date((profile as any).created_at || Date.now()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const cards = [
    { icon: Clock, label: 'Heures étudiées', value: stats?.hours ?? 0, suffix: 'h' },
    { icon: CheckCircle2, label: 'Tâches accomplies', value: stats?.tasks ?? 0, suffix: '' },
    { icon: Flame, label: 'Série actuelle', value: stats?.streak ?? 0, suffix: 'j' },
    { icon: Layers, label: 'Révisions de cartes', value: stats?.reviews ?? 0, suffix: '' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="container py-6 md:py-10 max-w-4xl">
      <div className="bento-card mb-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="h-28 w-28 rounded-3xl gradient-primary text-primary-foreground font-display font-bold text-4xl flex items-center justify-center glow-primary shrink-0">{initials}</div>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-sm text-muted-foreground">@{profile.username}</div>
          <h1 className="font-display text-3xl font-bold mt-1">{profile.full_name || profile.username}</h1>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', planColor)}>{PLAN_LABELS[profile.plan]}</span>
            {profile.level && <span className="px-3 py-1 rounded-full text-xs glass">{profile.level}</span>}
            {profile.school_level && <span className="px-3 py-1 rounded-full text-xs glass">{profile.school_level}</span>}
          </div>
          <div className="text-xs text-muted-foreground mt-3">Membre depuis {memberSince}</div>
        </div>
      </div>

      <h2 className="font-display text-xl font-bold mb-3">Statistiques</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bento-card">
            <c.icon className="h-5 w-5 text-primary mb-2" />
            {stats === null ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="font-mono text-3xl font-bold"><CountUp value={c.value} />{c.suffix}</div>
            )}
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
