import { useState } from 'react';
import {
  Search, Filter, Lock, CheckCircle, Clock,
  Paperclip, Send, Users, FileText, History,
  MessageSquare, X, ChevronDown, Bell, Zap,
  ArrowRight, AlertTriangle, ShieldCheck
} from 'lucide-react';

// ─── Mock data ────────────────────────────────────────────────────────────────

type TicketStatus = 'NOUVEAU' | 'EN ATTENTE' | 'EN COURS' | 'RÉSOLU' | 'REJETÉ';

interface Ticket {
  id: string;
  app: string;
  client: string;
  description: string;
  status: TicketStatus;
  sla: string;
  slaP: number;
  slaDeadline: string;
  prio: string;
  team: string;
  assignee: string;
  createdAt: string;
  category: string;
}

const initialTickets: Ticket[] = [
  {
    id: '2026-06-23-6', app: 'Portail RH',    client: 'CGI',       description: 'Impossible de générer les bulletins de salaire — module bloqué.',
    status: 'NOUVEAU',     sla: '—',       slaP: 0,   slaDeadline: '', prio: 'Critique', team: '', assignee: '', createdAt: '23/06 12:34', category: 'Accès / Authentification',
  },
  {
    id: '2026-06-23-5', app: 'Messagerie',    client: 'Sopra',     description: 'Les pièces jointes ne s\'envoient plus depuis ce matin.',
    status: 'NOUVEAU',     sla: '—',       slaP: 0,   slaDeadline: '', prio: 'Haute',    team: '', assignee: '', createdAt: '23/06 11:58', category: 'Messagerie',
  },
  {
    id: '2026-06-23-4', app: 'Active Directory', client: 'Atos',   description: 'Compte de 3 utilisateurs verrouillés après une mise à jour de GPO.',
    status: 'NOUVEAU',     sla: '—',       slaP: 0,   slaDeadline: '', prio: 'Haute',    team: '', assignee: '', createdAt: '23/06 11:12', category: 'Réseau',
  },
  {
    id: '2026-06-23-2', app: 'ERP Finance',  client: 'Atos',      description: 'Erreur 500 sur le module de facturation.',
    status: 'EN COURS',    sla: '01h 15m', slaP: 25,  slaDeadline: '23/06 14:00', prio: 'Haute',    team: 'Système',    assignee: 'Thomas Bernard', createdAt: '23/06 10:02', category: 'Applicatif',
  },
  {
    id: '2026-06-23-3', app: 'Réseau VPN',   client: 'Capgemini', description: 'Coupures intermittentes VPN pour l\'équipe Finance.',
    status: 'EN COURS',    sla: '02h 00m', slaP: 40,  slaDeadline: '23/06 15:30', prio: 'Haute',    team: 'Réseau',     assignee: 'Alice Morel',    createdAt: '23/06 09:00', category: 'Réseau',
  },
  {
    id: '2026-06-23-1', app: 'Portail RH',   client: 'CGI',       description: 'Connexion impossible pour tous les comptes CGI.',
    status: 'EN ATTENTE',  sla: '00h 22m', slaP: 8,   slaDeadline: '23/06 12:00', prio: 'Critique', team: 'Support N1', assignee: '',               createdAt: '23/06 08:45', category: 'Accès / Authentification',
  },
  {
    id: '2026-06-22-7', app: 'Intranet',     client: 'CGI',       description: 'Pages intranet inaccessibles après la mise à jour du serveur.',
    status: 'RÉSOLU',      sla: '—',       slaP: 100, slaDeadline: '22/06 18:00', prio: 'Basse',    team: 'Support N1', assignee: 'Karim Saïd',     createdAt: '22/06 14:00', category: 'Réseau',
  },
];

const teams = ['Support N1', 'Système', 'Réseau', 'Sécurité', 'BDD'];
const techniciansByTeam: Record<string, string[]> = {
  'Support N1': ['Sophie Leroy', 'Karim Saïd'],
  'Système':    ['Thomas Bernard', 'Louis Petit'],
  'Réseau':     ['Alice Morel', 'Marc Dupuis'],
  'Sécurité':   ['Fatima Benali'],
  'BDD':        ['Pierre Luc'],
};

