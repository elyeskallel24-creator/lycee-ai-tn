import { useEffect, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PlannerEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  color: string | null;
  subject: string | null;
}

const COLORS = ['#6C3BFF', '#00FFB2', '#FF6B6B', '#FFD60A', '#4F46E5', '#EC4899'];

export default function Planner() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', start: '09:00', end: '10:00', color: COLORS[0], subject: '' });

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const load = async () => {
    if (!user) return;
    const start = weekStart.toISOString();
    const end = addDays(weekStart, 7).toISOString();
    const { data } = await supabase.from('planner_events').select('*').eq('user_id', user.id).gte('start_time', start).lt('start_time', end).order('start_time');
    setEvents(data || []);
  };

  useEffect(() => { load(); }, [user, weekStart]);

  const create = async () => {
    if (!user || !form.title || !form.date) { toast.error('Titre et date requis'); return; }
    const startISO = new Date(`${form.date}T${form.start}`).toISOString();
    const endISO = new Date(`${form.date}T${form.end}`).toISOString();
    const { error } = await supabase.from('planner_events').insert({
      user_id: user.id, title: form.title, start_time: startISO, end_time: endISO, color: form.color, subject: form.subject || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Événement créé');
    await supabase.from('activity_log').insert({ user_id: user.id, activity_type: 'planner' });
    setOpen(false);
    setForm({ title: '', date: '', start: '09:00', end: '10:00', color: COLORS[0], subject: '' });
    load();
  };

  const del = async (id: string) => {
    await supabase.from('planner_events').delete().eq('id', id);
    setEvents(e => e.filter(x => x.id !== id));
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Planificateur</h1>
          <p className="text-muted-foreground">Semaine du {format(weekStart, 'd MMMM yyyy', { locale: fr })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>Aujourd'hui</Button>
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}><ChevronRight className="h-4 w-4" /></Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-1"><Plus className="h-4 w-4" /> Événement</Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader><DialogTitle>Nouvel événement</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Titre</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Matière</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Maths, Physique..." /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Début</Label><Input type="time" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} /></div>
                  <div><Label>Fin</Label><Input type="time" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Couleur</Label>
                  <div className="flex gap-2 mt-2">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setForm({ ...form, color: c })} className={`h-8 w-8 rounded-full transition-transform ${form.color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-background ring-foreground' : ''}`} style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <Button variant="hero" className="w-full" onClick={create}>Créer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2 min-h-[600px]">
        {days.map(d => {
          const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time), d));
          const isToday = isSameDay(d, new Date());
          return (
            <div key={d.toISOString()} className={`bento-card !p-3 ${isToday ? 'border-primary/50' : ''}`}>
              <div className={`text-xs uppercase font-semibold mb-1 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {format(d, 'EEE', { locale: fr })}
              </div>
              <div className={`font-display text-xl mb-3 ${isToday ? 'gradient-text font-bold' : ''}`}>
                {format(d, 'd')}
              </div>
              <div className="space-y-1.5">
                {dayEvents.map(e => (
                  <div key={e.id} className="group rounded-lg p-2 text-xs relative" style={{ background: `${e.color || '#6C3BFF'}25`, borderLeft: `3px solid ${e.color || '#6C3BFF'}` }}>
                    <div className="font-semibold truncate">{e.title}</div>
                    <div className="text-[10px] text-muted-foreground">{format(parseISO(e.start_time), 'HH:mm')} - {format(parseISO(e.end_time), 'HH:mm')}</div>
                    <button onClick={() => del(e.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
