import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Accent = 'violet' | 'mint' | 'coral';
export type Theme = 'dark' | 'light';

const ACCENTS: Record<Accent, { primary: string; primaryGlow: string; gradText: string }> = {
  violet: { primary: '257 100% 68%', primaryGlow: '245 91% 65%', gradText: 'linear-gradient(135deg, hsl(257 100% 75%), hsl(159 100% 60%))' },
  mint:   { primary: '159 80% 50%',  primaryGlow: '180 90% 50%', gradText: 'linear-gradient(135deg, hsl(159 90% 60%), hsl(190 100% 65%))' },
  coral:  { primary: '0 100% 68%',   primaryGlow: '20 100% 60%', gradText: 'linear-gradient(135deg, hsl(0 100% 72%), hsl(40 100% 65%))' },
};

interface Ctx {
  theme: Theme;
  accent: Accent;
  setTheme: (t: Theme) => void;
  setAccent: (a: Accent) => void;
}
const C = createContext<Ctx | undefined>(undefined);

const applyAccent = (a: Accent) => {
  const root = document.documentElement;
  const cfg = ACCENTS[a];
  root.style.setProperty('--primary', cfg.primary);
  root.style.setProperty('--primary-glow', cfg.primaryGlow);
  root.style.setProperty('--ring', cfg.primary);
  root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${cfg.primary}), hsl(${cfg.primaryGlow}))`);
  root.style.setProperty('--gradient-text', cfg.gradText);
};

const applyTheme = (t: Theme) => {
  document.documentElement.classList.toggle('dark', t === 'dark');
};

export const AppearanceProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('lyceeai_theme') as Theme) || 'dark');
  const [accent, setAccentState] = useState<Accent>(() => (localStorage.getItem('lyceeai_accent') as Accent) || 'violet');

  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { applyAccent(accent); }, [accent]);

  const setTheme = (t: Theme) => { setThemeState(t); localStorage.setItem('lyceeai_theme', t); };
  const setAccent = (a: Accent) => { setAccentState(a); localStorage.setItem('lyceeai_accent', a); };

  return <C.Provider value={{ theme, accent, setTheme, setAccent }}>{children}</C.Provider>;
};

export const useAppearance = () => {
  const c = useContext(C);
  if (!c) throw new Error('useAppearance must be inside AppearanceProvider');
  return c;
};

export const ACCENT_PRESETS: { key: Accent; label: string; color: string }[] = [
  { key: 'violet', label: 'Violet', color: 'hsl(257 100% 68%)' },
  { key: 'mint',   label: 'Mint',   color: 'hsl(159 80% 50%)'  },
  { key: 'coral',  label: 'Coral',  color: 'hsl(0 100% 68%)'   },
];
