import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Clock, CheckCircle, AlertTriangle,
  Search, Filter, ChevronRight, Bell
} from 'lucide-react';
import { useAuth } from '../lib/auth';

// ─── Mock data ────────────────────────────────────────────────────────────────

const assignedIncidents = [
  {
    id: '2026-06-23-1',
    app: 'Portail RH',
    client: 'CGI',
    status: 'EN COURS',
    statusClass: 'bg-secondary/10 text-secondary',
    priority: 'Critique',
    priorityClass: 'bg-danger/10 text-danger',
    slaRemaining: '00h 22m',
    slaPercent: 8,
    assignedAt: '23/06/2026 10:15',
    description: 'Problème de connexion sur le Portail RH',
  },
  {
    id: '2026-06-23-3',
    app: 'Réseau VPN',
    client: 'Atos',
    status: 'EN ATTENTE',
    statusClass: 'bg-primary/10 text-primary',
    priority: 'Haute',
    priorityClass: 'bg-warning/10 text-warning',
    slaRemaining: '01h 40m',
    slaPercent: 33,
    assignedAt: '23/06/2026 09:00',
    description: 'Coupure intermittente du réseau VPN pour l\'équipe Finance',
  },
  {
    id: '2026-06-22-7',
    app: 'Intranet',
    client: 'Capgemini',
    status: 'EN ATTENTE',
    statusClass: 'bg-primary/10 text-primary',
    priority: 'Moyenne',
    priorityClass: 'bg-gray-100 text-gray-600',
    slaRemaining: '03h 10m',
    slaPercent: 63,
    assignedAt: '22/06/2026 16:00',
    description: 'Pages intranet non accessibles après la mise à jour',
  },
  {
    id: '2026-06-22-4',
    app: 'CRM',
    client: 'Sopra',
    status: 'RÉSOLU',
    statusClass: 'bg-success/10 text-success',
    priority: 'Basse',
    priorityClass: 'bg-gray-100 text-gray-600',
    slaRemaining: '—',
    slaPercent: 100,
    assignedAt: '22/06/2026 12:30',
    description: 'Données manquantes sur les fiches clients',
  },
  {
    id: '2026-06-21-9',
    app: 'ERP Finance',
    client: 'CGI',
    status: 'RÉSOLU',
    statusClass: 'bg-success/10 text-success',
    priority: 'Haute',
    priorityClass: 'bg-warning/10 text-warning',
    slaRemaining: '—',
    slaPercent: 100,
    assignedAt: '21/06/2026 08:45',
    description: 'Module de facturation inaccessible',
  },
];

const kpis = [
  { label: 'Assignés',       value: '5', icon: ClipboardList, color: 'text-primary bg-primary/10'     },
  { label: 'En cours',       value: '1', icon: Clock,         color: 'text-secondary bg-secondary/10' },
  { label: 'Résolus auj.',   value: '2', icon: CheckCircle,   color: 'text-success bg-success/10'     },
  { label: 'SLA en risque',  value: '1', icon: AlertTriangle, color: 'text-danger bg-danger/10'       },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function RTHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] ?? 'vous';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = assignedIncidents.filter(inc => {
    const matchSearch =
      inc.id.toLowerCase().includes(search.toLowerCase()) ||
      inc.app.toLowerCase().includes(search.toLowerCase()) ||
      inc.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      inc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Responsable de Traitement · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="card-white p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
              <h2 className="text-3xl font-bold text-gray-900">{kpi.value}</h2>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* SLA Alert */}
      <div className="bg-danger/10 border border-danger/20 rounded-xl px-5 py-3.5 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-danger/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-danger" />
        </div>
        <div>
          <p className="text-sm font-bold text-danger">Incident 2026-06-23-1 va dépasser son SLA dans moins de 30 minutes</p>
          <p className="text-xs text-danger/70 mt-0.5">Portail RH · Priorité Critique · Assigné à vous</p>
        </div>
      </div>

      {/* Incident Table */}
      <div className="card-white flex flex-col">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-bold text-gray-900">Mes incidents assignés</h3>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            {/* Status Filter */}
            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
              {[['all', 'Tous'], ['EN COURS', 'En cours'], ['EN ATTENTE', 'En attente'], ['RÉSOLU', 'Résolus']].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val)}
                  className={`px-3 py-2 transition-colors ${statusFilter === val ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <button className="flex items-center space-x-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 font-medium sticky top-0 bg-white shadow-sm">
              <tr>
                <th className="py-3 px-5 font-medium">ID</th>
                <th className="py-3 px-5 font-medium">APPLICATION</th>
                <th className="py-3 px-5 font-medium">CLIENT</th>
                <th className="py-3 px-5 font-medium">STATUT</th>
                <th className="py-3 px-5 font-medium">SLA RESTANT</th>
                <th className="py-3 px-5 font-medium">PRIORITÉ</th>
                <th className="py-3 px-5 font-medium">ASSIGNÉ LE</th>
                <th className="py-3 px-5 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((inc, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                  onClick={() => navigate(`/rt/incident/${inc.id}`)}
                >
                  <td className="py-4 px-5 font-medium text-gray-900">{inc.id}</td>
                  <td className="py-4 px-5 text-gray-600">{inc.app}</td>
                  <td className="py-4 px-5 text-gray-600">{inc.client}</td>
                  <td className="py-4 px-5">
                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${inc.statusClass}`}>{inc.status}</span>
                  </td>
                  <td className="py-4 px-5">
                    {inc.slaRemaining === '—' ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold text-xs ${inc.slaPercent <= 15 ? 'text-danger' : inc.slaPercent <= 35 ? 'text-warning' : 'text-gray-600'}`}>
                          {inc.slaRemaining}
                        </span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${inc.slaPercent <= 15 ? 'bg-danger' : inc.slaPercent <= 35 ? 'bg-warning' : 'bg-success'}`}
                            style={{ width: inc.slaPercent + '%' }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${inc.priorityClass}`}>{inc.priority}</span>
                  </td>
                  <td className="py-4 px-5 text-gray-500 text-xs">{inc.assignedAt}</td>
                  <td className="py-4 px-5 text-right">
                    <button
                      className="flex items-center space-x-1 text-primary text-xs font-semibold hover:underline ml-auto"
                      onClick={e => { e.stopPropagation(); navigate(`/rt/incident/${inc.id}`); }}
                    >
                      <span>Ouvrir</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                    Aucun incident trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
          {filtered.length} sur {assignedIncidents.length} incident(s) affichés
        </div>
      </div>
    </div>
  );
}
