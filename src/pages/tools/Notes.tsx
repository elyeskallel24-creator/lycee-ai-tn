import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Bold, Italic, Heading1, Heading2, List, ListOrdered, Code, Quote, Search, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Note {
  id: string; title: string; content: string | null; subject: string | null; updated_at: string;
}

export default function Notes() {
  useActivityLog('notes');
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
    setNotes((data as Note[]) || []);
    if (!activeId && data?.length) setActiveId(data[0].id);
  }, [user, activeId]);
  useEffect(() => { load(); }, [user]);

  const active = notes.find(n => n.id === activeId);

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Commence à écrire...' })],
    content: active?.content || '',
    editorProps: { attributes: { class: 'prose prose-invert max-w-none min-h-[60vh] focus:outline-none' } },
  }, [activeId]);

  // autosave (debounced)
  useEffect(() => {
    if (!editor || !active) return;
    let t: any;
    const handler = () => {
      setSaveState('saving');
      clearTimeout(t);
      t = setTimeout(async () => {
        const html = editor.getHTML();
        await supabase.from('notes').update({ content: html, updated_at: new Date().toISOString() }).eq('id', active.id);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 1500);
      }, 2000);
    };
    editor.on('update', handler);
    return () => { editor.off('update', handler); clearTimeout(t); };
  }, [editor, active]);

  const createNote = async () => {
    if (!user) return;
    const { data } = await supabase.from('notes').insert({ user_id: user.id, title: 'Sans titre', content: '' }).select().single();
    if (data) { await load(); setActiveId((data as Note).id); }
  };
  const updateTitle = async (id: string, title: string) => {
    setNotes(ns => ns.map(n => n.id === id ? { ...n, title } : n));
    await supabase.from('notes').update({ title }).eq('id', id);
  };
  const updateSubject = async (id: string, subject: string) => {
    setNotes(ns => ns.map(n => n.id === id ? { ...n, subject } : n));
    await supabase.from('notes').update({ subject: subject || null }).eq('id', id);
  };
  const del = async (id: string) => {
    if (!confirm('Supprimer cette note ?')) return;
    await supabase.from('notes').delete().eq('id', id);
    if (activeId === id) setActiveId(null);
    load();
  };

  const subjects = useMemo(() => Array.from(new Set(notes.map(n => n.subject).filter(Boolean))) as string[], [notes]);
  const filtered = notes.filter(n =>
    (subjectFilter === 'all' || n.subject === subjectFilter) &&
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell
      title="Notes"
      subtitle="Éditeur riche avec auto-sauvegarde"
      actions={<Button variant="hero" onClick={createNote} className="gap-2"><Plus className="h-4 w-4" /> Nouvelle note</Button>}
    >
      <div className="grid md:grid-cols-[280px_1fr] gap-4 min-h-[70vh]">
        <aside className="bento-card !p-3 space-y-2 max-h-[75vh] overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
          </div>
          {subjects.length > 0 && (
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="w-full glass border-0 rounded-md px-2 py-2 text-sm">
              <option value="all">Toutes les matières</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <div className="space-y-1">
            {filtered.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-6">Aucune note</div>
            ) : filtered.map(n => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={cn('w-full text-left p-2 rounded-lg transition-colors', activeId === n.id ? 'bg-primary/15 text-primary' : 'hover:bg-secondary/50')}
              >
                <div className="font-medium truncate text-sm">{n.title || 'Sans titre'}</div>
                {n.subject && <div className="text-xs text-accent truncate">{n.subject}</div>}
              </button>
            ))}
          </div>
        </aside>

        {active && editor ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card flex flex-col">
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <Input value={active.title} onChange={(e) => updateTitle(active.id, e.target.value)} className="text-lg font-semibold flex-1" />
              <Input placeholder="Matière" value={active.subject ?? ''} onChange={(e) => updateSubject(active.id, e.target.value)} className="sm:w-40" />
              <Button variant="ghost" size="icon" onClick={() => del(active.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-border">
              <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></ToolBtn>
              <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></ToolBtn>
              <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></ToolBtn>
              <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></ToolBtn>
              <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></ToolBtn>
              <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></ToolBtn>
              <ToolBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="h-4 w-4" /></ToolBtn>
              <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></ToolBtn>
              <div className="ml-auto flex items-center text-xs text-muted-foreground gap-1">
                {saveState === 'saving' && <><Loader2 className="h-3 w-3 animate-spin" /> Sauvegarde…</>}
                {saveState === 'saved' && <><Check className="h-3 w-3 text-accent" /> Sauvegardé</>}
              </div>
            </div>
            <EditorContent editor={editor} />
          </motion.div>
        ) : (
          <EmptyState emoji="✍️" title="Tes notes apparaîtront ici" description="Crée-en une nouvelle pour commencer." action={<Button variant="hero" onClick={createNote}>Créer</Button>} />
        )}
      </div>
    </PageShell>
  );
}

const ToolBtn = ({ children, active, onClick }: any) => (
  <button onClick={onClick} className={cn('p-2 rounded-md transition-colors', active ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/60')}>{children}</button>
);
