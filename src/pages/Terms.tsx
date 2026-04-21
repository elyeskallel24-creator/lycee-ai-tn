import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
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
          <h1 className="font-display text-4xl font-bold mb-2">Conditions d'utilisation</h1>
          <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : avril 2026</p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">1. Acceptation</h2>
          <p className="text-muted-foreground">
            En créant un compte sur LyceeAI, tu acceptes les présentes conditions d'utilisation
            ainsi que notre <Link to="/privacy" className="text-primary hover:underline">politique de confidentialité</Link>.
          </p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">2. Utilisation acceptable</h2>
          <p className="text-muted-foreground">
            Tu t'engages à utiliser LyceeAI dans un cadre respectueux et constructif. Sont strictement interdits :
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li>Le <strong>harcèlement</strong>, les insultes ou les propos haineux dans les salles de chat</li>
            <li>Le partage de contenu illégal, violent ou pornographique</li>
            <li>L'usurpation d'identité d'un autre utilisateur</li>
            <li>Toute tentative de piratage, d'attaque ou d'exploitation de failles</li>
            <li>Le spam, la publicité non sollicitée ou la diffusion de liens malveillants</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            Le non-respect de ces règles peut entraîner la suspension ou la suppression de ton compte
            sans préavis.
          </p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">3. Plans et accès aux fonctionnalités</h2>
          <p className="text-muted-foreground">
            LyceeAI propose trois plans (Freemium, Lite, Premium). <strong>L'attribution des plans est gérée
            par l'administrateur</strong> de la plateforme. Aucun paiement automatique n'est traité dans l'application :
            les changements de plan sont effectués manuellement par l'équipe LyceeAI.
          </p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">4. Service fourni "tel quel"</h2>
          <p className="text-muted-foreground">
            LyceeAI est fourni <strong>"tel quel" (as-is)</strong>, sans garantie d'aucune sorte, expresse ou
            implicite. Nous ne garantissons pas que le service sera ininterrompu, sécurisé à 100 %, ou exempt
            d'erreurs. Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou partie du
            service à tout moment.
          </p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">5. Propriété intellectuelle</h2>
          <p className="text-muted-foreground">
            Tu conserves tous les droits sur le contenu que tu crées (notes, flashcards, etc.). En revanche,
            le code, le design, le logo et la marque LyceeAI restent notre propriété exclusive.
          </p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">6. Loi applicable</h2>
          <p className="text-muted-foreground">
            Les présentes conditions sont régies par <strong>la loi tunisienne</strong>. Tout litige relatif à
            l'utilisation de LyceeAI sera soumis à la compétence exclusive des tribunaux tunisiens.
          </p>

          <h2 className="font-display text-2xl font-semibold mt-8 mb-3">7. Contact</h2>
          <p className="text-muted-foreground">
            Pour toute question, contacte-nous via la <Link to="/contact" className="text-primary hover:underline">page Contact</Link>.
          </p>

          <div className="mt-10 pt-6 border-t border-border flex gap-3">
            <Button variant="hero" asChild><Link to="/contact">Nous contacter</Link></Button>
            <Button variant="outline" asChild><Link to="/privacy">Politique de confidentialité</Link></Button>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
