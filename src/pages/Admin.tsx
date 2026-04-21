import { useState, useEffect, useMemo } from 'react';
import { Logo } from '@/components/shared/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Users, FileText, Trash2, Search, Loader2, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Plan } from '@/lib/constants';
import { PLAN_LABELS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { PdfThumb } from '@/components/shared/PdfThumb';

const PIN_KEY = 'lyceeai_admin_pin';
const CORRECT_PIN = '5621';

interface UserRow {
  id: string; username: string; full_name: string | null; email: string | null;
  plan: Plan; level: string | null; created_at: string;
}
interface Ressource {
  id: string; title: string; description: string | null; subject: string | null;
  file_url: string; uploaded_at: string;
}

const PinGate = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const press = (n: string) => {
    if (pin.length >= 4) return;
    const next = pin + n;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === CORRECT_PIN) { sessionStorage.setItem(PIN_KEY, '1'); onUnlock(); }
        else { setShake(true); setTimeout(() => { setShake(false); setPin(''); }, 500); }
      }, 150);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />
      <div className="relative">
        <Logo size="lg" to="" className="mb-12 justify-center" />
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
            <Lock className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <p className="text-center text-muted-foreground mb-6">Code admin</p>
        <motion.div animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }} className="flex gap-3 justify-center mb-8">
          {[0, 1, 2, 3].map(i => <div key={i} className={cn('h-4 w-4 rounded-full transition-all', pin.length > i ? 'bg-primary scale-125' : 'bg-muted')} />)}
        </motion.div>
        <div className="grid grid-cols-3 gap-3 max-w-xs">
          {['1','2','3','4','5','6','7','8','9'].map(n => (
            <button key={n} onClick={() => press(n)} className="bento-card !p-0 h-16 font-display text-2xl font-semibold hover:scale-105 active:scale-95 transition-transform">{n}</button>
          ))}
          <div />
          <button onClick={() => press('0')} className="bento-card !p-0 h-16 font-display text-2xl font-semibold hover:scale-105 active:scale-95 transition-transform">0</button>
          <button onClick={() => setPin(p => p.slice(0, -1))} className="h-16 flex items-center justify-center text-muted-foreground hover:text-foreground">⌫</button>
        </div>
      </div>
    </div>
  );
};

export default function Admin() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(PIN_KEY) === '1');
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;
  return <AdminPanel />;
}

