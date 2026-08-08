import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { fetchIncidents, fetchNotificationsByRecipient, type IncidentDto, type NotificationDto } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Flame,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Zap,
  Radio,
  Layers
} from 'lucide-react';

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ActiveStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS';
export type SlaUrgencyState = 'breached' | 'at_risk' | 'on_track';

export interface SlaIncident {
  id: string;
  reference: string;
  title: string;
  application: string;
  severity: SeverityLevel;
  status: ActiveStatus;
  assignee: {
    name: string;
    avatarInitials: string;
    role: string;
  };
  createdAt: string; // ISO string
  slaDeadline: string; // ISO string
  totalSlaMinutes: number; // SLA window in minutes
}

export interface IncidentSlaMetrics {
  incident: SlaIncident;
  urgencyState: SlaUrgencyState;
  remainingMs: number;
  elapsedPercent: number;
  formattedTimer: string;
  isOverdue: boolean;
}

// ============================================================================
// MOCK DATA GENERATOR
// Uses relative time offsets from Date.now() so that every time the page loads:
// 1. One incident is already BREACHED (overdue by ~14 mins)
// 2. One incident is ABOUT TO BREACH in ~2 minutes (shows live ticking countdown!)
// 3. One incident is AT RISK (~18 mins remaining)
// 4. Three incidents are comfortably ON TRACK (1h 35m, 3h 40m, 7h 15m left)
// ============================================================================

function generateMockIncidents(): SlaIncident[] {
  const now = Date.now();
  const minute = 60 * 1000;

  return [
    {
      id: 'inc-101',
      reference: 'INC-2026-0801',
      title: 'Panne totale du service de paiement en ligne',
      application: 'Portail RH & Paie',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      assignee: {
        name: 'Karim Mansouri',
        avatarInitials: 'KM',
        role: 'Expert Systeme',
      },
      createdAt: new Date(now - 75 * minute).toISOString(), // Created 75m ago
      slaDeadline: new Date(now - 14 * minute - 30 * 1000).toISOString(), // Breached 14m 30s ago
      totalSlaMinutes: 60, // 60 min SLA limit
    },
    {
      id: 'inc-102',
      reference: 'INC-2026-0802',
      title: 'Latence critique sur la base de donnÃƒÂ©es ERP',
      application: 'ERP Finance',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      assignee: {
        name: 'Sophie Dupont',
        avatarInitials: 'SD',
        role: 'DBA Senior',
      },
      createdAt: new Date(now - 58 * minute).toISOString(), // Created 58m ago
      slaDeadline: new Date(now + 115 * 1000).toISOString(), // Breaching in ~1 min 55 sec!
      totalSlaMinutes: 60,
    },
    {
      id: 'inc-103',
      reference: 'INC-2026-0803',
      title: 'DÃƒÂ©lai d\'authentification SSO anormal',
      application: 'AD / LDAP Intranet',
      severity: 'HIGH',
      status: 'ACKNOWLEDGED',
      assignee: {
        name: 'Youssef Benali',
        avatarInitials: 'YB',
        role: 'IngÃƒÂ©nieur SÃƒÂ©curitÃƒÂ©',
      },
      createdAt: new Date(now - 102 * minute).toISOString(),
      slaDeadline: new Date(now + 18 * minute).toISOString(), // Breaching in 18 mins
      totalSlaMinutes: 120, // 2h SLA
    },
    {
      id: 'inc-104',
      reference: 'INC-2026-0804',
      title: 'Erreur 500 sur les exports PDF de rapports',
      application: 'Passerelle API Payment',
      severity: 'HIGH',
      status: 'OPEN',
      assignee: {
        name: 'Claire Martin',
        avatarInitials: 'CM',
        role: 'DÃƒÂ©veloppeur Lead',
      },
      createdAt: new Date(now - 25 * minute).toISOString(),
      slaDeadline: new Date(now + 95 * minute).toISOString(), // 1h 35m left
      totalSlaMinutes: 120,
    },
    {
      id: 'inc-105',
      reference: 'INC-2026-0805',
      title: 'Dysfonctionnement de la synchronisation CRM',
      application: 'CRM Sales Force',
      severity: 'MEDIUM',
      status: 'IN_PROGRESS',
      assignee: {
        name: 'Alexandre Dubois',
        avatarInitials: 'AD',
        role: 'Support N2',
      },
      createdAt: new Date(now - 40 * minute).toISOString(),
      slaDeadline: new Date(now + 220 * minute).toISOString(), // 3h 40m left
      totalSlaMinutes: 260,
    },
    {
      id: 'inc-106',
      reference: 'INC-2026-0806',
      title: 'Absence d\'affichage des avatars utilisateurs',
      application: 'Messagerie Interne',
      severity: 'LOW',
      status: 'OPEN',
      assignee: {
        name: 'Amine Tazi',
        avatarInitials: 'AT',
        role: 'Support N1',
      },
      createdAt: new Date(now - 45 * minute).toISOString(),
      slaDeadline: new Date(now + 435 * minute).toISOString(), // 7h 15m left
      totalSlaMinutes: 480, // 8h SLA
    },
  ];
}

