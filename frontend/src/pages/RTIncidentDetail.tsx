import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, AlertTriangle, CheckCircle,
  User, Calendar, Monitor, Flag, Send, FileText,
  MessageSquare, History
} from 'lucide-react';

// ─── Mock incident data ────────────────────────────────────────────────────────

const mockIncidents: Record<string, {
  id: string; app: string; client: string; status: string;
  priority: string; slaRemaining: string; slaPercent: number;
  description: string; assignedAt: string; assignee: string;
  category: string;
  timeline: { color: string; label: string; time: string }[];
  messages: { author: string; initials: string; time: string; text: string; mine: boolean }[];
}> = {
  '2026-06-23-1': {
    id: '2026-06-23-1',
    app: 'Portail RH',
    client: 'CGI',
    status: 'EN COURS',
    priority: 'Critique',
    slaRemaining: '00h 22m',
    slaPercent: 8,
    description: 'Les utilisateurs ne peuvent plus se connecter au Portail RH depuis ce matin (08h00). L\'erreur affichée est "Session expirée". Le problème touche tous les comptes du domaine CGI.',
    assignedAt: '23/06/2026 10:15',
    assignee: 'Thomas Bernard',
    category: 'Accès / Authentification',
    timeline: [
      { color: 'bg-primary',   label: 'Ticket créé par Jean Dupont',          time: '23/06 10:15' },
      { color: 'bg-secondary', label: 'Assigné à Thomas Bernard (vous)',       time: '23/06 10:20' },
      { color: 'bg-warning',   label: 'SLA en risque — moins de 30 minutes',  time: '23/06 10:35' },
    ],
    messages: [
      { author: 'Jean Dupont',     initials: 'JD', time: '10:15', text: 'Bonjour, je n\'arrive plus à me connecter au portail RH depuis ce matin.', mine: false },
      { author: 'Marie Martin',    initials: 'MM', time: '10:17', text: 'Bonjour Jean, nous regardons cela. Thomas va prendre en charge votre incident.', mine: false },
      { author: 'Thomas Bernard',  initials: 'TB', time: '10:22', text: 'Bonjour, je suis sur le problème. Pouvez-vous essayer de vider le cache navigateur ?', mine: true },
      { author: 'Jean Dupont',     initials: 'JD', time: '10:24', text: 'J\'ai essayé, le problème persiste.', mine: false },
    ],
  },
  '2026-06-23-3': {
    id: '2026-06-23-3',
    app: 'Réseau VPN',
    client: 'Atos',
    status: 'EN ATTENTE',
    priority: 'Haute',
    slaRemaining: '01h 40m',
    slaPercent: 33,
    description: 'Coupure intermittente du réseau VPN pour l\'équipe Finance depuis hier soir. Les déconnexions surviennent toutes les 15-20 minutes.',
    assignedAt: '23/06/2026 09:00',
    assignee: 'Thomas Bernard',
    category: 'Réseau',
    timeline: [
      { color: 'bg-primary',   label: 'Ticket créé par Sophie Leroy',   time: '22/06 21:00' },
      { color: 'bg-secondary', label: 'Assigné à Thomas Bernard (vous)', time: '23/06 09:00' },
    ],
    messages: [
      { author: 'Sophie Leroy', initials: 'SL', time: '21:00', text: 'Bonsoir, le VPN coupe toutes les 20 minutes pour notre équipe.', mine: false },
    ],
  },
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'details' | 'conversation' | 'rapport' | 'historique';

// ─── Component ────────────────────────────────────────────────────────────────

export default function RTIncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [status, setStatus] = useState<'EN ATTENTE' | 'EN COURS' | 'RÉSOLU'>('EN COURS');
  const [messageText, setMessageText] = useState('');

  const incident = mockIncidents[id ?? ''] ?? mockIncidents['2026-06-23-1'];

  const priorityClass =
    incident.priority === 'Critique' ? 'bg-danger/10 text-danger' :
    incident.priority === 'Haute'    ? 'bg-warning/10 text-warning' :
    'bg-gray-100 text-gray-600';

  const slaBarClass =
    incident.slaPercent <= 15 ? 'bg-danger' :
    incident.slaPercent <= 35 ? 'bg-warning' :
    'bg-success';

  return (
    <div className="h-full flex flex-col bg-background p-6 space-y-4">

      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/rt/home')}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-900">Incident #{incident.id}</h1>
              <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                status === 'EN COURS'   ? 'bg-secondary/10 text-secondary' :
                status === 'EN ATTENTE' ? 'bg-primary/10 text-primary' :
                                          'bg-success/10 text-success'
              }`}>{status}</span>
              <span className={`text-[10px] px-2 py-1 rounded font-bold ${priorityClass}`}>{incident.priority}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{incident.app} · {incident.client}</p>
          </div>
        </div>

        {/* SLA Badge */}
        {status !== 'RÉSOLU' && (
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${
            incident.slaPercent <= 15 ? 'border-danger/30 bg-danger/5' :
            incident.slaPercent <= 35 ? 'border-warning/30 bg-warning/5' :
            'border-success/30 bg-success/5'
          }`}>
            <Clock className={`w-4 h-4 ${
              incident.slaPercent <= 15 ? 'text-danger' :
              incident.slaPercent <= 35 ? 'text-warning' : 'text-success'
            }`} />
            <div>
              <p className="text-[10px] text-gray-500">SLA restant</p>
              <p className={`text-sm font-bold ${
                incident.slaPercent <= 15 ? 'text-danger' :
                incident.slaPercent <= 35 ? 'text-warning' : 'text-success'
              }`}>{incident.slaRemaining}</p>
            </div>
            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden ml-2">
              <div className={`h-full rounded-full ${slaBarClass}`} style={{ width: incident.slaPercent + '%' }} />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {status !== 'RÉSOLU' && (
        <div className="flex gap-3">
          {status === 'EN ATTENTE' && (
            <button
              onClick={() => setStatus('EN COURS')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-medium text-sm hover:bg-secondary/90 transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Prendre en charge</span>
            </button>
          )}
          {status === 'EN COURS' && (
            <button
              onClick={() => { setStatus('RÉSOLU'); setActiveTab('rapport'); }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-success text-white rounded-xl font-medium text-sm hover:bg-success/90 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Marquer comme résolu</span>
            </button>
          )}
          {status === 'EN COURS' && (
            <button className="flex items-center space-x-2 px-4 py-2 border border-warning/30 bg-warning/5 text-warning rounded-xl font-medium text-sm hover:bg-warning/10 transition-colors">
              <AlertTriangle className="w-4 h-4" />
              <span>Escalader</span>
            </button>
          )}
        </div>
      )}

      {/* Resolved Banner */}
      {status === 'RÉSOLU' && (
        <div className="bg-success/10 border border-success/20 rounded-xl px-5 py-3 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-success shrink-0" />
          <p className="text-sm font-medium text-success">Cet incident a été marqué comme résolu. Veuillez soumettre votre rapport de résolution.</p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 card-white flex flex-col overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-gray-100 text-sm font-medium px-6">
          {(
            [
              { id: 'details',      label: 'Détails',       icon: Monitor      },
              { id: 'conversation', label: 'Conversation',   icon: MessageSquare },
              { id: 'rapport',      label: 'Rapport de résolution', icon: FileText },
              { id: 'historique',   label: 'Historique',    icon: History      },
            ] as { id: Tab; label: string; icon: React.ElementType }[]
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                'flex items-center space-x-1.5 px-5 py-4 border-b-2 transition-colors ' +
                (activeTab === tab.id
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900')
              }
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Détails ─────────────────────────────────────────────── */}
        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">{incident.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: Monitor,  label: 'Application',    value: incident.app       },
                { icon: User,     label: 'Client',         value: incident.client    },
                { icon: Flag,     label: 'Priorité',       value: incident.priority  },
                { icon: User,     label: 'Assigné à',      value: incident.assignee  },
                { icon: Calendar, label: 'Assigné le',     value: incident.assignedAt },
                { icon: Monitor,  label: 'Catégorie',      value: incident.category  },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-start space-x-3">
                  <item.icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Conversation ────────────────────────────────────────── */}
        {activeTab === 'conversation' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {incident.messages.map((msg, i) => (
                <div key={i} className={`flex space-x-3 ${msg.mine ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.mine ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {msg.initials}
                  </div>
                  <div className={`max-w-md flex flex-col ${msg.mine ? 'items-end' : ''}`}>
                    <div className={`flex items-baseline space-x-2 mb-1 ${msg.mine ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span className="font-bold text-sm text-gray-900">{msg.author}</span>
                      <span className="text-[10px] text-gray-400">{msg.time}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${msg.mine ? 'bg-secondary/10 text-secondary-dark rounded-tr-sm' : 'bg-gray-100 text-gray-700 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-primary">
                <input
                  type="text"
                  placeholder="Écrire un message..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                <button className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Rapport de résolution ───────────────────────────────── */}
        {activeTab === 'rapport' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {reportSubmitted ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Rapport soumis avec succès</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  Votre rapport de résolution a été enregistré et transmis à l'Incident Manager pour validation.
                </p>
                <button
                  onClick={() => navigate('/rt/home')}
                  className="btn-primary"
                >
                  Retour à mes incidents
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg mb-1">Rapport de résolution</h2>
                  <p className="text-sm text-gray-500">Décrivez la cause racine identifiée et les actions prises pour résoudre l'incident.</p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cause racine identifiée *</label>
                    <select className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary">
                      <option value="">Sélectionner une cause...</option>
                      <option>Erreur de configuration</option>
                      <option>Panne matérielle</option>
                      <option>Bug logiciel</option>
                      <option>Problème réseau</option>
                      <option>Erreur humaine</option>
                      <option>Attaque / Sécurité</option>
                      <option>Surcharge de capacité</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Actions correctives réalisées *</label>
                    <textarea
                      rows={4}
                      placeholder="Décrivez les étapes réalisées pour résoudre l'incident..."
                      value={reportText}
                      onChange={e => setReportText(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Actions préventives recommandées</label>
                    <textarea
                      rows={3}
                      placeholder="Recommandations pour éviter que ce type d'incident se reproduise..."
                      className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date de résolution *</label>
                      <input
                        type="datetime-local"
                        defaultValue="2026-06-23T10:57"
                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Durée de résolution</label>
                      <input
                        type="text"
                        defaultValue="0h 42m"
                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (reportText.trim()) setReportSubmitted(true);
                    }}
                    disabled={!reportText.trim()}
                    className="w-full btn-primary py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Soumettre le rapport
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Tab: Historique ──────────────────────────────────────────── */}
        {activeTab === 'historique' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
              {incident.timeline.map((event, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[29px] top-1 w-3 h-3 ${event.color} rounded-full ring-4 ring-white`} />
                  <p className="text-sm text-gray-900 font-medium">{event.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{event.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
