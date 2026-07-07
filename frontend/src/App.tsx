import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Login from './pages/Login';
import ClientHome from './pages/ClientHome';
import CreateIncident from './pages/CreateIncident';
import IncidentWorkspace from './pages/IncidentWorkspace';
import AdminSettings from './pages/AdminSettings';
import ManagerHome from './pages/ManagerHome';
import Sidebar from './components/Sidebar';

// ─── Layout ───────────────────────────────────────────────────────────────────

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Protected Route ──────────────────────────────────────────────────────────

/**
 * Redirects to /login if the user is not authenticated.
 * Optionally enforces a specific role — redirects to the user's
 * own home if they try to access the wrong role's pages.
 */
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'client' | 'manager';
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to the user's own home
    return <Navigate to={user.role === 'client' ? '/client/home' : '/manager/home'} replace />;
  }

  return <>{children}</>;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Client-only pages */}
      <Route
        path="/client/home"
        element={
          <ProtectedRoute requiredRole="client">
            <AppLayout><ClientHome /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/create"
        element={
          <ProtectedRoute requiredRole="client">
            <AppLayout><CreateIncident /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/tickets"
        element={
          <ProtectedRoute requiredRole="client">
            <AppLayout><ClientHome /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/kb"
        element={
          <ProtectedRoute requiredRole="client">
            <AppLayout><ClientHome /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Manager-only pages */}
      <Route
        path="/manager/home"
        element={
          <ProtectedRoute requiredRole="manager">
            <AppLayout><ManagerHome /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/workspace"
        element={
          <ProtectedRoute requiredRole="manager">
            <AppLayout><IncidentWorkspace /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin pages — accessible to managers */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="manager">
            <AppLayout><AdminSettings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/apps"
        element={
          <ProtectedRoute requiredRole="manager">
            <AppLayout><AdminSettings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teams"
        element={
          <ProtectedRoute requiredRole="manager">
            <AppLayout><AdminSettings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sla"
        element={
          <ProtectedRoute requiredRole="manager">
            <AppLayout><AdminSettings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredRole="manager">
            <AppLayout><AdminSettings /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="*"
        element={
          user
            ? <Navigate to={user.role === 'client' ? '/client/home' : '/manager/home'} replace />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;