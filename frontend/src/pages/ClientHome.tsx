import { Search, Bell, Plus, Ticket, Clock, CheckCircle, XCircle } from 'lucide-react';
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
}