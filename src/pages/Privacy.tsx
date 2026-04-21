import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
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
        className="container max-w-3xl py-12 relative"
      >
        <div className="bento-card prose prose-invert max-w-none">
          <h1 className="font-display text-4xl font-bold mb-2">Politique de confidentialité</h1>
          <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : avril 2026</p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">1. Données que nous collectons</h2>
          <p className="text-muted-foreground">
            Lorsque tu utilises LyceeAI, nous collectons les informations suivantes :
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li>Ton <strong>nom complet</strong> et ton <strong>nom d'utilisateur</strong></li>
            <li>Ton <strong>adresse email</strong> (utilisée pour la connexion)</li>
            <li>Ta <strong>date de naissance</strong>, ton <strong>genre</strong> et ton <strong>niveau scolaire</strong></li>
            <li>Tes <strong>données d'étude</strong> : notes, tâches, sessions Pomodoro, flashcards, marque-pages, annotations PDF, messages de chat, etc.</li>
          </ul>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">2. Âge minimum</h2>
          <p className="text-muted-foreground">
            LyceeAI est destiné aux <strong>utilisateurs âgés de 14 ans et plus</strong>. Pour les utilisateurs
            <strong> de moins de 16 ans</strong>, un <strong>consentement parental</strong> peut être requis conformément à la
            réglementation en vigueur. En t'inscrivant, tu confirmes avoir l'âge requis ou l'autorisation
            de tes parents/tuteurs.
          </p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">3. Stockage et sécurité</h2>
          <p className="text-muted-foreground">
            Tes données sont stockées de manière sécurisée via notre infrastructure backend (Supabase),
            chiffrées en transit (HTTPS/TLS) et au repos. Nous appliquons des règles d'accès strictes
            (Row-Level Security) pour garantir que tu es la seule personne à pouvoir accéder à tes données.
          </p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">4. Utilisation des données</h2>
          <p className="text-muted-foreground">
            Nous utilisons tes données uniquement pour fournir les fonctionnalités de l'application
            (planification, flashcards, suivi de progression, etc.). Nous ne vendons jamais tes données
            à des tiers.
          </p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">5. Tes droits</h2>
          <p className="text-muted-foreground">
            Tu peux à tout moment demander la consultation, la modification ou la suppression de tes données
            personnelles. Pour toute demande, contacte-nous à :
            <a href="mailto:contact@lyceeai.tn" className="text-primary hover:underline ml-1">contact@lyceeai.tn</a>
          </p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">6. Cookies</h2>
          <p className="text-muted-foreground">
            Nous utilisons uniquement des cookies/localStorage techniques nécessaires à ton authentification
            et à tes préférences (thème, accent). Aucun cookie de tracking publicitaire.
          </p>

          <div className="mt-10 pt-6 border-t border-border flex gap-3">
            <Button variant="hero" asChild><Link to="/contact">Nous contacter</Link></Button>
            <Button variant="outline" asChild><Link to="/terms">Conditions d'utilisation</Link></Button>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
