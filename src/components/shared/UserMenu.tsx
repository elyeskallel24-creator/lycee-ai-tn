import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';

export const UserMenu = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = (profile?.full_name || profile?.username || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-9 w-9 rounded-full gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center hover:scale-105 transition-transform">
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 glass">
        <DropdownMenuLabel className="truncate">@{profile?.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}><User className="h-4 w-4 mr-2" /> Profil</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="h-4 w-4 mr-2" /> Paramètres</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={async () => { await signOut(); navigate('/'); }}>
          <LogOut className="h-4 w-4 mr-2" /> Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
