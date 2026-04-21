import { ReactNode } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { TOOLS } from '@/lib/constants';
import { usePlan } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';

export const ProtectedLayout = () => {
  const { user, loading, profile, signOut } = useAuth();
  const { plan, can } = usePlan();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const planColor = plan === 'premium' ? 'gradient-primary' : plan === 'lite' ? 'bg-accent text-accent-foreground' : 'bg-muted';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border glass shrink-0">
        <div className="p-5 border-b border-border">
          <Logo />
        </div>
        <div className="p-4 border-b border-border">
          <div className="text-xs text-muted-foreground">Connecté</div>
          <div className="font-semibold truncate">{profile?.full_name || profile?.username}</div>
          <div className={cn('inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold', planColor)}>
            {plan.toUpperCase()}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <NavLink to="/dashboard" className={({ isActive }) => cn('flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors', isActive ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-secondary/50')}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/ressources" className={({ isActive }) => cn('flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors', isActive ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-secondary/50')}>
            <BookOpen className="h-4 w-4" /> Ressources
          </NavLink>

          <div className="pt-4 px-3 text-xs text-muted-foreground font-semibold">OUTILS</div>
          {TOOLS.map(t => {
            const Icon = (Icons as any)[t.icon] || Icons.Square;
            const allowed = can(t.plan);
            return (
              <NavLink
                key={t.key}
                to={t.path}
                className={({ isActive }) => cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors',
                  isActive ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-secondary/50',
                  !allowed && 'opacity-60'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">{t.name}</span>
                {!allowed && <Sparkles className="h-3 w-3 text-accent" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          {plan !== 'premium' && (
            <Button variant="hero" size="sm" className="w-full gap-1" onClick={() => navigate('/pricing')}>
              <Sparkles className="h-3.5 w-3.5" /> Upgrade
            </Button>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await signOut(); navigate('/'); }}>
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass border-b border-border h-14 flex items-center justify-between px-4">
        <Logo size="sm" to="/dashboard" />
        <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate('/'); }}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <main className="flex-1 min-w-0 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border h-16 flex items-center justify-around px-2">
        <NavLink to="/dashboard" className={({ isActive }) => cn('flex flex-col items-center gap-0.5 text-xs p-2 rounded-xl', isActive && 'text-primary')}>
          <LayoutDashboard className="h-5 w-5" /> Dash
        </NavLink>
        <NavLink to="/ressources" className={({ isActive }) => cn('flex flex-col items-center gap-0.5 text-xs p-2 rounded-xl', isActive && 'text-primary')}>
          <BookOpen className="h-5 w-5" /> PDF
        </NavLink>
        <NavLink to="/tools/planner" className={({ isActive }) => cn('flex flex-col items-center gap-0.5 text-xs p-2 rounded-xl', isActive && 'text-primary')}>
          <Icons.CalendarDays className="h-5 w-5" /> Planning
        </NavLink>
        <NavLink to="/tools/pomodoro" className={({ isActive }) => cn('flex flex-col items-center gap-0.5 text-xs p-2 rounded-xl', isActive && 'text-primary')}>
          <Icons.Timer className="h-5 w-5" /> Focus
        </NavLink>
      </nav>
    </div>
  );
};
