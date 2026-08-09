import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, PlusCircle,
  HelpCircle, LogOut, Settings, Users, Layers,
  Shield, Zap, Wrench, FileText, ClipboardList, Inbox, Clock
} from 'lucide-react';
import { useAuth } from '../lib/auth';

type NavItem = { name: string; path: string; icon: React.ElementType };

const clientNav: NavItem[] = [
  { name: 'Vue d\'ensemble',       path: '/client/home',   icon: LayoutDashboard },
  { name: 'Mes tickets',           path: '/client/tickets', icon: Ticket          },
  { name: 'Nouveau ticket',        path: '/client/create',  icon: PlusCircle      },
  { name: 'RCA reçus',              path: '/client/rca',     icon: FileText        },

];

const managerNav: NavItem[] = [
  { name: 'Tableau de bord',  path: '/manager/home',      icon: LayoutDashboard },
  { name: 'Workspace',        path: '/manager/workspace', icon: Zap             },
  { name: 'Horloge SLA',      path: '/manager/sla-clock', icon: Clock           },
  { name: 'RCA reçus',        path: '/manager/rca',       icon: Inbox           },
];

const adminNav: NavItem[] = [
  { name: 'Utilisateurs',  path: '/admin',          icon: Users    },
  { name: 'Applications',  path: '/admin/apps',     icon: Layers   },
  { name: 'Équipes',       path: '/admin/teams',    icon: Users    },
  { name: 'SLA & Règles',  path: '/admin/sla',      icon: Shield   },
  { name: 'Horloge SLA',   path: '/admin/sla-clock', icon: Clock   },
  { name: 'Paramètres',    path: '/admin/settings', icon: Settings },
];

const rtNav: NavItem[] = [
  { name: 'Mes incidents',    path: '/rt/home',        icon: ClipboardList },
  { name: 'Horloge SLA',      path: '/rt/sla-clock',   icon: Clock         },
  { name: 'Créer un rapport', path: '/rt/report',      icon: FileText      },
];

const roleConfig: Record<
  string,
  { label: string; badge: string; badgeColor: string; avatarBg: string; nav: NavItem[]; BadgeIcon: React.ElementType }
> = {
  client: {
    label: 'Client',
    badge: 'CLIENT',
    badgeColor: 'bg-primary/20 text-primary',
    avatarBg: 'bg-primary',
    nav: clientNav,
    BadgeIcon: Users,
  },
  manager: {
    label: 'Incident Manager',
    badge: 'INCIDENT MANAGER',
    badgeColor: 'bg-secondary/20 text-secondary',
    avatarBg: 'bg-secondary',
    nav: managerNav,
    BadgeIcon: Shield,
  },
  admin: {
    label: 'Administrateur',
    badge: 'ADMIN',
    badgeColor: 'bg-danger/20 text-danger',
    avatarBg: 'bg-danger',
    nav: adminNav,
    BadgeIcon: Settings,
  },
  rt: {
    label: "Membre d'équipe",
    badge: 'MEMBRE EQUIPE',
    badgeColor: 'bg-warning/20 text-warning',
    avatarBg: 'bg-warning',
    nav: rtNav,
    BadgeIcon: Wrench,
  },
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const config = roleConfig[user?.role ?? 'client'] ?? roleConfig.client;
  const { label, badge, badgeColor, avatarBg, nav, BadgeIcon } = config;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 h-screen bg-sidebar text-gray-300 flex flex-col justify-between shrink-0 fixed left-0 top-0">
      <div>
        {/* Logo */}
        <div className="p-8 pb-4 flex flex-col items-center justify-center border-b border-white/5">
          <div className="text-white text-3xl font-bold tracking-tighter mb-1">DXC</div>
          <div className="text-[10px] tracking-widest text-gray-400 mb-6 uppercase">Technology</div>
        </div>

        {/* User info */}
        <div className="p-4 flex items-center space-x-3 mb-2">
          <div className={`w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-xs font-bold text-white ${avatarBg}`}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'U'}
          </div>
          <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-white">{user?.name ?? 'Utilisateur'}</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 mb-3">
          <span className={`inline-flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
            <BadgeIcon className="w-3 h-3" />
            <span>{badge}</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-1">
          {nav.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={
                  'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ' +
                  (isActive ? 'bg-primary-light text-white' : 'hover:bg-white/5 hover:text-white')
                }
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom actions */}
      <div className="p-4 space-y-1">
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <HelpCircle className="w-5 h-5" />
          <span>Support</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}


