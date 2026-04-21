import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { Flame, Trophy } from 'lucide-react';

interface Activity { activity_date: string; }

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function Streak() {
  useActivityLog('streak');
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) return;
    const since = new Date(); since.setDate(since.getDate() - 365);
    supabase.from('activity_log').select('activity_date').eq('user_id', user.id).gte('activity_date', since.toISOString().slice(0, 10)).then(({ data }) => {
      setActivities((data as Activity[]) || []);
    });
  }, [user]);

  const { weeks, currentStreak, longestStreak, totalDays } = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach(a => { counts[a.activity_date] = (counts[a.activity_date] || 0) + 1; });

    // Build 53 weeks ending today
    const cells: { date: Date; count: number }[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const endWeekday = (today.getDay() + 6) % 7; // 0=Mon
    const start = new Date(today); start.setDate(today.getDate() - (52 * 7 + endWeekday));
    for (let i = 0; i <= 52 * 7 + endWeekday; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      cells.push({ date: d, count: counts[d.toISOString().slice(0, 10)] || 0 });
    }
    // group into 53 weeks
    const weeks: { date: Date; count: number }[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    // streaks
    const sortedDates = Object.keys(counts).sort();
    let longest = 0, run = 0; let prev: string | null = null;
    for (const d of sortedDates) {
      if (prev) {
        const diff = (new Date(d).getTime() - new Date(prev).getTime()) / 86400000;
        run = diff === 1 ? run + 1 : 1;
      } else run = 1;
      if (run > longest) longest = run;
      prev = d;
    }
    let current = 0;
    const cursor = new Date();
    while (counts[cursor.toISOString().slice(0, 10)]) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return { weeks, currentStreak: current, longestStreak: longest, totalDays: sortedDates.length };
  }, [activities]);

  const intensity = (c: number) => c === 0 ? 'bg-secondary/30' : c === 1 ? 'bg-primary/25' : c === 2 ? 'bg-primary/55' : 'bg-primary';

  return (
    <PageShell title="Calendrier de séries" subtitle="Garde la flamme allumée 🔥">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bento-card">
          <Flame className="h-5 w-5 text-coral mb-2" />
          <div className="font-mono text-3xl font-bold">{currentStreak}j</div>
          <div className="text-xs text-muted-foreground">Série actuelle</div>
        </div>
        <div className="bento-card">
          <Trophy className="h-5 w-5 text-accent mb-2" />
          <div className="font-mono text-3xl font-bold">{longestStreak}j</div>
          <div className="text-xs text-muted-foreground">Record</div>
        </div>
        <div className="bento-card">
          <div className="font-mono text-3xl font-bold">{totalDays}</div>
          <div className="text-xs text-muted-foreground">Jours actifs (an)</div>
        </div>
      </div>

      <div className="bento-card overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          <div className="flex gap-1 pl-7">
            {weeks.map((w, i) => {
              const first = w[0]?.date;
              const showLabel = first && first.getDate() <= 7;
              return <div key={i} className="w-[14px] text-[10px] text-muted-foreground text-center">{showLabel ? MONTHS[first.getMonth()] : ''}</div>;
            })}
          </div>
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 w-6 text-[10px] text-muted-foreground">
              <div className="h-[14px]" /><div className="h-[14px]">Lun</div><div className="h-[14px]" /><div className="h-[14px]">Mer</div><div className="h-[14px]" /><div className="h-[14px]">Ven</div><div className="h-[14px]" />
            </div>
            {weeks.map((w, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = w[di];
                  if (!cell) return <div key={di} className="h-[14px] w-[14px]" />;
                  return (
                    <div key={di} title={`${cell.count} activité${cell.count > 1 ? 's' : ''} · ${cell.date.toLocaleDateString('fr-FR')}`}
                      className={`h-[14px] w-[14px] rounded-sm ${intensity(cell.count)} hover:ring-2 hover:ring-accent transition-all`} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
