import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Square, Clock } from 'lucide-react';

interface Session { id: string; subject: string | null; start_time: string; end_time: string | null; duration_minutes: number | null; }
interface Subject { id: string; name: string; hex_color: string; }

export default function Tracker() {
  useActivityLog('tracker');
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState('');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<Date | null>(null);

  const load = async () => {
    if (!user) return;
    const [{ data: s }, { data: subs }] = await Promise.all([
      supabase.from('study_sessions').select('*').eq('user_id', user.id).order('start_time', { ascending: false }).limit(50),
      supabase.from('subjects').select('*').eq('user_id', user.id),
    ]);
    setSessions((s as Session[]) || []);
    setSubjects((subs as Subject[]) || []);
  };
  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - (startRef.current?.getTime() ?? Date.now())) / 1000)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = () => { startRef.current = new Date(); setElapsed(0); setRunning(true); };
  const stop = async () => {
    if (!user || !startRef.current) return;
    const end = new Date();
    const minutes = Math.max(1, Math.round((end.getTime() - startRef.current.getTime()) / 60000));
    await supabase.from('study_sessions').insert({
      user_id: user.id, subject: subject || null,
      start_time: startRef.current.toISOString(), end_time: end.toISOString(), duration_minutes: minutes,
    });
    setRunning(false); setElapsed(0); startRef.current = null;
    load();
  };

  const fmt = (sec: number) => {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const fmtMin = (m: number | null) => {
    if (!m) return '0min';
    const h = Math.floor(m / 60); const mm = m % 60;
    return h ? `${h}h ${mm}min` : `${mm}min`;
  };

  // weekly chart
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
  const weekly = sessions.filter(s => new Date(s.start_time) >= weekStart);
  const bySubject: Record<string, number> = {};
  weekly.forEach(s => { const k = s.subject || 'Autre'; bySubject[k] = (bySubject[k] || 0) + (s.duration_minutes || 0); });
  const chartData = Object.entries(bySubject).map(([name, value]) => ({ name, hours: +(value / 60).toFixed(1), color: subjects.find(s => s.name === name)?.hex_color || '#6C3BFF' }));
  const totalWeek = weekly.reduce((a, b) => a + (b.duration_minutes || 0), 0);

  return (
    <PageShell title="Tracker d'heures" subtitle="Mesure ton temps d'étude par matière">
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bento-card">
          <div className="text-xs text-muted-foreground mb-2">Session en cours</div>
          <div className="flex items-end gap-3 mb-4">
            <div className={`font-mono text-5xl font-bold ${running ? 'gradient-text' : ''}`}>{fmt(elapsed)}</div>
            {running && <div className="flex items-center gap-1 text-xs text-accent mb-2"><span className="h-2 w-2 rounded-full bg-accent animate-pulse" /> En cours</div>}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input list="subjects" placeholder="Matière" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={running} />
            <datalist id="subjects">{subjects.map(s => <option key={s.id} value={s.name} />)}</datalist>
            {running ? (
              <Button variant="outline" onClick={stop} className="gap-2"><Square className="h-4 w-4" /> Arrêter</Button>
            ) : (
              <Button variant="hero" onClick={start} className="gap-2"><Play className="h-4 w-4" /> Démarrer</Button>
            )}
          </div>
        </div>
        <div className="bento-card">
          <div className="text-xs text-muted-foreground mb-2">Cette semaine</div>
          <div className="font-mono text-5xl font-bold mb-4">{fmtMin(totalWeek)}</div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="text-sm text-muted-foreground">Aucune session cette semaine.</div>}
        </div>
      </div>

      <h2 className="font-display text-xl mb-3">Historique</h2>
      {sessions.length === 0 ? (
        <EmptyState emoji="⏱️" title="Aucune session enregistrée" description="Démarre ton premier compteur ci-dessus." />
      ) : (
        <div className="bento-card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr><th className="text-left p-3">Date</th><th className="text-left p-3">Matière</th><th className="text-right p-3">Durée</th></tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3">{new Date(s.start_time).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3">{s.subject || '—'}</td>
                  <td className="p-3 text-right font-mono">{fmtMin(s.duration_minutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
