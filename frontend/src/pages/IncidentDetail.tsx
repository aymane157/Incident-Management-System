import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ClipboardList,
  Clock3,
  Download,
  Loader2,
  Monitor,
  Paperclip,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { fetchNewIncident, getAttachmentUrl, type IncidentDto } from '../lib/api';

function formatDate(value?: string | null) {
  if (!value) return 'Non défini';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function fullName(user?: IncidentDto['createdBy']) {
  if (!user) return 'Non assigné';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Non assigné';
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

export default function IncidentDetail() {
  const navigate = useNavigate();
  const { referenceId } = useParams<{ referenceId: string }>();
  const [incident, setIncident] = useState<IncidentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadIncident() {
      if (!referenceId) {
        setError('Référence d’incident manquante.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await fetchNewIncident(referenceId);
        if (!active) return;
        setIncident(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger cet incident.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadIncident();

    return () => {
      active = false;
    };
  }, [referenceId]);

  const attachmentCount = incident?.attachments?.length ?? 0;
  const timeline = useMemo(() => {
    if (!incident) return [];

    return [
      {
        icon: ClipboardList,
        label: 'Incident récupéré',
        value: incident.reference,
        meta: formatDate(incident.createdAt),
      },
      {
        icon: UserRound,
        label: 'Créé par',
        value: fullName(incident.createdBy),
        meta: incident.createdBy?.email ?? 'Utilisateur interne',
      },
      {
        icon: Monitor,
        label: 'Application',
        value: incident.application?.name ?? 'Application inconnue',
        meta: incident.application?.description ?? 'Aucune description',
      },
      {
        icon: ShieldAlert,
        label: 'Équipe assignée',
        value: incident.assignedTeam?.name ?? 'Non assignée',
        meta: fullName(incident.handledBy),
      },
    ];
  }, [incident]);

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
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
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
      <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary blur-3xl" />
        </div>

        <div className="relative z-10 px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Incident unique</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {incident.reference} · {incident.name ?? 'Incident sans titre'}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
                Vue détaillée de l’incident récupéré via `findNewIncident`, destinée aux équipes internes et aux admins.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(incident.status)}`}>
                  {incident.status}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${levelTone(incident.incidentLevel)}`}>
                  {incident.incidentLevel ?? 'Non priorisé'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                  <Calendar className="h-3.5 w-3.5" />
                  Créé le {formatDate(incident.createdAt)}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">SLA</p>
                  <p className="mt-1 text-lg font-bold">{formatDate(incident.slaDeadline)}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Pièces jointes</p>
                  <p className="mt-1 text-lg font-bold">{attachmentCount}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Client</p>
                  <p className="mt-1 text-sm font-semibold">{fullName(incident.createdBy)}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Application</p>
                  <p className="mt-1 text-sm font-semibold">{incident.application?.name ?? 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <section className="card-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Résumé opérationnel</h2>
                <p className="mt-1 text-sm text-gray-500">Les informations principales de l’incident au même endroit.</p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Référence</p>
                <p className="text-sm font-bold text-gray-900">{incident.reference}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Description</p>
                <p className="mt-2 text-sm leading-6 text-gray-700">{incident.description ?? 'Aucune description fournie.'}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Historique</p>
                <div className="mt-3 space-y-3">
                  {[
                    ['Statut', incident.status],
                    ['Priorité', incident.incidentLevel ?? 'Non défini'],
                    ['Créé par', fullName(incident.createdBy)],
                    ['Responsable de traitement', fullName(incident.handledBy)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="card-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Détails techniques</h2>
                <p className="mt-1 text-sm text-gray-500">Application, équipe et horodatage.</p>
              </div>
              <Monitor className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Application', value: incident.application?.name ?? 'Non définie' },
                { label: 'Client', value: fullName(incident.createdBy) },
                { label: 'Équipe', value: incident.assignedTeam?.name ?? 'Non affectée' },
                { label: 'Manager', value: fullName(incident.incidentManager) },
                { label: 'Validation', value: formatDate(incident.validatedAt) },
                { label: 'Assignation', value: formatDate(incident.assignedAt) },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            {incident.rejectionReason ? (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Motif de rejet</p>
                <p className="mt-2 text-sm leading-6 text-red-900">
                  {incident.rejectionReason}
                </p>
                {incident.status !== 'REJETE' ? (
                  <p className="mt-2 text-xs font-medium text-red-700">En attente de validation par le manager.</p>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="card-white p-6">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-gray-900">Pièces jointes</h2>
            </div>

            {attachmentCount > 0 ? (
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
                Aucune pièce jointe pour cet incident.
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card-white p-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-gray-900">Chronologie</h2>
            </div>

            <div className="mt-5 space-y-4">
              {timeline.map((step, index) => (
                <div key={step.label} className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                      {index === 0 ? (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                          Actif
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{step.value}</p>
                    <p className="mt-1 text-xs text-gray-400">{step.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          
        </aside>
      </div>
    </div>
  );
}
