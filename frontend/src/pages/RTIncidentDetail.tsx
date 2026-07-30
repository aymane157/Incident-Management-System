import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  Monitor,
  Paperclip,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  claimIncident,
  fetchNewIncident,
  fetchUserById,
  getAttachmentUrl,
  rejectIncidentWithReason,
  type IncidentDto,
  type UserDto,
} from '../lib/api';

function fullName(user?: IncidentDto['createdBy']) {
  if (!user) return 'Non assigné';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Non assigné';
}

function formatDate(value?: string | null) {
  if (!value) return 'Non défini';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function statusTone(status: IncidentDto['status']) {
  switch (status) {
    case 'NEW':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'VALIDATED':
      return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'IN_PROGRESS':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'RESOLVED':
      return 'bg-success/10 text-success border-success/20';
    case 'CLOSED':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'REJETE':
      return 'bg-danger/10 text-danger border-danger/20';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function levelTone(level?: IncidentDto['incidentLevel'] | null) {
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

export default function RTIncidentDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: referenceId } = useParams<{ id: string }>();
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [incident, setIncident] = useState<IncidentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!user?.id || !referenceId) {
        setError('Accès impossible.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [userData, incidentData] = await Promise.all([
          fetchUserById(user.id),
          fetchNewIncident(referenceId),
        ]);
        if (!active) return;
        setCurrentUser(userData);
        setIncident(incidentData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger cet incident.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [referenceId, user?.id]);

  const canClaim = useMemo(() => {
    if (!incident || !currentUser?.teamId) return false;
    if (incident.status === 'CLOSED' || incident.status === 'REJETE') return false;
    return incident.assignedTeam?.id === currentUser.teamId && incident.handledBy?.id !== currentUser.id;
  }, [currentUser?.id, currentUser?.teamId, incident]);

  const canWriteReport = useMemo(() => {
    if (!incident || !currentUser?.id) return false;
    return incident.handledBy?.id === currentUser.id && incident.status !== 'CLOSED' && incident.status !== 'REJETE';
  }, [currentUser?.id, incident]);

  const canReject = useMemo(() => {
    if (!incident || !currentUser?.teamId) return false;
    if (incident.status === 'CLOSED' || incident.status === 'REJETE') return false;
    return incident.assignedTeam?.id === currentUser.teamId;
  }, [currentUser?.teamId, incident]);

  async function handleClaim() {
    if (!incident || !user?.id) return;
    setClaiming(true);
    setError('');

    try {
      const updated = await claimIncident(incident.id, user.id);
      setIncident(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de prendre en charge l’incident.');
    } finally {
      setClaiming(false);
    }
  }

  async function handleReject() {
    if (!incident || !user?.id) return;
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      setError('Veuillez saisir un motif de rejet.');
      return;
    }

    setRejecting(true);
    setError('');
    setActionMessage('');

    try {
      const updated = await rejectIncidentWithReason(incident.reference, {
        reason: trimmedReason,
        teamMemberId: user.id,
      });
      setIncident(updated);
      setRejectReason('');
      setActionMessage('Incident rejeté et notifié au manager.');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de rejeter l'incident.");
    } finally {
      setRejecting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-gray-700">Chargement de l’incident...</span>
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="h-full bg-background p-6">
        <button
          onClick={() => navigate('/rt/home')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la file RT
        </button>
        <div className="card-white mx-auto max-w-2xl p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-danger/10 p-3 text-danger">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Incident introuvable</h1>
              <p className="mt-1 text-sm text-gray-500">{error || 'Aucun incident n’a pu être chargé.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="border-b border-gray-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="relative overflow-hidden px-6 py-8">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary blur-3xl" />
          </div>

          <div className="relative z-10">
            <button
              onClick={() => navigate('/rt/home')}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>

            <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Incident RT</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  {incident.reference} · {incident.name ?? 'Incident sans titre'}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
                  Détail de l’incident de votre équipe, avec prise en charge manuelle et accès au RCA.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(incident.status)}`}>
                    {incident.status}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${levelTone(incident.incidentLevel)}`}>
                    {incident.incidentLevel ?? 'Non priorisé'}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                    <Monitor className="h-3.5 w-3.5" />
                    {incident.application?.name ?? 'Application'}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Client</p>
                    <p className="mt-1 text-sm font-semibold">{fullName(incident.createdBy)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Pris en charge par</p>
                    <p className="mt-1 text-sm font-semibold">{fullName(incident.handledBy)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Assigné le</p>
                    <p className="mt-1 text-sm font-semibold">{formatDate(incident.assignedAt)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">SLA</p>
                    <p className="mt-1 text-sm font-semibold">{formatDate(incident.slaDeadline)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          {error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
              {error}
            </div>
          ) : null}

          {actionMessage ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-800">
              {actionMessage}
            </div>
          ) : null}

          <section className="card-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Description</h2>
                <p className="mt-1 text-sm text-gray-500">Contexte complet de l’incident.</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>

            <p className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
              {incident.description ?? 'Aucune description fournie.'}
            </p>
          </section>

          <section className="card-white p-6">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-gray-900">Pièces jointes</h2>
            </div>

            {incident.attachments?.length ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {incident.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={getAttachmentUrl(attachment.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{attachment.fileName ?? `Pièce jointe #${attachment.id}`}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {attachment.contentType ?? 'type inconnu'} · {attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)} KB` : 'taille inconnue'}
                        </p>
                      </div>
                      <Download className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                Aucune pièce jointe.
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Actions</h2>
            <p className="mt-1 text-sm text-gray-500">
              Vous devez prendre l’incident avant d’écrire le rapport RCA.
            </p>

            <div className="mt-4 space-y-3">
              {canClaim ? (
                <button
                  type="button"
                  onClick={() => void handleClaim()}
                  disabled={claiming}
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {claiming ? 'Prise en charge...' : 'Me l’assigner'}
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => navigate(`/rt/report/${incident.reference}`)}
                disabled={!canWriteReport}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Rédiger le RCA
              </button>

              {canReject ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
                    Motif de rejet
                  </label>
                  <textarea
                    rows={4}
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-red-400 focus:outline-none"
                    placeholder="Expliquez pourquoi l'incident est rejeté..."
                  />
                  <button
                    type="button"
                    onClick={() => void handleReject()}
                    disabled={rejecting}
                    className="mt-3 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {rejecting ? 'Rejet en cours...' : "Rejeter l'incident"}
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => navigate('/rt/home')}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Retour à la file
              </button>
            </div>

            {!canWriteReport ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Le RCA sera disponible après votre prise en charge et reste indisponible si l'incident est rejeté.
              </div>
            ) : null}
          </section>

          <section className="card-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Résumé</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Référence</span>
                <span className="font-semibold text-gray-900">{incident.reference}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Application</span>
                <span className="font-semibold text-gray-900">{incident.application?.name ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Client</span>
                <span className="font-semibold text-gray-900">{fullName(incident.createdBy)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Technicien</span>
                <span className="font-semibold text-gray-900">{fullName(incident.handledBy)}</span>
              </div>
              {incident.status === 'REJETE' ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Motif de rejet</p>
                  <p className="mt-2 text-sm leading-6 text-red-900">
                    {incident.rejectionReason ?? 'Aucun motif enregistré.'}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
