import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/shared/Logo';
import { Eye, EyeOff, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { SCHOOL_LEVELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const signInSchema = z.object({
  email: z.string().email('Email invalide').max(255),
  password: z.string().min(6, 'Au moins 6 caractères').max(72),
});

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, 'Au moins 2 caractères').max(100),
  username: z.string().trim().min(3, 'Au moins 3 caractères').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Lettres, chiffres et _ uniquement'),
  email: z.string().email('Email invalide').max(255),
  password: z.string().min(8, 'Au moins 8 caractères').max(72),
  date_of_birth: z.string().min(1, 'Requis'),
  gender: z.string().min(1, 'Choisis une option'),
  school_level: z.string().min(1, 'Requis'),
  terms: z.boolean().refine(v => v === true, 'Tu dois accepter les conditions'),
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

const passwordStrength = (pw: string): { score: number; label: string; color: string } => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: 1, label: 'Faible', color: 'bg-coral' };
  if (s <= 3) return { score: 3, label: 'Moyen', color: 'bg-gold' };
  return { score: 5, label: 'Fort', color: 'bg-accent' };
};

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // username availability
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const signInForm = useForm<SignInData>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } });
  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { full_name: '', username: '', email: '', password: '', date_of_birth: '', gender: undefined as any, school_level: '', terms: false },
  });

  const usernameValue = signUpForm.watch('username');
  const passwordValue = signUpForm.watch('password');
  const strength = passwordStrength(passwordValue || '');

  useEffect(() => {
    if (mode !== 'signup') return;
    if (!usernameValue || usernameValue.length < 3) { setUsernameStatus('idle'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(usernameValue)) { setUsernameStatus('invalid'); return; }
    setUsernameStatus('checking');
    const t = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('id').eq('username', usernameValue).maybeSingle();
      setUsernameStatus(data ? 'taken' : 'available');
    }, 500);
    return () => clearTimeout(t);
  }, [usernameValue, mode]);

  const onSignIn = async (d: SignInData) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: d.email, password: d.password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error.message);
      return;
    }
    toast.success('Bienvenue !');
    navigate('/dashboard');
  };

  const onSignUp = async (d: SignUpData) => {
    if (usernameStatus === 'taken') { toast.error('Ce nom d\'utilisateur est déjà pris'); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: d.email,
      password: d.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: d.full_name,
          username: d.username,
          gender: d.gender,
          school_level: d.school_level,
          date_of_birth: d.date_of_birth,
        },
      },
    });
    setSubmitting(false);
    if (error) {
      if (error.message.toLowerCase().includes('already')) toast.error('Cet email est déjà utilisé');
      else toast.error(error.message);
      return;
    }
    toast.success('Compte créé ! Bienvenue 🎉');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />
      <div className="blob bg-primary w-96 h-96 -top-20 -left-20" />
      <div className="blob bg-accent w-80 h-80 bottom-0 right-0" style={{ animationDelay: '5s' }} />

      <div className="relative w-full max-w-md mx-auto flex flex-col justify-center p-6 md:p-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <Logo size="lg" to="" className="mb-8" />

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bento-card"
        >
          <h1 className="font-display text-3xl font-bold mb-1">
            {mode === 'signin' ? 'Bon retour 👋' : 'Créer un compte'}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === 'signin' ? 'Connecte-toi pour continuer' : 'Rejoins LyceeAI gratuitement'}
          </p>

          {mode === 'signin' ? (
            <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" autoComplete="email" {...signInForm.register('email')} />
                {signInForm.formState.errors.email && <p className="text-xs text-destructive mt-1">{signInForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} autoComplete="current-password" {...signInForm.register('password')} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signInForm.formState.errors.password && <p className="text-xs text-destructive mt-1">{signInForm.formState.errors.password.message}</p>}
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Se connecter
              </Button>
            </form>
          ) : (
            <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nom complet</Label>
                  <Input {...signUpForm.register('full_name')} />
                  {signUpForm.formState.errors.full_name && <p className="text-xs text-destructive mt-1">{signUpForm.formState.errors.full_name.message}</p>}
                </div>
                <div>
                  <Label>Nom d'utilisateur</Label>
                  <div className="relative">
                    <Input {...signUpForm.register('username')} placeholder="ex: ahmed_t" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {usernameStatus === 'available' && <Check className="h-4 w-4 text-accent" />}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                  {usernameStatus === 'taken' && <p className="text-xs text-destructive mt-1">Déjà pris</p>}
                  {usernameStatus === 'invalid' && <p className="text-xs text-destructive mt-1">Caractères invalides</p>}
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" autoComplete="email" {...signUpForm.register('email')} />
                {signUpForm.formState.errors.email && <p className="text-xs text-destructive mt-1">{signUpForm.formState.errors.email.message}</p>}
              </div>

              <div>
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} autoComplete="new-password" {...signUpForm.register('password')} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordValue && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={cn('h-full transition-all', strength.color)} style={{ width: `${(strength.score / 5) * 100}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Force : {strength.label}</p>
                  </div>
                )}
                {signUpForm.formState.errors.password && <p className="text-xs text-destructive mt-1">{signUpForm.formState.errors.password.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date de naissance</Label>
                  <Input type="date" {...signUpForm.register('date_of_birth')} />
                  {signUpForm.formState.errors.date_of_birth && <p className="text-xs text-destructive mt-1">{signUpForm.formState.errors.date_of_birth.message}</p>}
                </div>
                <div>
                  <Label>Genre</Label>
                  <Select onValueChange={(v) => signUpForm.setValue('gender', v as any, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                  {signUpForm.formState.errors.gender && <p className="text-xs text-destructive mt-1">{signUpForm.formState.errors.gender.message}</p>}
                </div>
              </div>

              <div>
                <Label>Niveau scolaire</Label>
                <Select onValueChange={(v) => signUpForm.setValue('school_level', v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Choisir ton niveau" /></SelectTrigger>
                  <SelectContent>
                    {SCHOOL_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                {signUpForm.formState.errors.school_level && <p className="text-xs text-destructive mt-1">{signUpForm.formState.errors.school_level.message}</p>}
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={signUpForm.watch('terms')}
                  onCheckedChange={(c) => signUpForm.setValue('terms', !!c, { shouldValidate: true })}
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight">
                  J'accepte les conditions d'utilisation et la politique de confidentialité.
                </label>
              </div>
              {signUpForm.formState.errors.terms && <p className="text-xs text-destructive">{signUpForm.formState.errors.terms.message}</p>}

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting || usernameStatus === 'taken' || usernameStatus === 'checking'}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Créer mon compte
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>Pas de compte ? <button onClick={() => setMode('signup')} className="text-primary font-semibold hover:underline">S'inscrire</button></>
            ) : (
              <>Déjà inscrit ? <button onClick={() => setMode('signin')} className="text-primary font-semibold hover:underline">Se connecter</button></>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
