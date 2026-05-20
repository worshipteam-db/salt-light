import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Goals from "@/pages/Goals";
import TaskArchive from "@/pages/TaskArchive";
import CharacterPage from "@/pages/CharacterPage";
import DevotionPage from "@/pages/DevotionPage";
import LoginPage from "@/pages/LoginPage";
import FeedbackPage from "@/pages/FeedbackPage";
import MailPage from "@/pages/MailPage";
import AchievementsPage from "@/pages/AchievementsPage";
import ClickSpark from "@/components/ClickSpark";

function FloatingFeedbackBubble() {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading || !user) return null;
  if (location.pathname === "/feedback" || location.pathname === "/login") return null;

  return (
    <Link
      to="/feedback"
      className="hidden sm:flex fixed bottom-4 right-4 z-[9999] items-center justify-center rounded-full bg-primary px-3 py-2 text-primary-foreground shadow-lg ring-1 ring-black/10 transition-all hover:bg-primary/90"
      title="Feedback / Bug Report"
    >
      <span className="text-[10px] font-medium leading-none whitespace-nowrap">
        Feedback / Bug Report
      </span>
    </Link>
  );
}

function App() {
  return (
    <ClickSpark
      sparkColor="#4a7c59"
      sparkSize={8}
      sparkRadius={18}
      sparkCount={7}
      duration={500}
      easing="ease-out"
      extraScale={1}
    >
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <FloatingFeedbackBubble />
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                element={
                  <ProtectedRoute
                    unauthenticatedElement={<Navigate to="/login" replace />}
                  />
                }
              >
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/archive" element={<TaskArchive />} />
                  <Route path="/character" element={<CharacterPage />} />
                  <Route path="/devotion" element={<DevotionPage />} />
                  <Route path="/mail" element={<MailPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ClickSpark>
  );
}

export default App;