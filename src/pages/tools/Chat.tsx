import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLog } from '@/hooks/useActivityLog';
import { PageShell } from '@/components/shared/PageShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Msg { id: string; user_id: string; room_id: string; content: string; created_at: string; }
interface Profile { id: string; username: string; full_name: string | null; }

const ROOMS = ['general', 'math', 'physique', 'francais', 'histoire', 'svt', 'anglais'];
const ROOM_LABELS: Record<string, string> = {
  general: 'Général', math: 'Mathématiques', physique: 'Physique', francais: 'Français',
  histoire: 'Histoire', svt: 'SVT', anglais: 'Anglais',
};

export default function Chat() {
  useActivityLog('chat');
  const { user, profile } = useAuth();
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('room_id', room).order('created_at', { ascending: true }).limit(200);
      if (!active) return;
      setMessages((data as Msg[]) || []);
      const ids = Array.from(new Set((data || []).map((m: any) => m.user_id)));
      if (ids.length) {
        const { data: ps } = await supabase.from('profiles').select('id,username,full_name').in('id', ids);
        const map: Record<string, Profile> = {};
        (ps || []).forEach((p: any) => (map[p.id] = p));
        if (active) setProfiles(prev => ({ ...prev, ...map }));
      }
    })();

    const channel = supabase
      .channel(`chat:${room}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${room}` }, async (payload) => {
        const m = payload.new as Msg;
        setMessages(ms => [...ms, m]);
        if (!profiles[m.user_id]) {
          const { data: p } = await supabase.from('profiles').select('id,username,full_name').eq('id', m.user_id).maybeSingle();
          if (p) setProfiles(prev => ({ ...prev, [p.id]: p as Profile }));
        }
      })
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [room]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!user || !text.trim()) return;
    const content = text.trim().slice(0, 1000);
    setText('');
    await supabase.from('chat_messages').insert({ user_id: user.id, room_id: room, content });
  };

  const cutoff = Date.now() - 5 * 60 * 1000;
  const onlineCount = new Set(messages.filter(m => new Date(m.created_at).getTime() > cutoff).map(m => m.user_id)).size;

  return (
    <PageShell title="Salle d'étude" subtitle="Discute en temps réel avec d'autres élèves">
      <div className="grid md:grid-cols-[200px_1fr] gap-4 h-[75vh]">
        <aside className="bento-card !p-2 space-y-1 overflow-y-auto">
          {ROOMS.map(r => (
            <button key={r} onClick={() => setRoom(r)}
              className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                room === r ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-secondary/50')}>
              <Hash className="h-4 w-4" /> {ROOM_LABELS[r]}
            </button>
          ))}
        </aside>

        <div className="bento-card flex flex-col !p-3">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <div className="font-display font-semibold">#{ROOM_LABELS[room]}</div>
            <div className="text-xs text-accent">🟢 {onlineCount} en ligne (5 min)</div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.length === 0 && (
              <EmptyState emoji="💬" title="Sois le premier à écrire dans cette salle" />
            )}
            {messages.map(m => {
              const own = m.user_id === user?.id;
              const p = profiles[m.user_id];
              const name = p?.full_name || p?.username || 'Élève';
              const initial = name[0]?.toUpperCase() ?? '?';
              return (
                <div key={m.id} className={cn('flex gap-2', own && 'flex-row-reverse')}>
                  <div className="h-8 w-8 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">{initial}</div>
                  <div className={cn('max-w-[70%]', own && 'text-right')}>
                    <div className="text-xs text-muted-foreground mb-0.5"><span className="font-semibold">{name}</span> · {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className={cn('inline-block px-3 py-2 rounded-2xl text-sm break-words',
                      own ? 'gradient-primary text-primary-foreground' : 'glass')}>{m.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-3 pt-2 border-t border-border">
            <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Écrire un message..." maxLength={1000} />
            <Button variant="hero" onClick={send} className="gap-2"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
