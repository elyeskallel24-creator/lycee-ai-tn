import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exam { id: string; exam_name: string; subject: string | null; exam_date: string; }

const useTick = () => {
  const [, set] = useState(0);
  useEffect(() => { const i = setInterval(() => set(x => x + 1), 1000); return () => clearInterval(i); }, []);
};

export default function ExamCountdown() {
  useActivityLog('exam-countdown');
  useTick();
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [name, setName] = useState(''); const [subject, setSubject] = useState(''); const [date, setDate] = useState('');

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('exam_countdowns').select('*').eq('user_id', user.id).order('exam_date');
    setExams((data as Exam[]) || []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !name || !date) return;
    await supabase.from('exam_countdowns').insert({ user_id: user.id, exam_name: name, subject: subject || null, exam_date: new Date(date).toISOString() });
    setName(''); setSubject(''); setDate(''); load();
  };
  const del = async (id: string) => { await supabase.from('exam_countdowns').delete().eq('id', id); load(); };

  return (
    <PageShell title="Compte à rebours examens" subtitle="Reste concentré sur tes prochaines échéances">
      <div className="bento-card mb-6 grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2">
        <Input placeholder="Nom de l'examen" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Matière" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button variant="hero" onClick={add} className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button>
      </div>

      {exams.length === 0 ? (
        <EmptyState emoji="📅" title="Aucun examen planifié" description="Ajoute ton premier examen pour démarrer le compte à rebours." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((e, i) => <ExamCard key={e.id} exam={e} onDelete={() => del(e.id)} index={i} />)}
        </div>
      )}
    </PageShell>
  );
}

export function ExamCard({ exam, onDelete, index = 0, compact = false }: { exam: Exam; onDelete?: () => void; index?: number; compact?: boolean }) {
  const ms = new Date(exam.exam_date).getTime() - Date.now();
  const passed = ms <= 0;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  const tone = passed ? 'from-muted to-muted' : days > 14 ? 'from-emerald-500 to-teal-600' : days > 7 ? 'from-amber-400 to-orange-500' : 'from-red-500 to-rose-600';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={cn('bento-card relative overflow-hidden', compact && '!p-4')}>
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-15', tone)} />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-display font-semibold">{exam.exam_name}</div>
            {exam.subject && <div className="text-xs text-accent">{exam.subject}</div>}
          </div>
          {onDelete && <button onClick={onDelete} className="opacity-50 hover:opacity-100"><Trash2 className="h-4 w-4" /></button>}
        </div>
        <div className="mt-4">
          {passed ? (
            <div className="font-mono text-2xl font-bold">Terminé ✓</div>
          ) : (
            <div className="font-mono text-2xl font-bold tabular-nums">
              {days}j {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">{new Date(exam.exam_date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</div>
        </div>
      </div>
    </motion.div>
  );
}
