import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Brain, Calendar, Layers, Timer, Flame, Trophy, Check, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PLANS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

const features = [
  { icon: Calendar, title: 'Planificateur intelligent', desc: 'Calendrier hebdomadaire & rappels.', size: 'col-span-2 row-span-1', gradient: 'from-violet-600/40 to-indigo-700/20' },
  { icon: Timer, title: 'Pomodoro Focus', desc: '25 min de concentration totale.', size: 'col-span-1 row-span-1', gradient: 'from-coral/40 to-pink-600/20' },
  { icon: Layers, title: 'Flashcards SRS', desc: 'Algorithme SM-2.', size: 'col-span-1 row-span-1', gradient: 'from-cyan-500/40 to-blue-700/20' },
  { icon: Brain, title: 'Carte de connaissances', desc: 'Visualise toutes tes leçons.', size: 'col-span-2 row-span-1', gradient: 'from-emerald-500/40 to-teal-700/20' },
  { icon: Flame, title: 'Séries quotidiennes', desc: 'Garde la flamme allumée 🔥', size: 'col-span-1 row-span-1', gradient: 'from-orange-500/40 to-red-700/20' },
  { icon: Trophy, title: 'Badges & succès', desc: 'Gagne pendant que tu étudies.', size: 'col-span-2 row-span-1', gradient: 'from-amber-400/40 to-yellow-600/20' },
];

const testimonials = [
  { name: 'Yasmine B.', level: 'Bac Sciences', text: 'J\'ai amélioré ma moyenne de 3 points en 2 mois. Les flashcards SRS sont incroyables.', emoji: '🌟' },
  { name: 'Mehdi K.', level: 'Licence 2 Info', text: 'Le tracker d\'heures m\'a aidé à mieux gérer mon temps. Indispensable.', emoji: '🚀' },
  { name: 'Salma R.', level: 'Terminale', text: 'L\'interface est tellement belle, ça donne envie d\'étudier !', emoji: '💜' },
];

const faqs = [
  { q: 'C\'est gratuit ?', a: 'Oui, le plan Freemium est gratuit pour toujours et te donne accès au planificateur et au Pomodoro.' },
  { q: 'Comment fonctionne la répétition espacée ?', a: 'On utilise l\'algorithme SM-2 qui calcule automatiquement quand tu dois revoir chaque carte pour la mémoriser à long terme.' },
  { q: 'Est-ce adapté aux étudiants tunisiens ?', a: 'Oui, l\'application est en français et conçue spécifiquement pour les lycéens et étudiants en Tunisie.' },
  { q: 'Comment je passe au plan Premium ?', a: 'Va sur la page tarifs et choisis ton plan. Tu peux changer à tout moment.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="hero" size="sm" onClick={() => navigate('/dashboard')}>Tableau de bord</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Connexion</Button>
                <Button variant="hero" size="sm" onClick={() => navigate('/auth?mode=signup')}>S'inscrire</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
          <div className="blob bg-primary w-96 h-96 -top-20 -left-20" />
          <div className="blob bg-accent w-80 h-80 top-40 right-0" style={{ animationDelay: '5s' }} />
          <div className="blob bg-primary-glow w-72 h-72 bottom-0 left-1/3" style={{ animationDelay: '10s' }} />
        </motion.div>

        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/30 mb-6 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Fait pour les lycéens tunisiens 🇹🇳</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-balance mb-6 leading-[0.95]">
              Étudie plus <span className="gradient-text">intelligemment</span>.
              <br />Réussis plus vite.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
              La plateforme tout-en-un qui combine planification, mémorisation et productivité pour les étudiants en Tunisie.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="hero" size="xl" onClick={() => navigate('/auth?mode=signup')} className="gap-2 group">
                Commencer gratuitement
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="glass" size="xl" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                Voir les plans
              </Button>
            </div>

            {/* Floating dashboard preview mockup */}
            <motion.div
              initial={{ opacity: 0, y: 60, rotateX: 20 }}
              animate={{ opacity: 1, y: 0, rotateX: 8 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="mt-20 perspective-1000"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="glass rounded-3xl p-4 md:p-6 max-w-4xl mx-auto shadow-elegant border-primary/20 animate-float">
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="h-3 w-3 rounded-full bg-coral" />
                  <div className="h-3 w-3 rounded-full bg-gold" />
                  <div className="h-3 w-3 rounded-full bg-accent" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Pomodoros', value: '12', color: 'from-coral to-pink-500' },
                    { label: 'Cartes dues', value: '24', color: 'from-cyan-500 to-blue-600' },
                    { label: 'Série 🔥', value: '7j', color: 'from-orange-500 to-red-600' },
                  ].map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className={`rounded-2xl p-4 bg-gradient-to-br ${s.color} text-white`}
                    >
                      <div className="text-xs opacity-80">{s.label}</div>
                      <div className="font-mono text-2xl md:text-3xl font-bold">{s.value}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="container">
          <div className="text-center mb-16">
            <div className="text-sm text-accent font-mono mb-3">// FONCTIONNALITÉS</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-4 text-balance">
              Tout ce dont tu as besoin <span className="gradient-text">pour exceller</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-4 max-w-6xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bento-card relative overflow-hidden ${f.size}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-50`} />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <f.icon className="h-8 w-8 text-foreground" />
                  <div>
                    <div className="font-display text-xl font-semibold">{f.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{f.desc}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="container relative">
          <div className="text-center mb-16">
            <div className="text-sm text-accent font-mono mb-3">// TARIFS</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-4 text-balance">
              Choisis ton <span className="gradient-text">niveau</span>
            </h2>
            <p className="text-muted-foreground">Annule à tout moment.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((p, i) => (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bento-card ${p.highlight ? 'border-primary/50 shadow-glow' : ''}`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
                    LE PLUS POPULAIRE
                  </div>
                )}
                <div className="text-sm text-muted-foreground">{p.description}</div>
                <h3 className="font-display text-2xl font-bold mt-1">{p.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="font-mono text-5xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground ml-2">{p.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={p.highlight ? 'hero' : 'glass'}
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  {p.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <div className="text-sm text-accent font-mono mb-3">// TÉMOIGNAGES</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-balance">
              Aimé par les <span className="gradient-text">étudiants</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bento-card"
              >
                <div className="text-3xl mb-3">{t.emoji}</div>
                <p className="text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.level}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-32">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <div className="text-sm text-accent font-mono mb-3">// FAQ</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-balance">
              Questions <span className="gradient-text">fréquentes</span>
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bento-card border-0 px-6">
                <AccordionTrigger className="hover:no-underline font-display text-lg">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 relative">
        <div className="container">
          <div className="bento-card max-w-4xl mx-auto text-center py-16 relative overflow-hidden">
            <div className="absolute inset-0 gradient-mesh" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-balance">
                Prêt à <span className="gradient-text">transformer</span> tes études ?
              </h2>
              <p className="text-muted-foreground mb-8">Rejoins les étudiants qui réussissent avec LyceeAI.</p>
              <Button variant="hero" size="xl" onClick={() => navigate('/auth?mode=signup')} className="gap-2">
                Commencer gratuitement <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Logo size="sm" />
          <div>© 2026 LyceeAI — Fait avec 💜 pour les lycéens tunisiens</div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/pricing" className="hover:text-primary">Tarifs</Link>
            <Link to="/auth" className="hover:text-primary">Connexion</Link>
            <Link to="/contact" className="hover:text-primary">Contact / Support</Link>
            <Link to="/privacy" className="hover:text-primary">Confidentialité</Link>
            <Link to="/terms" className="hover:text-primary">Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
