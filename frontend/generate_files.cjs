const fs = require('fs');
const path = require('path');

const files = {
  "src/components/Sidebar.tsx": `import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, PlusCircle, Settings, Users, Briefcase, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', path: '/home', icon: LayoutDashboard },
    { name: 'Workspace', path: '/workspace', icon: Activity },
    { name: 'Create Incident', path: '/create', icon: PlusCircle },
    { name: 'Admin', path: '/admin', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar text-white flex flex-col justify-between shrink-0 fixed left-0 top-0">
      <div>
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-lg">
            D
          </div>
          <span className="font-bold text-xl tracking-tight">DXC Assure</span>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative",
                  isActive ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/20 border border-primary/50 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5 relative z-10" />
                <span className="font-medium relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 m-4 bg-white/5 rounded-xl border border-white/10 flex items-center space-x-3 hover:bg-white/10 cursor-pointer transition">
        <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" className="w-10 h-10 rounded-full border-2 border-primary" />
        <div>
          <p className="text-sm font-semibold">Sarah Jenkins</p>
          <p className="text-xs text-gray-400">Incident Manager</p>
        </div>
      </div>
    </div>
  );
}`,
  "src/components/Topbar.tsx": `import { Bell, Search, Command } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="h-16 border-b border-gray-200 bg-surface/50 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center space-x-2 text-sm text-muted">
        <span>Incidents</span>
        <span>/</span>
        <span className="text-text font-medium">Dashboard</span>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="relative group cursor-pointer hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <div className="bg-background border border-gray-200 rounded-full py-1.5 pl-10 pr-4 text-sm flex items-center space-x-8 hover:border-gray-300 transition-colors">
            <span className="text-gray-500">Search anything...</span>
            <div className="flex items-center space-x-1">
              <kbd className="bg-white border border-gray-200 rounded px-1.5 text-xs text-gray-500 shadow-sm font-sans">Ctrl</kbd>
              <kbd className="bg-white border border-gray-200 rounded px-1.5 text-xs text-gray-500 shadow-sm font-sans">K</kbd>
            </div>
          </div>
        </div>
        
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition text-gray-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
        </button>
      </div>
    </div>
  );
}`,
  "src/App.tsx": `import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ClientHome from './pages/ClientHome';
import CreateIncident from './pages/CreateIncident';
import IncidentWorkspace from './pages/IncidentWorkspace';
import AdminSettings from './pages/AdminSettings';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
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

export default App;`,
  "src/pages/Login.tsx": `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-sidebar relative overflow-hidden flex items-center justify-center">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-secondary/20 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass p-10 rounded-2xl w-full max-w-md relative z-10 shadow-2xl"
      >
        <div className="mb-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-2xl text-white mx-auto mb-6 shadow-lg">
            D
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-400">Sign in to DXC Assure Enterprise</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input 
                type="email" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                placeholder="Enterprise Email"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                placeholder="Password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" className="rounded bg-white/5 border-white/10 text-primary focus:ring-primary focus:ring-offset-sidebar w-4 h-4 transition-colors" />
              <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">Forgot Password?</a>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-xl py-3 font-semibold shadow-premium hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}`,
  "src/pages/ClientHome.tsx": `import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, AlertCircle, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Mon', score: 92 },
  { name: 'Tue', score: 95 },
  { name: 'Wed', score: 89 },
  { name: 'Thu', score: 98 },
  { name: 'Fri', score: 99 },
  { name: 'Sat', score: 100 },
  { name: 'Sun', score: 97 },
];

export default function ClientHome() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-gradient-to-br from-primary to-sidebar rounded-3xl p-8 text-white shadow-premium relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">Good morning, Sarah</h2>
          <p className="text-white/70 mb-8 max-w-md">Your overall SLA compliance is excellent this week. You have 3 pending approvals in your queue.</p>
          
          <div className="flex items-center space-x-8">
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">Active Incidents</p>
              <p className="text-4xl font-bold">24</p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">Avg Resolution</p>
              <p className="text-4xl font-bold">1.2h</p>
            </div>
          </div>
        </motion.div>

        {/* SLA Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="w-full md:w-96 card-premium p-6 flex flex-col"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Health Score</h3>
              <p className="text-sm text-gray-500">SLA Compliance</p>
            </div>
            <div className="bg-success/10 text-success px-2.5 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>96%</span>
            </div>
          </div>
          <div className="flex-1 min-h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#6B2D8B', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="score" stroke="#6B2D8B" strokeWidth={3} dot={{ r: 4, fill: '#6B2D8B' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Applications Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Core Applications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'DXC CloudRight', status: 'Operational', color: 'bg-success', incidents: 0 },
            { name: 'Enterprise Analytics', status: 'Degraded', color: 'bg-warning', incidents: 3 },
            { name: 'Modern Workplace', status: 'Operational', color: 'bg-success', incidents: 1 },
          ].map((app, i) => (
            <motion.div 
              key={app.name}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
              className="card-premium p-6 group cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-sm bg-primary/20" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className={"w-2 h-2 rounded-full " + app.color} />
                  <span className="text-xs font-medium text-gray-500">{app.status}</span>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{app.name}</h4>
              <p className="text-sm text-gray-500">{app.incidents} active incidents</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card-premium overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-gray-900">Recent Incidents</h3>
          <button className="text-primary font-medium text-sm hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="py-4 px-6 font-medium">ID</th>
                <th className="py-4 px-6 font-medium">Description</th>
                <th className="py-4 px-6 font-medium">Priority</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { id: 'INC-1042', desc: 'Database connection timeout on Analytics node', prio: 'P1 - Critical', status: 'Investigating', statusColor: 'bg-danger/10 text-danger' },
                { id: 'INC-1041', desc: 'Unable to access HR portal via VPN', prio: 'P3 - Moderate', status: 'In Progress', statusColor: 'bg-warning/10 text-warning' },
                { id: 'INC-1040', desc: 'Deploy failure on staging environment', prio: 'P2 - High', status: 'Resolved', statusColor: 'bg-success/10 text-success' },
              ].map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6 font-medium text-gray-900">{inc.id}</td>
                  <td className="py-4 px-6 text-gray-600">{inc.desc}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {inc.prio}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold " + inc.statusColor}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-400 hover:text-primary transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`,
  "src/pages/CreateIncident.tsx": `import { motion } from 'framer-motion';
import { Upload, Sparkles, FileText, Bot } from 'lucide-react';

export default function CreateIncident() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left Column: Form */}
      <div className="flex-[2] space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">New Incident</h2>
          <p className="text-gray-500">Provide details to help us resolve the issue quickly.</p>
        </div>

        <div className="card-premium p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Application / Service</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none">
              <option>Select an application</option>
              <option>DXC CloudRight</option>
              <option>Enterprise Analytics</option>
              <option>Modern Workplace</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Category</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none">
                <option>Select category</option>
                <option>Network</option>
                <option>Hardware</option>
                <option>Software</option>
                <option>Access</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Priority</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none">
                <option>P4 - Low</option>
                <option>P3 - Moderate</option>
                <option>P2 - High</option>
                <option>P1 - Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Description</label>
            <textarea 
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
              placeholder="Describe the issue in detail..."
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Attachments</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors mb-4">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">SVG, PNG, JPG or PDF (max. 10MB)</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all">
              Submit Incident
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: AI Assistant */}
      <div className="flex-1 space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="card-premium p-6 border-l-4 border-l-accent"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Smart Assistant</h3>
              <p className="text-xs text-gray-500">Live AI Suggestions</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
              Based on your description, this seems like a <span className="font-bold text-primary">Network Issue</span>. Would you like me to auto-categorize it?
            </div>
            
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Suggested Articles</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <FileText className="w-4 h-4 text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Troubleshooting VPN Connectivity</p>
                    <p className="text-xs text-gray-500">Updated 2 days ago</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}`,
  "src/pages/IncidentWorkspace.tsx": `import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MessageSquare, Paperclip, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';

export default function IncidentWorkspace() {
  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden">
      {/* Left: Queue */}
      <div className="w-80 flex flex-col card-premium overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900">Queue</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search incidents..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={"p-3 rounded-lg cursor-pointer transition-all " + (i === 1 ? "bg-primary/5 border border-primary/20" : "hover:bg-gray-50 border border-transparent")}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-900">INC-104{i}</span>
                <span className={"text-[10px] px-2 py-0.5 rounded-full font-semibold " + (i === 1 ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning")}>
                  {i === 1 ? 'P1' : 'P3'}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 leading-tight">Database connection timeout affecting multiple nodes.</p>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Details */}
      <div className="flex-1 flex flex-col card-premium overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">INC-1041</h2>
              <span className="bg-danger/10 text-danger px-2.5 py-1 rounded-full text-xs font-bold">P1 - Critical</span>
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">Investigating</span>
            </div>
            <h3 className="text-lg text-gray-700 font-medium">Database connection timeout on Analytics node</h3>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">Assign</button>
            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">Resolve</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Description</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Starting around 09:00 UTC, the analytics processing node began throwing connection timeout errors to the primary PostgreSQL database. This is affecting the real-time dashboards for the marketing team. Immediate attention required.
            </p>
          </section>

          <section>
            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Activity Timeline</h4>
            <div className="space-y-6">
              {[
                { time: '10:15 AM', user: 'System', text: 'Incident auto-assigned to Database Team', icon: AlertTriangle, color: 'text-warning bg-warning/10' },
                { time: '10:05 AM', user: 'Sarah Jenkins', text: 'Changed priority from P2 to P1', icon: AlertTriangle, color: 'text-danger bg-danger/10' },
                { time: '09:00 AM', user: 'Client Portal', text: 'Incident reported by user', icon: CheckCircle, color: 'text-gray-500 bg-gray-100' },
              ].map((act, i) => (
                <div key={i} className="flex gap-4">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center shrink-0 " + act.color}>
                    <act.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">{act.text}</p>
                    <p className="text-xs text-gray-500">{act.user} • {act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Right: Collaboration */}
      <div className="w-80 flex flex-col card-premium overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100 bg-sidebar text-white">
          <h3 className="font-bold">Team Chat</h3>
          <p className="text-xs text-gray-400">3 participants</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] text-center text-gray-400 font-medium">Today</span>
            <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 self-start max-w-[85%]">
              <p className="text-sm text-gray-700">I'm checking the logs on node-4 now.</p>
              <span className="text-[10px] text-gray-400 mt-1 block">Mike • 10:20 AM</span>
            </div>
            <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-sm shadow-sm self-end max-w-[85%] mt-4">
              <p className="text-sm">Great, let me know if you need the access keys.</p>
              <span className="text-[10px] text-primary-100 mt-1 block text-right">You • 10:22 AM</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="relative">
            <input type="text" placeholder="Type a message..." className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <button className="absolute right-2 top-2 p-1 text-primary hover:bg-primary/10 rounded-full transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  "src/pages/AdminSettings.tsx": `export default function AdminSettings() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h2>
        <p className="text-gray-500">Manage users, teams, and application configurations.</p>
      </div>

      <div className="flex gap-8">
        <div className="w-64 shrink-0 space-y-1">
          {['Users', 'Applications', 'Teams', 'Permissions', 'SLA Configuration', 'Audit Logs'].map((item, i) => (
            <button key={item} className={"w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors " + (i === 0 ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-100")}>
              {item}
            </button>
          ))}
        </div>

        <div className="flex-1 card-premium p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">User Management</h3>
            <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all shadow-sm">
              Add User
            </button>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="py-3 px-6 font-medium">Name</th>
                  <th className="py-3 px-6 font-medium">Role</th>
                  <th className="py-3 px-6 font-medium">Department</th>
                  <th className="py-3 px-6 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { name: 'Sarah Jenkins', role: 'Admin', dept: 'IT Operations', status: 'Active' },
                  { name: 'Michael Chen', role: 'Resolver', dept: 'Database', status: 'Active' },
                  { name: 'Emma Davis', role: 'Client', dept: 'Marketing', status: 'Inactive' },
                ].map((u) => (
                  <tr key={u.name} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">{u.role}</td>
                    <td className="py-4 px-6 text-gray-600 text-sm">{u.dept}</td>
                    <td className="py-4 px-6">
                      <span className={"inline-flex px-2 py-1 rounded-full text-xs font-medium " + (u.status === 'Active' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500')}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}`
};

Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(__dirname, filepath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
  console.log('Created:', filepath);
});
