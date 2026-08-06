import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  Clock,
  Filter,
  Loader2,
  Search,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  fetchTeamById,
  fetchTeamIncidents,
  fetchUserById,
  type IncidentDto,
  type TeamDto,
  type UserDto,
} from '../lib/api';

function formatName(user?: UserDto | null) {
  if (!user) return 'Non assigné';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Non assigné';
}

function statusLabel(status: IncidentDto['status']) {
  switch (status) {
    case 'NEW':
      return 'Nouveau';
    case 'VALIDATED':
      return 'Validé';
    case 'IN_PROGRESS':
      return 'En cours';
    case 'RESOLVED':
      return 'Résolu';
    case 'CLOSED':
      return 'Clos';
    case 'REJETE':
      return 'Rejeté';
    default:
      return status;
  }
}

function statusClass(status: IncidentDto['status']) {
  switch (status) {
    case 'NEW':
      return 'bg-primary/10 text-primary';
    case 'VALIDATED':
      return 'bg-secondary/10 text-secondary';
    case 'IN_PROGRESS':
      return 'bg-warning/10 text-warning';
    case 'RESOLVED':
      return 'bg-success/10 text-success';
    case 'CLOSED':
      return 'bg-gray-100 text-gray-600';
    case 'REJETE':
      return 'bg-danger/10 text-danger';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function priorityClass(level?: IncidentDto['incidentLevel'] | null) {
  switch (level) {
    case 'CRITICAL':
      return 'bg-danger/10 text-danger';
    case 'HIGH':
      return 'bg-warning/10 text-warning';
    case 'MEDIUM':
      return 'bg-secondary/10 text-secondary';
    case 'LOW':
      return 'bg-success/10 text-success';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export default function RTHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [team, setTeam] = useState<TeamDto | null>(null);
  const [incidents, setIncidents] = useState<IncidentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | IncidentDto['status']>('all');

  useEffect(() => {
    let active = true;

    async function loadQueue() {
      if (!user?.id) {
        setError('Utilisateur non connecté.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const userData = await fetchUserById(user.id);
        if (!active) return;
        setCurrentUser(userData);

        if (!userData.teamId) {
          setError('Ce compte n’est rattaché à aucune équipe.');
          setTeam(null);
          setIncidents([]);
          return;
        }

        const [teamData, incidentsData] = await Promise.all([
          fetchTeamById(userData.teamId),
          fetchTeamIncidents(userData.teamId),
        ]);

        if (!active) return;
        setTeam(teamData);
        setIncidents(incidentsData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger la file de traitement.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQueue();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const firstName = user?.name?.split(' ')[0] ?? 'vous';

  const filtered = useMemo(() => {
    return incidents.filter((incident) => {
      const matchSearch =
        incident.reference.toLowerCase().includes(search.toLowerCase()) ||
        incident.name?.toLowerCase().includes(search.toLowerCase()) ||
        incident.description?.toLowerCase().includes(search.toLowerCase()) ||
        incident.application?.name?.toLowerCase().includes(search.toLowerCase()) ||
        formatName(incident.createdBy).toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || incident.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [incidents, search, statusFilter]);

  const newCount = incidents.filter((incident) => incident.status === 'NEW').length;
  const inProgressCount = incidents.filter((incident) => incident.status === 'IN_PROGRESS').length;
  const riskCount = incidents.filter((incident) => incident.incidentLevel === 'CRITICAL' || incident.incidentLevel === 'HIGH').length;
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-gray-700">Chargement de votre file d?incidents...</span>
        </div>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="h-full bg-background p-8">
        <div className="card-white mx-auto max-w-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900">Acc?s RT</h1>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {team ? `Équipe ${team.name ?? 'non nommée'} · ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}` : 'Aucune équipe associée'}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          <div className="font-semibold text-gray-900">{formatName(currentUser)}</div>
          <div>{currentUser?.teamName ?? 'Membre équipe'}</div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assignés équipe', value: incidents.length, icon: ClipboardList, color: 'text-primary bg-primary/10' },
          { label: 'Nouveaux', value: newCount, icon: Clock, color: 'text-secondary bg-secondary/10' },
          { label: 'En cours', value: inProgressCount, icon: CheckCircle, color: 'text-success bg-success/10' },
          { label: 'SLA en risque', value: riskCount, icon: AlertTriangle, color: 'text-danger bg-danger/10' },
        ].map((kpi, i) => (
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

      <div className="card-white flex flex-col">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900">Incidents de mon équipe</h3>
            <p className="text-xs text-gray-500 mt-1">
              Vous pouvez prendre en charge un incident avant d’ouvrir le rapport RCA.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
              {[
                ['all', 'Tous'],
                ['NEW', 'Nouveaux'],
                ['IN_PROGRESS', 'En cours'],
                ['RESOLVED', 'Résolus'],
              ].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val as typeof statusFilter)}
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
                <th className="py-3 px-5 font-medium">RÉF.</th>
                <th className="py-3 px-5 font-medium">APPLICATION</th>
                <th className="py-3 px-5 font-medium">CLIENT</th>
                <th className="py-3 px-5 font-medium">STATUT</th>
                <th className="py-3 px-5 font-medium">PRIORITÉ</th>
                <th className="py-3 px-5 font-medium">AFFECTÉ À</th>
                <th className="py-3 px-5 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((incident) => {
                return (
                  <tr
                    key={incident.id}
                    className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                    onClick={() => navigate(`/rt/incident/${incident.reference}`)}
                  >
                    <td className="py-4 px-5 font-medium text-gray-900">{incident.reference}</td>
                    <td className="py-4 px-5 text-gray-600">{incident.application?.name ?? '?'}</td>
                    <td className="py-4 px-5 text-gray-600">{formatName(incident.createdBy)}</td>
                    <td className="py-4 px-5">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold ${statusClass(incident.status)}`}>
                        {statusLabel(incident.status)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${priorityClass(incident.incidentLevel)}`}>
                        {incident.incidentLevel ?? '?'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-500 text-xs">
                      {formatName(incident.handledBy)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        className="flex items-center space-x-1 text-primary text-xs font-semibold hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/rt/incident/${incident.reference}`);
                        }}
                      >
                        <span>Ouvrir</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                    Aucun incident trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
          {filtered.length} sur {incidents.length} incident(s) affiché(s)
        </div>
      </div>
    </div>
  );
}





