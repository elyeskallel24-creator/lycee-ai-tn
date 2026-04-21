import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { PlanGate } from "@/components/shared/PlanGate";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Ressources = lazy(() => import("./pages/Ressources"));
const Pomodoro = lazy(() => import("./pages/tools/Pomodoro"));
const Planner = lazy(() => import("./pages/tools/Planner"));
const Admin = lazy(() => import("./pages/Admin"));
const ToolPlaceholder = lazy(() => import("./pages/tools/ToolPlaceholder"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const lazyTool = (name: string, plan: 'lite' | 'premium') => (
  <PlanGate required={plan} toolName={name}>
    <ToolPlaceholder name={name} />
  </PlanGate>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors theme="dark" />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />

              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ressources" element={<Ressources />} />
                <Route path="/tools/planner" element={<Planner />} />
                <Route path="/tools/pomodoro" element={<Pomodoro />} />

                {/* Lite tools */}
                <Route path="/tools/flashcards" element={lazyTool('Flashcards SRS', 'lite')} />
                <Route path="/tools/notes" element={lazyTool('Notes Markdown', 'lite')} />
                <Route path="/tools/bookmarks" element={lazyTool('Marque-pages', 'lite')} />
                <Route path="/tools/myday" element={lazyTool('My Day', 'lite')} />
                <Route path="/tools/kanban" element={lazyTool('Kanban', 'lite')} />
                <Route path="/tools/annotator" element={lazyTool('Annotateur PDF', 'lite')} />

                {/* Premium tools */}
                <Route path="/tools/chat" element={lazyTool('Salle d\'étude', 'premium')} />
                <Route path="/tools/tracker" element={lazyTool('Tracker d\'heures', 'premium')} />
                <Route path="/tools/exam-countdown" element={lazyTool('Compte à rebours', 'premium')} />
                <Route path="/tools/knowledge-map" element={lazyTool('Carte de connaissances', 'premium')} />
                <Route path="/tools/srs-schedule" element={lazyTool('Planning SRS', 'premium')} />
                <Route path="/tools/streak" element={lazyTool('Calendrier de séries', 'premium')} />
                <Route path="/tools/folders" element={lazyTool('Dossiers couleurs', 'premium')} />
                <Route path="/tools/stretch" element={lazyTool('Étirements', 'premium')} />
                <Route path="/tools/fuel-log" element={lazyTool('Carnet d\'énergie', 'premium')} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