const slaOptions = [
  { label: '1 heure',   value: '01h 00m', hours: 1  },
  { label: '2 heures',  value: '02h 00m', hours: 2  },
  { label: '4 heures',  value: '04h 00m', hours: 4  },
  { label: '8 heures',  value: '08h 00m', hours: 8  },
  { label: '24 heures', value: '24h 00m', hours: 24 },
  { label: '48 heures', value: '48h 00m', hours: 48 },
];

const priorityOptions = ['Critique', 'Haute', 'Moyenne', 'Basse'];

type MainTab  = 'new' | 'all';
type PanelTab = 'conversation' | 'details' | 'rca' | 'historique';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusClass = (s: string) =>
  s === 'EN COURS'   ? 'bg-secondary/10 text-secondary' :
  s === 'EN ATTENTE' ? 'bg-primary/10 text-primary' :
  s === 'RÉSOLU'     ? 'bg-success/10 text-success' :
  s === 'REJETÉ'     ? 'bg-danger/10 text-danger' :
  s === 'NOUVEAU'    ? 'bg-warning/10 text-warning' : 'bg-gray-100 text-gray-500';

const prioClass = (p: string) =>
  p === 'Critique' ? 'bg-danger/10 text-danger' :
  p === 'Haute'    ? 'bg-warning/10 text-warning' :
  p === 'Moyenne'  ? 'bg-blue-50 text-blue-600' :
  'bg-gray-100 text-gray-500';

// ─── Assignment Modal ─────────────────────────────────────────────────────────

interface AssignModalProps {
  ticket: Ticket;
  onClose: () => void;
  onConfirm: (data: { priority: string; team: string; sla: string; slaDeadline: string; reject: boolean }) => void;
}

