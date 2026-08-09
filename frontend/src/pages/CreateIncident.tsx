import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, Loader2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  createClientIncident,
  fetchApplications,
  type ApplicationOption,
  type IncidentLevel,
} from '../lib/api';

const levelOptions: Array<{ value: IncidentLevel; label: string; description: string }> = [
  { value: 'CRITICAL', label: 'Critique', description: 'Service indisponible ou impact majeur' },
  { value: 'HIGH', label: 'Haute', description: 'Impact important sur le mÃ©tier' },
  { value: 'MEDIUM', label: 'Moyenne', description: 'Impact limitÃ© avec contournement possible' },
  { value: 'LOW', label: 'Basse', description: 'Demande mineure ou faible impact' },
];

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function CreateIncident() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationOption[]>([]);
  const [applicationId, setApplicationId] = useState('');
  const [incidentLevel, setIncidentLevel] = useState<IncidentLevel | ''>('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadApplications() {
      setLoadingApplications(true);
      setError('');

      try {
        if (!user?.id) {
          setError('Utilisateur non connecte.');
          setLoadingApplications(false);
          return;
        }

        const data = await fetchApplications(user.id);
        if (!active) return;

        setApplications(data);
        setApplicationId((current) => current || (data[0]?.id ? String(data[0].id) : ''));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger les applications.');
      } finally {
        if (active) {
          setLoadingApplications(false);
        }
      }
    }

    loadApplications();

    return () => {
      active = false;
    };
  }, []);

  const selectedApplication = useMemo(
    () => applications.find((application) => String(application.id) === applicationId),
    [applications, applicationId]
  );

  function handleFilesSelected(nextFiles: FileList | null) {
    if (!nextFiles || nextFiles.length === 0) return;

    // Snapshot into a plain array right away â€” FileList is live and tied to
    // the input element, so if we hold onto the FileList itself inside the
    // setAttachments updater, resetting event.target.value afterwards wipes
    // it out before the updater actually runs.
    const filesSnapshot = Array.from(nextFiles);

    setAttachments((current) => {
      const combined = [...current];

      for (const file of filesSnapshot) {
        const isDuplicate = combined.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        );

        if (!isDuplicate) {
          combined.push(file);
        }
      }

      return combined;
    });
  }

  // Generate/revoke object URLs for image previews whenever the attachment
  // list changes.
  useEffect(() => {
    setPreviewUrls((current) => {
      const next: Record<string, string> = {};

      attachments.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const key = fileKey(file);
          next[key] = current[key] ?? URL.createObjectURL(file);
        }
      });

      Object.entries(current).forEach(([key, url]) => {
        if (!next[key]) URL.revokeObjectURL(url);
      });

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments]);

  // Revoke all remaining object URLs on unmount.
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (attachments.length === 0) {
  setError('Veuillez ajouter au moins une piÃ¨ce jointe.');
  return;
}
    if (!applicationId) {
      setError('Veuillez sÃ©lectionner une application liÃ©e Ã  votre compte.');
      return;
    }

    if (!description.trim()) {
      setError('Veuillez saisir une description.');
      return;
    }

    if (!incidentLevel) {
      setError('Veuillez sÃ©lectionner une criticitÃ©.');
      return;
    }


    if (!user?.id) {
      setError('Utilisateur non connecte.');
      return;
    }

    const currentUserId = user.id;

    const formData = new FormData();
    formData.append('description', description.trim());
    formData.append('applicationId', applicationId);
    formData.append('createdById', String(currentUserId));
    formData.append('incidentLevel', incidentLevel);
    attachments.forEach((file) => formData.append('attachments', file));

    setSubmitting(true);

    try {
      const incident = await createClientIncident(formData);
      setSuccessMessage(
        `Ticket crÃ©Ã© avec succÃ¨s${incident?.reference ? ` : ${incident.reference}` : ''}.`
      );
      setDescription('');
      setIncidentLevel('');
      setAttachments([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La crÃ©ation du ticket a Ã©chouÃ©.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 pb-2">
        <button
          onClick={() => navigate('/client/home')}
          className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>CrÃ©er un nouveau ticket</span>
        </button>
        <div className="text-xs text-gray-400 mt-2 ml-6">Accueil &gt; Nouveau ticket</div>
      </div>

   <div className="flex-1 flex min-h-0 overflow-y-auto px-12 py-4 gap-12">
        <div className="w-48 space-y-6 pt-4">
       
         

          <div className="pt-20">
            <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto relative overflow-hidden flex items-center justify-center">
              <div className="w-20 h-20 bg-primary/20 rotate-45 transform" />
            </div>
          </div>
        </div>

        <form className="flex-1 max-w-3xl" onSubmit={handleSubmit}>
          <div className="card-white p-8 space-y-8 relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Informations gÃ©nÃ©rales</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Le formulaire envoie directement le ticket au service backend.
                </p>
              </div>
              <div className="text-xs text-gray-400 text-right">
                {selectedApplication ? `Application: ${selectedApplication.name}` : 'Aucune application sÃ©lectionnÃ©e'}
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            ) : null}

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
              <div className="min-w-0 space-y-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                  Exemple:  ID du ticket (gÃ©nÃ©rÃ© automatiquement)
                  </label>
                  <div className="font-bold text-gray-900">2026-06-23-1</div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Application <span className="text-danger">*</span>
                  </label>
                  <select
                    className="input-field appearance-none bg-gray-50"
                    value={applicationId}
                    onChange={(event) => setApplicationId(event.target.value)}
                    disabled={loadingApplications || submitting}
                  >
                    <option value="">
                      {loadingApplications ? 'Chargement des applications...' : 'SÃ©lectionnez une application'}
                    </option>
                    {applications.map((application) => (
                      <option key={application.id} value={application.id}>
                        {application.name}
                      </option>
                    ))}
                  </select>
                  {!loadingApplications && applications.length === 0 ? (
                    <p className="text-xs text-amber-600 mt-1">
                      Aucune application n'est associÃ©e Ã  ce compte client.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    CriticitÃ© <span className="text-danger">*</span>
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {levelOptions.map((option) => {
                      const selected = incidentLevel === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setIncidentLevel(option.value)}
                          className={`rounded-xl border-2 p-3 text-left transition-all ${
                            selected
                              ? 'border-primary bg-primary/5 text-primary shadow-sm'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          disabled={submitting}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{option.label}</span>
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                option.value === 'CRITICAL'
                                  ? 'bg-danger'
                                  : option.value === 'HIGH'
                                    ? 'bg-warning'
                                    : option.value === 'MEDIUM'
                                      ? 'bg-secondary'
                                      : 'bg-success'
                              }`}
                            />
                          </div>
                          <p className="mt-1 text-xs leading-relaxed opacity-80">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Description <span className="text-danger">*</span>
                  </label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                    
                    <textarea
                      rows={6}
                      placeholder="DÃ©crivez votre problÃ¨me en dÃ©tail..."
                      className="w-full p-4 text-sm focus:outline-none resize-none"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      maxLength={3000}
                      disabled={submitting}
                    />
                    <div className="bg-white p-2 text-right text-xs text-gray-400">
                      {description.length} / 3000
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-w-0 self-start">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">PiÃ¨ces jointes <span className="text-danger">*</span></label>
                <label className="border-2 border-dashed border-gray-200 rounded-2xl h-48 md:h-56 flex flex-col items-center justify-center bg-gray-50 hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer group overflow-hidden flex-shrink-0">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Glissez-dÃ©posez votre fichier ici</p>
                  <p className="text-xs text-gray-400 mt-1">ou</p>
                  <span className="mt-2 text-primary font-semibold text-sm hover:underline">Parcourir les fichiers</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.docm,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) => {
                      handleFilesSelected(event.target.files);
                      event.target.value = '';
                    }}
                    disabled={submitting}
                  />
                </label>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Formats acceptÃ©s : PNG, JPG, GIF, WEBP, PDF, DOC, DOCX (max. 5 Mo par fichier)
                </p>
                {attachments.length > 0 ? (
                  <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600 flex flex-col min-h-0">
                    <p className="font-semibold text-gray-700 mb-2">
                      Fichiers sÃ©lectionnÃ©s ({attachments.length})
                    </p>
                    <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {attachments.map((file) => {
                        const key = fileKey(file);
                        const previewUrl = previewUrls[key];

                        return (
                          <li
                            key={key}
                            className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 border border-gray-100"
                          >
                            {previewUrl ? (
                              <img
                                src={previewUrl}
                                alt={file.name}
                                className="h-10 w-10 shrink-0 rounded-md object-cover border border-gray-100"
                              />
                            ) : (
                              <div className="h-10 w-10 shrink-0 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-400">
                                {(file.name.split('.').pop() || 'FILE').slice(0, 4).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-gray-700">{file.name}</p>
                              <p className="text-[11px] text-gray-400">
                                {file.type || 'type inconnu'} Â· {Math.round(file.size / 1024)} KB
                              </p>
                            </div>
                            <button
                              type="button"
                              className="shrink-0 text-xs font-semibold text-danger hover:underline"
                              onClick={() =>
                                setAttachments((current) =>
                                  current.filter((existing) => fileKey(existing) !== key)
                                )
                              }
                              disabled={submitting}
                            >
                              Supprimer
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/client/home')}
                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary gap-2 min-w-36"
                disabled={submitting || loadingApplications || applications.length === 0}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submitting ? 'Envoi en cours' : 'CrÃ©er le ticket'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}




