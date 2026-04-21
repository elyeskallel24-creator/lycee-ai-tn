import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const INTERVALS = [1, 3, 7, 14, 30];

interface Event { id: string; title: string; start_time: string; }

export default function SrsSchedule() {
  useActivityLog('srs-schedule');
  const { user } = useAuth();
  const [lesson, setLesson] = useState(''); const [subject, setSubject] = useState('');
  const [events, setEvents] = useState<Event[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('planner_events').select('id,title,start_time').eq('user_id', user.id).like('title', 'Révision:%').gte('start_time', new Date().toISOString()).order('start_time');
    setEvents((data as Event[]) || []);
  };
  useEffect(() => { load(); }, [user]);

  const schedule = async () => {
    if (!user || !lesson.trim()) return;
    const rows = INTERVALS.map(d => {
      const start = new Date(); start.setDate(start.getDate() + d);
      const end = new Date(start); end.setMinutes(end.getMinutes() + 30);
      return {
        user_id: user.id,
        title: `Révision: ${lesson.trim()}`,
        subject: subject || null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        color: '#6C3BFF',
      };
    });
    await supabase.from('planner_events').insert(rows);
    toast.success('5 révisions planifiées 🎯');
    setLesson(''); setSubject('');
    load();
  };

  // Build month grid
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const startWeekday = (start.getDay() + 6) % 7;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const reviewDates = new Set(events.map(e => new Date(e.start_time).toDateString()));

  return (
    <PageShell title="Planning SRS" subtitle="Marque une leçon comme maîtrisée et révise-la automatiquement">
      <div className="bento-card mb-6 grid sm:grid-cols-[1fr_1fr_auto] gap-2">
        <Input placeholder="Nom de la leçon" value={lesson} onChange={(e) => setLesson(e.target.value)} />
        <Input placeholder="Matière" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Button variant="hero" onClick={schedule} className="gap-2"><Sparkles className="h-4 w-4" /> Marquer comme maîtrisé</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bento-card">
          <div className="font-display font-semibold mb-3">{today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
          <div className="grid grid-cols-7 text-xs text-muted-foreground mb-1">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i} className="text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startWeekday }).map((_, i) => <div key={'p' + i} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = new Date(today.getFullYear(), today.getMonth(), i + 1);
              const isReview = reviewDates.has(d.toDateString());
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-sm ${isReview ? 'gradient-primary text-primary-foreground font-bold' : isToday ? 'border border-accent text-accent' : 'glass'}`}>
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bento-card">
          <div className="font-display font-semibold mb-3">À réviser bientôt</div>
          {events.length === 0 ? (
            <EmptyState emoji="📚" title="Aucune révision planifiée" />
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {events.slice(0, 30).map(e => {
                const d = new Date(e.start_time);
                const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
                return (
                  <div key={e.id} className="glass rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{e.title.replace('Révision: ', '')}</div>
                      <div className="text-xs text-muted-foreground">{d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                    </div>
                    <div className="text-xs font-mono text-accent">+{days}j</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
