import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  Pencil,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  Users,
} from 'lucide-react';
import {
  getAttachmentUrl,
  fetchManagerIncidents,
  fetchTeams,
  IncidentDto,
  IncidentLevel,
  IncidentStatus,
  STATIC_INCIDENT_MANAGER_ID,
  TeamDto,
  updateIncident,
} from '../lib/api';

type MainTab = 'new' | 'all';

const statusLabel: Record<IncidentStatus, string> = {
  NEW: 'NOUVEAU',
  REJETE: 'REJETÉ',
  VALIDATED: 'VALIDÉ',
  IN_PROGRESS: 'EN COURS',
  RESOLVED: 'RÉSOLU',
  CLOSED: 'FERMÉ',
};

const statusClass: Record<IncidentStatus, string> = {
  NEW: 'bg-warning/10 text-warning',
  REJETE: 'bg-danger/10 text-danger',
  VALIDATED: 'bg-primary/10 text-primary',
  IN_PROGRESS: 'bg-secondary/10 text-secondary',
  RESOLVED: 'bg-success/10 text-success',
  CLOSED: 'bg-gray-100 text-gray-500',
};

const levelLabel: Record<IncidentLevel, string> = {
  CRITICAL: 'Critique',
  HIGH: 'Haute',
  MEDIUM: 'Moyenne',
  LOW: 'Basse',
};

const levelClass: Record<IncidentLevel, string> = {
  CRITICAL: 'bg-danger/10 text-danger',
  HIGH: 'bg-warning/10 text-warning',
  MEDIUM: 'bg-blue-50 text-blue-600',
  LOW: 'bg-gray-100 text-gray-500',
};

type TeamOption = Pick<TeamDto, 'id' | 'name'>;

