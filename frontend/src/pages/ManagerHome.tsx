import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, Clock, Lock,
  TrendingUp, Users, ArrowRight, Zap,
  Bell, Search
} from 'lucide-react';
import { useAuth } from '../lib/auth';

// ─── Mock data ────────────────────────────────────────────────────────────────

const kpis = [
  {
    label: 'Tickets ouverts',
    value: '84',
    trend: '+6 depuis hier',
    trendUp: false,
    icon: Lock,
    color: 'text-primary bg-primary/10',
  },
  {
    label: 'SLA en risque',
    value: '8',
    trend: '+2 depuis hier',
    trendUp: false,
    icon: AlertTriangle,
    color: 'text-warning bg-warning/10',
  },
  {
    label: 'Résolus aujourd\'hui',
    value: '47',
    trend: '+15% vs hier',
    trendUp: true,
    icon: CheckCircle,
    color: 'text-success bg-success/10',
  },
  {
    label: 'Temps moy. résolution',
    value: '2h 14m',
    trend: '-8% vs hier',
    trendUp: true,
    icon: TrendingUp,
    color: 'text-secondary bg-secondary/10',
  },
];

const urgentTickets = [
  { id: '2026-06-23-1', app: 'Portail RH',   client: 'CGI',      sla: '00h 22m', slap: 8,  prio: 'Critique' },
  { id: '2026-06-23-4', app: 'ERP Finance',   client: 'Atos',     sla: '00h 47m', slap: 15, prio: 'Haute'    },
  { id: '2026-06-22-9', app: 'CRM',           client: 'Capgemini',sla: '01h 05m', slap: 22, prio: 'Haute'    },
  { id: '2026-06-22-7', app: 'Intranet',      client: 'CGI',      sla: '01h 30m', slap: 30, prio: 'Moyenne'  },
  { id: '2026-06-22-3', app: 'AD / LDAP',     client: 'Sopra',    sla: '01h 55m', slap: 38, prio: 'Haute'    },
];

const teamLoad = [
  { team: 'Support N1', tickets: 23, capacity: 30 },
  { team: 'Système',    tickets: 18, capacity: 20 },
  { team: 'Réseau',     tickets: 12, capacity: 20 },
  { team: 'Sécurité',   tickets: 9,  capacity: 15 },
  { team: 'BDD',        tickets: 14, capacity: 15 },
];

const recentActivity = [
  { color: 'bg-success',   text: 'Ticket 2026-06-23-2 résolu par Marie Martin',          time: 'Il y a 8 min'  },
  { color: 'bg-danger',    text: 'SLA critique sur 2026-06-23-1 — moins de 30 minutes',   time: 'Il y a 12 min' },
  { color: 'bg-primary',   text: 'Ticket 2026-06-23-3 assigné à l\'équipe Système',       time: 'Il y a 20 min' },
  { color: 'bg-warning',   text: 'Ticket 2026-06-22-9 escaladé en priorité haute',        time: 'Il y a 34 min' },
  { color: 'bg-secondary', text: 'Nouveau ticket 2026-06-23-5 créé par Atos',             time: 'Il y a 41 min' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManagerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name?.split(' ')[0] ?? 'Manager';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Tableau de bord · Incident Manager · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un ticket, un client..."
              className="w-full bg-white border border-gray-200 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          <button
            onClick={() => navigate('/manager/workspace')}
            className="btn-primary space-x-2 flex items-center"
          >
            <Zap className="w-4 h-4" />
            <span>Workspace</span>
          </button>
        </div>
      </div>

      {/* ── SLA Alert Banner ──────────────────────────────────────────── */}
      <div className="bg-danger/10 border border-danger/20 rounded-xl px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-danger/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-danger" />
          </div>
          <div>
            <p className="text-sm font-bold text-danger">2 tickets vont dépasser leur SLA dans moins de 30 minutes</p>
            <p className="text-xs text-danger/70 mt-0.5">2026-06-23-1 (Portail RH) · 2026-06-23-4 (ERP Finance)</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/manager/workspace')}
          className="flex items-center space-x-1.5 text-sm font-semibold text-danger hover:underline shrink-0"
        >
          <span>Intervenir</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="card-white p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</h2>
              <p className={`text-xs font-medium ${kpi.trendUp ? 'text-success' : 'text-danger'}`}>{kpi.trend}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Priority Queue */}
        <div className="flex-[2] card-white flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">File de priorité — SLA critique</h3>
              <p className="text-xs text-gray-400 mt-0.5">Tickets classés par temps SLA restant</p>
            </div>
            <button
              onClick={() => navigate('/manager/workspace')}
              className="text-primary text-xs font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Voir tout</span><ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 font-medium">
                <tr>
                  <th className="py-3 px-5 font-medium">ID</th>
                  <th className="py-3 px-5 font-medium">APPLICATION</th>
                  <th className="py-3 px-5 font-medium">CLIENT</th>
                  <th className="py-3 px-5 font-medium">SLA RESTANT</th>
                  <th className="py-3 px-5 font-medium">PRIORITÉ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {urgentTickets.map((t, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                    onClick={() => navigate('/manager/workspace')}
                  >
                    <td className="py-3.5 px-5 font-medium text-gray-900">{t.id}</td>
                    <td className="py-3.5 px-5 text-gray-600">{t.app}</td>
                    <td className="py-3.5 px-5 text-gray-600">{t.client}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold text-xs ${t.slap <= 15 ? 'text-danger' : t.slap <= 30 ? 'text-warning' : 'text-gray-600'}`}>
                          {t.sla}
                        </span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${t.slap <= 15 ? 'bg-danger' : t.slap <= 30 ? 'bg-warning' : 'bg-success'}`}
                            style={{ width: t.slap + '%' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        t.prio === 'Critique' ? 'bg-danger/10 text-danger' :
                        t.prio === 'Haute'    ? 'bg-warning/10 text-warning' :
                                                'bg-gray-100 text-gray-500'
                      }`}>
                        {t.prio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Team Load + Activity */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Team Workload */}
          <div className="card-white">
            <div className="p-5 border-b border-gray-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-gray-900">Charge des équipes</h3>
            </div>
            <div className="p-5 space-y-4">
              {teamLoad.map((t, i) => {
                const pct = Math.round((t.tickets / t.capacity) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                      <span>{t.team}</span>
                      <span className={pct >= 90 ? 'text-danger' : pct >= 70 ? 'text-warning' : 'text-success'}>
                        {t.tickets}/{t.capacity}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: pct + '%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-white flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Activité récente</h3>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="relative pl-4 border-l-2 border-primary/20 space-y-5">
                {recentActivity.map((a, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 ${a.color} rounded-full ring-4 ring-white`} />
                    <p className="text-sm text-gray-900 font-medium leading-snug">{a.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 text-center">
              <button className="text-primary text-sm font-semibold hover:underline">
                Voir toute l'activité
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Quick stats row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-white p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Tickets en attente de validation</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">23</p>
          </div>
        </div>
        <div className="card-white p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Techniciens actifs aujourd'hui</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">14</p>
          </div>
        </div>
        <div className="card-white p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Taux de résolution dans les SLA</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">91%</p>
          </div>
        </div>
      </div>

    </div>
  );
}