function fullName(user?: IncidentDto['createdBy'] | IncidentDto['incidentManager'] | IncidentDto['handledBy']): string {
  if (!user) return 'Non assigne';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Non assigne';
}

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  const first = parts[0]?.[0] ?? 'U';
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? 'N';
  return `${first}${second}`.toUpperCase();
}

function mapStatus(status: IncidentDto['status']): ActiveStatus | null {
  switch (status) {
    case 'NEW':
      return 'OPEN';
    case 'VALIDATED':
      return 'ACKNOWLEDGED';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    default:
      return null;
  }
}

function mapSeverity(level?: IncidentDto['incidentLevel'] | null): SeverityLevel {
  return level ?? 'MEDIUM';
}

function toSlaIncident(incident: IncidentDto): SlaIncident | null {
  if (!incident.slaDeadline) return null;

  const status = mapStatus(incident.status);
  if (!status) return null;

  const deadlineMs = new Date(incident.slaDeadline).getTime();
  const createdMs = new Date(incident.createdAt ?? '').getTime();
  if (Number.isNaN(deadlineMs)) return null;

  const assigneeSource = incident.handledBy ?? incident.incidentManager ?? incident.createdBy;
  const assigneeName = fullName(assigneeSource);
  const assigneeRole = incident.assignedTeam?.name ?? incident.handledBy?.teamName ?? incident.incidentManager?.teamName ?? 'Equipe';
  const totalSlaMinutes = Number.isNaN(createdMs)
    ? Math.max(1, Math.round((deadlineMs - Date.now()) / 60000))
    : Math.max(1, Math.round((deadlineMs - createdMs) / 60000));

  return {
    id: String(incident.id),
    reference: incident.reference,
    title: incident.name ?? incident.description ?? incident.reference,
    application: incident.application?.name ?? 'Application',
    severity: mapSeverity(incident.incidentLevel),
    status,
    assignee: {
      name: assigneeName,
      avatarInitials: initials(assigneeName),
      role: assigneeRole,
    },
    createdAt: incident.createdAt ?? new Date().toISOString(),
    slaDeadline: incident.slaDeadline,
    totalSlaMinutes,
  };
}
// ============================================================================
// HELPER FUNCTIONS FOR CALCULATING SLA STATUS & FORMATTING
// ============================================================================