function fullName(user?: { firstName?: string | null; lastName?: string | null } | null): string {
  if (!user) return 'Non renseigné';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Non renseigné';
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function matchesQuery(incident: IncidentDto, query: string): boolean {
  if (!query) return true;
  const haystack = [
    incident.reference,
    incident.name,
    incident.description,
    incident.application?.name,
    fullName(incident.createdBy),
    fullName(incident.incidentManager),
    incident.assignedTeam?.name,
    fullName(incident.handledBy),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function getIncidentClient(incident: IncidentDto): string {
  return fullName(incident.createdBy);
}

function isImageAttachment(contentType?: string | null, fileName?: string | null): boolean {
  if (contentType?.startsWith('image/')) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName ?? '');
}

function EditIncidentModal({
  incident,
  teams,
  onClose,
  onSave,
  saving,
}: {
  incident: IncidentDto;
  teams: TeamOption[];
  onClose: () => void;
  onSave: (incident: IncidentDto) => void;
  saving: boolean;
}) {
  const [assignedTeamId, setAssignedTeamId] = useState<string>(
    incident.assignedTeam?.id ? String(incident.assignedTeam.id) : ''
  );

  useEffect(() => {
    setAssignedTeamId(incident.assignedTeam?.id ? String(incident.assignedTeam.id) : '');
  }, [incident]);

  const selectedTeam = teams.find(team => String(team.id) === assignedTeamId) ?? null;

  const handleSave = () => {
    onSave({
      ...incident,
      assignedTeam: selectedTeam ? { id: selectedTeam.id, name: selectedTeam.name ?? null } : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4 overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-gradient-to-r from-[#1a0045] to-[#3b0b8c] p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">#{incident.reference}</span>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${statusClass[incident.status]}`}>
                {statusLabel[incident.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/80">
              {incident.application?.name ?? 'Application'} · {getIncidentClient(incident)}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-white/70 transition-colors hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Incident</p>
            <p className="text-sm font-semibold text-gray-900">{incident.name ?? 'Incident sans titre'}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{incident.description ?? '—'}</p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Assigner à l'équipe
            </label>
            <select
              value={assignedTeamId}
              onChange={e => setAssignedTeamId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none"
            >
              <option value="">Aucune équipe</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name ?? `Equipe #${team.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 text-xs text-gray-600">
            La criticité est définie par le client lors de la création du ticket. Le manager peut uniquement ajuster l'équipe assignée.
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success py-3 text-sm font-semibold text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer la mise à jour'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IncidentWorkspace() {
  const [incidents, setIncidents] = useState<IncidentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [mainTab, setMainTab] = useState<MainTab>('new');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editIncident, setEditIncident] = useState<IncidentDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchManagerIncidents(STATIC_INCIDENT_MANAGER_ID);
      setIncidents(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await fetchTeams();
      setTeams(data.map(team => ({ id: team.id, name: team.name })));
    } catch {
      setTeams([]);
    }
  };

  useEffect(() => {
    void loadIncidents();
    void loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newIncidents = useMemo(
    () => incidents.filter(incident => incident.status === 'NEW'),
    [incidents]
  );

  const handledIncidents = useMemo(
    () => incidents.filter(incident => incident.status !== 'NEW'),
    [incidents]
  );

  const listToShow = useMemo(() => {
    const base = mainTab === 'new' ? newIncidents : handledIncidents;
    return base.filter(incident => matchesQuery(incident, searchQuery));
  }, [handledIncidents, mainTab, newIncidents, searchQuery]);

  const selectedIncident = useMemo(
    () => incidents.find(incident => incident.id === selectedId) ?? null,
    [incidents, selectedId]
  );

  useEffect(() => {
    if (listToShow.length === 0) {
      return;
    }

    if (!selectedIncident || !listToShow.some(incident => incident.id === selectedIncident.id)) {
      setSelectedId(listToShow[0].id);
    }
  }, [listToShow, selectedIncident]);

  const handleSaveIncident = async (updated: IncidentDto) => {
    try {
      setSaving(true);
      const saved = await updateIncident(updated.id, updated);
      setIncidents(prev => prev.map(incident => (incident.id === saved.id ? saved : incident)));
      setEditIncident(null);
      setSuccessMessage(`Incident ${saved.reference} mis à jour.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update incident');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4 bg-background p-6">
      {editIncident && (
        <EditIncidentModal
          incident={editIncident}
          teams={teams}
          onClose={() => setEditIncident(null)}
          onSave={handleSaveIncident}
          saving={saving}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspace incident manager</h1>
          <p className="text-sm text-gray-500">
            Incidents reçus pour le manager connecté. User id statique: {STATIC_INCIDENT_MANAGER_ID}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void loadIncidents()}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
          <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total', value: incidents.length, icon: FileText, color: 'text-primary bg-primary/10' },
          { label: 'Nouveaux', value: newIncidents.length, icon: AlertTriangle, color: 'text-warning bg-warning/10' },
          { label: 'En cours', value: incidents.filter(i => i.status === 'IN_PROGRESS').length, icon: Clock, color: 'text-secondary bg-secondary/10' },
          { label: 'Résolus', value: incidents.filter(i => i.status === 'RESOLVED').length, icon: CheckCircle, color: 'text-success bg-success/10' },
        ].map(item => (
          <div key={item.label} className="card-white flex items-center justify-between p-5">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">{item.label}</p>
              <p className="text-3xl font-bold text-gray-900">{item.value}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        <div className="card-white flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h3 className="font-bold text-gray-900">
                {mainTab === 'new' ? 'Incidents à traiter' : 'Incidents suivis'}
              </h3>
              <p className="text-xs text-gray-400">
                Filtrés sur le manager connecté et sa boîte de réception.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-64 rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                Filtrer
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-gray-100 text-xs font-medium">
            {[
              { id: 'new' as const, label: `Nouveaux (${newIncidents.length})` },
              { id: 'all' as const, label: `Tous (${handledIncidents.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={
                  'flex-1 border-b-2 px-4 py-3 transition-colors ' +
                  (mainTab === tab.id
                    ? 'border-primary font-bold text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900')
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center py-20 text-sm text-gray-500">
                Chargement des incidents...
              </div>
            ) : error ? (
              <div className="p-6 text-sm text-danger">
                <div className="rounded-xl border border-danger/20 bg-danger/5 p-4">{error}</div>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white text-gray-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">RÉF</th>
                    <th className="px-5 py-3 font-medium">APPLICATION</th>
                    <th className="px-5 py-3 font-medium">CLIENT</th>
                    <th className="px-5 py-3 font-medium">STATUT</th>
                    <th className="px-5 py-3 font-medium">CRITICITÉ</th>
                    <th className="px-5 py-3 font-medium">SLA</th>
                    <th className="px-5 py-3 font-medium">ÉQUIPE / TECH</th>
                    <th className="px-5 py-3 text-right font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {listToShow.map(incident => {
                    const isSelected = selectedIncident?.id === incident.id;

                    return (
                      <tr
                        key={incident.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-gray-50/70'
                        }`}
                        onClick={() => setSelectedId(incident.id)}
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900">{incident.reference}</td>
                        <td className="px-5 py-3.5 text-gray-600">{incident.application?.name ?? '—'}</td>
                        <td className="px-5 py-3.5 text-gray-600">{getIncidentClient(incident)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${statusClass[incident.status]}`}>
                            {statusLabel[incident.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {incident.incidentLevel ? (
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${levelClass[incident.incidentLevel]}`}>
                              {levelLabel[incident.incidentLevel]}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Non défini</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          {formatDateTime(incident.slaDeadline)}
                        </td>
                        <td className="px-5 py-3.5">
                          {incident.assignedTeam?.name || incident.handledBy ? (
                            <div>
                              <p className="text-xs font-medium text-gray-800">
                                {incident.assignedTeam?.name ?? '—'}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {fullName(incident.handledBy)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Non assigné</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setEditIncident(incident)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Modifier
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!loading && !error && listToShow.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                        Aucun incident trouvé pour ce manager.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card-white flex w-[420px] shrink-0 flex-col overflow-hidden">
          {selectedIncident ? (
            <>
              <div className="flex items-start justify-between border-b border-gray-100 bg-gray-50 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">#{selectedIncident.reference}</h3>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${statusClass[selectedIncident.status]}`}>
                      {statusLabel[selectedIncident.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedIncident.application?.name ?? 'Application'} · {getIncidentClient(selectedIncident)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="border-b border-gray-100 bg-white p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Action rapide</p>
                <button
                  onClick={() => setEditIncident(selectedIncident)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  <Pencil className="h-4 w-4" />
                  Modifier l’incident
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {selectedIncident.name ?? 'Incident sans titre'}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    {selectedIncident.description ?? '—'}
                  </p>
                </div>

                {selectedIncident.attachments?.length ? (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Capture / pièce jointe</p>
                    <div className="mt-3 grid grid-cols-1 gap-3">
                      {selectedIncident.attachments.map(attachment => {
                        const previewUrl = getAttachmentUrl(attachment.id);
                        const imageAttachment = isImageAttachment(attachment.contentType, attachment.fileName);

                        return (
                          <a
                            key={attachment.id}
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-primary/40 hover:shadow-md"
                          >
                            {imageAttachment ? (
                              <img
                                src={previewUrl}
                                alt={attachment.fileName ?? 'Screenshot'}
                                className="h-44 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-44 w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
                                Ouvrir la pièce jointe
                              </div>
                            )}
                            <div className="border-t border-gray-100 p-3">
                              <p className="text-xs font-semibold text-gray-900">{attachment.fileName ?? 'Pièce jointe'}</p>
                              <p className="mt-0.5 text-[10px] text-gray-400">
                                {attachment.contentType ?? 'type inconnu'} · {attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)} KB` : 'taille inconnue'}
                              </p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {[
                  ['Statut', statusLabel[selectedIncident.status]],
                  ['Criticité', selectedIncident.incidentLevel ? levelLabel[selectedIncident.incidentLevel] : 'Non défini'],
                  ['SLA', formatDateTime(selectedIncident.slaDeadline)],
                  ['Créé le', formatDateTime(selectedIncident.createdAt)],
                  ['Validé le', formatDateTime(selectedIncident.validatedAt)],
                  ['Équipe', selectedIncident.assignedTeam?.name ?? 'Non assigné'],
                  ['Technicien', fullName(selectedIncident.handledBy)],
                  ['Manager', fullName(selectedIncident.incidentManager)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}

                <div className="rounded-xl border border-warning/20 bg-warning/5 p-3 text-xs text-gray-700">
                  Les nouveaux incidents peuvent être révisés ici avant leur traitement.
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <Users className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm font-semibold text-gray-900">Sélectionnez un incident</p>
                <p className="mt-1 text-xs text-gray-500">
                  Le panneau détail affiche le ticket à mettre à jour.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="fixed bottom-6 right-6 rounded-xl bg-success px-4 py-3 text-sm font-medium text-white shadow-lg">
          {successMessage}
        </div>
      )}
    </div>
  );
}
