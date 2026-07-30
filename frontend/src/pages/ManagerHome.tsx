import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  FileText,
  Lock,
  MessageSquareText,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  fetchNotificationsByRecipient,
  fetchUserById,
  type NotificationDto,
  type UserDto,
} from '../lib/api';

const kpis = [
  {
    label: 'Tickets ouverts',
    value: '84',
    trend: '+6 depuis hier',
    trendUp: false,
    icon: Lock,
    color: 'text-primary bg-primary/10',
  },
  {
    label: 'SLA en risque',
    value: '8',
    trend: '+2 depuis hier',
    trendUp: false,
    icon: AlertTriangle,
    color: 'text-warning bg-warning/10',
  },
  {
    label: "Resolus aujourd'hui",
    value: '47',
    trend: '+15% vs hier',
    trendUp: true,
    icon: CheckCircle,
    color: 'text-success bg-success/10',
  },
  {
    label: 'Temps moy. resolution',
    value: '2h 14m',
    trend: '-8% vs hier',
    trendUp: true,
    icon: TrendingUp,
    color: 'text-secondary bg-secondary/10',
  },
];

const urgentTickets = [
  { id: '2026-06-23-1', app: 'Portail RH', client: 'CGI', sla: '00h 22m', slap: 8, prio: 'Critique' },
  { id: '2026-06-23-4', app: 'ERP Finance', client: 'Atos', sla: '00h 47m', slap: 15, prio: 'Haute' },
  { id: '2026-06-22-9', app: 'CRM', client: 'Capgemini', sla: '01h 05m', slap: 22, prio: 'Haute' },
  { id: '2026-06-22-7', app: 'Intranet', client: 'CGI', sla: '01h 30m', slap: 30, prio: 'Moyenne' },
  { id: '2026-06-22-3', app: 'AD / LDAP', client: 'Sopra', sla: '01h 55m', slap: 38, prio: 'Haute' },
];

const teamLoad = [
  { team: 'Support N1', tickets: 23, capacity: 30 },
  { team: 'Systeme', tickets: 18, capacity: 20 },
  { team: 'Reseau', tickets: 12, capacity: 20 },
  { team: 'Securite', tickets: 9, capacity: 15 },
  { team: 'BDD', tickets: 14, capacity: 15 },
];

const recentActivity = [
  { color: 'bg-success', text: 'Ticket 2026-06-23-2 resolu par Marie Martin', time: 'Il y a 8 min' },
  { color: 'bg-danger', text: 'SLA critique sur 2026-06-23-1 - moins de 30 minutes', time: 'Il y a 12 min' },
  { color: 'bg-primary', text: "Ticket 2026-06-23-3 assigne a l'equipe Systeme", time: 'Il y a 20 min' },
  { color: 'bg-warning', text: 'Ticket 2026-06-22-9 escalade en priorite haute', time: 'Il y a 34 min' },
  { color: 'bg-secondary', text: 'Nouveau ticket 2026-06-23-5 cree par Atos', time: 'Il y a 41 min' },
];

