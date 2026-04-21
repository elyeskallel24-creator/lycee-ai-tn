import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, LogOut, Sparkles, Lock, ChevronLeft, ChevronRight, Settings as SettingsIcon, User, Loader2 } from 'lucide-react';
import { TOOLS, PLAN_LABELS, PLAN_RANK, type Plan } from '@/lib/constants';
import { usePlan } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenu } from '@/components/shared/UserMenu';
import { OnboardingModal } from '@/components/shared/OnboardingModal';

const SECTIONS: { label: string; plan: Plan }[] = [
  { label: 'GRATUIT', plan: 'freemium' },
  { label: 'LITE', plan: 'lite' },
  { label: 'PREMIUM', plan: 'premium' },
];

export const ProtectedLayout = () => {
  const { user, loading, profile, signOut } = useAuth();
  const { plan, can } = usePlan();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('lyceeai_sidebar_collapsed') === '1');

  const toggleCollapse = () => {
    setCollapsed(c => { const n = !c; localStorage.setItem('lyceeai_sidebar_collapsed', n ? '1' : '0'); return n; });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  const planColor = plan === 'premium' ? 'gradient-primary text-primary-foreground' : plan === 'lite' ? 'bg-accent text-accent-foreground' : 'bg-muted';

  const renderTool = (t: typeof TOOLS[number]) => {
    const Icon = (Icons as any)[t.icon] || Icons.Square;
    const allowed = can(t.plan);
    const link = (
      <NavLink
        to={t.path}
        className={({ isActive }) => cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all',
          isActive ? 'gradient-primary text-primary-foreground font-medium shadow-lg' : 'hover:bg-secondary/50',
          !allowed && 'opacity-50',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate flex-1">{t.name}</span>}
        {!collapsed && !allowed && <Lock className="h-3 w-3 text-accent" />}
      </NavLink>
    );
    if (!collapsed) return <div key={t.key}>{link}</div>;
    return (
      <Tooltip key={t.key} delayDuration={150}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{t.name}{!allowed && ' 🔒'}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={cn('hidden lg:flex flex-col border-r border-border glass shrink-0 transition-[width] duration-300', collapsed ? 'w-[72px]' : 'w-64')}>
        <div className={cn('p-5 border-b border-border flex items-center justify-between', collapsed && 'p-3 justify-center')}>
          {collapsed ? <Logo size="sm" showText={false} /> : <Logo />}
        </div>
        {!collapsed && (
          <div className="p-4 border-b border-border">
            <div className="text-xs text-muted-foreground">Connecté</div>
            <div className="font-semibold truncate">{profile?.full_name || profile?.username}</div>
            <div className={cn('inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold', planColor)}>{PLAN_LABELS[plan]}</div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {renderTool({ key: 'dashboard' as any, name: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', plan: 'freemium', description: '', gradient: '' } as any)}
          {renderTool({ key: 'ressources' as any, name: 'Ressources', icon: 'BookOpen', path: '/ressources', plan: 'freemium', description: '', gradient: '' } as any)}

          {SECTIONS.map(sec => {
            const tools = TOOLS.filter(t => t.plan === sec.plan);
            return (
              <div key={sec.label} className="pt-3">
                {!collapsed && <div className="px-3 pb-1 text-[10px] tracking-widest text-muted-foreground font-semibold">{sec.label}</div>}
                {collapsed && <div className="mx-auto my-2 h-px w-6 bg-border" />}
                {tools.map(renderTool)}
              </div>
            );
          })}

          <div className="pt-4 border-t border-border mt-3">
            {renderTool({ key: 'profile' as any, name: 'Profil', icon: 'User', path: '/profile', plan: 'freemium', description: '', gradient: '' } as any)}
            {renderTool({ key: 'settings' as any, name: 'Paramètres', icon: 'Settings', path: '/settings', plan: 'freemium', description: '', gradient: '' } as any)}
          </div>
        </nav>

        <div className={cn('p-3 border-t border-border space-y-2', collapsed && 'flex flex-col items-center')}>
          {!collapsed && plan !== 'premium' && (
            <Button variant="hero" size="sm" className="w-full gap-1" onClick={() => navigate('/pricing')}>
              <Sparkles className="h-3.5 w-3.5" /> Upgrade
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={toggleCollapse} className="w-full justify-center">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass border-b border-border h-14 flex items-center justify-between px-4">
        <Logo size="sm" to="/dashboard" />
        <UserMenu />
      </div>

      {/* Desktop top-right user menu */}
      <div className="hidden lg:flex fixed top-4 right-6 z-30">
        <UserMenu />
      </div>

      <main className="flex-1 min-w-0 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <Outlet />
      </main>

      <OnboardingModal />

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
        <NavLink to="/profile" className={({ isActive }) => cn('flex flex-col items-center gap-0.5 text-xs p-2 rounded-xl', isActive && 'text-primary')}>
          <User className="h-5 w-5" /> Profil
        </NavLink>
      </nav>
    </div>
  );
};