function AdminPanel() {
  const [tab, setTab] = useState<'users' | 'ressources'>('users');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: u }, { data: r }] = await Promise.all([
      supabase.from('profiles').select('id, username, full_name, email, plan, level, created_at').order('created_at', { ascending: false }),
      supabase.from('ressources').select('*').order('uploaded_at', { ascending: false }),
    ]);
    setUsers((u as any) || []);
    setRessources(r || []);
    setLoading(false);
  };
  useEffect(() => { loadAll(); }, []);

  const stats = useMemo(() => ({
    total: users.length,
    freemium: users.filter(u => u.plan === 'freemium').length,
    lite: users.filter(u => u.plan === 'lite').length,
    premium: users.filter(u => u.plan === 'premium').length,
    pdfs: ressources.length,
  }), [users, ressources]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border glass sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-xs px-2 py-1 rounded-full bg-coral/20 text-coral font-mono font-semibold">ADMIN</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem(PIN_KEY); window.location.reload(); }}>Déverrouiller</Button>
        </div>
      </header>

      <div className="container py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { k: 'Total Users', v: stats.total },
            { k: 'Freemium', v: stats.freemium },
            { k: 'Lite', v: stats.lite, accent: 'text-accent' },
            { k: 'Premium', v: stats.premium, accent: 'gradient-text' },
            { k: 'PDFs', v: stats.pdfs },
          ].map(s => (
            <div key={s.k} className="bento-card !p-4">
              <div className="text-xs text-muted-foreground">{s.k}</div>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <div className={cn('font-mono text-2xl font-bold', (s as any).accent)}>{s.v}</div>}
            </div>
          ))}
        </div>

        {/* Recent signups */}
        {!loading && users.length > 0 && (
          <div className="bento-card !p-4 mb-6">
            <div className="text-xs text-muted-foreground mb-2">Activité récente — derniers inscrits</div>
            <div className="grid sm:grid-cols-5 gap-2 text-sm">
              {users.slice(0, 5).map(u => (
                <a key={u.id} href={`#user-${u.id}`} className="glass rounded-xl p-2 hover:border-primary/50 transition-all">
                  <div className="font-mono truncate">@{u.username}</div>
                  <div className="text-[10px] text-muted-foreground">{PLAN_LABELS[u.plan]} · {new Date(u.created_at).toLocaleDateString('fr-FR')}</div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('users')} className={cn('pill-tab gap-2 inline-flex items-center', tab === 'users' ? 'gradient-primary text-primary-foreground' : 'glass')}>
            <Users className="h-4 w-4" /> Utilisateurs
          </button>
          <button onClick={() => setTab('ressources')} className={cn('pill-tab gap-2 inline-flex items-center', tab === 'ressources' ? 'gradient-primary text-primary-foreground' : 'glass')}>
            <FileText className="h-4 w-4" /> Ressources
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'users'
            ? <UsersTab key="u" users={users} setUsers={setUsers} loading={loading} />
            : <RessourcesTab key="r" items={ressources} setItems={setRessources} reload={loadAll} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function UsersTab({ users, setUsers, loading }: { users: UserRow[]; setUsers: (u: UserRow[]) => void; loading: boolean }) {
  const [search, setSearch] = useState('');
  const [pendingPlan, setPendingPlan] = useState<{ user: UserRow; plan: Plan } | null>(null);

  const updatePlan = async (id: string, plan: Plan) => {
    const { error } = await supabase.from('profiles').update({ plan }).eq('id', id);
    if (error) { toast.error('Erreur de connexion. Réessaie dans un moment. 🔌'); return; }
    toast.success(`Plan mis à jour : ${PLAN_LABELS[plan]}`);
    setUsers(users.map(x => x.id === id ? { ...x, plan } : x));
  };
  const updateLevel = async (id: string, level: string) => {
    const { error } = await supabase.from('profiles').update({ level }).eq('id', id);
    if (error) { toast.error('Erreur de connexion. Réessaie dans un moment. 🔌'); return; }
    setUsers(users.map(x => x.id === id ? { ...x, level } : x));
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.username?.toLowerCase().includes(s) || u.full_name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
  });

  const exportCsv = () => {
    const header = ['username', 'full_name', 'email', 'plan', 'level', 'created_at'];
    const rows = users.map(u => header.map(h => {
      const v = (u as any)[h] ?? '';
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    }).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lyceeai_users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher username, nom ou email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCsv}><Download className="h-4 w-4" /> Exporter CSV</Button>
      </div>

      <div className="bento-card !p-0 overflow-hidden">
        {loading ? <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="text-left p-3 font-medium">Username</th>
                  <th className="text-left p-3 font-medium">Nom</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium w-32">Plan</th>
                  <th className="text-left p-3 font-medium w-48">Niveau</th>
                  <th className="text-left p-3 font-medium">Inscrit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr id={`user-${u.id}`} key={u.id} className="border-b border-border/50 hover:bg-secondary/20 target:bg-primary/10">
                    <td className="p-3 font-mono">@{u.username}</td>
                    <td className="p-3">{u.full_name || '—'}</td>
                    <td className="p-3 text-muted-foreground text-xs">{u.email}</td>
                    <td className="p-3">
                      <Select value={u.plan} onValueChange={(v) => setPendingPlan({ user: u, plan: v as Plan })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freemium">Freemium</SelectItem>
                          <SelectItem value="lite">Lite</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Input defaultValue={u.level || ''} placeholder="ex: Terminale Sciences" className="h-8"
                        onBlur={(e) => { if (e.target.value !== (u.level || '')) updateLevel(u.id, e.target.value); }} />
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Aucun utilisateur</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingPlan} onOpenChange={(o) => !o && setPendingPlan(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le changement de plan</AlertDialogTitle>
            <AlertDialogDescription>
              Changer le plan de <span className="text-foreground font-mono">@{pendingPlan?.user.username}</span> à <span className="text-foreground font-semibold">{pendingPlan && PLAN_LABELS[pendingPlan.plan]}</span> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pendingPlan) { updatePlan(pendingPlan.user.id, pendingPlan.plan); setPendingPlan(null); } }}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

function RessourcesTab({ items, setItems, reload }: { items: Ressource[]; setItems: (i: Ressource[]) => void; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', file: null as File | null });
  const [pendingDelete, setPendingDelete] = useState<Ressource | null>(null);

  const upload = async () => {
    if (!form.file || !form.title) { toast.error('Titre et fichier requis'); return; }
    if (form.file.type !== 'application/pdf') { toast.error('Seuls les PDF sont acceptés'); return; }
    if (form.file.size > 50 * 1024 * 1024) { toast.error('Max 50 MB'); return; }
    setUploading(true);
    const path = `${Date.now()}_${form.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('ressources').upload(path, form.file, { contentType: 'application/pdf' });
    if (upErr) { toast.error('Erreur de connexion. Réessaie dans un moment. 🔌'); setUploading(false); return; }
    const { error: insErr } = await supabase.from('ressources').insert({
      title: form.title, description: form.description || null, subject: form.subject || null, file_url: path,
    });
    setUploading(false);
    if (insErr) { toast.error('Erreur de connexion. Réessaie dans un moment. 🔌'); return; }
    toast.success('Ressource ajoutée');
    setOpen(false);
    setForm({ title: '', description: '', subject: '', file: null });
    reload();
  };

  const del = async (r: Ressource) => {
    await supabase.storage.from('ressources').remove([r.file_url]);
    const { error } = await supabase.from('ressources').delete().eq('id', r.id);
    if (error) { toast.error('Erreur de connexion. Réessaie dans un moment. 🔌'); return; }
    setItems(items.filter(i => i.id !== r.id));
    toast.success('Supprimé');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex justify-between items-center mb-4">
        <div><div className="font-mono text-2xl font-bold">{items.length}</div><div className="text-xs text-muted-foreground">ressources</div></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="hero" className="gap-2"><Upload className="h-4 w-4" /> Uploader un PDF</Button></DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader><DialogTitle>Nouvelle ressource</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titre</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Matière</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Maths, Physique..." /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Fichier PDF (max 50 MB)</Label><Input type="file" accept="application/pdf" onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })} /></div>
              <Button variant="hero" className="w-full" onClick={upload} disabled={uploading}>
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />} Uploader
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(r => (
          <div key={r.id} className="bento-card group">
            <div className="aspect-[4/3] mb-3 rounded-xl bg-muted/50 overflow-hidden flex items-center justify-center relative">
              <PdfThumb filePath={r.file_url} className="max-w-full max-h-full" />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold truncate">{r.title}</div>
                {r.subject && <div className="text-xs text-accent font-mono mt-1">{r.subject}</div>}
              </div>
              <button onClick={() => setPendingDelete(r)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
            {r.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</div>}
            <div className="text-[10px] text-muted-foreground mt-3">{new Date(r.uploaded_at).toLocaleDateString('fr-FR')}</div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">Aucune ressource</div>}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce PDF définitivement ?</AlertDialogTitle>
            <AlertDialogDescription>« {pendingDelete?.title} » sera supprimé pour tous les utilisateurs. Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (pendingDelete) { del(pendingDelete); setPendingDelete(null); } }}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
