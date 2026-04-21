import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string; title: string; status: string; subject: string | null; due_date: string | null; position: number | null;
}
interface Subject { id: string; name: string; hex_color: string; }

const COLUMNS = [
  { key: 'todo', label: 'À faire' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'done', label: 'Terminé' },
];

export default function Kanban() {
  useActivityLog('kanban');
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [due, setDue] = useState('');

  const load = async () => {
    if (!user) return;
    const [{ data: t }, { data: s }] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('is_daily_goal', false).order('position'),
      supabase.from('subjects').select('*').eq('user_id', user.id),
    ]);
    setTasks((t as Task[]) || []);
    setSubjects((s as Subject[]) || []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !title.trim()) return;
    await supabase.from('tasks').insert({
      user_id: user.id, title: title.trim(), subject: subject || null, due_date: due || null,
      status: 'todo', is_daily_goal: false, position: tasks.filter(x => x.status === 'todo').length,
    });
    setTitle(''); setSubject(''); setDue(''); setOpen(false);
    load();
  };
  const del = async (id: string) => { await supabase.from('tasks').delete().eq('id', id); load(); };

  const onDragEnd = async (r: DropResult) => {
    if (!r.destination) return;
    const id = r.draggableId;
    const newStatus = r.destination.droppableId;
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await supabase.from('tasks').update({ status: newStatus, position: r.destination.index }).eq('id', id);
  };

  const colorFor = (subj: string | null) => subjects.find(s => s.name === subj)?.hex_color || 'hsl(var(--primary))';

  return (
    <PageShell
      title="Kanban"
      subtitle="Organise tes devoirs par étape"
      actions={<Button variant="hero" onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Nouvelle tâche</Button>}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid md:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <Droppable key={col.key} droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef} {...provided.droppableProps}
                    className={cn('bento-card !p-3 min-h-[60vh] transition-colors', snapshot.isDraggingOver && 'bg-primary/5')}
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="font-display font-semibold">{col.label}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{colTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colTasks.length === 0 && (
                        <div className="border-2 border-dashed border-border rounded-xl py-10 text-center text-xs text-muted-foreground">Glisse ici</div>
                      )}
                      {colTasks.map((t, i) => {
                        const overdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done';
                        return (
                          <Draggable key={t.id} draggableId={t.id} index={i}>
                            {(p) => (
                              <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                                className="glass border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 min-w-0 flex-1">
                                    <span className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ background: colorFor(t.subject) }} />
                                    <div className="min-w-0">
                                      <div className="font-medium text-sm">{t.title}</div>
                                      {t.subject && <div className="text-xs text-muted-foreground">{t.subject}</div>}
                                      {t.due_date && (
                                        <div className={cn('inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px]',
                                          overdue ? 'bg-red-500/15 text-red-400' : 'bg-secondary text-muted-foreground')}>
                                          <Calendar className="h-3 w-3" /> {new Date(t.due_date).toLocaleDateString('fr-FR')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <button onClick={() => del(t.id)} className="opacity-50 hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle tâche</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full glass border-0 rounded-md px-3 py-2 text-sm">
              <option value="">Sans matière</option>
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <DialogFooter><Button variant="hero" onClick={add}>Créer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
