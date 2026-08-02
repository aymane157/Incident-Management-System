import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Filter, ArrowUpDown, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { fetchIncidents, type IncidentDto } from '../lib/api';

const statusLabels: Record<IncidentDto['status'], string> = {
  NEW: 'En attente',
  VALIDATED: 'Valide',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Resolu',
  CLOSED: 'Resolu',
  REJETE: 'Rejete',
};

const statusStyles: Record<IncidentDto['status'], string> = {
  NEW: 'bg-primary/10 text-primary',
  VALIDATED: 'bg-secondary/10 text-secondary',
  IN_PROGRESS: 'bg-warning/10 text-warning',
  RESOLVED: 'bg-success/10 text-success',
  CLOSED: 'bg-gray-100 text-gray-600',
  REJETE: 'bg-danger/10 text-danger',
};

const priorityLabels: Record<NonNullable<IncidentDto['incidentLevel']>, string> = {
  CRITICAL: 'Critique',
  HIGH: 'Haute',
  MEDIUM: 'Moyenne',
  LOW: 'Basse',
};

const priorityStyles: Record<NonNullable<IncidentDto['incidentLevel']>, string> = {
  CRITICAL: 'bg-danger',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-warning',
  LOW: 'bg-success',
};

type StatusFilter = 'ALL' | IncidentDto['status'];
type PriorityFilter = 'ALL' | NonNullable<IncidentDto['incidentLevel']>;

function formatDate(value?: string | null) {
  if (!value) return 'Non defini';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function fullName(user?: IncidentDto['createdBy']) {
  if (!user) return 'Non assigne';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Non assigne';
}

function formatSlaRemaining(incident: IncidentDto) {
  if (!incident.slaDeadline) return '—';

  const deadline = new Date(incident.slaDeadline).getTime();
  if (Number.isNaN(deadline)) return '—';

  const deltaMs = deadline - Date.now();
  const deltaMinutes = Math.round(Math.abs(deltaMs) / 60000);
  const hours = Math.floor(deltaMinutes / 60);
  const minutes = deltaMinutes % 60;
  const text = `${hours}h ${String(minutes).padStart(2, '0')}m`;

  return deltaMs < 0 ? `En retard de ${text}` : text;
}

function priorityTone(level?: IncidentDto['incidentLevel'] | null) {
  if (!level) return 'bg-gray-100 text-gray-600';
  return priorityStyles[level];
}

export default function ClientTickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<IncidentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [selectedPrio, setSelectedPrio] = useState<PriorityFilter>('ALL');
  const [sortByDate, setSortByDate] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    let active = true;

    async function loadTickets() {
      if (!user?.id) {
        setError('Utilisateur non connecte.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await fetchIncidents();
        if (!active) return;
        const owned = data.filter((incident) => incident.createdBy?.id === user.id);
        setIncidents(owned);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger vos tickets.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTickets();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const filteredTickets = useMemo(() => {
    return incidents
      .filter((ticket) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          ticket.reference.toLowerCase().includes(q) ||
          ticket.name?.toLowerCase().includes(q) ||
          ticket.description?.toLowerCase().includes(q) ||
          ticket.application?.name?.toLowerCase().includes(q);
        const matchesStatus = selectedStatus === 'ALL' || ticket.status === selectedStatus;
        const matchesPrio = selectedPrio === 'ALL' || ticket.incidentLevel === selectedPrio;
        return matchesSearch && matchesStatus && matchesPrio;
      })
      .sort((left, right) => {
        const leftDate = new Date(left.createdAt ?? 0).getTime();
        const rightDate = new Date(right.createdAt ?? 0).getTime();
        return sortByDate === 'desc' ? rightDate - leftDate : leftDate - rightDate;
      });
  }, [incidents, searchTerm, selectedStatus, selectedPrio, sortByDate]);

  const summary = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((ticket) => ticket.status === 'NEW' || ticket.status === 'VALIDATED' || ticket.status === 'IN_PROGRESS').length;
    const resolved = incidents.filter((ticket) => ticket.status === 'RESOLVED').length;
    const rejected = incidents.filter((ticket) => ticket.status === 'REJETE').length;

    return { total, open, resolved, rejected };
  }, [incidents]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-gray-700">Chargement de vos tickets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes tickets</h1>
          <p className="text-gray-500 text-sm">Gerez et suivez l'etat de tous vos incidents signales.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/client/create')} className="btn-primary space-x-2 flex items-center">
            <Plus className="w-4 h-4" />
            <span>Nouveau Ticket</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-white p-5">
          <p className="text-sm font-medium text-gray-500">Total</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>
        <div className="card-white p-5">
          <p className="text-sm font-medium text-gray-500">Ouverts</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.open}</p>
        </div>
        <div className="card-white p-5">
          <p className="text-sm font-medium text-gray-500">Resolus</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.resolved}</p>
        </div>
        <div className="card-white p-5">
          <p className="text-sm font-medium text-gray-500">Rejetes</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.rejected}</p>
        </div>
      </div>

      <div className="card-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par reference, application ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filtrer par :</span>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
            className="bg-white border border-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="ALL">Tous les statuts</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={selectedPrio}
            onChange={(e) => setSelectedPrio(e.target.value as PriorityFilter)}
            className="bg-white border border-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="ALL">Toutes les priorites</option>
            <option value="CRITICAL">Critique</option>
            <option value="HIGH">Haute</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Basse</option>
          </select>

          <button
            onClick={() => setSortByDate(sortByDate === 'desc' ? 'asc' : 'desc')}
            className="flex items-center space-x-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Date : {sortByDate === 'desc' ? 'Recent' : 'Ancien'}</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      <div className="card-white flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-medium">
              <tr>
                <th className="py-4 px-6 font-medium">REFERENCE</th>
                <th className="py-4 px-6 font-medium">APPLICATION</th>
                <th className="py-4 px-6 font-medium">STATUT</th>
                <th className="py-4 px-6 font-medium">DATE</th>
                <th className="py-4 px-6 font-medium">SLA RESTANT</th>
                <th className="py-4 px-6 font-medium">PRIORITE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/incidents/${ticket.reference}`)}
                  >
                    <td className="py-4 px-6 font-bold text-gray-900">
                      <div>
                        <p>{ticket.reference}</p>
                        <p className="mt-1 text-xs font-normal text-gray-400">{fullName(ticket.createdBy)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-medium">{ticket.application?.name ?? 'Application'}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[ticket.status]}`}>
                          {statusLabels[ticket.status]}
                        </span>
                        {ticket.status === 'REJETE' && ticket.rejectionReason ? (
                          <p className="max-w-xs text-xs text-gray-500 line-clamp-2">
                            {ticket.rejectionReason}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{formatDate(ticket.createdAt)}</td>
                    <td className="py-4 px-6 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="w-28 font-medium">{formatSlaRemaining(ticket)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {ticket.incidentLevel ? (
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${priorityTone(ticket.incidentLevel)}`} />
                          <span className="text-gray-700 font-medium">{priorityLabels[ticket.incidentLevel]}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Aucun ticket ne correspond aux criteres de recherche.
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
