import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Highlighter, StickyNote, MousePointer2, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
// @ts-ignore - pdfjs-dist resolves at runtime via Vite
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
// @ts-ignore
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface Resource { id: string; title: string; subject: string | null; file_url: string; }
interface Annotation { id: string; type: 'highlight' | 'note'; page: number; x: number; y: number; width?: number; height?: number; comment?: string; }

export default function Annotator() {
  useActivityLog('annotator');
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [active, setActive] = useState<Resource | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('ressources').select('id,title,subject,file_url').order('uploaded_at', { ascending: false });
      setResources((data as Resource[]) || []);
    })();
  }, []);

  if (active) return <PdfWorkspace resource={active} onBack={() => setActive(null)} userId={user?.id} />;

  return (
    <PageShell title="Annotateur PDF" subtitle="Surligne et annote les ressources">
      {resources.length === 0 ? (
        <EmptyState emoji="📄" title="Aucun PDF disponible" description="L'admin n'a encore mis aucune ressource en ligne." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <motion.button
              key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => setActive(r)}
              className="bento-card text-left hover:scale-[1.02] transition-transform"
            >
              <div className="aspect-[3/4] rounded-lg gradient-primary mb-3 flex items-center justify-center text-primary-foreground text-4xl font-display">PDF</div>
              <div className="font-semibold">{r.title}</div>
              {r.subject && <div className="text-xs text-accent">{r.subject}</div>}
            </motion.button>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function PdfWorkspace({ resource, onBack, userId }: { resource: Resource; onBack: () => void; userId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [tool, setTool] = useState<'select' | 'highlight' | 'note'>('select');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annoRowId, setAnnoRowId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [activeNote, setActiveNote] = useState<Annotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // get signed URL
        const path = resource.file_url;
        const { data: signed } = await supabase.storage.from('ressources').createSignedUrl(path, 60 * 60);
        const url = signed?.signedUrl ?? path;
        const doc = await pdfjsLib.getDocument(url).promise;
        setPdf(doc); setPages(doc.numPages);

        if (userId) {
          const { data } = await supabase.from('annotations').select('id,data').eq('ressource_id', resource.id).eq('user_id', userId).maybeSingle();
          if (data) {
            setAnnoRowId(data.id);
            setAnnotations((data.data as any) || []);
          }
        }
      } catch (e: any) {
        toast.error('Impossible de charger le PDF');
      } finally {
        setLoading(false);
      }
    })();
  }, [resource.id, userId]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    (async () => {
      const p = await pdf.getPage(page);
      const viewport = p.getViewport({ scale: 1.4 });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await p.render({ canvasContext: ctx, viewport, canvas }).promise;
    })();
  }, [pdf, page]);

  const persist = async (next: Annotation[]) => {
    if (!userId) return;
    if (annoRowId) {
      await supabase.from('annotations').update({ data: next as any, updated_at: new Date().toISOString() }).eq('id', annoRowId);
    } else {
      const { data } = await supabase.from('annotations').insert({ user_id: userId, ressource_id: resource.id, data: next as any }).select('id').single();
      if (data) setAnnoRowId(data.id);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (tool === 'select') return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (tool === 'note') {
      const ann: Annotation = { id: crypto.randomUUID(), type: 'note', page, x, y, comment: '' };
      const next = [...annotations, ann];
      setAnnotations(next); persist(next); setActiveNote(ann);
    } else {
      setDrag({ x, y });
    }
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!drag || tool !== 'highlight') { setDrag(null); return; }
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x2 = e.clientX - rect.left, y2 = e.clientY - rect.top;
    const ann: Annotation = {
      id: crypto.randomUUID(), type: 'highlight', page,
      x: Math.min(drag.x, x2), y: Math.min(drag.y, y2),
      width: Math.abs(x2 - drag.x), height: Math.abs(y2 - drag.y),
    };
    if ((ann.width || 0) > 8 && (ann.height || 0) > 8) {
      const next = [...annotations, ann];
      setAnnotations(next); persist(next);
    }
    setDrag(null);
  };
  const removeAnno = (id: string) => {
    const next = annotations.filter(a => a.id !== id);
    setAnnotations(next); persist(next); setActiveNote(null);
  };
  const updateNote = (id: string, comment: string) => {
    const next = annotations.map(a => a.id === id ? { ...a, comment } : a);
    setAnnotations(next); persist(next);
  };

  const pageAnnos = annotations.filter(a => a.page === page);

  return (
    <div className="container py-4 max-w-6xl">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
        <div className="font-display font-semibold ml-2">{resource.title}</div>
        <div className="ml-auto flex items-center gap-1 glass rounded-xl p-1">
          <Button variant={tool === 'select' ? 'hero' : 'ghost'} size="icon" onClick={() => setTool('select')}><MousePointer2 className="h-4 w-4" /></Button>
          <Button variant={tool === 'highlight' ? 'hero' : 'ghost'} size="icon" onClick={() => setTool('highlight')}><Highlighter className="h-4 w-4" /></Button>
          <Button variant={tool === 'note' ? 'hero' : 'ghost'} size="icon" onClick={() => setTool('note')}><StickyNote className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-mono text-sm px-2">{page} / {pages}</span>
          <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(pages, p + 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="bento-card !p-2 overflow-auto max-h-[80vh]">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div ref={containerRef} className="relative inline-block" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
            <canvas ref={canvasRef} className="block max-w-full" />
            {pageAnnos.map(a => a.type === 'highlight' ? (
              <div key={a.id}
                onContextMenu={(e) => { e.preventDefault(); removeAnno(a.id); }}
                style={{ position: 'absolute', left: a.x, top: a.y, width: a.width, height: a.height, background: 'rgba(255, 230, 0, 0.35)', pointerEvents: tool === 'select' ? 'auto' : 'none' }}
                title="Clic droit pour supprimer"
              />
            ) : (
              <button key={a.id}
                onClick={() => setActiveNote(a)}
                style={{ position: 'absolute', left: a.x - 12, top: a.y - 12 }}
                className="h-6 w-6 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs shadow-lg"
              >📝</button>
            ))}
          </div>
        )}
      </div>

      {activeNote && (
        <div className="fixed bottom-6 right-6 w-80 bento-card z-40">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm">Note</div>
            <button onClick={() => removeAnno(activeNote.id)}><Trash2 className="h-4 w-4" /></button>
          </div>
          <textarea
            autoFocus value={activeNote.comment ?? ''}
            onChange={(e) => { setActiveNote({ ...activeNote, comment: e.target.value }); updateNote(activeNote.id, e.target.value); }}
            className="w-full glass border-0 rounded-md p-2 text-sm min-h-[100px]" placeholder="Ta note…"
          />
          <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setActiveNote(null)}>Fermer</Button>
        </div>
      )}
    </div>
  );
}
