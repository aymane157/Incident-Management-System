import { useState } from 'react';
import { Search, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TicketItem {
  id: string;
  app: string;
  status: 'EN ATTENTE' | 'EN COURS' | 'RÉSOLU' | 'REJETÉ';
  date: string;
  sla: string;
  slap: number;
  prio: 'Critique' | 'Haute' | 'Moyenne' | 'Basse';
}

const mockTickets: TicketItem[] = [
  { id: '2026-06-23-1', app: 'Portail RH', status: 'EN ATTENTE', date: '23/06/2026 10:15', sla: '02h 45m', slap: 35, prio: 'Haute' },
  { id: '2026-06-23-2', app: 'ERP Finance', status: 'EN COURS', date: '23/06/2026 09:47', sla: '05h 20m', slap: 68, prio: 'Moyenne' },
  { id: '2026-06-22-8', app: 'Intranet', status: 'RÉSOLU', date: '22/06/2026 16:22', sla: '—', slap: 100, prio: 'Basse' },
  { id: '2026-06-22-7', app: 'CRM', status: 'EN ATTENTE', date: '22/06/2026 14:11', sla: '01h 10m', slap: 18, prio: 'Haute' },
  { id: '2026-06-21-5', app: 'Portail RH', status: 'REJETÉ', date: '21/06/2026 11:02', sla: '—', slap: 0, prio: 'Basse' },
  { id: '2026-06-20-4', app: 'AD / LDAP', status: 'RÉSOLU', date: '20/06/2026 08:30', sla: '—', slap: 100, prio: 'Critique' },
  { id: '2026-06-19-3', app: 'ERP Finance', status: 'RÉSOLU', date: '19/06/2026 14:15', sla: '—', slap: 100, prio: 'Moyenne' },
  { id: '2026-06-18-2', app: 'Intranet', status: 'RÉSOLU', date: '18/06/2026 11:00', sla: '—', slap: 100, prio: 'Basse' },
];

const statusStyles: Record<TicketItem['status'], { badge: string; text: string }> = {
  'EN ATTENTE': { badge: 'bg-primary/10 text-primary', text: 'EN ATTENTE' },
  'EN COURS': { badge: 'bg-secondary/10 text-secondary', text: 'EN COURS' },
  'RÉSOLU': { badge: 'bg-success/10 text-success', text: 'RÉSOLU' },
  'REJETÉ': { badge: 'bg-danger/10 text-danger', text: 'REJETÉ' },
};

const priorityStyles: Record<TicketItem['prio'], string> = {
  'Critique': 'bg-danger',
  'Haute': 'bg-orange-500',
  'Moyenne': 'bg-warning',
  'Basse': 'bg-success',
};

export default function ClientTickets() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPrio, setSelectedPrio] = useState<string>('ALL');
  const [sortByDate, setSortByDate] = useState<'desc' | 'asc'>('desc');

  const filteredTickets = mockTickets
    .filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.app.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'ALL' || ticket.status === selectedStatus;
      const matchesPrio = selectedPrio === 'ALL' || ticket.prio === selectedPrio;
      return matchesSearch && matchesStatus && matchesPrio;
    })
    .sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('');
      const dateB = b.date.split('/').reverse().join('');
      return sortByDate === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
    });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes tickets</h1>
          <p className="text-gray-500 text-sm">Gérez et suivez l'état de tous vos incidents signalés.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/client/create')} className="btn-primary space-x-2 flex items-center">
            <Plus className="w-4 h-4" />
            <span>Nouveau Ticket</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par ID ou application..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
        </div>

        {/* Option Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filtrer par :</span>
          </div>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="EN ATTENTE">En attente</option>
            <option value="EN COURS">En cours</option>
            <option value="RÉSOLU">Résolus</option>
            <option value="REJETÉ">Rejetés</option>
          </select>

          {/* Priority Select */}
          <select
            value={selectedPrio}
            onChange={(e) => setSelectedPrio(e.target.value)}
            className="bg-white border border-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="ALL">Toutes les priorités</option>
            <option value="Critique">Critique</option>
            <option value="Haute">Haute</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Basse">Basse</option>
          </select>

          {/* Sort button */}
          <button
            onClick={() => setSortByDate(sortByDate === 'desc' ? 'asc' : 'desc')}
            className="flex items-center space-x-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Date : {sortByDate === 'desc' ? 'Récent' : 'Ancien'}</span>
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card-white flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-medium">
              <tr>
                <th className="py-4 px-6 font-medium">ID DU TICKET</th>
                <th className="py-4 px-6 font-medium">APPLICATION</th>
                <th className="py-4 px-6 font-medium">STATUT</th>
                <th className="py-4 px-6 font-medium">DATE DE CRÉATION</th>
                <th className="py-4 px-6 font-medium">SLA RESTANT</th>
                <th className="py-4 px-6 font-medium">PRIORITÉ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="py-4 px-6 font-bold text-gray-900">{row.id}</td>
                    <td className="py-4 px-6 text-gray-700 font-medium">{row.app}</td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusStyles[row.status].badge}`}>
                        {statusStyles[row.status].text}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{row.date}</td>
                    <td className="py-4 px-6 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="w-14 font-medium">{row.sla}</span>
                        {row.sla !== '—' && (
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${row.slap < 30 ? 'bg-danger' : row.slap < 60 ? 'bg-warning' : 'bg-success'}`}
                              style={{ width: row.slap + '%' }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${priorityStyles[row.prio]}`}></div>
                        <span className="text-gray-700 font-medium">{row.prio}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Aucun ticket ne correspond aux critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
