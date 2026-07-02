import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ClientHome from './pages/ClientHome';
import CreateIncident from './pages/CreateIncident';
import IncidentWorkspace from './pages/IncidentWorkspace';
import AdminSettings from './pages/AdminSettings';
import Sidebar from './components/Sidebar';

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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<AppLayout><ClientHome /></AppLayout>} />
        <Route path="/create" element={<AppLayout><CreateIncident /></AppLayout>} />
        <Route path="/workspace" element={<AppLayout><IncidentWorkspace /></AppLayout>} />
        <Route path="/admin" element={<AppLayout><AdminSettings /></AppLayout>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;