function formatDate(value?: string | null) {
  if (!value) return 'Non defini';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function fullName(user?: UserDto | null) {
  if (!user) return 'Utilisateur';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Utilisateur';
}

export default function ManagerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [refreshingNotifications, setRefreshingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  const firstName = user?.name?.split(' ')[0] ?? 'Manager';

  const rcaNotifications = useMemo(() => {
    return notifications
      .filter((item) => String(item.message ?? '').toLowerCase().includes('rca'))
      .sort((left, right) => {
        const leftDate = new Date(left.createdAt ?? 0).getTime();
        const rightDate = new Date(right.createdAt ?? 0).getTime();
        return rightDate - leftDate;
      });
  }, [notifications]);

  useEffect(() => {
    let active = true;

    async function loadNotifications(background = false) {
      if (!user?.id) {
        setLoadingNotifications(false);
        setRefreshingNotifications(false);
        return;
      }

      if (background) {
        setRefreshingNotifications(true);
      } else {
        setLoadingNotifications(true);
      }

      setNotificationsError('');

      try {
        const userData = await fetchUserById(user.id);
        if (!active) return;

        const data = await fetchNotificationsByRecipient(userData.id);
        if (!active) return;

        setNotifications(data);
      } catch (err) {
        if (!active) return;
        setNotificationsError(err instanceof Error ? err.message : 'Impossible de charger les notifications.');
      } finally {
        if (!active) return;
        setLoadingNotifications(false);
        setRefreshingNotifications(false);
      }
    }

    void loadNotifications();

    const intervalId = window.setInterval(() => {
      void loadNotifications(true);
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [user?.id]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Tableau de bord - Incident Manager - {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un ticket, un client..."
              className="w-full bg-white border border-gray-200 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600">
            <Bell className="w-5 h-5" />
            {rcaNotifications.length ? (
              <span className="absolute top-1 right-1 min-w-4 rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {rcaNotifications.length}
              </span>
            ) : (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => navigate('/manager/workspace')}
            className="btn-primary space-x-2 flex items-center"
          >
            <Zap className="w-4 h-4" />
            <span>Workspace</span>
          </button>
          <button
            onClick={() => navigate('/manager/rca')}
            className="hidden sm:inline-flex items-center space-x-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" />
            <span>RCA recus</span>
          </button>
        </div>
      </div>

      <div className="bg-danger/10 border border-danger/20 rounded-xl px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-danger/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-danger" />
          </div>
          <div>
            <p className="text-sm font-bold text-danger">2 tickets vont depasser leur SLA dans moins de 30 minutes</p>
            <p className="text-xs text-danger/70 mt-0.5">2026-06-23-1 (Portail RH) - 2026-06-23-4 (ERP Finance)</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/manager/workspace')}
          className="flex items-center space-x-1.5 text-sm font-semibold text-danger hover:underline shrink-0"
        >
          <span>Intervenir</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="card-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-gray-900">Notifications RCA</h3>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Les nouveaux rapports apparaissent ici quand ils sont soumis.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (!user?.id) return;
              setRefreshingNotifications(true);
              setNotificationsError('');
              try {
                const userData = await fetchUserById(user.id);
                const data = await fetchNotificationsByRecipient(userData.id);
                setNotifications(data);
              } catch (err) {
                setNotificationsError(err instanceof Error ? err.message : 'Impossible de rafraichir les notifications.');
              } finally {
                setRefreshingNotifications(false);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshingNotifications ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {loadingNotifications ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            Chargement des notifications...
          </div>
        ) : notificationsError ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {notificationsError}
          </div>
        ) : rcaNotifications.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rcaNotifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                      {notification.type ?? 'NOTIFICATION'}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {notification.message ?? 'Nouvelle notification'}
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <MessageSquareText className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Incident: {notification.incident?.reference ?? '—'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Recu par {fullName(notification.recipient)} - {formatDate(notification.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            Aucun RCA notifie pour le moment.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="card-white p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</h2>
              <p className={`text-xs font-medium ${kpi.trendUp ? 'text-success' : 'text-danger'}`}>{kpi.trend}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-[2] card-white flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">File de priorite - SLA critique</h3>
              <p className="text-xs text-gray-400 mt-0.5">Tickets classes par temps SLA restant</p>
            </div>
            <button
              onClick={() => navigate('/manager/workspace')}
              className="text-primary text-xs font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 font-medium">
                <tr>
                  <th className="py-3 px-5 font-medium">ID</th>
                  <th className="py-3 px-5 font-medium">APPLICATION</th>
                  <th className="py-3 px-5 font-medium">CLIENT</th>
                  <th className="py-3 px-5 font-medium">SLA RESTANT</th>
                  <th className="py-3 px-5 font-medium">PRIORITE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {urgentTickets.map((t, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                    onClick={() => navigate('/manager/workspace')}
                  >
                    <td className="py-3.5 px-5 font-medium text-gray-900">{t.id}</td>
                    <td className="py-3.5 px-5 text-gray-600">{t.app}</td>
                    <td className="py-3.5 px-5 text-gray-600">{t.client}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-semibold text-xs ${
                            t.slap <= 15 ? 'text-danger' : t.slap <= 30 ? 'text-warning' : 'text-gray-600'
                          }`}
                        >
                          {t.sla}
                        </span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              t.slap <= 15 ? 'bg-danger' : t.slap <= 30 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${t.slap}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          t.prio === 'Critique'
                            ? 'bg-danger/10 text-danger'
                            : t.prio === 'Haute'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {t.prio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="card-white">
            <div className="p-5 border-b border-gray-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-gray-900">Charge des equipes</h3>
            </div>
            <div className="p-5 space-y-4">
              {teamLoad.map((t, i) => {
                const pct = Math.round((t.tickets / t.capacity) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                      <span>{t.team}</span>
                      <span className={pct >= 90 ? 'text-danger' : pct >= 70 ? 'text-warning' : 'text-success'}>
                        {t.tickets}/{t.capacity}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-white flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Activite recente</h3>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="relative pl-4 border-l-2 border-primary/20 space-y-5">
                {recentActivity.map((a, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 ${a.color} rounded-full ring-4 ring-white`} />
                    <p className="text-sm text-gray-900 font-medium leading-snug">{a.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 text-center">
              <button className="text-primary text-sm font-semibold hover:underline">Voir toute l'activite</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-white p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Tickets en attente de validation</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">23</p>
          </div>
        </div>
        <div className="card-white p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Techniciens actifs aujourd'hui</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">14</p>
          </div>
        </div>
        <div className="card-white p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Taux de resolution dans les SLA</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">91%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
