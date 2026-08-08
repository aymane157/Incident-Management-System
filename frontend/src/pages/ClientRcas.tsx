import { useEffect, useMemo, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { fetchClientRcaReports, type RcaReportDto } from '../lib/api';

export default function ClientRcas() {
  const { user } = useAuth();
  const [reports, setReports] = useState<RcaReportDto[]>([]);
  const [error, setError] = useState('');

  const sortedReports = useMemo(
    () =>
      [...reports].sort(
        (left, right) =>
          new Date(right.sentToClientAt ?? right.createdAt ?? 0).getTime() -
          new Date(left.sentToClientAt ?? left.createdAt ?? 0).getTime()
      ),
    [reports]
  );

  const load = async () => {
    if (!user?.id) return;

    try {
      setError('');
      setReports(await fetchClientRcaReports(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les RCA.');
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);


  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Suivi incident</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">RCA recus</h1>
        <p className="mt-2 text-sm text-gray-500">Les analyses envoyees par votre incident manager sont disponibles ici.</p>
      </div>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <div className="space-y-4">
        {sortedReports.map((report) => (
          <article key={report.id} className="card-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{report.incident?.reference ?? `RCA #${report.id}`}</h2>
                <p className="text-sm text-gray-500">{report.incident?.application?.name ?? 'Incident'}</p>
              </div>
              <FileText className="text-primary" />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <section>
                <h3 className="text-xs font-bold uppercase text-gray-400">Cause racine</h3>
                <p className="mt-2 text-sm text-gray-700">{report.rootCause ?? 'Non renseignee'}</p>
              </section>
              <section>
                <h3 className="text-xs font-bold uppercase text-gray-400">Solution</h3>
                <p className="mt-2 text-sm text-gray-700">{report.solution ?? 'Non renseignee'}</p>
              </section>
              <section>
                <h3 className="text-xs font-bold uppercase text-gray-400">Prevention</h3>
                <p className="mt-2 text-sm text-gray-700">{report.preventiveMeasures ?? 'Non renseignee'}</p>
              </section>
            </div>

          
          </article>
        ))}

        {!sortedReports.length ? (
          <div className="card-white flex items-center gap-3 p-6 text-gray-500">
            <Loader2 className="h-5 w-5" />
            Aucun RCA ne vous a encore ete envoye.
          </div>
        ) : null}
      </div>
    </div>
  );
}


