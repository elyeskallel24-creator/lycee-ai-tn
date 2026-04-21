import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Bookmark {
  id: string; url: string; title: string | null; description: string | null; thumbnail: string | null; subject: string | null; created_at: string;
}

export default function Bookmarks() {
  useActivityLog('bookmarks');
  const { user } = useAuth();
  const [items, setItems] = useState<Bookmark[]>([]);
  const [url, setUrl] = useState('');
  const [subject, setSubject] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setItems((data as Bookmark[]) || []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !url.trim()) return;
    setLoading(true);
    let title: string | null = null, description: string | null = null, thumbnail: string | null = null;
    let finalUrl = url.trim();
    try {
      const { data, error } = await supabase.functions.invoke('fetch-og', { body: { url: finalUrl } });
      if (error) throw error;
      if (data && !data.error) {
        title = data.title;
        description = data.description;
        thumbnail = data.image;
        finalUrl = data.url || finalUrl;
      }
    } catch {
      // fallback below
    }
    if (!title) {
      try { title = new URL(finalUrl).hostname; } catch { title = finalUrl; }
      thumbnail = `https://www.google.com/s2/favicons?domain=${title}&sz=128`;
    }
    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id, url: finalUrl, title, description, thumbnail, subject: subject || null,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setUrl(''); setSubject('');
    load();
  };

  const del = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id);
    load();
  };

  const subjects = useMemo(() => Array.from(new Set(items.map(b => b.subject).filter(Boolean))) as string[], [items]);
  const filtered = filter === 'all' ? items : items.filter(b => b.subject === filter);

  return (
    <PageShell title="Marque-pages" subtitle="Garde tes ressources web préférées">
      <div className="bento-card mb-6 flex flex-col sm:flex-row gap-2">
        <Input placeholder="https://exemple.com" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} className="flex-1" />
        <Input placeholder="Matière (optionnel)" value={subject} onChange={(e) => setSubject(e.target.value)} className="sm:w-48" />
        <Button variant="hero" onClick={add} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Ajouter
        </Button>
      </div>

      {subjects.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={() => setFilter('all')} className={`pill-tab ${filter === 'all' ? 'gradient-primary text-primary-foreground' : 'glass'}`}>Tous</button>
          {subjects.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`pill-tab ${filter === s ? 'gradient-primary text-primary-foreground' : 'glass'}`}>{s}</button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState emoji="🔖" title="Aucun marque-page" description="Colle un lien pour le sauvegarder." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b, i) => (
            <motion.a
              key={b.id} href={b.url} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bento-card group block overflow-hidden !p-0 hover:scale-[1.02] transition-transform"
            >
              <div className="aspect-video bg-secondary relative overflow-hidden">
                {b.thumbnail && <img src={b.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                <button
                  onClick={(e) => { e.preventDefault(); del(b.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                ><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="p-4">
                <div className="font-display font-semibold line-clamp-1">{b.title}</div>
                {b.description && <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{b.description}</div>}
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <ExternalLink className="h-3 w-3 text-accent" />
                  <span className="text-muted-foreground truncate">{(() => { try { return new URL(b.url).hostname; } catch { return b.url; } })()}</span>
                  {b.subject && <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/15 text-primary">{b.subject}</span>}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </PageShell>
  );
}
