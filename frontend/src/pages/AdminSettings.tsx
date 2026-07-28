import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Layers, Shield, Clock, AlertTriangle, Activity } from 'lucide-react';
import TeamDiagram from '../components/TeamDiagram';
import {
  fetchApplications,
  fetchIncidents,
  fetchTeams,
  fetchUsers,
  updateUser,
  type ApplicationOption,
  type IncidentDto,
  type TeamDto,
  type UserDto,
} from '../lib/api';

type Tab = 'utilisateurs' | 'applications' | 'equipes' | 'sla';

const tabRoutes: Record<Tab, string> = {
  utilisateurs: '/admin',
  applications: '/admin/apps',
  equipes: '/admin/teams',
  sla: '/admin/sla',
};

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'utilisateurs', label: 'Utilisateurs' },
  { id: 'applications', label: 'Applications' },
  { id: 'equipes', label: 'Equipes' },
  { id: 'sla', label: 'SLA & Regles' },
];

function pathToTab(pathname: string): Tab {
  if (pathname.includes('/teams')) return 'equipes';
  if (pathname.includes('/apps')) return 'applications';
  if (pathname.includes('/sla') || pathname.includes('/settings')) return 'sla';
  return 'utilisateurs';
}

function formatName(user: UserDto): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Utilisateur';
}

type UserEditForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  teamId: string;
};

const USER_ROLES = ['ADMIN', 'CLIENT', 'INCIDENT_MANAGER', 'MEMBRE_EQUIPE', 'RESPONSABLE_TRAITEMENT'];

function roleLabel(role?: string | null): string {
  if (!role) return 'Inconnu';
  const map: Record<string, string> = {
    ADMIN: 'ADMIN',
    CLIENT: 'CLIENT',
    INCIDENT_MANAGER: 'INCIDENT MANAGER',
    MEMBRE_EQUIPE: 'TECHNICIEN',
    RESPONSABLE_TRAITEMENT: 'RESPONSABLE TRAITEMENT',
  };
  return map[role] ?? role.replace(/_/g, ' ');
}

function roleTone(role?: string | null): string {
  if (role === 'ADMIN') return 'text-danger';
  if (role === 'INCIDENT_MANAGER') return 'text-secondary';
  if (role === 'CLIENT') return 'text-primary';
  return 'text-gray-500';
}

function getIncidentDeadline(incident: IncidentDto): Date | null {
  if (!incident.slaDeadline) return null;
  const deadline = new Date(incident.slaDeadline);
  return Number.isNaN(deadline.getTime()) ? null : deadline;
}

