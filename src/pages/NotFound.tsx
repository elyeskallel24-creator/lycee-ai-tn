import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 — non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
      <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="blob bg-primary w-96 h-96 -top-20 -left-20" />
        <div className="blob bg-accent w-80 h-80 bottom-0 right-0" style={{ animationDelay: '5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bento-card max-w-md w-full text-center relative"
      >
        <Logo to="" className="justify-center mb-6" />

        <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 glow-primary">
          <Search className="h-8 w-8 text-primary-foreground" />
        </div>

        <div className="font-mono text-6xl font-bold gradient-text mb-2">404</div>
        <h1 className="font-display text-2xl font-bold mb-2">Page introuvable 🔍</h1>
        <p className="text-muted-foreground mb-6">
          Cette page n'existe pas ou a été déplacée.
        </p>

        <Button variant="hero" size="lg" className="w-full gap-2" asChild>
          <Link to="/"><Home className="h-4 w-4" /> Retourner à l'accueil</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
