import { Search, Bell, Plus, Ticket, Clock, CheckCircle, XCircle, TrendingUp, HelpCircle, Activity, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function ClientHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'vous';

  // KPIs
  const kpis = [
    { label: 'Total tickets', value: '36', trend: '+12% vs mois dernier', icon: Ticket, color: 'text-primary bg-primary/10', trendColor: 'text-success' },
    { label: 'En cours', value: '12', trend: '+4% vs mois dernier', icon: Clock, color: 'text-secondary bg-secondary/10', trendColor: 'text-success' },
    { label: 'Résolus', value: '18', trend: '+18% vs mois dernier', icon: CheckCircle, color: 'text-success bg-success/10', trendColor: 'text-success' },
    { label: 'Rejetés', value: '6', trend: '-8% vs mois dernier', icon: XCircle, color: 'text-danger bg-danger/10', trendColor: 'text-danger' },
  ];

  // Recharts Chart Data: Ticket Activity (last 7 days)
  const ticketHistoryData = [
    { name: 'Lun', Ouverts: 4, Résolus: 2 },
    { name: 'Mar', Ouverts: 6, Résolus: 3 },
    { name: 'Mer', Ouverts: 5, Résolus: 4 },
    { name: 'Jeu', Ouverts: 8, Résolus: 6 },
    { name: 'Ven', Ouverts: 7, Résolus: 5 },
    { name: 'Sam', Ouverts: 2, Résolus: 2 },
    { name: 'Dim', Ouverts: 4, Résolus: 3 },
  ];

  // Recharts Chart Data: App Distribution
  const appDistributionData = [
    { name: 'Portail RH', value: 15 },
    { name: 'ERP Finance', value: 10 },
    { name: 'CRM', value: 8 },
    { name: 'Intranet', value: 3 },
  ];

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bon retour, {firstName} 👋</h1>
          <p className="text-gray-500 text-sm">Voici l'état actuel de vos services et demandes de support.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Rechercher un incident..." className="w-full bg-white border border-gray-200 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary" />
          </div>
          <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          <button onClick={() => navigate('/client/create')} className="btn-primary space-x-2 flex items-center">
            <Plus className="w-4 h-4" />
            <span>Nouveau Ticket</span>
          </button>
        </div>
      </div>

      {/* KPIs Row */}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Trends Chart (Area) */}
        <div className="lg:col-span-2 card-white p-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">Activité des Tickets</h3>
              <p className="text-xs text-gray-400">Évolution du nombre de tickets créés vs résolus sur 7 jours</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                <span className="text-gray-600">Ouverts</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-success inline-block"></span>
                <span className="text-gray-600">Résolus</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ticketHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOuverts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Ouverts" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorOuverts)" />
                <Area type="monotone" dataKey="Résolus" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution Chart (Bar) */}
        <div className="card-white p-6 flex flex-col space-y-4">
          <div>
            <h3 className="font-bold text-gray-900">Répartition par Application</h3>
            <p className="text-xs text-gray-400">Nombre de tickets soumis par application</p>
          </div>
          <div className="h-72 w-full flex flex-col justify-between">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appDistributionData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#374151" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {appDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend/Quick Stats */}
            <div className="space-y-1 bg-gray-50 rounded-xl p-3 text-xs text-gray-600 border border-gray-100">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Application la plus sollicitée :</span>
                <span>Portail RH (41%)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Applications actives :</span>
                <span>4 applications</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Dashboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance / Service Health */}
        <div className="card-white p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900">Santé du Service</h3>
              <p className="text-xs text-gray-400">Respect des engagements de service (SLA)</p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-gray-700">Taux de respect SLA</span>
              </div>
              <span className="text-base font-bold text-success">94.4%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-gray-700">Temps de résolution moy.</span>
              </div>
              <span className="text-base font-bold text-gray-900">3h 15m</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-gray-700">Temps de 1ère réponse</span>
              </div>
              <span className="text-base font-bold text-gray-900">22 min</span>
            </div>
          </div>
          <div className="bg-primary/5 rounded-2xl p-4 mt-6 flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-primary-dark">
              <p className="font-semibold">Une question sur vos SLA ?</p>
              <p className="mt-0.5 opacity-80">Consultez la charte de support technique ou contactez votre Account Manager.</p>
            </div>
          </div>
        </div>

        {/* Quick Tickets Summary View */}
        <div className="card-white flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Tickets Récents</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">Top 3</span>
          </div>
          <div className="p-2 overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 font-medium">
                <tr>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">APPLI</th>
                  <th className="py-2 px-3">STATUT</th>
                  <th className="py-2 px-3">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { id: '2026-06-23-1', app: 'Portail RH', status: 'EN ATTENTE', sc: 'bg-primary/10 text-primary', date: '23/06' },
                  { id: '2026-06-23-2', app: 'ERP Finance', status: 'EN COURS', sc: 'bg-secondary/10 text-secondary', date: '23/06' },
                  { id: '2026-06-22-8', app: 'Intranet', status: 'RÉSOLU', sc: 'bg-success/10 text-success', date: '22/06' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => navigate('/client/tickets')}>
                    <td className="py-3 px-3 font-semibold text-gray-900">{row.id}</td>
                    <td className="py-3 px-3 text-gray-600">{row.app}</td>
                    <td className="py-3 px-3">
                      <span className={"text-[9px] px-1.5 py-0.5 rounded font-bold " + row.sc}>{row.status}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-400">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 mt-auto border-t border-gray-100 text-center">
            <button onClick={() => navigate('/client/tickets')} className="text-primary text-sm font-semibold hover:underline">
              Voir tous mes tickets →
            </button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card-white flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Activité Récente</h3>
          </div>
          <div className="p-5 space-y-4 flex-1">
            <div className="relative pl-4 border-l-2 border-primary/20 space-y-5">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-white"></div>
                <p className="text-xs text-gray-900 font-medium">Ticket 2026-06-23-1 est en cours de traitement</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Il y a 15 min</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-success rounded-full ring-4 ring-white"></div>
                <p className="text-xs text-gray-900 font-medium">Ticket 2026-06-22-8 a été résolu</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Il y a 1 heure</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-danger rounded-full ring-4 ring-white"></div>
                <p className="text-xs text-gray-900 font-medium">Votre ticket 2026-06-21-5 a été rejeté</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Hier à 16:45</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}