function getMostRecentTimestamp(incident: IncidentDto): Date | null {
  const candidates = [
    incident.closedAt,
    incident.resolvedAt,
    incident.assignedAt,
    incident.validatedAt,
    incident.createdAt,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function sameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatRelativeTime(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const future = diffMs > 0;
  const diffMinutes = Math.max(1, Math.round(Math.abs(diffMs) / 60000));

  if (diffMinutes < 60) return future ? `Dans ${diffMinutes} min` : `Il y a ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return future ? `Dans ${diffHours} h` : `Il y a ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  return future ? `Dans ${diffDays} j` : `Il y a ${diffDays} j`;
}

function buildRecentActivity(incidents: IncidentDto[]) {
  const statusText: Record<string, string> = {
    NEW: 'Nouveau ticket cree',
    VALIDATED: 'Ticket valide',
    IN_PROGRESS: 'Ticket pris en charge',
    RESOLVED: 'Ticket resolu',
    CLOSED: 'Ticket clos',
    REJETE: 'Ticket refuse',
  };

  return incidents
    .map((incident) => {
      const timestamp = getMostRecentTimestamp(incident);
      if (!timestamp) return null;

      return {
        id: incident.reference ?? String(incident.id),
        timestamp,
        text: `${statusText[incident.status] ?? 'Ticket mis a jour'} - ${incident.reference}`,
        time: formatRelativeTime(timestamp),
        tone:
          incident.status === 'REJETE'
            ? 'bg-danger'
            : incident.status === 'RESOLVED' || incident.status === 'CLOSED'
              ? 'bg-success'
              : incident.status === 'IN_PROGRESS'
                ? 'bg-secondary'
                : 'bg-primary',
      };
    })
    .filter((item): item is { id: string; timestamp: Date; text: string; time: string; tone: string } => item !== null)
    .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
    .slice(0, 5)
    .map(({ timestamp, ...rest }) => rest);
}

export default function AdminSettings() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>(() => pathToTab(location.pathname));
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserDto[]>([]);
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [applications, setApplications] = useState<ApplicationOption[]>([]);
  const [incidents, setIncidents] = useState<IncidentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [editForm, setEditForm] = useState<UserEditForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CLIENT',
    teamId: '',
  });
  const [savingUser, setSavingUser] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setActiveTab(pathToTab(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const [usersData, teamsData, applicationsData, incidentsData] = await Promise.all([
          fetchUsers(),
          fetchTeams(),
          fetchApplications(),
          fetchIncidents(),
        ]);

        if (!active) return;

        setUsers(usersData);
        setTeams(teamsData);
        setApplications(applicationsData);
        setIncidents(incidentsData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger le tableau de bord administrateur.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const openIncidents = useMemo(
    () => incidents.filter((incident) => incident.status !== 'RESOLVED' && incident.status !== 'CLOSED'),
    [incidents]
  );

  const usersWithoutTeam = useMemo(() => users.filter((user) => !user.teamId), [users]);

  const slaAtRisk = useMemo(() => {
    const now = Date.now();
    const windowMs = 30 * 60 * 1000;

    return incidents.filter((incident) => {
      if (incident.status === 'RESOLVED' || incident.status === 'CLOSED') return false;
      const deadline = getIncidentDeadline(incident);
      if (!deadline) return false;
      return deadline.getTime() >= now && deadline.getTime() <= now + windowMs;
    });
  }, [incidents]);

  const resolvedToday = useMemo(() => {
    const today = new Date();
    return incidents.filter((incident) => {
      const resolvedDate = incident.resolvedAt ? new Date(incident.resolvedAt) : null;
      const closedDate = incident.closedAt ? new Date(incident.closedAt) : null;
      return (
        (resolvedDate && !Number.isNaN(resolvedDate.getTime()) && sameDay(resolvedDate, today)) ||
        (closedDate && !Number.isNaN(closedDate.getTime()) && sameDay(closedDate, today))
      );
    });
  }, [incidents]);

  const averageResolution = useMemo(() => {
    const durations = incidents
      .map((incident) => {
        if (!incident.createdAt) return null;
        const endSource = incident.resolvedAt ?? incident.closedAt;
        if (!endSource) return null;

        const start = new Date(incident.createdAt);
        const end = new Date(endSource);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

        return end.getTime() - start.getTime();
      })
      .filter((value): value is number => value !== null && value >= 0);

    if (durations.length === 0) return 'N/A';

    const averageMinutes = Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length / 60000);
    const hours = Math.floor(averageMinutes / 60);
    const minutes = averageMinutes % 60;
    return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
  }, [incidents]);

  const userCards = useMemo(
    () => [
      { label: 'Utilisateurs', value: users.length, icon: Users, color: 'text-primary bg-primary/10' },
      { label: 'Equipes', value: teams.length, icon: Layers, color: 'text-secondary bg-secondary/10' },
      { label: 'Tickets ouverts', value: openIncidents.length, icon: Shield, color: 'text-warning bg-warning/10' },
      { label: 'SLA a risque', value: slaAtRisk.length, icon: AlertTriangle, color: 'text-danger bg-danger/10' },
    ],
    [openIncidents.length, slaAtRisk.length, teams.length, users.length]
  );

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const haystack = [
        formatName(user),
        user.email ?? '',
        user.teamName ?? '',
        roleLabel(user.role),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [searchQuery, users]);

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return applications;

    return applications.filter((application) => {
      const haystack = [
        application.name ?? '',
        application.description ?? '',
        application.clientUser ? formatName(application.clientUser) : '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [applications, searchQuery]);

  const filteredTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return teams;

    return teams.filter((team) => {
      const haystack = [
        team.name ?? '',
        team.description ?? '',
        team.functionRole ?? '',
        ...(team.members ?? []).map((member) => formatName(member)),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [searchQuery, teams]);

  const recentActivity = useMemo(() => buildRecentActivity(incidents), [incidents]);

  function goToTab(tab: Tab) {
    navigate(tabRoutes[tab]);
  }

  function openUserEditor(user: UserDto) {
    setEditingUser(user);
    setSaveError('');
    setEditForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      password: '',
      role: user.role ?? 'CLIENT',
      teamId: user.teamId ? String(user.teamId) : '',
    });
  }

  async function handleSaveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) return;

    setSavingUser(true);
    setSaveError('');

    try {
      const saved = await updateUser(editingUser.id, {
        id: editingUser.id,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        password: editForm.password.trim() || undefined,
        role: editForm.role as UserDto['role'],
        teamId: editForm.teamId ? Number(editForm.teamId) : null,
      });

      setUsers((current) => current.map((user) => (user.id === saved.id ? saved : user)));
      setEditingUser(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Impossible de mettre a jour l'utilisateur.");
    } finally {
      setSavingUser(false);
    }
  }

  return (
    <div className="h-full bg-background p-6">
      <div className="mb-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {userCards.map((card) => (
          <div key={card.label} className="card-white flex items-center justify-between p-5">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">{card.label}</p>
              <h2 className="mb-1 text-3xl font-bold text-gray-900">{card.value}</h2>
              <p className="text-xs font-medium text-gray-400">
                {card.label === 'Tickets ouverts'
                  ? `${resolvedToday.length} resolus aujourd'hui`
                  : card.label === 'SLA a risque'
                    ? `${usersWithoutTeam.length} utilisateurs sans equipe`
                    : 'Donnees en temps reel'}
              </p>
            </div>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="card-white flex h-[calc(100%-5.5rem)] flex-col overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex border-b border-gray-100 px-6 text-sm font-medium">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => goToTab(tab.id)}
                className={[
                  'border-b-2 px-6 py-4 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary font-bold text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between bg-gray-50/50 px-6 py-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={
                  activeTab === 'applications'
                    ? 'Rechercher une application...'
                    : activeTab === 'equipes'
                      ? 'Rechercher une equipe...'
                      : activeTab === 'sla'
                        ? 'Rechercher un ticket...'
                        : 'Rechercher un utilisateur...'
                }
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <button className="btn-primary flex items-center space-x-2 py-2 text-sm">
              <Plus className="h-4 w-4" />
              <span>
                {activeTab === 'applications'
                  ? 'Ajouter une application'
                  : activeTab === 'equipes'
                    ? 'Ajouter une equipe'
                    : activeTab === 'sla'
                      ? 'Ajouter une regle'
                      : 'Ajouter un utilisateur'}
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
            Chargement des donnees administrateur...
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-red-600">
            {error}
          </div>
        ) : (
          <>
            {activeTab === 'utilisateurs' && (
              <>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white font-medium text-gray-400 shadow-sm">
                      <tr>
                        <th className="px-6 py-4 font-medium">NOM</th>
                        <th className="px-6 py-4 font-medium">EMAIL</th>
                        <th className="px-6 py-4 font-medium">ROLE</th>
                        <th className="px-6 py-4 font-medium">EQUIPE</th>
                        <th className="px-6 py-4 font-medium">STATUT</th>
                        <th className="px-6 py-4 text-right font-medium">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{formatName(user)}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email ?? '-'}</td>
                          <td className={`px-6 py-4 text-[10px] font-bold ${roleTone(user.role)}`}>{roleLabel(user.role)}</td>
                          <td className="px-6 py-4 text-gray-600">{user.teamName ?? 'Aucune'}</td>
                          <td className="px-6 py-4">
                            <span
                              className={[
                                'rounded-full px-2.5 py-1 text-[10px] font-bold',
                                user.teamId ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
                              ].join(' ')}
                            >
                              {user.teamId ? 'Affecte' : 'Sans equipe'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-400">
                            <button
                              type="button"
                              onClick={() => openUserEditor(user)}
                              className="hover:text-primary"
                            >
                              Editer
                            </button>
                            <span className="px-2">|</span>
                            <button type="button" className="hover:text-danger">
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                            Aucun utilisateur ne correspond a la recherche.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-gray-100 p-4 text-center text-xs font-medium text-gray-500">
                  {filteredUsers.length} utilisateur{filteredUsers.length === 1 ? '' : 's'} affiches
                </div>
              </>
            )}

            {activeTab === 'applications' && (
              <div className="flex-1 overflow-auto p-6">
                <div className="mb-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Applications</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{filteredApplications.length}</p>
                  </div>
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Tickets ouverts</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{openIncidents.length}</p>
                  </div>
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">SLA moyen</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{averageResolution}</p>
                  </div>
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Tickets resolus aujourd'hui</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{resolvedToday.length}</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{application.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{application.description ?? 'Aucune description fournie.'}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                          #{application.id}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {application.clientUser ? (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Client</span>
                            <span className="font-medium text-gray-900">{formatName(application.clientUser)}</span>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-2">
                          {[
                            application.appTeam,
                            application.systemTeam,
                            application.databaseTeam,
                            application.networkTeam,
                          ]
                            .filter((team): team is TeamDto => Boolean(team))
                            .map((team) => (
                              <span
                                key={`${application.id}-${team.id}`}
                                className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500"
                              >
                                {team.name}
                              </span>
                            ))}
                          {[
                            application.appTeam,
                            application.systemTeam,
                            application.databaseTeam,
                            application.networkTeam,
                          ].every((team) => !team) ? (
                            <span className="text-sm text-gray-400">Aucune equipe rattachee</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredApplications.length === 0 && (
                    <div className="col-span-full rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
                      Aucune application ne correspond a la recherche.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'equipes' && (
              <div className="flex-1 overflow-auto p-6">
                <div className="mb-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Equipes</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{filteredTeams.length}</p>
                  </div>
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Membres</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {filteredTeams.reduce((sum, team) => sum + (team.members?.length ?? 0), 0)}
                    </p>
                  </div>
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Equipes sans description</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {filteredTeams.filter((team) => !team.description).length}
                    </p>
                  </div>
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Utilisateurs sans equipe</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{usersWithoutTeam.length}</p>
                  </div>
                </div>

                <TeamDiagram teams={filteredTeams} />

                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {filteredTeams.map((team) => (
                    <div key={team.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{team.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{team.description ?? 'Aucune description fournie.'}</p>
                        </div>
                        <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-bold text-secondary">
                          {team.functionRole ?? 'Equipe'}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(team.members ?? []).map((member) => (
                          <span
                            key={member.id}
                            className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600"
                          >
                            {formatName(member)}
                          </span>
                        ))}
                        {(team.members ?? []).length === 0 ? (
                          <span className="text-sm text-gray-400">Aucun membre rattache.</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sla' && (
              <div className="flex-1 overflow-auto p-6">
                <div className="mb-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Tickets critiques</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {incidents.filter((incident) => incident.incidentLevel === 'CRITICAL').length}
                    </p>
                  </div>
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">SLA a risque</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{slaAtRisk.length}</p>
                  </div>
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Traites aujourd'hui</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{resolvedToday.length}</p>
                  </div>
                  <div className="card-white p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Duree moyenne</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{averageResolution}</p>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b border-gray-100 p-5">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <h3 className="font-bold text-gray-900">Tickets prioritaires</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-gray-400">
                          <tr>
                            <th className="px-5 py-3 font-medium">REFERENCE</th>
                            <th className="px-5 py-3 font-medium">APPLICATION</th>
                            <th className="px-5 py-3 font-medium">STATUT</th>
                            <th className="px-5 py-3 font-medium">SLA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {[...incidents]
                            .sort((left, right) => {
                              const leftDate = getIncidentDeadline(left)?.getTime() ?? 0;
                              const rightDate = getIncidentDeadline(right)?.getTime() ?? 0;
                              return leftDate - rightDate;
                            })
                            .slice(0, 8)
                            .map((incident) => {
                              const deadline = getIncidentDeadline(incident);
                              const isAtRisk = slaAtRisk.some((item) => item.id === incident.id);

                              return (
                                <tr key={incident.id} className="hover:bg-gray-50/60">
                                  <td className="px-5 py-3.5 font-medium text-gray-900">{incident.reference}</td>
                                  <td className="px-5 py-3.5 text-gray-600">{incident.application?.name ?? '-'}</td>
                                  <td className="px-5 py-3.5">
                                    <span
                                      className={[
                                        'rounded-full px-2.5 py-1 text-[10px] font-bold',
                                        incident.status === 'CLOSED' || incident.status === 'RESOLVED'
                                          ? 'bg-success/10 text-success'
                                          : incident.status === 'REJETE'
                                            ? 'bg-danger/10 text-danger'
                                            : isAtRisk
                                              ? 'bg-warning/10 text-warning'
                                              : 'bg-gray-100 text-gray-500',
                                      ].join(' ')}
                                    >
                                      {incident.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={[
                                          'text-xs font-semibold',
                                          isAtRisk ? 'text-danger' : 'text-gray-600',
                                        ].join(' ')}
                                      >
                                        {deadline ? formatRelativeTime(deadline) : 'Aucun SLA'}
                                      </span>
                                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                          className={[
                                            'h-full rounded-full',
                                            incident.status === 'CLOSED' || incident.status === 'RESOLVED'
                                              ? 'bg-success'
                                              : isAtRisk
                                                ? 'bg-danger'
                                                : 'bg-warning',
                                          ].join(' ')}
                                          style={{ width: isAtRisk ? '95%' : '60%' }}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b border-gray-100 p-5">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <h3 className="font-bold text-gray-900">Activite recente</h3>
                    </div>
                    <div className="p-5">
                      <div className="relative space-y-5 border-l-2 border-primary/20 pl-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="relative">
                            <div
                              className={`absolute -left-[21px] top-1 h-2.5 w-2.5 ${activity.tone} rounded-full ring-4 ring-white`}
                            />
                            <p className="text-sm font-medium leading-snug text-gray-900">{activity.text}</p>
                            <p className="mt-0.5 text-xs text-gray-400">{activity.time}</p>
                          </div>
                        ))}
                        {recentActivity.length === 0 && (
                          <div className="text-sm text-gray-400">Aucune activite recente disponible.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSaveUser} className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Utilisateur</p>
              <h3 className="mt-1 text-xl font-bold text-gray-900">{formatName(editingUser)}</h3>
              <p className="mt-1 text-sm text-gray-500">Modifier les informations et enregistrer via updateDto.</p>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Prénom</span>
                <input
                  value={editForm.firstName}
                  onChange={(event) => setEditForm((current) => ({ ...current, firstName: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Nom</span>
                <input
                  value={editForm.lastName}
                  onChange={(event) => setEditForm((current) => ({ ...current, lastName: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Email</span>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Mot de passe</span>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(event) => setEditForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Laisser vide pour conserver"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Rôle</span>
                <select
                  value={editForm.role}
                  onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Equipe</span>
                <select
                  value={editForm.teamId}
                  onChange={(event) => setEditForm((current) => ({ ...current, teamId: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Aucune</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {saveError ? (
              <div className="mx-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {saveError}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-6">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                disabled={savingUser}
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary px-5 py-2.5 text-sm" disabled={savingUser}>
                {savingUser ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>
  );
}
