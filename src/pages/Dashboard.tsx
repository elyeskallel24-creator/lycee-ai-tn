import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import { TOOLS, PLAN_LABELS } from '@/lib/constants';
import { Link } from 'react-router-dom';
import { Sparkles, Flame, Timer, Layers, Trophy, ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { profile } = useAuth();
  const { plan, can } = usePlan();
  const [stats, setStats] = useState({ pomodoros: 0, dueCards: 0, streak: 0, todayTasks: 0 });

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ count: pomodoros }, { count: dueCards }, { data: activities }, { count: todayTasks }] = await Promise.all([
        supabase.from('study_sessions').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).gte('start_time', today),
        supabase.from('flashcards').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).lte('next_review', new Date().toISOString()),
        supabase.from('activity_log').select('activity_date').eq('user_id', profile.id).order('activity_date', { ascending: false }).limit(60),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('is_daily_goal', true).eq('daily_reset_date', today),
      ]);
      // streak
      let streak = 0;
      if (activities && activities.length) {
        const dates = new Set(activities.map(a => a.activity_date));
        const cur = new Date();
        while (dates.has(cur.toISOString().slice(0, 10))) {
          streak++;
          cur.setDate(cur.getDate() - 1);
        }
      }
      setStats({ pomodoros: pomodoros ?? 0, dueCards: dueCards ?? 0, streak, todayTasks: todayTasks ?? 0 });
    })();
  }, [profile]);

  const firstName = profile?.full_name?.split(' ')[0] || profile?.username || 'étudiant';
  const allowedTools = TOOLS.filter(t => can(t.plan));
  const lockedTools = TOOLS.filter(t => !can(t.plan));

  return (
    <div className="container py-8 md:py-12">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-sm text-accent font-mono">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <h1 className="font-display text-3xl md:text-5xl font-bold">
              Salut <span className="gradient-text">{firstName}</span> 👋
            </h1>
            {profile?.level && <div className="text-muted-foreground mt-1">{profile.level}</div>}
          </div>
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30', plan === 'premium' && 'glow-primary')}>
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-semibold">{PLAN_LABELS[plan]}</span>
            {plan !== 'premium' && (
              <Link to="/pricing" className="text-xs text-primary underline ml-2">Upgrade</Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bento stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pomodoros', value: stats.pomodoros, icon: Timer, color: 'from-coral to-pink-500' },
          { label: 'Cartes dues', value: stats.dueCards, icon: Layers, color: 'from-cyan-500 to-blue-600' },
          { label: 'Série', value: `${stats.streak}j`, icon: Flame, color: 'from-orange-500 to-red-600' },
          { label: 'My Day', value: stats.todayTasks, icon: Trophy, color: 'from-amber-500 to-yellow-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bento-card relative overflow-hidden"
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-20', s.color)} />
            <div className="relative">
              <s.icon className="h-5 w-5 text-foreground/70 mb-2" />
              <div className="font-mono text-3xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tools grid */}
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold mb-4">Tes outils</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allowedTools.map((t, i) => {
            const Icon = (Icons as any)[t.icon] || Icons.Square;
            return (
              <motion.div key={t.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={t.path} className="bento-card group block h-full relative overflow-hidden">
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-30 transition-opacity', t.gradient)} />
                  <div className="relative">
                    <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 text-white', t.gradient)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="font-display font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Locked / upgrade */}
      {lockedTools.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">Débloque plus</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedTools.slice(0, 4).map(t => {
              const Icon = (Icons as any)[t.icon] || Icons.Square;
              return (
                <Link key={t.key} to={t.path} className="bento-card relative opacity-70 hover:opacity-100">
                  <Icon className="h-8 w-8 text-muted-foreground mb-2" />
                  <div className="font-display font-semibold">{t.name}</div>
                  <div className="text-xs text-accent mt-1">Plan {t.plan}</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