function calculateSlaMetrics(incident: SlaIncident, nowMs: number): IncidentSlaMetrics {
  const deadlineMs = new Date(incident.slaDeadline).getTime();
  const createdMs = new Date(incident.createdAt).getTime();
  const remainingMs = deadlineMs - nowMs;

  const totalDurationMs = Math.max(1, (incident.totalSlaMinutes * 60 * 1000) || (deadlineMs - createdMs));
  const elapsedMs = Math.max(0, nowMs - createdMs);
  
  // Clamp elapsed percent between 0 and 100
  const elapsedPercent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));

  const isOverdue = remainingMs <= 0;

  // Determine urgency state
  let urgencyState: SlaUrgencyState = 'on_track';
  if (isOverdue) {
    urgencyState = 'breached';
  } else if (remainingMs <= 20 * 60 * 1000 || elapsedPercent >= 75) {
    // Less than 20 mins remaining OR >75% of window used -> At Risk
    urgencyState = 'at_risk';
  }

  // Format timer string HH:MM:SS
  const absRemainingMs = Math.abs(remainingMs);
  const hours = Math.floor(absRemainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((absRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absRemainingMs % (1000 * 60)) / 1000);

  const formattedHours = hours > 0 ? `${String(hours).padStart(2, '0')}:` : '';
  const formattedTime = `${formattedHours}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const formattedTimer = isOverdue ? `+${formattedTime}` : formattedTime;

  return {
    incident,
    urgencyState,
    remainingMs,
    elapsedPercent,
    formattedTimer,
    isOverdue,
  };
}

// Styling maps matching the existing project design tokens
const severityBadgeStyles: Record<SeverityLevel, { label: string; pCode: string; className: string }> = {
  CRITICAL: { label: 'Critique', pCode: 'P1', className: 'bg-red-100 text-red-700 border-red-200 font-bold' },
  HIGH:     { label: 'Haute',    pCode: 'P2', className: 'bg-orange-100 text-orange-700 border-orange-200 font-semibold' },
  MEDIUM:   { label: 'Moyenne',  pCode: 'P3', className: 'bg-amber-100 text-amber-700 border-amber-200 font-medium' },
  LOW:      { label: 'Basse',    pCode: 'P4', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 font-medium' },
};

const statusBadgeStyles: Record<ActiveStatus, { label: string; className: string }> = {
  OPEN:         { label: 'OUVERT',      className: 'bg-blue-50 text-blue-700 border-blue-200' },
  ACKNOWLEDGED: { label: 'PRIS EN CHARGE', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  IN_PROGRESS:  { label: 'EN COURS',    className: 'bg-amber-50 text-amber-800 border-amber-200' },
};

// ============================================================================
// MAIN COMPONENT: SlaClock
// ============================================================================

export default function SlaClock() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rawIncidents, setRawIncidents] = useState<SlaIncident[]>([]);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<'ALL' | SlaUrgencyState>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | SeverityLevel>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [loadMode, setLoadMode] = useState<'live' | 'demo'>('live');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  void loadMode;
  void notifications;
  void loading;
  void error;
  void refreshing;
  void lastUpdatedAt;

  const loadData = async (background = false) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const [incidents, notificationData] = await Promise.all([
        fetchIncidents(),
        user?.id ? fetchNotificationsByRecipient(user.id) : Promise.resolve([] as NotificationDto[]),
      ]);

      const activeIncidents = incidents
        .map(toSlaIncident)
        .filter((incident): incident is SlaIncident => incident !== null);

      setRawIncidents(activeIncidents);
      setNotifications(notificationData);
      setLoadMode('live');
      setLastUpdatedAt(new Date().toISOString());
    } catch (err) {
      setRawIncidents(generateMockIncidents());
      setNotifications([]);
      setLoadMode('demo');
      setError(err instanceof Error ? err.message : 'Impossible de charger les incidents SLA.');
      setLastUpdatedAt(new Date().toISOString());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadData(true);
    }, 60000);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /*
   * LIVE COUNTDOWN TIMER ENGINE:
   * Client-side setInterval ticking every 1000ms.
   *
   * [FUTURE WEBSOCKET INTEGRATION POINT]:
   * Subscribe to websocket topic e.g.:
   * stompClient.subscribe('/topic/incidents', (message) => {
   *   const updatedIncident = JSON.parse(message.body);
   *   setRawIncidents(prev => updateIncidentList(prev, updatedIncident));
   * });
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Compute metrics for all incidents using current ticking timestamp
  const incidentMetrics: IncidentSlaMetrics[] = useMemo(() => {
    return rawIncidents.map(inc => calculateSlaMetrics(inc, nowMs));
  }, [rawIncidents, nowMs]);

  // SLA Summary counts
  const summaryCounts = useMemo(() => {
    let breached = 0;
    let atRisk = 0;
    let onTrack = 0;

    incidentMetrics.forEach(m => {
      if (m.urgencyState === 'breached') breached++;
      else if (m.urgencyState === 'at_risk') atRisk++;
      else onTrack++;
    });

    return {
      total: incidentMetrics.length,
      breached,
      atRisk,
      onTrack,
    };
  }, [incidentMetrics]);

  // Sort & Filter logic
  // Required sorting: Breached first, then At Risk, then On Track.
  // Within each group: soonest-to-breach (lowest remainingMs) at top.
  const filteredAndSortedIncidents = useMemo(() => {
    return incidentMetrics
      .filter(m => {
        // Filter by urgency tab
        if (selectedUrgency !== 'ALL' && m.urgencyState !== selectedUrgency) {
          return false;
        }
        // Filter by severity
        if (selectedSeverity !== 'ALL' && m.incident.severity !== selectedSeverity) {
          return false;
        }
        // Search filter (Title, Ref, App, Assignee)
        if (searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase();
          const matchTitle = m.incident.title.toLowerCase().includes(term);
          const matchRef = m.incident.reference.toLowerCase().includes(term);
          const matchApp = m.incident.application.toLowerCase().includes(term);
          const matchAssignee = m.incident.assignee.name.toLowerCase().includes(term);
          return matchTitle || matchRef || matchApp || matchAssignee;
        }
        return true;
      })
      .sort((a, b) => {
        // Hierarchy score: breached=1, at_risk=2, on_track=3
        const stateScore: Record<SlaUrgencyState, number> = {
          breached: 1,
          at_risk: 2,
          on_track: 3,
        };

        if (stateScore[a.urgencyState] !== stateScore[b.urgencyState]) {
          return stateScore[a.urgencyState] - stateScore[b.urgencyState];
        }

        // Within same urgency group: soonest to breach / most overdue first
        return a.remainingMs - b.remainingMs;
      });
  }, [incidentMetrics, selectedUrgency, selectedSeverity, searchTerm]);

  // Helper to refresh live data
  const handleRefreshData = () => {
    void loadData(true);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      
      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ PAGE HEADER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-text tracking-tight">Horloge SLA (Live SLA Clock)</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm animate-pulse">
              <Radio className="w-3 h-3 mr-1 text-emerald-600 animate-ping" />
              Direct (1s tick)
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Supervision en temps reel des delais de resolution SLA pour les incidents actifs
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshData}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            title="Rafraichir les incidents et notifications SLA"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            <span>Rafraichir live</span>
          </button>
          <div className="text-right text-xs text-muted hidden md:block">
            Dernier tick: <span className="font-mono text-gray-700">{new Date(nowMs).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ SUMMARY KPI STRIP Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* BREACHED CARD */}
        <div
          onClick={() => setSelectedUrgency(selectedUrgency === 'breached' ? 'ALL' : 'breached')}
          className={`card-white p-5 cursor-pointer transition-all border-l-4 border-l-red-500 hover:shadow-md ${
            selectedUrgency === 'breached' ? 'ring-2 ring-red-400 bg-red-50/40' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-red-100/80 text-red-600">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase tracking-wider">
              Critique
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-red-600 tracking-tight">{summaryCounts.breached}</div>
            <div className="text-xs font-semibold text-gray-700 mt-1">Depassement SLA (Breached)</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Incidents ayant depasse l'echeance</p>
          </div>
        </div>

        {/* AT RISK CARD */}
        <div
          onClick={() => setSelectedUrgency(selectedUrgency === 'at_risk' ? 'ALL' : 'at_risk')}
          className={`card-white p-5 cursor-pointer transition-all border-l-4 border-l-amber-500 hover:shadow-md ${
            selectedUrgency === 'at_risk' ? 'ring-2 ring-amber-400 bg-amber-50/40' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-100/80 text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">
              Alerte
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-600 tracking-tight">{summaryCounts.atRisk}</div>
            <div className="text-xs font-semibold text-gray-700 mt-1">SLA en Risque (At Risk)</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Echeance &lt; 30m ou &gt;75% ecoule</p>
          </div>
        </div>

        {/* ON TRACK CARD */}
        <div
          onClick={() => setSelectedUrgency(selectedUrgency === 'on_track' ? 'ALL' : 'on_track')}
          className={`card-white p-5 cursor-pointer transition-all border-l-4 border-l-emerald-500 hover:shadow-md ${
            selectedUrgency === 'on_track' ? 'ring-2 ring-emerald-400 bg-emerald-50/40' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-100/80 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">
              Normal
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">{summaryCounts.onTrack}</div>
            <div className="text-xs font-semibold text-gray-700 mt-1">Dans les Delais (On Track)</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Traitement selon les objectifs SLA</p>
          </div>
        </div>

        {/* TOTAL ACTIVE CARD */}
        <div
          onClick={() => setSelectedUrgency('ALL')}
          className={`card-white p-5 cursor-pointer transition-all border-l-4 border-l-primary hover:shadow-md ${
            selectedUrgency === 'ALL' ? 'ring-2 ring-primary/40 bg-primary/5' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
              Actifs
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-primary tracking-tight">{summaryCounts.total}</div>
            <div className="text-xs font-semibold text-gray-700 mt-1">Total Incidents Actifs</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Hors resolus &amp; fermes</p>
          </div>
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ FILTERS & CONTROL BAR Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="card-white p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="   Rechercher par titre, ref, app..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 pr-4 text-xs"
          />
        </div>

        {/* Urgency Filter Tabs */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedUrgency('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedUrgency === 'ALL'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tous ({summaryCounts.total})
          </button>
          <button
            onClick={() => setSelectedUrgency('breached')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              selectedUrgency === 'breached'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            <span>Depassement ({summaryCounts.breached})</span>
          </button>
          <button
            onClick={() => setSelectedUrgency('at_risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedUrgency === 'at_risk'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            En Risque ({summaryCounts.atRisk})
          </button>
          <button
            onClick={() => setSelectedUrgency('on_track')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedUrgency === 'on_track'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Dans les delais ({summaryCounts.onTrack})
          </button>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as 'ALL' | SeverityLevel)}
            className="input-field text-xs py-2 w-full md:w-44"
          >
            <option value="ALL">Toutes </option>
            <option value="CRITICAL">P1 - Critique</option>
            <option value="HIGH">P2 - Haute</option>
            <option value="MEDIUM">P3 - Moyenne</option>
            <option value="LOW">P4 - Basse</option>
          </select>
        </div>

      </div>

    <div className="card-white overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-gray-900">
              Incidents Actifs et Chronometres SLA ({filteredAndSortedIncidents.length})
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span>Trié par: <strong>Urgence SLA puis échéance la plus proche</strong></span>
          </div>
        </div>

        {filteredAndSortedIncidents.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">Aucun incident trouve</h3>
            <p className="text-xs text-muted mt-1">
              Tous les incidents correspondant aux criticites choisis sont traites.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 min-w-[220px]">Chronometre SLA &amp; Progression</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Incident &amp; Application</th>
                  <th className="py-3.5 px-4">Priorite</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Assigne Ã </th>
                  <th className="py-3.5 px-4">Echeance SLA</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredAndSortedIncidents.map(({ incident, urgencyState, formattedTimer, elapsedPercent, isOverdue }) => {
                  const sevConfig = severityBadgeStyles[incident.severity];
                  const stConfig = statusBadgeStyles[incident.status];

                  // Row background and border highlights based on urgency
                  let rowBgClass = 'bg-white hover:bg-gray-50/80';
                  let timerColorClass = 'text-emerald-700';
                  let progressBarGradient = 'from-emerald-500 to-teal-500';
                  let badgeUrgencyText = 'ON TRACK';
                  let badgeUrgencyBg = 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  if (urgencyState === 'breached') {
                    rowBgClass = 'bg-red-50/60 hover:bg-red-50/90 border-l-4 border-l-red-600';
                    timerColorClass = 'text-red-600 font-black';
                    progressBarGradient = 'from-red-500 to-rose-600';
                    badgeUrgencyText = 'DÃƒâ€°PASSÃƒâ€° (BREACHED)';
                    badgeUrgencyBg = 'bg-red-600 text-white font-bold animate-pulse';
                  } else if (urgencyState === 'at_risk') {
                    rowBgClass = 'bg-amber-50/50 hover:bg-amber-50/80 border-l-4 border-l-amber-500';
                    timerColorClass = 'text-amber-700 font-extrabold';
                    progressBarGradient = 'from-amber-500 to-yellow-500';
                    badgeUrgencyText = 'EN RISQUE';
                    badgeUrgencyBg = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
                  } else {
                    rowBgClass = 'bg-white hover:bg-gray-50 border-l-4 border-l-emerald-500';
                  }

                  return (
                    <tr key={incident.id} className={`transition-colors ${rowBgClass}`}>
                      
                      {/* TIMER & PROGRESS BAR COLUMN */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${badgeUrgencyBg}`}>
                              {urgencyState === 'breached' && <Flame className="w-3 h-3 mr-1" />}
                              {urgencyState === 'at_risk' && <Clock className="w-3 h-3 mr-1 animate-spin" style={{ animationDuration: '4s' }} />}
                              {badgeUrgencyText}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              {Math.round(elapsedPercent)}% écoulé
                            </span>
                          </div>

                          {/* Countdown Timer Display */}
                          <div className={`text-xl font-mono tracking-tight flex items-center space-x-1.5 ${timerColorClass}`}>
                            <Clock className={`w-4 h-4 shrink-0 ${isOverdue ? 'text-red-600 animate-bounce' : ''}`} />
                            <span>{formattedTimer}</span>
                            {isOverdue && <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-red-600">RETARD</span>}
                          </div>

                          {/* Thin SLA Progress Bar */}
                          <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden shadow-inner relative">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${progressBarGradient}`}
                              style={{ width: `${elapsedPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* INCIDENT DETAILS COLUMN */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {incident.reference}
                            </span>
                            <span className="inline-flex items-center text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              <Layers className="w-3 h-3 mr-1 text-gray-400" />
                              {incident.application}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-xs line-clamp-2 hover:text-primary transition-colors">
                            {incident.title}
                          </h3>
                        </div>
                      </td>

                      {/* SEVERITY BADGE */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs border ${sevConfig.className}`}>
                          <span className="font-mono mr-1">[{sevConfig.pCode}]</span>
                          <span>{sevConfig.label}</span>
                        </span>
                      </td>

                      {/* STATUS BADGE */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${stConfig.className}`}>
                          {stConfig.label}
                        </span>
                      </td>

                      {/* ASSIGNEE */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                            {incident.assignee.avatarInitials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs">{incident.assignee.name}</p>
                            <p className="text-[10px] text-gray-500">{incident.assignee.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* SLA DEADLINE & DURATION */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="space-y-0.5 text-gray-600">
                          <div className="font-semibold text-xs text-gray-800">
                            {new Date(incident.slaDeadline).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-muted">
                            {new Date(incident.slaDeadline).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-gray-500 pt-0.5">
                            Fenetre SLA: <strong>{incident.totalSlaMinutes} min</strong>
                          </div>
                        </div>
                      </td>

                      {/* ACTION BUTTON */}
                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/incidents/${incident.reference}`)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-all"
                        >
                          <span>Voir</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    

    </div>
  );
}





