import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, ArrowLeft, Sparkles } from 'lucide-react';
import { sm2, Quality } from '@/lib/srs';
import { toast } from 'sonner';

interface Deck { id: string; name: string; subject: string | null; created_at: string; }
interface Card {
  id: string; deck_id: string; question: string; answer: string;
  ease_factor: number; interval: number; repetitions: number; next_review: string;
}

export default function Flashcards() {
  useActivityLog('flashcards');
  const { user } = useAuth();
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [openDeck, setOpenDeck] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckSubject, setDeckSubject] = useState('');

  const loadDecks = async () => {
    if (!user) return;
    const { data } = await supabase.from('flashcard_decks').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setDecks((data as Deck[]) || []);
  };
  useEffect(() => { loadDecks(); }, [user]);

  const createDeck = async () => {
    if (!user || !deckName.trim()) return;
    const { error } = await supabase.from('flashcard_decks').insert({ user_id: user.id, name: deckName.trim(), subject: deckSubject || null });
    if (error) return toast.error(error.message);
    setDeckName(''); setDeckSubject(''); setOpenDeck(false);
    loadDecks();
  };

  const deleteDeck = async (id: string) => {
    if (!confirm('Supprimer ce deck et toutes ses cartes ?')) return;
    await supabase.from('flashcards').delete().eq('deck_id', id);
    await supabase.from('flashcard_decks').delete().eq('id', id);
    loadDecks();
  };

  if (deckId) return <DeckView deckId={deckId} onBack={() => navigate('/tools/flashcards')} />;

  return (
    <PageShell
      title="Flashcards"
      subtitle="Mémorise avec la répétition espacée (SM-2)"
      actions={
        <Button variant="hero" onClick={() => setOpenDeck(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nouveau deck
        </Button>
      }
    >
      {decks.length === 0 ? (
        <EmptyState emoji="🧠" title="Aucun deck pour l'instant" description="Crée ton premier deck pour commencer à mémoriser." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="bento-card group cursor-pointer" onClick={() => navigate(`/tools/flashcards/${d.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg font-semibold">{d.name}</div>
                    {d.subject && <div className="text-xs text-accent">{d.subject}</div>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteDeck(d.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-3">Cliquer pour ouvrir</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={openDeck} onOpenChange={setOpenDeck}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau deck</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nom du deck" value={deckName} onChange={(e) => setDeckName(e.target.value)} />
            <Input placeholder="Matière (facultatif)" value={deckSubject} onChange={(e) => setDeckSubject(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="hero" onClick={createDeck}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function DeckView({ deckId, onBack }: { deckId: string; onBack: () => void }) {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [openCard, setOpenCard] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const [q, setQ] = useState(''); const [a, setA] = useState('');
  const [studyMode, setStudyMode] = useState(false);

  const load = async () => {
    if (!user) return;
    const [{ data: dk }, { data: cd }] = await Promise.all([
      supabase.from('flashcard_decks').select('*').eq('id', deckId).maybeSingle(),
      supabase.from('flashcards').select('*').eq('deck_id', deckId).order('created_at', { ascending: true }),
    ]);
    setDeck(dk as Deck | null);
    setCards((cd as Card[]) || []);
  };
  useEffect(() => { load(); }, [deckId, user]);

  const save = async () => {
    if (!user || !q.trim() || !a.trim()) return;
    if (editing) {
      await supabase.from('flashcards').update({ question: q, answer: a }).eq('id', editing.id);
    } else {
      await supabase.from('flashcards').insert({ user_id: user.id, deck_id: deckId, question: q, answer: a });
    }
    setQ(''); setA(''); setEditing(null); setOpenCard(false);
    load();
  };

  const del = async (id: string) => {
    await supabase.from('flashcards').delete().eq('id', id);
    load();
  };

  const dueCards = cards.filter(c => new Date(c.next_review) <= new Date());

  if (studyMode) return <StudyMode deckName={deck?.name ?? ''} cards={dueCards.length ? dueCards : cards} onExit={() => { setStudyMode(false); load(); }} />;

  return (
    <PageShell
      title={deck?.name ?? 'Deck'}
      subtitle={`${cards.length} cartes • ${dueCards.length} à réviser`}
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
          <Button variant="outline" onClick={() => { setEditing(null); setQ(''); setA(''); setOpenCard(true); }} className="gap-2"><Plus className="h-4 w-4" /> Carte</Button>
          <Button variant="hero" disabled={cards.length === 0} onClick={() => setStudyMode(true)} className="gap-2"><Sparkles className="h-4 w-4" /> Étudier</Button>
        </div>
      }
    >
      {cards.length === 0 ? (
        <EmptyState emoji="🃏" title="Pas encore de cartes" description="Ajoute ta première question/réponse." />
      ) : (
        <div className="space-y-2">
          {cards.map(c => (
            <div key={c.id} className="bento-card flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{c.question}</div>
                <div className="text-sm text-muted-foreground truncate">{c.answer}</div>
                <div className="text-xs text-accent mt-1 font-mono">Prochaine: {new Date(c.next_review).toLocaleDateString('fr-FR')}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setQ(c.question); setA(c.answer); setOpenCard(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => del(c.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={openCard} onOpenChange={setOpenCard}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Modifier' : 'Nouvelle carte'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Textarea placeholder="Question" value={q} onChange={(e) => setQ(e.target.value)} rows={2} />
            <Textarea placeholder="Réponse" value={a} onChange={(e) => setA(e.target.value)} rows={3} />
          </div>
          <DialogFooter><Button variant="hero" onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function StudyMode({ deckName, cards, onExit }: { deckName: string; cards: Card[]; onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = cards[idx];

  if (!card) {
    return (
      <PageShell title="Bravo ! 🎉" subtitle={`Tu as terminé ${deckName}`} actions={<Button variant="hero" onClick={onExit}>Retour</Button>}>
        <EmptyState emoji="✅" title="Toutes les cartes sont faites" description="Reviens demain pour les prochaines révisions." />
      </PageShell>
    );
  }

  const rate = async (q: Quality) => {
    const next = sm2({ ease_factor: card.ease_factor, interval: card.interval, repetitions: card.repetitions }, q);
    await supabase.from('flashcards').update(next).eq('id', card.id);
    setRevealed(false);
    setIdx(i => i + 1);
  };

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onExit} className="gap-2"><ArrowLeft className="h-4 w-4" /> Quitter</Button>
        <div className="font-mono text-sm text-muted-foreground">{idx + 1} / {cards.length}</div>
      </div>
      <div className="[perspective:1500px]">
        <motion.div
          key={card.id + (revealed ? 'b' : 'f')}
          initial={{ rotateY: revealed ? 90 : -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bento-card min-h-[300px] flex items-center justify-center text-center cursor-pointer p-10 [transform-style:preserve-3d]"
          onClick={() => !revealed && setRevealed(true)}
        >
          <div>
            <div className="text-xs uppercase tracking-widest text-accent mb-3">{revealed ? 'Réponse' : 'Question'}</div>
            <div className="font-display text-2xl md:text-3xl">{revealed ? card.answer : card.question}</div>
            {!revealed && <div className="text-xs text-muted-foreground mt-6">Cliquer pour révéler</div>}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2 mt-6">
            <Button variant="outline" className="border-red-500/40 hover:bg-red-500/10" onClick={() => rate(0)}>Encore</Button>
            <Button variant="outline" className="border-orange-500/40 hover:bg-orange-500/10" onClick={() => rate(3)}>Difficile</Button>
            <Button variant="outline" className="border-emerald-500/40 hover:bg-emerald-500/10" onClick={() => rate(4)}>Bien</Button>
            <Button variant="outline" className="border-accent/40 hover:bg-accent/10" onClick={() => rate(5)}>Facile</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
