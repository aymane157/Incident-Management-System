import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Loader2,
  Search,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  createRcaReport,
  fetchNewIncident,
  fetchRcaReportByIncident,
  fetchTeamIncidents,
  fetchUserById,
  type IncidentDto,
  type RcaReportDto,
  type UserDto,
} from '../lib/api';

function fullName(user?: UserDto | null) {
  if (!user) return 'Non assigné';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Non assigné';
}

export default function RTRcaReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { referenceId } = useParams<{ referenceId?: string }>();
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [teamIncidents, setTeamIncidents] = useState<IncidentDto[]>([]);
  const [incident, setIncident] = useState<IncidentDto | null>(null);
  const [existingReport, setExistingReport] = useState<RcaReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    rootCause: '',
    solution: '',
    preventiveMeasures: '',
  });

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!user?.id) {
        setError('Utilisateur non connecté.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const userData = await fetchUserById(user.id);
        if (!active) return;
        setCurrentUser(userData);

        if (!userData.teamId) {
          setError('Ce compte n’est rattaché à aucune équipe.');
          setLoading(false);
          return;
        }

        const incidents = await fetchTeamIncidents(userData.teamId);
        if (!active) return;

        setTeamIncidents(incidents.filter((item) => item.status !== 'CLOSED' && item.status !== 'REJETE'));

        if (referenceId) {
          const incidentData = await fetchNewIncident(referenceId);
          if (!active) return;
          setIncident(incidentData);

          const report = await fetchRcaReportByIncident(incidentData.id);
          if (!active) return;
          setExistingReport(report);

          if (report) {
            setForm({
              rootCause: report.rootCause ?? '',
              solution: report.solution ?? '',
              preventiveMeasures: report.preventiveMeasures ?? '',
            });
          }
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger le rapport RCA.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [referenceId, user?.id]);

  const filteredTeamIncidents = useMemo(() => {
    return teamIncidents.filter((incident) => {
      const q = search.toLowerCase();
      return (
        incident.reference.toLowerCase().includes(q) ||
        incident.application?.name?.toLowerCase().includes(q) ||
        incident.name?.toLowerCase().includes(q)
      );
    });
  }, [search, teamIncidents]);

  const canSubmit = Boolean(currentUser?.id && incident?.status !== 'CLOSED' && incident?.status !== 'REJETE' && !existingReport);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!incident || !currentUser) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const created = await createRcaReport({
        incidentId: incident.id,
        authorId: currentUser.id,
        rootCause: form.rootCause,
        solution: form.solution,
        preventiveMeasures: form.preventiveMeasures,
      });
      setExistingReport(created);
      setSuccess('Rapport RCA enregistr�.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d’enregistrer le rapport.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-gray-700">Chargement du RCA...</span>
        </div>
      </div>
    );
  }

  if (!referenceId) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RCA</h1>
            <p className="mt-1 text-sm text-gray-500">Choisissez un incident déjà pris en charge pour rédiger son rapport.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        <div className="card-white p-5">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mt-5 grid gap-3">
            {filteredTeamIncidents.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/rt/report/${item.reference}`)}
                className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.reference}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.application?.name ?? 'Application'} · {fullName(item.createdBy)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-700">{item.status}</p>
                    <p className="text-[10px] text-gray-400">RCA</p>
                  </div>
                </div>
              </button>
            ))}

            {filteredTeamIncidents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                Aucun incident assigné à votre compte n’est disponible pour le RCA.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="h-full bg-background p-6">
        <button
          onClick={() => navigate('/rt/report')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
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
              <p className="mt-1 text-sm text-gray-500">{error || 'Aucun incident à reporter.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/rt/report')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="card-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RCA · {incident.reference}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {incident.application?.name ?? 'Application'} · {fullName(incident.createdBy)}
              </p>
            </div>
            <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              {incident.handledBy?.id === currentUser?.id ? 'Assigne a vous' : 'Prise automatique a l envoi'}
            </span>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-800">
              {success}
            </div>
          ) : null}

          {existingReport ? (
            <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h2 className="text-lg font-bold text-gray-900">Rapport existant</h2>
              <p className="mt-1 text-sm text-gray-500">Un rapport RCA a déjà été enregistré pour cet incident.</p>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Cause racine</p>
                  <p className="mt-1 text-gray-700">{existingReport.rootCause ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Solution</p>
                  <p className="mt-1 text-gray-700">{existingReport.solution ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Mesures préventives</p>
                  <p className="mt-1 text-gray-700">{existingReport.preventiveMeasures ?? '—'}</p>
                </div>
              </div>
            </div>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cause racine identifiée *</label>
                <textarea
                  rows={4}
                  value={form.rootCause}
                  onChange={(e) => setForm((current) => ({ ...current, rootCause: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  placeholder="Décrivez la cause racine..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Solution appliquée *</label>
                <textarea
                  rows={4}
                  value={form.solution}
                  onChange={(e) => setForm((current) => ({ ...current, solution: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  placeholder="Décrivez les actions correctives..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mesures préventives *</label>
                <textarea
                  rows={4}
                  value={form.preventiveMeasures}
                  onChange={(e) => setForm((current) => ({ ...current, preventiveMeasures: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  placeholder="Décrivez ce qu’il faut mettre en place pour éviter la récidive..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !canSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {existingReport ? 'Rapport d�j� enregistr�' : submitting ? 'Enregistrement...' : 'Enregistrer et m assigner'}
              </button>
            </form>
          )}
        </section>

        <aside className="space-y-6">
          <section className="card-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Résumé</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Technicien</span>
                <span className="font-semibold text-gray-900">{fullName(incident.handledBy)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Client</span>
                <span className="font-semibold text-gray-900">{fullName(incident.createdBy)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Statut</span>
                <span className="font-semibold text-gray-900">{incident.status}</span>
              </div>
            </div>
          </section>

          <section className="card-white p-6">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-gray-900">Accès</h2>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Le rapport est activé seulement quand l’incident est pris en charge par votre compte.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}







