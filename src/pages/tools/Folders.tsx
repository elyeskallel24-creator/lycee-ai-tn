import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, FolderOpen } from 'lucide-react';

interface Subject { id: string; name: string; hex_color: string; }

const SWATCHES = ['#6C3BFF', '#4F46E5', '#00FFB2', '#FF6B6B', '#FFD60A', '#06B6D4', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'];

export default function Folders() {
  useActivityLog('folders');
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [counts, setCounts] = useState<Record<string, { notes: number; tasks: number; bookmarks: number }>>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [name, setName] = useState(''); const [color, setColor] = useState('#6C3BFF');

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('subjects').select('*').eq('user_id', user.id).order('name');
    const subs = (data as Subject[]) || [];
    setSubjects(subs);
    // counts
    const c: Record<string, any> = {};
    await Promise.all(subs.map(async s => {
      const [{ count: n }, { count: t }, { count: b }] = await Promise.all([
        supabase.from('notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('subject', s.name),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('subject', s.name),
        supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('subject', s.name),
      ]);
      c[s.id] = { notes: n ?? 0, tasks: t ?? 0, bookmarks: b ?? 0 };
    }));
    setCounts(c);
  };
  useEffect(() => { load(); }, [user]);

  const save = async () => {
    if (!user || !name.trim()) return;
    if (editing) {
      await supabase.from('subjects').update({ name: name.trim(), hex_color: color }).eq('id', editing.id);
    } else {
      await supabase.from('subjects').insert({ user_id: user.id, name: name.trim(), hex_color: color });
    }
    setName(''); setColor('#6C3BFF'); setEditing(null); setOpen(false);
    load();
  };
  const del = async (s: Subject) => {
    if (!confirm(`Supprimer "${s.name}" ? Les éléments associés ne seront pas supprimés.`)) return;
    await supabase.from('subjects').delete().eq('id', s.id);
    load();
  };

  return (
    <PageShell
      title="Dossiers couleurs"
      subtitle="Organise tes matières avec des couleurs"
      actions={<Button variant="hero" onClick={() => { setEditing(null); setName(''); setColor('#6C3BFF'); setOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> Matière</Button>}
    >
      {subjects.length === 0 ? (
        <EmptyState emoji="🎨" title="Aucune matière" description="Crée ta première matière pour colorer tes notes, tâches et marque-pages." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s, i) => {
            const c = counts[s.id] || { notes: 0, tasks: 0, bookmarks: 0 };
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bento-card relative overflow-hidden cursor-pointer group"
                onClick={() => { setEditing(s); setName(s.name); setColor(s.hex_color); setOpen(true); }}
              >
                <div className="absolute inset-0 opacity-15" style={{ background: `linear-gradient(135deg, ${s.hex_color}, transparent)` }} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: s.hex_color }}>
                      <FolderOpen className="h-6 w-6 text-white" />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); del(s); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="font-display font-semibold mt-3">{s.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.notes} notes · {c.tasks} tâches · {c.bookmarks} marque-pages</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Modifier' : 'Nouvelle matière'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nom (ex. Mathématiques)" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map(s => (
                <button key={s} onClick={() => setColor(s)} className={`h-8 w-8 rounded-lg ring-2 transition-all ${color === s ? 'ring-foreground' : 'ring-transparent'}`} style={{ background: s }} />
              ))}
              <Input value={color} onChange={(e) => setColor(e.target.value)} className="w-24 font-mono text-xs" />
            </div>
          </div>
          <DialogFooter><Button variant="hero" onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
