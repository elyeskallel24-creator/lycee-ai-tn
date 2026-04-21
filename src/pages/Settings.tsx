import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppearance, ACCENT_PRESETS } from '@/hooks/useAppearance';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Check, Moon, Sun, Bell, KeyRound, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { profile, user, refreshProfile, signOut } = useAuth();
  const { theme, accent, setTheme, setAccent } = useAppearance();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('lyceeai_notif') === '1');

  useEffect(() => {
    if (profile) { setFullName(profile.full_name || ''); setUsername(profile.username || ''); }
  }, [profile]);

  useEffect(() => {
    if (!username || username === profile?.username) { setUsernameStatus('idle'); return; }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) { setUsernameStatus('invalid'); return; }
    setUsernameStatus('checking');
    const t = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
      setUsernameStatus(data ? 'taken' : 'available');
    }, 500);
    return () => clearTimeout(t);
  }, [username, profile?.username]);

  const save = async () => {
    if (!user) return;
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') { toast.error('Nom d\'utilisateur invalide'); return; }
    setSaving('saving');
    const { error } = await supabase.from('profiles').update({ full_name: fullName, username }).eq('id', user.id);
    if (error) { toast.error('Erreur de connexion. Réessaie dans un moment. 🔌'); setSaving('idle'); return; }
    await refreshProfile();
    setSaving('saved');
    setTimeout(() => setSaving('idle'), 2000);
  };

  const toggleNotifications = async (v: boolean) => {
    if (v && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { toast.error('Permission refusée'); return; }
    }
    setNotifications(v);
    localStorage.setItem('lyceeai_notif', v ? '1' : '0');
    toast.success(v ? 'Notifications activées' : 'Notifications désactivées');
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/auth` });
    if (error) toast.error('Erreur de connexion. Réessaie dans un moment. 🔌');
    else toast.success('Email envoyé ! Vérifie ta boîte de réception 📬');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="container py-6 md:py-10 max-w-3xl">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">Paramètres</h1>

      {/* Profile */}
      <section className="bento-card mb-5">
        <h2 className="font-display text-xl font-bold mb-4">Profil</h2>
        <div className="space-y-3">
          <div>
            <Label>Nom complet</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>Nom d'utilisateur</Label>
            <div className="relative">
              <Input value={username} onChange={e => setUsername(e.target.value)} />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {usernameStatus === 'available' && <Check className="h-4 w-4 text-accent" />}
              </div>
            </div>
            {usernameStatus === 'taken' && <p className="text-xs text-destructive mt-1">Déjà pris</p>}
            {usernameStatus === 'invalid' && <p className="text-xs text-destructive mt-1">3-30 caractères, lettres/chiffres/_</p>}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="hero" onClick={save} disabled={saving === 'saving'}>
              {saving === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
            {saving === 'saving' && <span className="text-xs text-muted-foreground">Sauvegarde...</span>}
            {saving === 'saved' && <span className="text-xs text-accent">✓ Sauvegardé</span>}
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="bento-card mb-5">
        <h2 className="font-display text-xl font-bold mb-4">Apparence</h2>
        <div className="space-y-4">
          <div>
            <Label>Thème</Label>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setTheme('dark')} className={cn('flex-1 p-3 rounded-2xl glass flex items-center justify-center gap-2 transition-all', theme === 'dark' && 'border-primary glow-primary')}>
                <Moon className="h-4 w-4" /> Sombre
              </button>
              <button onClick={() => setTheme('light')} className={cn('flex-1 p-3 rounded-2xl glass flex items-center justify-center gap-2 transition-all', theme === 'light' && 'border-primary glow-primary')}>
                <Sun className="h-4 w-4" /> Clair
              </button>
            </div>
          </div>
          <div>
            <Label>Couleur d'accent</Label>
            <div className="flex gap-3 mt-2">
              {ACCENT_PRESETS.map(p => (
                <button key={p.key} onClick={() => setAccent(p.key)} className={cn('flex flex-col items-center gap-1 transition-transform hover:scale-105', accent === p.key && 'scale-110')}>
                  <div className="h-12 w-12 rounded-2xl border-2 transition-all" style={{ background: p.color, borderColor: accent === p.key ? p.color : 'transparent', boxShadow: accent === p.key ? `0 0 24px ${p.color}` : 'none' }} />
                  <span className="text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bento-card mb-5">
        <h2 className="font-display text-xl font-bold mb-4">Notifications</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Bell className="h-4 w-4" /><span>Notifications navigateur</span></div>
          <Switch checked={notifications} onCheckedChange={toggleNotifications} />
        </div>
      </section>

      {/* Account */}
      <section className="bento-card">
        <h2 className="font-display text-xl font-bold mb-4">Compte</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={resetPassword}>
            <KeyRound className="h-4 w-4" /> Changer le mot de passe
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> Se déconnecter
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass">
              <AlertDialogHeader>
                <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
                <AlertDialogDescription>Tu devras te reconnecter pour accéder à ton compte.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={async () => { await signOut(); navigate('/'); }}>Se déconnecter</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </motion.div>
  );
}
