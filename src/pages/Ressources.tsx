import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Download, Search, Loader2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Ressource { id: string; title: string; description: string | null; subject: string | null; file_url: string; uploaded_at: string; }

export default function Ressources() {
  const { user } = useAuth();
  const [items, setItems] = useState<Ressource[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('ressources').select('*').order('uploaded_at', { ascending: false });
      setItems(data || []);
      setLoading(false);
    })();
  }, []);

  const subjects = Array.from(new Set(items.map(i => i.subject).filter(Boolean) as string[]));
  const filtered = items.filter(i =>
    (!q || i.title.toLowerCase().includes(q.toLowerCase())) &&
    (subject === 'all' || i.subject === subject)
  );

  const open = async (r: Ressource) => {
    const { data, error } = await supabase.storage.from('ressources').createSignedUrl(r.file_url, 3600);
    if (error) { toast.error('Impossible d\'ouvrir le fichier'); return; }
    window.open(data.signedUrl, '_blank');
    if (user) supabase.from('activity_log').insert({ user_id: user.id, activity_type: 'ressource_view' });
  };

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Ressources</h1>
      <p className="text-muted-foreground mb-6">Bibliothèque de PDF pour tes études</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher un titre..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSubject('all')} className={`pill-tab ${subject === 'all' ? 'gradient-primary text-primary-foreground' : 'glass'}`}>Tout</button>
          {subjects.map(s => (
            <button key={s} onClick={() => setSubject(s)} className={`pill-tab ${subject === s ? 'gradient-primary text-primary-foreground' : 'glass'}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-3 opacity-30" />
          Aucune ressource pour le moment
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bento-card group">
              <div className="h-32 mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <div className="font-display text-lg font-semibold">{r.title}</div>
              {r.subject && <div className="text-xs text-accent font-mono mt-1">{r.subject}</div>}
              {r.description && <div className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.description}</div>}
              <div className="flex gap-2 mt-4">
                <Button variant="hero" size="sm" className="flex-1 gap-1" onClick={() => open(r)}>
                  <ExternalLink className="h-3 w-3" /> Ouvrir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
