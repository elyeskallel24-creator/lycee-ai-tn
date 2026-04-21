import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';

const schema = z.object({
  name: z.string().trim().min(2, 'Au moins 2 caractères').max(100),
  email: z.string().trim().email('Email invalide').max(255),
  message: z.string().trim().min(10, 'Au moins 10 caractères').max(5000),
});
type FormData = z.infer<typeof schema>;

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Erreur de connexion. Réessaie dans un moment. 🔌');
      return;
    }
    toast.success('Message envoyé ! On te répondra bientôt 📬');
    reset();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 gradient-mesh opacity-40 pointer-events-none" />
      <nav className="relative border-b border-border/50 glass">
        <div className="container flex items-center justify-between h-16">
          <Logo />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Accueil</Link>
          </Button>
        </div>
      </nav>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container max-w-2xl py-12 relative"
      >
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 glow-primary">
            <Mail className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Contact / Support</h1>
          <p className="text-muted-foreground">Une question, un bug, une suggestion ? Écris-nous, on lit tout 💜</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bento-card space-y-4">
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input id="name" placeholder="Ton nom" {...register('name')} className="mt-1.5" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="toi@exemple.com" {...register('email')} className="mt-1.5" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={6} placeholder="Dis-nous tout..." {...register('message')} className="mt-1.5 resize-none" />
            {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi...</> : 'Envoyer le message'}
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Tu peux aussi nous écrire directement à{' '}
            <a href="mailto:contact@lyceeai.tn" className="text-primary hover:underline">contact@lyceeai.tn</a>
          </p>
        </form>
      </motion.main>
    </div>
  );
}
