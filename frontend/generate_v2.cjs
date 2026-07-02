const fs = require('fs');
const path = require('path');

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3a1362',
        'primary-light': '#512285',
        'primary-dark': '#290b49',
        secondary: '#00A3E0',
        sidebar: '#180d27',
        background: '#f3f4f8',
        surface: '#FFFFFF',
        text: '#1a1a1a',
        muted: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'premium': '0 4px 20px rgba(58, 19, 98, 0.08)',
      },
    },
  },
  plugins: [],
}`;

const files = {
  "tailwind.config.js": tailwindConfig,
  "src/index.css": `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-text font-sans antialiased;
  }
}

@layer utilities {
  .card-white {
    @apply bg-surface rounded-2xl shadow-soft border border-gray-100/50;
  }
  .input-field {
    @apply w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all;
  }
  .btn-primary {
    @apply bg-primary hover:bg-primary-light text-white font-medium py-2.5 px-5 rounded-xl transition-colors shadow-md shadow-primary/20 flex items-center justify-center;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}`,
  "src/App.tsx": `import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

export default App;`,
  "src/components/Sidebar.tsx": `import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, PlusCircle, CheckSquare, FileCheck, BookOpen, HelpCircle, LogOut, Settings, Users, Layers, Shield } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');

  const clientNav = [
    { name: 'Vue d\\'ensemble', path: '/home', icon: LayoutDashboard },
    { name: 'Mes tickets', path: '/workspace', icon: Ticket },
    { name: 'Nouveau ticket', path: '/create', icon: PlusCircle },
    { name: 'Mes validations', path: '/validations', icon: CheckSquare },
    { name: 'Mes approbations', path: '/approbations', icon: FileCheck },
    { name: 'Base de connaissances', path: '/kb', icon: BookOpen },
  ];

  const adminNav = [
    { name: 'Tableau de bord', path: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Utilisateurs', path: '/admin', icon: Users },
    { name: 'Applications', path: '/admin/apps', icon: Layers },
    { name: 'Équipes', path: '/admin/teams', icon: Users },
    { name: 'SLA & Règles', path: '/admin/sla', icon: Shield },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNav : clientNav;

  return (
    <div className="w-64 h-screen bg-sidebar text-gray-300 flex flex-col justify-between shrink-0 fixed left-0 top-0">
      <div>
        <div className="p-8 pb-4 flex flex-col items-center justify-center border-b border-white/5">
          <div className="text-white text-3xl font-bold tracking-tighter mb-1">DXC</div>
          <div className="text-[10px] tracking-widest text-gray-400 mb-6 uppercase">Technology</div>
        </div>
        
        <div className="p-4 flex items-center space-x-3 mb-2">
          <img src="https://i.pravatar.cc/150?u=jean" alt="User" className="w-10 h-10 rounded-full border border-gray-600" />
          <div>
            <p className="text-xs text-gray-400">Client</p>
            <p className="text-sm font-semibold text-white">Jean Dupont</p>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={"flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium " + (isActive ? "bg-primary-light text-white" : "hover:bg-white/5 hover:text-white")}
              >
                <item.icon className={"w-5 h-5 " + (isActive ? "text-white" : "text-gray-400")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 space-y-1">
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <HelpCircle className="w-5 h-5" />
          <span>Support</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}`,
  "src/pages/Login.tsx": `import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="w-1/2 bg-[#1b0a33] flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#3a1362]/40 to-transparent"></div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="text-white text-5xl font-bold tracking-tighter mb-2">DXC</div>
          <div className="text-xs tracking-[0.3em] text-gray-300 mb-12 uppercase">Technology</div>
          <h1 className="text-4xl font-bold text-white mb-4">Bienvenue sur<br />DXC Incident Hub</h1>
          <p className="text-gray-300">Connectez-vous pour accéder<br />à votre espace de gestion des incidents.</p>
        </div>
      </div>
      
      {/* Right side */}
      <div className="w-1/2 bg-white flex items-center justify-center p-12 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative z-10">
          <form onSubmit={(e) => { e.preventDefault(); navigate('/home'); }} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Adresse e-mail</label>
              <input type="email" placeholder="exemple@dxc.com" className="input-field" required />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Mot de passe</label>
              <input type="password" placeholder="••••••••" className="input-field font-serif tracking-widest" required />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-sm text-primary font-medium hover:underline">Mot de passe oublié ?</a>
            </div>
            
            <button type="submit" className="w-full btn-primary py-3 text-base mt-2">
              Se connecter
            </button>
          </form>
          <div className="mt-8 text-center text-xs text-gray-400">
            © 2026 DXC Technology. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
}`,
  "src/pages/ClientHome.tsx": `import { Search, Bell, Plus, Ticket, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClientHome() {
  const navigate = useNavigate();

  const kpis = [
    { label: 'Total tickets', value: '36', trend: '+12% vs mois dernier', icon: Ticket, color: 'text-primary bg-primary/10', trendColor: 'text-success' },
    { label: 'En cours', value: '12', trend: '+4% vs mois dernier', icon: Clock, color: 'text-secondary bg-secondary/10', trendColor: 'text-success' },
    { label: 'Résolus', value: '18', trend: '+18% vs mois dernier', icon: CheckCircle, color: 'text-success bg-success/10', trendColor: 'text-success' },
    { label: 'Rejetés', value: '6', trend: '-8% vs mois dernier', icon: XCircle, color: 'text-danger bg-danger/10', trendColor: 'text-danger' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bon retour, Jean 👋</h1>
          <p className="text-gray-500 text-sm">Voici ce qui se passe aujourd'hui.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Rechercher un ticket, une application..." className="w-full bg-white border border-gray-200 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary" />
          </div>
          <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          <button onClick={() => navigate('/create')} className="btn-primary space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nouveau Ticket</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="card-white p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</h2>
              <p className={"text-xs font-medium " + kpi.trendColor}>{kpi.trend}</p>
            </div>
            <div className={"w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 " + kpi.color}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table */}
        <div className="flex-[2] card-white flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Mes tickets récents</h3>
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 font-medium">
                <tr>
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium">APPLICATION</th>
                  <th className="py-3 px-4 font-medium">STATUT</th>
                  <th className="py-3 px-4 font-medium">DATE DE CRÉATION</th>
                  <th className="py-3 px-4 font-medium">SLA RESTANT</th>
                  <th className="py-3 px-4 font-medium">PRIORITÉ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { id: '2026-06-23-1', app: 'Portail RH', status: 'EN ATTENTE', sc: 'bg-primary/10 text-primary', date: '23/06/2026 10:15', sla: '02h 45m', slap: 35, prio: 'Haute', pc: 'bg-danger' },
                  { id: '2026-06-23-2', app: 'ERP Finance', status: 'EN COURS', sc: 'bg-secondary/10 text-secondary', date: '23/06/2026 09:47', sla: '05h 20m', slap: 68, prio: 'Moyenne', pc: 'bg-warning' },
                  { id: '2026-06-22-8', app: 'Intranet', status: 'RÉSOLU', sc: 'bg-success/10 text-success', date: '22/06/2026 16:22', sla: '—', slap: 100, prio: 'Basse', pc: 'bg-success' },
                  { id: '2026-06-22-7', app: 'CRM', status: 'EN ATTENTE', sc: 'bg-primary/10 text-primary', date: '22/06/2026 14:11', sla: '01h 10m', slap: 18, prio: 'Haute', pc: 'bg-danger' },
                  { id: '2026-06-21-5', app: 'Portail RH', status: 'REJETÉ', sc: 'bg-danger/10 text-danger', date: '21/06/2026 11:02', sla: '—', slap: 0, prio: 'Basse', pc: 'bg-success' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 cursor-pointer">
                    <td className="py-4 px-4 font-medium text-gray-900">{row.id}</td>
                    <td className="py-4 px-4 text-gray-600">{row.app}</td>
                    <td className="py-4 px-4">
                      <span className={"text-[10px] px-2 py-1 rounded font-bold " + row.sc}>{row.status}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{row.date}</td>
                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="w-12">{row.sla}</span>
                        {row.sla !== '—' && (
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-warning" style={{ width: row.slap + '%' }}></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1.5">
                        <div className={"w-1.5 h-1.5 rounded-full " + row.pc}></div>
                        <span className="text-gray-600">{row.prio}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 mt-auto border-t border-gray-100 text-center">
            <button className="text-primary text-sm font-semibold hover:underline">Voir tous mes tickets</button>
          </div>
        </div>

        {/* Activity */}
        <div className="flex-1 card-white flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Activité récente</h3>
          </div>
          <div className="p-6 space-y-6 flex-1">
            <div className="relative pl-4 border-l-2 border-primary/20 space-y-8">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-white"></div>
                <p className="text-sm text-gray-900 font-medium">Ticket 2026-06-23-1 est passé en cours de traitement</p>
                <p className="text-xs text-gray-400 mt-1">Il y a 15 min</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-success rounded-full ring-4 ring-white"></div>
                <p className="text-sm text-gray-900 font-medium">Ticket 2026-06-22-8 a été résolu</p>
                <p className="text-xs text-gray-400 mt-1">Il y a 1 heure</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-danger rounded-full ring-4 ring-white"></div>
                <p className="text-sm text-gray-900 font-medium">Votre ticket 2026-06-21-5 a été rejeté</p>
                <p className="text-xs text-gray-400 mt-1">Hier à 16:45</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-secondary rounded-full ring-4 ring-white"></div>
                <p className="text-sm text-gray-900 font-medium">Nouveau message sur le ticket 2026-06-20-1</p>
                <p className="text-xs text-gray-400 mt-1">Hier à 14:30</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
            <button className="text-primary text-sm font-semibold hover:underline">Voir toute l'activité</button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  "src/pages/CreateIncident.tsx": `import { ArrowLeft, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateIncident() {
  const navigate = useNavigate();
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 pb-2">
        <button onClick={() => navigate('/home')} className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Créer un nouveau ticket</span>
        </button>
        <div className="text-xs text-gray-400 mt-2 ml-6">Accueil &gt; Nouveau ticket</div>
      </div>

      <div className="flex-1 flex px-12 py-4 gap-12">
        {/* Stepper */}
        <div className="w-48 space-y-6 pt-4">
          <div className="flex items-center space-x-3 text-primary">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-sm font-semibold">Informations</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-sm font-medium">Détails</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-sm font-medium">Confirmation</span>
          </div>
          
          <div className="pt-20">
            {/* Isometric illustration placeholder */}
            <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto relative overflow-hidden flex items-center justify-center">
               <div className="w-20 h-20 bg-primary/20 rotate-45 transform"></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 max-w-3xl">
          <div className="card-white p-8 space-y-8 relative">
            <h2 className="text-xl font-bold text-gray-900">Informations générales</h2>
            
            <div className="flex gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">ID du ticket (généré automatiquement)</label>
                  <div className="font-bold text-gray-900">2026-06-23-1</div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Application <span className="text-danger">*</span></label>
                  <select className="input-field appearance-none bg-gray-50">
                    <option>Sélectionnez une application</option>
                    <option>Portail RH</option>
                    <option>ERP Finance</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Description <span className="text-danger">*</span></label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                    <div className="bg-gray-50 border-b border-gray-200 p-2 flex space-x-2">
                      <button className="p-1 hover:bg-gray-200 rounded font-bold text-gray-600 text-sm">B</button>
                      <button className="p-1 hover:bg-gray-200 rounded italic text-gray-600 text-sm">I</button>
                      <button className="p-1 hover:bg-gray-200 rounded underline text-gray-600 text-sm">U</button>
                      <div className="w-px h-4 bg-gray-300 my-auto mx-1"></div>
                      <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Paperclip className="w-4 h-4" /></button>
                    </div>
                    <textarea rows={6} placeholder="Décrivez votre problème en détail..." className="w-full p-4 text-sm focus:outline-none resize-none"></textarea>
                    <div className="bg-white p-2 text-right text-xs text-gray-400">0 / 3000</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Capture d'écran</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Glissez-déposez votre fichier ici</p>
                  <p className="text-xs text-gray-400 mt-1">ou</p>
                  <button className="mt-2 text-primary font-semibold text-sm hover:underline">Parcourir les fichiers</button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">Formats acceptés : PNG, JPG, GIF (max. 5 Mo)</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <button className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Annuler</button>
              <button className="btn-primary">Suivant</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  "src/pages/IncidentWorkspace.tsx": `import { useState } from 'react';
import { Search, Filter, Lock, CheckCircle, Clock, Paperclip, Send } from 'lucide-react';

export default function IncidentWorkspace() {
  const [selectedTicket, setSelectedTicket] = useState(true);

  return (
    <div className="h-full flex flex-col bg-background p-6 space-y-6">
      {/* Header KPIs */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vue globale</h1>
        <div className="flex items-center space-x-3">
          <img src="https://i.pravatar.cc/150?u=marie" alt="User" className="w-8 h-8 rounded-full border border-gray-200" />
          <div className="text-right">
            <p className="text-xs text-gray-500">Incident Manager</p>
            <p className="text-sm font-semibold">Marie Martin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-4xl">
        <div className="card-white p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Lock className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tickets en attente<br/>de validation</p>
            <div className="flex items-end space-x-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-none mt-1">23</h2>
              <span className="text-[10px] text-gray-400 mb-0.5">+0 depuis hier</span>
            </div>
          </div>
        </div>
        <div className="card-white p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">SLA en risque<br/>&nbsp;</p>
            <div className="flex items-end space-x-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-none mt-1">8</h2>
              <span className="text-[10px] text-danger mb-0.5">+2 depuis hier</span>
            </div>
          </div>
        </div>
        <div className="card-white p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Résolus aujourd'hui<br/>&nbsp;</p>
            <div className="flex items-end space-x-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-none mt-1">47</h2>
              <span className="text-[10px] text-success mb-0.5">+15% vs hier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Table View */}
        <div className="flex-1 card-white flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input type="text" placeholder="Rechercher un ticket..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary" />
            </div>
            <button className="flex items-center space-x-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 font-medium sticky top-0 bg-white">
                <tr>
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium">APPLICATION</th>
                  <th className="py-3 px-4 font-medium">CLIENT</th>
                  <th className="py-3 px-4 font-medium">STATUT</th>
                  <th className="py-3 px-4 font-medium">SLA RESTANT</th>
                  <th className="py-3 px-4 font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className={"hover:bg-gray-50 cursor-pointer " + (i === 1 ? "bg-primary/5" : "")} onClick={() => setSelectedTicket(true)}>
                    <td className="py-4 px-4 font-medium text-gray-900">2026-06-23-{i}</td>
                    <td className="py-4 px-4 text-gray-600">Portail RH</td>
                    <td className="py-4 px-4 text-gray-600">Jean Dupont</td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] px-2 py-1 rounded font-bold bg-primary/10 text-primary">EN ATTENTE</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">01h 15m <span className="text-danger font-medium text-xs ml-1">15%</span></td>
                    <td className="py-4 px-4 text-right space-x-2 text-gray-400">
                      <button className="hover:text-success"><CheckCircle className="w-4 h-4 inline" /></button>
                      <button className="hover:text-danger"><span className="font-bold">X</span></button>
                      <button className="hover:text-gray-900">•••</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
            1-5 sur 23 &lt; &gt;
          </div>
        </div>

        {/* Right Drawer - Ticket Details & Chat */}
        {selectedTicket && (
          <div className="w-[450px] card-white flex flex-col shrink-0 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-3">
                <h3 className="font-bold text-gray-900 text-lg">2026-06-23-1</h3>
                <span className="text-[10px] px-2 py-1 rounded font-bold bg-primary/10 text-primary">EN ATTENTE</span>
              </div>
            </div>
            
            <div className="flex border-b border-gray-100 text-sm font-medium">
              <button className="px-4 py-3 border-b-2 border-primary text-primary">Conversation</button>
              <button className="px-4 py-3 text-gray-500 hover:text-gray-900">Détails</button>
              <button className="px-4 py-3 text-gray-500 hover:text-gray-900">Pièces jointes (1)</button>
              <button className="px-4 py-3 text-gray-500 hover:text-gray-900">Historique</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-white flex flex-col">
              <h4 className="font-bold text-gray-900 text-lg mb-4">Problème de connexion sur le Portail RH</h4>
              <p className="text-xs text-gray-500 mb-6">Créé le 23/06/2026 à 10:15 par Jean Dupont</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-gray-100">
                <div><span className="text-gray-500">Application:</span> <span className="font-medium">Portail RH</span></div>
                <div><span className="text-gray-500">Priorité:</span> <span className="font-medium text-danger">Haute</span></div>
                <div><span className="text-gray-500">Assigné à:</span> <span className="font-medium">Marie Martin</span></div>
              </div>

              {/* Chat View */}
              <div className="flex-1 flex flex-col space-y-4">
                {/* Client Message */}
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">JD</div>
                  <div>
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">Jean Dupont</span>
                      <span className="text-[10px] text-gray-400">10:15</span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-700">
                      Bonjour, je n'arrive plus à me connecter au portail RH depuis ce matin.
                    </div>
                  </div>
                </div>
                {/* Support Message */}
                <div className="flex space-x-3 flex-row-reverse space-x-reverse">
                  <img src="https://i.pravatar.cc/150?u=marie" className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline space-x-2 mb-1 flex-row-reverse space-x-reverse">
                      <span className="font-bold text-sm text-gray-900">Marie Martin</span>
                      <span className="text-[10px] text-gray-400">10:17</span>
                    </div>
                    <div className="bg-primary/10 text-primary-dark p-3 rounded-2xl rounded-tr-sm text-sm">
                      Bonjour Jean, nous regardons cela. Pouvez-vous essayer de vider le cache de votre navigateur ?
                    </div>
                  </div>
                </div>
                {/* Client Reply */}
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">JD</div>
                  <div>
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">Jean Dupont</span>
                      <span className="text-[10px] text-gray-400">10:18</span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-700">
                      J'ai essayé, mais le problème persiste.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-primary">
                <input type="text" placeholder="Écrire un message..." className="flex-1 bg-transparent text-sm focus:outline-none" />
                <button className="text-gray-400 hover:text-gray-600"><Paperclip className="w-4 h-4" /></button>
                <button className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center"><Send className="w-4 h-4" /></button>
              </div>
            </div>
            {/* Actions for Manager (Valider/Rejeter) */}
            <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-100">
              <button className="flex-1 btn-primary text-sm shadow-none">Valider le ticket</button>
              <button className="flex-1 bg-danger hover:bg-red-600 text-white font-medium py-2 rounded-xl transition-colors text-sm">Rejeter le ticket</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`,
  "src/pages/AdminSettings.tsx": `import { Search, Plus, MoreVertical } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="card-white flex-1 flex flex-col overflow-hidden">
        {/* Header & Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex border-b border-gray-100 text-sm font-medium px-6">
            <button className="px-6 py-4 border-b-2 border-primary text-primary font-bold">Utilisateurs</button>
            <button className="px-6 py-4 text-gray-500 hover:text-gray-900">Applications</button>
            <button className="px-6 py-4 text-gray-500 hover:text-gray-900">Équipes</button>
            <button className="px-6 py-4 text-gray-500 hover:text-gray-900">SLA & Règles</button>
          </div>
          <div className="p-4 px-6 flex justify-between items-center bg-gray-50/50">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input type="text" placeholder="Rechercher un utilisateur..." className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary" />
            </div>
            <button className="btn-primary space-x-2 py-2 text-sm">
              <Plus className="w-4 h-4" />
              <span>Ajouter un utilisateur</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 font-medium sticky top-0 bg-white shadow-sm">
              <tr>
                <th className="py-4 px-6 font-medium">NOM</th>
                <th className="py-4 px-6 font-medium">EMAIL</th>
                <th className="py-4 px-6 font-medium">RÔLE</th>
                <th className="py-4 px-6 font-medium">ÉQUIPE</th>
                <th className="py-4 px-6 font-medium">STATUT</th>
                <th className="py-4 px-6 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: 'Jean Dupont', email: 'jean.dupont@dxc.com', role: 'CLIENT', team: 'RH' },
                { name: 'Marie Martin', email: 'marie.martin@dxc.com', role: 'INCIDENT MANAGER', team: 'Support' },
                { name: 'Thomas Bernard', email: 'thomas.bernard@dxc.com', role: 'TECHNICIEN', team: 'Système' },
                { name: 'Sophie Leroy', email: 'sophie.leroy@dxc.com', role: 'CLIENT', team: 'Finance' },
                { name: 'Admin DXC', email: 'admin@dxc.com', role: 'ADMIN', team: 'IT' },
              ].map((u, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{u.name}</td>
                  <td className="py-4 px-6 text-gray-600">{u.email}</td>
                  <td className="py-4 px-6">
                    <span className={"text-[10px] font-bold " + (u.role === 'ADMIN' ? 'text-danger' : u.role === 'CLIENT' ? 'text-primary' : 'text-secondary')}>{u.role}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{u.team}</td>
                  <td className="py-4 px-6">
                    <div className="w-10 h-5 bg-success rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right text-gray-400 space-x-3">
                    <button className="hover:text-primary">✏️</button>
                    <button className="hover:text-danger">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
          1-5 sur 12 &lt; &gt;
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
  console.log('Created/Updated:', filepath);
});
