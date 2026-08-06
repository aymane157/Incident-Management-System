import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquareText,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  SquarePen,
  Users,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  fetchRcaReports,
  fetchUserById,
  updateRcaReportStatus,
  sendRcaToClient,
  type RcaReportDto,
  type UserDto,
} from '../lib/api';

type DeliveryMode = 'mail' | 'app';

function fullName(user?: UserDto | null) {
  if (!user) return 'Non assigne';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Non assigne';
}

function formatDate(value?: string | null) {
  if (!value) return 'Non defini';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function reportStatus(report: RcaReportDto) {
  if (report.validatedByManager) {
    return {
      label: 'Valide',
      tone: 'bg-success/10 text-success border-success/20',
      icon: CheckCircle2,
    };
  }

  return {
    label: 'Recu',
    tone: 'bg-warning/10 text-warning border-warning/20',
    icon: ReceiptText,
  };
}

export default function ManagerRcaInbox() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const [reports, setReports] = useState<RcaReportDto[]>([]);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('mail');
  const [validating, setValidating] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(
    async (options?: { background?: boolean }) => {
      if (!user?.id) {
        setError('Utilisateur non connecte.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (options?.background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const userData = await fetchUserById(user.id);
        if (!mountedRef.current) return;
        setCurrentUser(userData);

        const allReports = await fetchRcaReports();
        if (!mountedRef.current) return;

        const visibleReports = allReports
          .filter((report) => {
            if (!userData.id) return true;

            const incident = report.incident;
            const incidentManagerId = incident?.incidentManager?.id;
            const assignedTeamId = incident?.assignedTeam?.id;
            const managerTeamId = userData.teamId;

            return (
              incidentManagerId === userData.id ||
              report.author?.id === userData.id ||
              (managerTeamId != null && assignedTeamId === managerTeamId)
            );
          })
          .sort((left, right) => {
            const leftDate = new Date(left.createdAt ?? 0).getTime();
            const rightDate = new Date(right.createdAt ?? 0).getTime();
            return rightDate - leftDate;
          });

        setReports(visibleReports);
        setSelectedId((current) => {
          if (current != null && visibleReports.some((report) => report.id === current)) {
            return current;
          }

          return visibleReports[0]?.id ?? null;
        });
        setLastSyncedAt(new Date().toISOString());
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger les rapports RCA.');
      } finally {
        if (!mountedRef.current) return;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadData({ background: true });
    }, 15000);

    const handleRefresh = () => {
      if (document.visibilityState === 'visible') {
        void loadData({ background: true });
      }
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [loadData]);

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedId) ?? null,
    [reports, selectedId]
  );

  const summary = useMemo(() => {
    const received = reports.length;
    const validated = reports.filter((report) => report.validatedByManager).length;
    const pending = received - validated;

    return { received, validated, pending };
  }, [reports]);

  async function handleValidate() {
    if (!selectedReport || !currentUser) return;

    setValidating(true);
    setError('');
    setStatusMessage('');

    try {
      const updated = await updateRcaReportStatus(selectedReport.id, currentUser.id, true);

      setReports((current) =>
        current.map((report) => (report.id === updated.id ? updated : report))
      );
      setSelectedId(updated.id);
      setStatusMessage(`RCA ${updated.incident?.reference ?? `#${updated.id}`} valide.`);
      await loadData({ background: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de valider le rapport RCA.');
    } finally {
      setValidating(false);
    }
  }

  async function handleSendToClient() {
    if (!selectedReport || !currentUser) return;
    setSending(true);
    setError('');
    try {
      const updated = await sendRcaToClient(selectedReport.id, currentUser.id);
      setReports(current => current.map(report => report.id === updated.id ? updated : report));
      setStatusMessage(`RCA ${updated.incident?.reference ?? `#${updated.id}`} envoye au client.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le RCA au client.");
    } finally {
      setSending(false);
    }
  }

  if (loading && reports.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-gray-700">Chargement des RCA recus...</span>
        </div>
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="h-full bg-background p-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-3 text-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Impossible de charger les RCA</h1>
              <p className="mt-1 text-sm text-amber-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Reception dynamique</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Boite de reception RCA</h1>
          <p className="mt-2 text-sm text-gray-500">
            Les rapports RCA des incidents geres par votre compte apparaissent ici des leur creation.
         
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/manager/workspace')}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <SquarePen className="h-4 w-4" />
            Workspace
          </button>
          <button
            type="button"
            onClick={() => void loadData({ background: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
        
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-white p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">RCA recus</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.received}</p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        <div className="card-white p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">En attente de validation</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.pending}</p>
          </div>
          <div className="rounded-2xl bg-warning/10 p-3 text-warning">
            <ReceiptText className="h-6 w-6" />
          </div>
        </div>
        <div className="card-white p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Valides</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.validated}</p>
          </div>
          <div className="rounded-2xl bg-success/10 p-3 text-success">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="card-white overflow-hidden">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Rapports recus</h2>
                <p className="mt-1 text-sm text-gray-500">Selectionnez un RCA pour afficher ses details.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Synchronisation</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {lastSyncedAt ? formatDate(lastSyncedAt) : 'En attente'}
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[72vh] overflow-auto">
            {reports.length ? (
              <div className="divide-y divide-gray-100">
                {reports.map((report) => {
                  const status = reportStatus(report);
                  const StatusIcon = status.icon;
                  const isSelected = report.id === selectedId;

                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedId(report.id)}
                      className={`w-full border-l-4 px-5 py-4 text-left transition ${
                        isSelected
                          ? 'border-l-primary bg-primary/5'
                          : 'border-l-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {report.incident?.reference ?? `RCA #${report.id}`}
                            </p>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.tone}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {report.incident?.application?.name ?? 'Application inconnue'} · {fullName(report.incident?.createdBy)}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm text-gray-700">
                            {report.rootCause ?? 'Aucune cause racine saisie.'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-600">{formatDate(report.createdAt)}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gray-400">RCA</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <ReceiptText className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Aucun RCA recu</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Les rapports valides par les equipes apparaitront ici des qu&apos;ils seront enregistres.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="card-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Detail du RCA</h2>
                <p className="mt-1 text-sm text-gray-500">Vue dynamique du rapport selectionne.</p>
              </div>
              <Users className="h-5 w-5 text-primary" />
            </div>

            {selectedReport ? (
              <div className="mt-5 space-y-5">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Incident</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {selectedReport.incident?.reference ?? `#${selectedReport.id}`}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedReport.incident?.application?.name ?? 'Application inconnue'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Cree par</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {fullName(selectedReport.author)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Recu le</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Statut</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {reportStatus(selectedReport).label}
                    </p>
                  </div>
                  
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Cause racine</p>
                    <p className="mt-2 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                      {selectedReport.rootCause ?? 'Non renseignee'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Solution</p>
                    <p className="mt-2 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                      {selectedReport.solution ?? 'Non renseignee'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Mesures preventives</p>
                    <p className="mt-2 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                      {selectedReport.preventiveMeasures ?? 'Non renseignees'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => selectedReport.incident?.reference && navigate(`/incidents/${selectedReport.incident.reference}`)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  Ouvrir l&apos;incident source
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                Selectionnez un rapport pour afficher son contenu.
              </div>
            )}
          </section>

          <section className="card-white p-6">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-gray-900">Validation et envoi</h2>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              La validation est persistante. L&apos;envoi mail ou message reste une demonstration frontend.
            </p>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={handleValidate}
                disabled={!selectedReport || selectedReport.validatedByManager || validating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-success px-4 py-3 text-sm font-semibold text-white transition hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {selectedReport?.validatedByManager ? 'RCA deja valide' : validating ? 'Validation...' : 'Valider le RCA'}
              </button>

           

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMode('mail')}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    deliveryMode === 'mail'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Mail
                </button>
              
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Demo</p>
                <p className="mt-2">
                  {deliveryMode === 'mail'
                    ? `Pret a  un envoi mail au client ${fullName(selectedReport?.incident?.createdBy)}.`
                    : `Pret a  un message dans l app pour ${fullName(selectedReport?.incident?.createdBy)}.`}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Statut actuel: {selectedReport?.validatedByManager ? 'valide' : 'en attente de validation'}.
                </p>
              </div>

            
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
