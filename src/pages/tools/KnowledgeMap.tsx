import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Node { id: string; title: string; subject: string | null; parent_id: string | null; is_completed: boolean; }

export default function KnowledgeMap() {
  useActivityLog('knowledge-map');
  const { user } = useAuth();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [open, setOpen] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [title, setTitle] = useState(''); const [subject, setSubject] = useState('');

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('knowledge_nodes').select('*').eq('user_id', user.id);
    setNodes((data as Node[]) || []);
  };
  useEffect(() => { load(); }, [user]);

  const addNode = async () => {
    if (!user || !title.trim()) return;
    await supabase.from('knowledge_nodes').insert({ user_id: user.id, title: title.trim(), subject: subject || null, parent_id: parentId, is_completed: false });
    setTitle(''); setSubject(''); setOpen(false);
    load();
  };

  const toggle = async (n: Node) => {
    await supabase.from('knowledge_nodes').update({ is_completed: !n.is_completed }).eq('id', n.id);
    setNodes(ns => ns.map(x => x.id === n.id ? { ...x, is_completed: !x.is_completed } : x));
  };

  const del = async (id: string) => {
    if (!confirm('Supprimer ce nœud et tous ses enfants ?')) return;
    // recursive delete
    const collect = (root: string): string[] => {
      const children = nodes.filter(n => n.parent_id === root).flatMap(c => collect(c.id));
      return [root, ...children];
    };
    const ids = collect(id);
    await supabase.from('knowledge_nodes').delete().in('id', ids);
    load();
  };

  const roots = nodes.filter(n => !n.parent_id);
  const childrenOf = (id: string) => nodes.filter(n => n.parent_id === id);

  return (
    <PageShell
      title="Carte de connaissances"
      subtitle="Visualise et coche tes leçons"
      actions={<Button variant="hero" onClick={() => { setParentId(null); setOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> Sujet racine</Button>}
    >
      {roots.length === 0 ? (
        <EmptyState emoji="🌳" title="Pas encore de carte" description="Crée ton premier sujet racine pour commencer ton arbre." />
      ) : (
        <div className="space-y-6">
          {roots.map(root => {
            const all = [root, ...nodes.filter(n => n.parent_id === root.id || nodes.some(p => p.id === n.parent_id && p.parent_id === root.id))];
            const completed = all.filter(n => n.is_completed).length;
            return (
              <motion.div key={root.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-display text-lg font-semibold">{root.title}</div>
                  <div className="text-sm text-muted-foreground">{completed}/{all.length} maîtrisées</div>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-4">
                  <div className="h-full gradient-primary" style={{ width: `${(completed / all.length) * 100}%` }} />
                </div>
                <NodeRow node={root} childrenOf={childrenOf} onToggle={toggle} onDelete={del} onAddChild={(id) => { setParentId(id); setOpen(true); }} depth={0} />
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{parentId ? 'Sous-leçon' : 'Sujet racine'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Matière" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <DialogFooter><Button variant="hero" onClick={addNode}>Créer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function NodeRow({ node, childrenOf, onToggle, onDelete, onAddChild, depth }: any) {
  const kids = childrenOf(node.id);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 group" style={{ paddingLeft: depth * 20 }}>
        <button onClick={() => onToggle(node)} className={cn('h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all', node.is_completed ? 'gradient-primary border-transparent' : 'border-border hover:border-primary')}>
          {node.is_completed && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
        </button>
        <div className={cn('flex-1 px-3 py-2 rounded-lg glass border border-border', node.is_completed && 'opacity-60')}>
          <div className="font-medium text-sm">{node.title}</div>
          {node.subject && <div className="text-xs text-accent">{node.subject}</div>}
        </div>
        <button onClick={() => onAddChild(node.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-secondary"><Plus className="h-3.5 w-3.5" /></button>
        <button onClick={() => onDelete(node.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-secondary"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
      {kids.map((k: any) => <NodeRow key={k.id} node={k} childrenOf={childrenOf} onToggle={onToggle} onDelete={onDelete} onAddChild={onAddChild} depth={depth + 1} />)}
    </div>
  );
}
