import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Goals from '@/pages/Goals';
import TaskArchive from '@/pages/TaskArchive';
import CharacterPage from '@/pages/CharacterPage';
import DevotionPage from '@/pages/DevotionPage';
import LoginPage from '@/pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
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
              </Route>
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;