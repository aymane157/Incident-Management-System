import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import TeamDiagram from '../components/TeamDiagram';

// ─── Tab routing ──────────────────────────────────────────────────────────────

type Tab = 'utilisateurs' | 'applications' | 'equipes' | 'sla';

function pathToTab(pathname: string): Tab {
  if (pathname.includes('/teams'))    return 'equipes';
  if (pathname.includes('/apps'))     return 'applications';
  if (pathname.includes('/sla') || pathname.includes('/settings')) return 'sla';
  return 'utilisateurs';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(() => pathToTab(location.pathname));

  useEffect(() => {
    setActiveTab(pathToTab(location.pathname));
  }, [location.pathname]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'utilisateurs',  label: 'Utilisateurs'  },
    { id: 'applications',  label: 'Applications'  },
    { id: 'equipes',       label: 'Équipes'        },
    { id: 'sla',           label: 'SLA & Règles'   },
  ];

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="card-white flex-1 flex flex-col overflow-hidden">

        {/* ── Tab bar ──────────────────────────────────────────────────── */}
        <div className="border-b border-gray-100">
          <div className="flex border-b border-gray-100 text-sm font-medium px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  'px-6 py-4 border-b-2 transition-colors ' +
                  (activeTab === tab.id
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-900')
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contextual toolbar */}
          {activeTab === 'utilisateurs' && (
            <div className="p-4 px-6 flex justify-between items-center bg-gray-50/50">
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button className="btn-primary space-x-2 py-2 text-sm flex items-center">
                <Plus className="w-4 h-4" />
                <span>Ajouter un utilisateur</span>
              </button>
            </div>
          )}

          {activeTab === 'equipes' && (
            <div className="p-4 px-6 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">Organigramme des équipes</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Glissez les nœuds · Cliquez pour modifier · Utilisez les boutons pour ajouter
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Utilisateurs ─────────────────────────────────────────────── */}
        {activeTab === 'utilisateurs' && (
          <>
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
                    { name: 'Jean Dupont',     email: 'jean.dupont@dxc.com',    role: 'CLIENT',           team: 'RH'      },
                    { name: 'Marie Martin',    email: 'marie.martin@dxc.com',   role: 'INCIDENT MANAGER', team: 'Support' },
                    { name: 'Thomas Bernard',  email: 'thomas.bernard@dxc.com', role: 'TECHNICIEN',       team: 'Système' },
                    { name: 'Sophie Leroy',    email: 'sophie.leroy@dxc.com',   role: 'CLIENT',           team: 'Finance' },
                    { name: 'Admin DXC',       email: 'admin@dxc.com',          role: 'ADMIN',            team: 'IT'      },
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{u.name}</td>
                      <td className="py-4 px-6 text-gray-600">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={
                          'text-[10px] font-bold ' +
                          (u.role === 'ADMIN'
                            ? 'text-danger'
                            : u.role === 'CLIENT'
                            ? 'text-primary'
                            : 'text-secondary')
                        }>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{u.team}</td>
                      <td className="py-4 px-6">
                        <div className="w-10 h-5 bg-success rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
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
          </>
        )}

        {/* ── Équipes ──────────────────────────────────────────────────── */}
        {activeTab === 'equipes' && (
          <div className="flex-1 overflow-hidden p-6">
            <TeamDiagram />
          </div>
        )}

        {/* ── Placeholders ─────────────────────────────────────────────── */}
        {activeTab === 'applications' && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Section Applications — à venir
          </div>
        )}
        {activeTab === 'sla' && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Section SLA & Règles — à venir
          </div>
        )}

      </div>
    </div>
  );
}