function AssignModal({ ticket, onClose, onConfirm }: AssignModalProps) {
  const [priority, setPriority] = useState(ticket.prio);
  const [team, setTeam]         = useState(ticket.team);
  const [slaHours, setSlaHours] = useState('4');
  const [step, setStep]         = useState<1 | 2>(1);

  const selectedSla = slaOptions.find(s => String(s.hours) === slaHours) ?? slaOptions[2];

  const handleConfirm = () => {
    const now  = new Date();
    now.setHours(now.getHours() + selectedSla.hours);
    const deadline = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) +
      ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    onConfirm({ priority, team, sla: selectedSla.value, slaDeadline: deadline, reject: false });
  };

  const handleReject = () => {
    onConfirm({ priority, team, sla: '—', slaDeadline: '', reject: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a0045] to-[#3b0b8c] p-5 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-white font-bold">#{ticket.id}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${prioClass(ticket.prio)}`}>{ticket.prio}</span>
            </div>
            <p className="text-white/80 text-sm">{ticket.app} · {ticket.client}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 pt-4 pb-2 flex items-center space-x-2">
          {[1, 2].map(n => (
            <div key={n} className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= n ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
              }`}>{n}</div>
              <span className={`text-xs font-medium ${step >= n ? 'text-gray-900' : 'text-gray-400'}`}>
                {n === 1 ? 'Qualifier' : 'Dispatcher'}
              </span>
              {n < 2 && <ArrowRight className="w-3 h-3 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="p-5 space-y-4">

          {/* Ticket description */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description du ticket</p>
            <p className="text-sm text-gray-700 leading-relaxed">{ticket.description}</p>
            <div className="flex items-center space-x-3 mt-2.5 text-[10px] text-gray-400">
              <span>📅 {ticket.createdAt}</span>
              <span>🏷 {ticket.category}</span>
            </div>
          </div>

          {step === 1 && (
            <>
              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Criticité / Priorité</label>
                <div className="grid grid-cols-4 gap-2">
                  {priorityOptions.map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                        priority === p
                          ? p === 'Critique' ? 'border-danger bg-danger/10 text-danger'
                          : p === 'Haute'    ? 'border-warning bg-warning/10 text-warning'
                          : p === 'Moyenne'  ? 'border-blue-400 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-gray-50 text-gray-500'
                          : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >{p}</button>
                  ))}
                </div>
              </div>

              {/* SLA */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Délai SLA à accorder
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {slaOptions.map(s => (
                    <button
                      key={s.hours}
                      onClick={() => setSlaHours(String(s.hours))}
                      className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                        slaHours === String(s.hours)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 mx-auto mb-0.5 opacity-60" />
                      {s.label}
                    </button>
                  ))}
                </div>
                {slaHours && (
                  <p className="text-[10px] text-gray-500 mt-1.5">
                    ⏰ Échéance SLA : <span className="font-semibold text-gray-700">{selectedSla.label} à partir de maintenant</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep(2)}
                  disabled={!priority || !slaHours}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40 flex items-center justify-center space-x-2"
                >
                  <span>Suivant — Dispatcher</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2.5 border-2 border-danger/20 bg-danger/5 text-danger rounded-xl text-sm font-medium hover:bg-danger/10 transition-colors"
                >
                  Rejeter
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Summary */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${prioClass(priority)}`}>{priority}</span>
                  <span className="text-gray-600">SLA : <span className="font-bold text-gray-900">{selectedSla.label}</span></span>
                </div>
                <button onClick={() => setStep(1)} className="text-primary hover:underline text-[10px]">Modifier</button>
              </div>

              {/* Team */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  <Users className="w-3.5 h-3.5 inline mr-1" />
                  Équipe de traitement *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {teams.map(t => (
                    <button
                      key={t}
                      onClick={() => setTeam(t)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-all text-left ${
                        team === t
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full mb-1 flex items-center justify-center text-[9px] font-bold text-white ${
                        team === t ? 'bg-primary' : 'bg-gray-300'
                      }`}>
                        {t.charAt(0)}
                      </div>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technicians for selected team */}
              {team && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Techniciens disponibles — {team}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(techniciansByTeam[team] ?? []).map(name => (
                      <span key={name} className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
                        <div className="w-4 h-4 rounded-full bg-secondary/30 text-secondary flex items-center justify-center text-[8px] font-bold">
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleConfirm}
                  disabled={!team}
                  className="flex-1 bg-success hover:bg-success/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-40 flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirmer l'assignation</span>
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IncidentWorkspace() {
  const [tickets, setTickets]           = useState(initialTickets);
  const [mainTab, setMainTab]           = useState<MainTab>('new');
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState<PanelTab>('conversation');
  const [searchQuery, setSearchQuery]   = useState('');
  const [rcaText, setRcaText]           = useState('');
  const [rcaSaved, setRcaSaved]         = useState(false);
  const [assignModal, setAssignModal]   = useState<Ticket | null>(null);

  const newTickets  = tickets.filter(t => t.status === 'NOUVEAU');
  const allTickets  = tickets.filter(t => t.status !== 'NOUVEAU');
  const selected    = tickets.find(t => t.id === selectedId);

  const listToShow = (mainTab === 'new' ? newTickets : allTickets).filter(t =>
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.app.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignTeam = (ticketId: string, team: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, team, assignee: '' } : t));
  };

  const handleAssignTech = (ticketId: string, tech: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignee: tech } : t));
  };

  const handleValidate = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'EN COURS' } : t));
  };

  const handleReject = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'REJETÉ' } : t));
  };

  const handleAssignModalConfirm = (data: { priority: string; team: string; sla: string; slaDeadline: string; reject: boolean }) => {
    if (!assignModal) return;
    setTickets(prev => prev.map(t =>
      t.id === assignModal.id
        ? {
            ...t,
            status: data.reject ? 'REJETÉ' : 'EN ATTENTE',
            prio: data.priority,
            team: data.team,
            sla: data.sla,
            slaDeadline: data.slaDeadline,
          }
        : t
    ));
    setAssignModal(null);
    if (!data.reject) setMainTab('all');
  };

  return (
    <div className="h-full flex flex-col bg-background p-6 space-y-4">

      {/* Modal */}
      {assignModal && (
        <AssignModal
          ticket={assignModal}
          onClose={() => setAssignModal(null)}
          onConfirm={handleAssignModalConfirm}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspace — Gestion des incidents</h1>
          <p className="text-sm text-gray-500 mt-0.5">Triage, assignation SLA et suivi en temps réel.</p>
        </div>
        {/* KPI chips */}
        <div className="flex gap-2.5">
          {[
            { icon: Bell,        label: 'Nouveaux',  value: newTickets.length,                                          color: 'text-warning bg-warning/10',    pulse: newTickets.length > 0 },
            { icon: Lock,        label: 'En attente', value: tickets.filter(t => t.status === 'EN ATTENTE').length,    color: 'text-primary bg-primary/10',    pulse: false },
            { icon: Clock,       label: 'En cours',   value: tickets.filter(t => t.status === 'EN COURS').length,      color: 'text-secondary bg-secondary/10',pulse: false },
            { icon: CheckCircle, label: 'Résolus',    value: tickets.filter(t => t.status === 'RÉSOLU').length,        color: 'text-success bg-success/10',    pulse: false },
          ].map((k, i) => (
            <div key={i} className="card-white px-3.5 py-2.5 flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center relative ${k.color}`}>
                <k.icon className="w-3.5 h-3.5" />
                {k.pulse && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full animate-ping" />
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 leading-none">{k.label}</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{k.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center border-b border-gray-200 gap-1">
        <button
          onClick={() => { setMainTab('new'); setSelectedId(null); }}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors ${
            mainTab === 'new' ? 'border-warning text-warning' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Nouveaux tickets</span>
          {newTickets.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-warning text-white text-[10px] font-bold rounded-full">
              {newTickets.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setMainTab('all'); setSelectedId(null); }}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors ${
            mainTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Tous les incidents</span>
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex gap-5 overflow-hidden min-h-0">

        {/* ── Ticket list ─────────────────────────────────────────────── */}
        <div className="flex-1 card-white flex flex-col overflow-hidden">

          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button className="flex items-center space-x-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>

          {/* ═══════════════════ NEW TICKETS view ═══════════════════════ */}
          {mainTab === 'new' && (
            <>
              {newTickets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-gray-400">
                  <ShieldCheck className="w-12 h-12 text-success opacity-50" />
                  <p className="text-sm font-medium">Aucun nouveau ticket à traiter 🎉</p>
                </div>
              ) : (
                <div className="flex-1 overflow-auto divide-y divide-gray-50">
                  {listToShow.map(t => (
                    <div
                      key={t.id}
                      className="p-5 hover:bg-gray-50/60 transition-colors group"
                    >
                      {/* Row header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-bold text-gray-900 text-sm">{t.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${statusClass(t.status)}`}>{t.status}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${prioClass(t.prio)}`}>{t.prio}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{t.createdAt}</span>
                      </div>

                      {/* Application + Client */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-semibold text-gray-800">{t.app}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{t.client}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{t.category}</span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">
                        {t.description}
                      </p>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAssignModal(t)}
                          className="flex items-center space-x-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Qualifier &amp; Assigner</span>
                        </button>
                        <button
                          onClick={() => { setSelectedId(t.id); }}
                          className="flex items-center space-x-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Voir détails</span>
                        </button>
                        <button
                          onClick={() => handleReject(t.id)}
                          className="flex items-center space-x-1.5 px-3 py-2 border border-danger/20 text-danger rounded-xl text-xs font-medium hover:bg-danger/5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rejeter</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ═══════════════════ ALL INCIDENTS view ══════════════════════ */}
          {mainTab === 'all' && (
            <>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-400 font-medium sticky top-0 bg-white shadow-sm">
                    <tr>
                      <th className="py-3 px-4 font-medium">ID</th>
                      <th className="py-3 px-4 font-medium">APPLICATION</th>
                      <th className="py-3 px-4 font-medium">CLIENT</th>
                      <th className="py-3 px-4 font-medium">STATUT</th>
                      <th className="py-3 px-4 font-medium">SLA RESTANT</th>
                      <th className="py-3 px-4 font-medium">ÉCHÉANCE SLA</th>
                      <th className="py-3 px-4 font-medium">ÉQUIPE / ASSIGNÉ</th>
                      <th className="py-3 px-4 font-medium text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {listToShow.map(t => (
                      <tr
                        key={t.id}
                        className={`cursor-pointer transition-colors ${selectedId === t.id ? 'bg-primary/5' : 'hover:bg-gray-50/60'}`}
                        onClick={() => { setSelectedId(t.id); setActiveTab('conversation'); }}
                      >
                        <td className="py-3.5 px-4 font-medium text-gray-900">{t.id}</td>
                        <td className="py-3.5 px-4 text-gray-600">{t.app}</td>
                        <td className="py-3.5 px-4 text-gray-600">{t.client}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${statusClass(t.status)}`}>{t.status}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {t.sla === '—' ? <span className="text-gray-300">—</span> : (
                            <div className="flex items-center space-x-1.5">
                              <span className={`text-xs font-semibold ${t.slaP <= 15 ? 'text-danger' : t.slaP <= 35 ? 'text-warning' : 'text-gray-600'}`}>{t.sla}</span>
                              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${t.slaP <= 15 ? 'bg-danger' : t.slaP <= 35 ? 'bg-warning' : 'bg-success'}`} style={{ width: t.slaP + '%' }} />
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-500">{t.slaDeadline || '—'}</td>
                        <td className="py-3.5 px-4">
                          {t.assignee ? (
                            <div>
                              <p className="text-xs font-medium text-gray-800">{t.assignee}</p>
                              <p className="text-[10px] text-gray-400">{t.team}</p>
                            </div>
                          ) : t.team ? (
                            <p className="text-xs text-gray-500">{t.team} — non assigné</p>
                          ) : (
                            <span className="text-[10px] text-danger font-medium">Non assigné</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 text-gray-400" onClick={e => e.stopPropagation()}>
                          {t.status === 'EN ATTENTE' && (
                            <>
                              <button onClick={() => handleValidate(t.id)} className="hover:text-success transition-colors" title="Démarrer">
                                <CheckCircle className="w-4 h-4 inline" />
                              </button>
                              <button onClick={() => handleReject(t.id)} className="hover:text-danger transition-colors" title="Rejeter">
                                <X className="w-4 h-4 inline" />
                              </button>
                            </>
                          )}
                          {t.status === 'EN ATTENTE' && !t.team && (
                            <button
                              onClick={() => setAssignModal(t)}
                              className="hover:text-primary transition-colors" title="Assigner"
                            >
                              <Users className="w-4 h-4 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {listToShow.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">Aucun incident trouvé.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
                {listToShow.length} sur {allTickets.length} incidents
              </div>
            </>
          )}
        </div>

        {/* ── Ticket Detail Panel ──────────────────────────────────────── */}
        {selected && (
          <div className="w-[440px] card-white flex flex-col shrink-0 overflow-hidden shadow-lg">

            {/* Panel header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">#{selected.id}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${statusClass(selected.status)}`}>{selected.status}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${prioClass(selected.prio)}`}>{selected.prio}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{selected.app} · {selected.client}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assignment section (only for non-new tickets without full assignment) */}
            {selected.status !== 'NOUVEAU' && (
              <div className="p-4 border-b border-gray-100 bg-white">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assignation</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Users className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                    <select
                      value={selected.team}
                      onChange={e => handleAssignTeam(selected.id, e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 pl-8 pr-7 text-sm focus:outline-none focus:border-primary text-gray-700"
                    >
                      <option value="">Équipe...</option>
                      {teams.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-3 text-gray-400 pointer-events-none" />
                  </div>
                  {selected.team && (
                    <div className="relative flex-1">
                      <select
                        value={selected.assignee}
                        onChange={e => handleAssignTech(selected.id, e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 pr-7 text-sm focus:outline-none focus:border-primary text-gray-700"
                      >
                        <option value="">Technicien...</option>
                        {(techniciansByTeam[selected.team] ?? []).map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>
                {selected.assignee && (
                  <p className="text-[10px] text-success mt-1.5 font-medium">✓ Assigné à {selected.assignee} ({selected.team})</p>
                )}
                {selected.slaDeadline && (
                  <p className="text-[10px] text-gray-500 mt-1">⏰ Échéance SLA : <span className="font-semibold">{selected.slaDeadline}</span></p>
                )}
              </div>
            )}

            {/* NOUVEAU ticket: show big Assign CTA */}
            {selected.status === 'NOUVEAU' && (
              <div className="p-4 border-b border-gray-100 bg-warning/5">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <p className="text-xs font-semibold text-warning">Ticket non encore qualifié</p>
                </div>
                <button
                  onClick={() => setAssignModal(selected)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Qualifier &amp; Assigner ce ticket</span>
                </button>
              </div>
            )}

            {/* Panel Tabs */}
            <div className="flex border-b border-gray-100 text-xs font-medium">
              {(
                [
                  { id: 'conversation', label: 'Conversation',  icon: MessageSquare },
                  { id: 'details',      label: 'Détails',       icon: Lock         },
                  { id: 'rca',          label: 'RCA',           icon: FileText     },
                  { id: 'historique',   label: 'Historique',    icon: History      },
                ] as { id: PanelTab; label: string; icon: React.ElementType }[]
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    'flex items-center space-x-1 px-3 py-3 border-b-2 transition-colors flex-1 justify-center ' +
                    (activeTab === tab.id ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500 hover:text-gray-900')
                  }
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ── Conversation ──────────────────────────────────────────── */}
            {activeTab === 'conversation' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <h4 className="font-bold text-gray-900">{selected.description}</h4>
                  <p className="text-xs text-gray-500">Créé le {selected.createdAt}</p>

                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">JD</div>
                    <div>
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="font-bold text-sm">Jean Dupont</span>
                        <span className="text-[10px] text-gray-400">{selected.createdAt.split(' ')[1] ?? '—'}</span>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-700">
                        {selected.description}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-primary">
                    <input type="text" placeholder="Écrire un message..." className="flex-1 bg-transparent text-sm focus:outline-none" />
                    <button className="text-gray-400 hover:text-gray-600"><Paperclip className="w-4 h-4" /></button>
                    <button className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center"><Send className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Détails ───────────────────────────────────────────────── */}
            {activeTab === 'details' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {[
                  ['Application',   selected.app],
                  ['Client',        selected.client],
                  ['Priorité',      selected.prio],
                  ['Statut',        selected.status],
                  ['SLA restant',   selected.sla],
                  ['Échéance SLA',  selected.slaDeadline || '—'],
                  ['Équipe',        selected.team || 'Non assigné'],
                  ['Technicien',    selected.assignee || 'Non assigné'],
                  ['Catégorie',     selected.category],
                  ['Créé le',       selected.createdAt],
                ].map(([label, val], i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{val}</p>
                  </div>
                ))}
                {selected.status === 'EN ATTENTE' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleValidate(selected.id)} className="flex-1 bg-success text-white font-medium py-2 rounded-xl text-sm hover:bg-success/90 transition-colors">Démarrer</button>
                    <button onClick={() => handleReject(selected.id)} className="flex-1 bg-danger text-white font-medium py-2 rounded-xl text-sm hover:bg-red-600 transition-colors">Rejeter</button>
                  </div>
                )}
              </div>
            )}

            {/* ── RCA ───────────────────────────────────────────────────── */}
            {activeTab === 'rca' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {rcaSaved ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-3">
                    <CheckCircle className="w-10 h-10 text-success" />
                    <p className="text-sm font-bold text-gray-900">Rapport RCA enregistré</p>
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold text-gray-900">Rapport RCA</h4>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary">
                      <option>Erreur de configuration</option>
                      <option>Bug logiciel</option>
                      <option>Problème réseau</option>
                      <option>Panne matérielle</option>
                      <option>Autre</option>
                    </select>
                    <textarea
                      rows={5}
                      placeholder="Analyse &amp; actions correctives..."
                      value={rcaText}
                      onChange={e => setRcaText(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                    <textarea
                      rows={3}
                      placeholder="Recommandations préventives..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                    <button
                      onClick={() => { if (rcaText.trim()) setRcaSaved(true); }}
                      disabled={!rcaText.trim()}
                      className="w-full bg-primary text-white font-medium py-2.5 rounded-xl text-sm disabled:opacity-40"
                    >
                      Enregistrer le rapport RCA
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── Historique ────────────────────────────────────────────── */}
            {activeTab === 'historique' && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="relative pl-5 border-l-2 border-primary/20 space-y-5">
                  {[
                    { color: 'bg-warning',   text: `Ticket créé par ${selected.client}`,              time: selected.createdAt },
                    { color: 'bg-secondary', text: `Assigné à l'équipe ${selected.team || '—'}`,     time: '10:20' },
                    { color: 'bg-warning',   text: 'SLA défini : ' + (selected.sla || '—'),          time: '10:21' },
                    { color: 'bg-primary',   text: 'Statut : ' + selected.status,                    time: '10:25' },
                  ].map((e, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[25px] top-1 w-3 h-3 ${e.color} rounded-full ring-4 ring-white`} />
                      <p className="text-sm text-gray-900 font-medium">{e.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{e.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}