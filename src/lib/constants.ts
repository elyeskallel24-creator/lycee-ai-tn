export type Plan = 'freemium' | 'lite' | 'premium';

export const PLAN_LABELS: Record<Plan, string> = {
  freemium: 'Freemium',
  lite: 'Lite',
  premium: 'Premium',
};

export const SCHOOL_LEVELS = [
  '1ère année secondaire',
  '2ème année secondaire',
  '3ème année secondaire',
  'Bac (Terminale)',
  'Licence 1',
  'Licence 2',
  'Licence 3',
  'Mastère 1',
  'Mastère 2',
];

export type ToolKey =
  | 'planner' | 'pomodoro'
  | 'flashcards' | 'notes' | 'bookmarks' | 'myday' | 'kanban' | 'annotator'
  | 'chat' | 'tracker' | 'exam-countdown' | 'knowledge-map' | 'srs-schedule'
  | 'streak' | 'folders' | 'stretch' | 'fuel-log';

export interface ToolMeta {
  key: ToolKey;
  name: string;
  description: string;
  icon: string;
  plan: Plan;
  path: string;
  gradient: string;
}

export const TOOLS: ToolMeta[] = [
  { key: 'planner', name: 'Planificateur', description: 'Calendrier intelligent avec récurrences', icon: 'CalendarDays', plan: 'freemium', path: '/tools/planner', gradient: 'from-violet-500 to-indigo-600' },
  { key: 'pomodoro', name: 'Pomodoro', description: 'Timer de concentration 25/5', icon: 'Timer', plan: 'freemium', path: '/tools/pomodoro', gradient: 'from-coral to-pink-500' },
  { key: 'flashcards', name: 'Flashcards SRS', description: 'Mémorisation avec répétition espacée', icon: 'Layers', plan: 'lite', path: '/tools/flashcards', gradient: 'from-cyan-400 to-blue-600' },
  { key: 'notes', name: 'Notes', description: 'Éditeur Markdown auto-sauvegardé', icon: 'FileText', plan: 'lite', path: '/tools/notes', gradient: 'from-amber-400 to-orange-500' },
  { key: 'bookmarks', name: 'Marque-pages', description: 'Garde tes ressources web', icon: 'Bookmark', plan: 'lite', path: '/tools/bookmarks', gradient: 'from-emerald-400 to-teal-600' },
  { key: 'myday', name: 'My Day', description: 'Tâches quotidiennes', icon: 'Sun', plan: 'lite', path: '/tools/myday', gradient: 'from-yellow-400 to-amber-500' },
  { key: 'kanban', name: 'Kanban', description: 'Tableau de devoirs drag & drop', icon: 'KanbanSquare', plan: 'lite', path: '/tools/kanban', gradient: 'from-fuchsia-500 to-pink-600' },
  { key: 'annotator', name: 'Annotateur PDF', description: 'Surligne et annote tes PDF', icon: 'Highlighter', plan: 'lite', path: '/tools/annotator', gradient: 'from-rose-400 to-red-500' },
  { key: 'chat', name: 'Salle d\'étude', description: 'Chat en temps réel avec autres élèves', icon: 'MessagesSquare', plan: 'premium', path: '/tools/chat', gradient: 'from-purple-500 to-violet-700' },
  { key: 'tracker', name: 'Tracker d\'heures', description: 'Comptabilise tes heures d\'étude', icon: 'Clock', plan: 'premium', path: '/tools/tracker', gradient: 'from-indigo-500 to-blue-700' },
  { key: 'exam-countdown', name: 'Compte à rebours', description: 'Décompte avant tes examens', icon: 'Hourglass', plan: 'premium', path: '/tools/exam-countdown', gradient: 'from-red-500 to-orange-600' },
  { key: 'knowledge-map', name: 'Carte de connaissances', description: 'Arbre visuel de tes leçons', icon: 'GitBranch', plan: 'premium', path: '/tools/knowledge-map', gradient: 'from-teal-500 to-cyan-700' },
  { key: 'srs-schedule', name: 'Planning SRS', description: 'Révisions espacées automatiques', icon: 'Repeat', plan: 'premium', path: '/tools/srs-schedule', gradient: 'from-green-500 to-emerald-700' },
  { key: 'streak', name: 'Calendrier de séries', description: 'Garde la flamme allumée', icon: 'Flame', plan: 'premium', path: '/tools/streak', gradient: 'from-orange-500 to-red-600' },
  { key: 'folders', name: 'Dossiers couleurs', description: 'Organise par matière', icon: 'FolderOpen', plan: 'premium', path: '/tools/folders', gradient: 'from-sky-400 to-indigo-600' },
  { key: 'stretch', name: 'Étirements', description: 'Pause physique guidée', icon: 'Activity', plan: 'premium', path: '/tools/stretch', gradient: 'from-lime-400 to-green-600' },
  { key: 'fuel-log', name: 'Carnet d\'énergie', description: 'Hydratation & repas', icon: 'Apple', plan: 'premium', path: '/tools/fuel-log', gradient: 'from-pink-400 to-rose-600' },
];

export const PLAN_RANK: Record<Plan, number> = { freemium: 0, lite: 1, premium: 2 };

export const planAllows = (userPlan: Plan, toolPlan: Plan) => PLAN_RANK[userPlan] >= PLAN_RANK[toolPlan];

export const PLANS = [
  {
    key: 'freemium' as Plan,
    name: 'Freemium',
    price: '0',
    period: 'pour toujours',
    description: 'Découvre les bases',
    features: ['Planificateur académique', 'Pomodoro Focus Timer', 'Accès aux ressources PDF', 'Tableau de bord personnel'],
    cta: 'Commencer gratuitement',
    highlight: false,
  },
  {
    key: 'lite' as Plan,
    name: 'Lite',
    price: '15',
    period: 'TND / mois',
    description: 'Pour les sérieux',
    features: ['Tout Freemium', 'Flashcards SRS', 'Notes Markdown', 'Marque-pages', 'My Day & Kanban', 'Annotateur PDF'],
    cta: 'Passer à Lite',
    highlight: true,
  },
  {
    key: 'premium' as Plan,
    name: 'Premium',
    price: '29',
    period: 'TND / mois',
    description: 'Performance maximale',
    features: ['Tout Lite', 'Salle d\'étude partagée', 'Tracker d\'heures', 'Compte à rebours examens', 'Carte de connaissances', 'Calendrier de séries', 'Carnet d\'énergie & étirements'],
    cta: 'Passer à Premium',
    highlight: false,
  },
];
