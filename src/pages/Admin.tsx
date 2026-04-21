import { useState, useEffect } from 'react';
import { Logo } from '@/components/shared/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Users, FileText, Trash2, Plus, Edit2, Search, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Plan } from '@/lib/constants';
import { PLAN_LABELS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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
        if (next === CORRECT_PIN) {
          sessionStorage.setItem(PIN_KEY, '1');
          onUnlock();
        } else {
          setShake(true);
          setTimeout(() => { setShake(false); setPin(''); }, 500);
        }
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
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={cn('h-4 w-4 rounded-full transition-all', pin.length > i ? 'bg-primary scale-125' : 'bg-muted')} />
          ))}
        </motion.div>

        <div className="grid grid-cols-3 gap-3 max-w-xs">
          {['1','2','3','4','5','6','7','8','9'].map(n => (
            <button key={n} onClick={() => press(n)} className="bento-card !p-0 h-16 font-display text-2xl font-semibold hover:scale-105 active:scale-95 transition-transform">
              {n}
            </button>
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
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border glass sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-xs px-2 py-1 rounded-full bg-coral/20 text-coral font-mono font-semibold">ADMIN</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem(PIN_KEY); window.location.reload(); }}>
            Déverrouiller
          </Button>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('users')} className={cn('pill-tab gap-2 inline-flex items-center', tab === 'users' ? 'gradient-primary text-primary-foreground' : 'glass')}>
            <Users className="h-4 w-4" /> Utilisateurs
          </button>
          <button onClick={() => setTab('ressources')} className={cn('pill-tab gap-2 inline-flex items-center', tab === 'ressources' ? 'gradient-primary text-primary-foreground' : 'glass')}>
            <FileText className="h-4 w-4" /> Ressources
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'users' ? <UsersTab key="u" /> : <RessourcesTab key="r" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('id, username, full_name, email, plan, level, created_at').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setUsers(data as any || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updatePlan = async (id: string, plan: Plan) => {
    const { error } = await supabase.from('profiles').update({ plan }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Plan mis à jour : ${PLAN_LABELS[plan]}`);
    setUsers(u => u.map(x => x.id === id ? { ...x, plan } : x));
  };

  const updateLevel = async (id: string, level: string) => {
    const { error } = await supabase.from('profiles').update({ level }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setUsers(u => u.map(x => x.id === id ? { ...x, level } : x));
  };

  const filtered = users.filter(u =>
    !search || u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    freemium: users.filter(u => u.plan === 'freemium').length,
    lite: users.filter(u => u.plan === 'lite').length,
    premium: users.filter(u => u.plan === 'premium').length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bento-card !p-4"><div className="text-xs text-muted-foreground">Total</div><div className="font-mono text-2xl font-bold">{stats.total}</div></div>
        <div className="bento-card !p-4"><div className="text-xs text-muted-foreground">Freemium</div><div className="font-mono text-2xl font-bold">{stats.freemium}</div></div>
        <div className="bento-card !p-4"><div className="text-xs text-muted-foreground">Lite</div><div className="font-mono text-2xl font-bold text-accent">{stats.lite}</div></div>
        <div className="bento-card !p-4"><div className="text-xs text-muted-foreground">Premium</div><div className="font-mono text-2xl font-bold gradient-text">{stats.premium}</div></div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Rechercher username, nom ou email..." value={search} onChange={e => setSearch(e.target.value)} />
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
                  <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="p-3 font-mono">@{u.username}</td>
                    <td className="p-3">{u.full_name || '—'}</td>
                    <td className="p-3 text-muted-foreground text-xs">{u.email}</td>
                    <td className="p-3">
                      <Select value={u.plan} onValueChange={(v) => updatePlan(u.id, v as Plan)}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freemium">Freemium</SelectItem>
                          <SelectItem value="lite">Lite</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Input
                        defaultValue={u.level || ''}
                        placeholder="ex: Terminale Sciences"
                        className="h-8"
                        onBlur={(e) => { if (e.target.value !== (u.level || '')) updateLevel(u.id, e.target.value); }}
                      />
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
    </motion.div>
  );
}

function RessourcesTab() {
  const [items, setItems] = useState<Ressource[]>([]);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', file: null as File | null });

  const load = async () => {
    const { data } = await supabase.from('ressources').select('*').order('uploaded_at', { ascending: false });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!form.file || !form.title) { toast.error('Titre et fichier requis'); return; }
    if (form.file.type !== 'application/pdf') { toast.error('Seuls les PDF sont acceptés'); return; }
    if (form.file.size > 50 * 1024 * 1024) { toast.error('Max 50 MB'); return; }
    setUploading(true);
    const path = `${Date.now()}_${form.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('ressources').upload(path, form.file, { contentType: 'application/pdf' });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { error: insErr } = await supabase.from('ressources').insert({
      title: form.title, description: form.description || null, subject: form.subject || null, file_url: path,
    });
    setUploading(false);
    if (insErr) { toast.error(insErr.message); return; }
    toast.success('Ressource ajoutée');
    setOpen(false);
    setForm({ title: '', description: '', subject: '', file: null });
    load();
  };

  const del = async (r: Ressource) => {
    if (!confirm(`Supprimer "${r.title}" ?`)) return;
    await supabase.storage.from('ressources').remove([r.file_url]);
    await supabase.from('ressources').delete().eq('id', r.id);
    setItems(x => x.filter(i => i.id !== r.id));
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
            <div className="flex items-start justify-between gap-2 mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <button onClick={() => del(r)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
            <div className="font-display font-semibold">{r.title}</div>
            {r.subject && <div className="text-xs text-accent font-mono mt-1">{r.subject}</div>}
            {r.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</div>}
            <div className="text-[10px] text-muted-foreground mt-3">{new Date(r.uploaded_at).toLocaleDateString('fr-FR')}</div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">Aucune ressource</div>}
      </div>
    </motion.div>
  );
}
