import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import type { UserRole } from './lib/auth';
import Login from './pages/Login';
import ClientHome from './pages/ClientHome';
import ClientTickets from './pages/ClientTickets';
import ClientRcas from './pages/ClientRcas';
import CreateIncident from './pages/CreateIncident';
import IncidentWorkspace from './pages/IncidentWorkspace';
import AdminSettings from './pages/AdminSettings';
import ManagerHome from './pages/ManagerHome';
import RTHome from './pages/RTHome';
import RTIncidentDetail from './pages/RTIncidentDetail';
import IncidentDetail from './pages/IncidentDetail';
import RTRcaReport from './pages/RTRcaReport';
import ManagerRcaInbox from './pages/ManagerRcaInbox';
import SlaClock from './pages/SlaClock';
import Sidebar from './components/Sidebar';

function homeRoute(role: UserRole): string {
  switch (role) {
    case 'client':
      return '/client/home';
    case 'manager':
      return '/manager/home';
    case 'admin':
      return '/admin';
    case 'rt':
      return '/rt/home';
  }
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="relative ml-64 flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SlaClockEntry() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'manager':
      return <Navigate to="/manager/sla-clock" replace />;
    case 'rt':
      return <Navigate to="/rt/sla-clock" replace />;
    case 'admin':
      return <Navigate to="/admin/sla-clock" replace />;
    default:
      return <Navigate to={homeRoute(user.role)} replace />;
  }
}

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

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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
        path="/client/rca"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <AppLayout><ClientRcas /></AppLayout>
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

      <Route
        path="/manager/home"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <AppLayout><ManagerHome /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/workspace"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <AppLayout><IncidentWorkspace /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/rca"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <AppLayout><ManagerRcaInbox /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/sla-clock"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <AppLayout><SlaClock /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/horloge-sla"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <AppLayout><SlaClock /></AppLayout>
          </ProtectedRoute>
        }
      />

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
        path="/admin/sla-clock"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout><SlaClock /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/horloge-sla"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout><SlaClock /></AppLayout>
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

      <Route
        path="/rt/home"
        element={
          <ProtectedRoute allowedRoles={['rt', 'admin']}>
            <AppLayout><RTHome /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rt/sla-clock"
        element={
          <ProtectedRoute allowedRoles={['rt', 'admin']}>
            <AppLayout><SlaClock /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rt/horloge-sla"
        element={
          <ProtectedRoute allowedRoles={['rt', 'admin']}>
            <AppLayout><SlaClock /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rt/incident/:id"
        element={
          <ProtectedRoute allowedRoles={['rt', 'admin']}>
            <AppLayout><RTIncidentDetail /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rt/report"
        element={
          <ProtectedRoute allowedRoles={['rt', 'admin']}>
            <AppLayout><RTRcaReport /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rt/report/:referenceId"
        element={
          <ProtectedRoute allowedRoles={['rt', 'admin']}>
            <AppLayout><RTRcaReport /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/sla-clock" element={<SlaClockEntry />} />
      <Route path="/incidents/:referenceId" element={<AppLayout><IncidentDetail /></AppLayout>} />

      <Route
        path="*"
        element={user ? <Navigate to={homeRoute(user.role)} replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}


