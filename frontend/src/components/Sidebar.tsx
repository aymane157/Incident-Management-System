import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, PlusCircle, CheckSquare, FileCheck, BookOpen, HelpCircle, LogOut, Settings, Users, Layers, Shield } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');

  const clientNav = [
    { name: 'Vue d\'ensemble', path: '/home', icon: LayoutDashboard },
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
}