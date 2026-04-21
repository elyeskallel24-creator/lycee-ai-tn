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

const Flashcards = lazy(() => import("./pages/tools/Flashcards"));
const Notes = lazy(() => import("./pages/tools/Notes"));
const Bookmarks = lazy(() => import("./pages/tools/Bookmarks"));
const MyDay = lazy(() => import("./pages/tools/MyDay"));
const Kanban = lazy(() => import("./pages/tools/Kanban"));
const Annotator = lazy(() => import("./pages/tools/Annotator"));

const Chat = lazy(() => import("./pages/tools/Chat"));
const Tracker = lazy(() => import("./pages/tools/Tracker"));
const ExamCountdown = lazy(() => import("./pages/tools/ExamCountdown"));
const KnowledgeMap = lazy(() => import("./pages/tools/KnowledgeMap"));
const SrsSchedule = lazy(() => import("./pages/tools/SrsSchedule"));
const Streak = lazy(() => import("./pages/tools/Streak"));
const Folders = lazy(() => import("./pages/tools/Folders"));
const Stretch = lazy(() => import("./pages/tools/Stretch"));
const FuelLog = lazy(() => import("./pages/tools/FuelLog"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const gated = (plan: 'lite' | 'premium', name: string, node: React.ReactNode) => (
  <PlanGate required={plan} toolName={name}>{node}</PlanGate>
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

                <Route path="/tools/flashcards" element={gated('lite', 'Flashcards SRS', <Flashcards />)} />
                <Route path="/tools/flashcards/:deckId" element={gated('lite', 'Flashcards SRS', <Flashcards />)} />
                <Route path="/tools/notes" element={gated('lite', 'Notes', <Notes />)} />
                <Route path="/tools/bookmarks" element={gated('lite', 'Marque-pages', <Bookmarks />)} />
                <Route path="/tools/myday" element={gated('lite', 'My Day', <MyDay />)} />
                <Route path="/tools/kanban" element={gated('lite', 'Kanban', <Kanban />)} />
                <Route path="/tools/annotator" element={gated('lite', 'Annotateur PDF', <Annotator />)} />

                <Route path="/tools/chat" element={gated('premium', "Salle d'étude", <Chat />)} />
                <Route path="/tools/tracker" element={gated('premium', "Tracker d'heures", <Tracker />)} />
                <Route path="/tools/exam-countdown" element={gated('premium', 'Compte à rebours', <ExamCountdown />)} />
                <Route path="/tools/knowledge-map" element={gated('premium', 'Carte de connaissances', <KnowledgeMap />)} />
                <Route path="/tools/srs-schedule" element={gated('premium', 'Planning SRS', <SrsSchedule />)} />
                <Route path="/tools/streak" element={gated('premium', 'Calendrier de séries', <Streak />)} />
                <Route path="/tools/folders" element={gated('premium', 'Dossiers couleurs', <Folders />)} />
                <Route path="/tools/stretch" element={gated('premium', 'Étirements', <Stretch />)} />
                <Route path="/tools/fuel-log" element={gated('premium', "Carnet d'énergie", <FuelLog />)} />
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
