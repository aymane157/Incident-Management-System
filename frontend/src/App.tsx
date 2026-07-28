import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import type { UserRole } from './lib/auth';
import Login from './pages/Login';
import ClientHome from './pages/ClientHome';
import ClientTickets from './pages/ClientTickets';
import CreateIncident from './pages/CreateIncident';
import IncidentWorkspace from './pages/IncidentWorkspace';
import AdminSettings from './pages/AdminSettings';
import ManagerHome from './pages/ManagerHome';
import RTHome from './pages/RTHome';
import RTIncidentDetail from './pages/RTIncidentDetail';
import IncidentDetail from './pages/IncidentDetail';
import RTRcaReport from './pages/RTRcaReport';
import Sidebar from './components/Sidebar';

// ─── Role → default home route ────────────────────────────────────────────────

function homeRoute(role: UserRole): string {
  switch (role) {
    case 'client':  return '/client/home';
    case 'manager': return '/manager/home';
    case 'admin':   return '/admin';
    case 'rt':      return '/rt/home';
  }
}

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
 * If `allowedRoles` is provided, redirects to the user's own home
 * when their role is not in the allowed list.
 */
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeRoute(user.role)} replace />;
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

      {/* ── CLIENT ─────────────────────────────────────────────────── */}
      <Route
        path="/client/home"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <AppLayout><ClientHome /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/create"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <AppLayout><CreateIncident /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/tickets"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <AppLayout><ClientTickets /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/kb"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <AppLayout><ClientHome /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── INCIDENT MANAGER ───────────────────────────────────────── */}
      <Route
        path="/manager/home"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <AppLayout><ManagerHome /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/workspace"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <AppLayout><IncidentWorkspace /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── ADMIN ──────────────────────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout><AdminSettings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/apps"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout><AdminSettings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teams"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout><AdminSettings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sla"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout><AdminSettings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout><AdminSettings /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── RESPONSABLE DE TRAITEMENT ──────────────────────────────── */}
      <Route
        path="/rt/home"
        element={
          <ProtectedRoute allowedRoles={['rt']}>
            <AppLayout><RTHome /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rt/incident/:id"
        element={
          <ProtectedRoute allowedRoles={['rt']}>
            <AppLayout><RTIncidentDetail /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rt/report"
        element={
          <ProtectedRoute allowedRoles={['rt']}>
            <AppLayout><RTRcaReport /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rt/report/:referenceId"
        element={
          <ProtectedRoute allowedRoles={['rt']}>
            <AppLayout><RTRcaReport /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents/:referenceId"
        element={
          <AppLayout><IncidentDetail /></AppLayout>
        }
      />

      {/* Default redirect */}
      <Route
        path="*"
        element={
          user
            ? <Navigate to={homeRoute(user.role)} replace />
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
