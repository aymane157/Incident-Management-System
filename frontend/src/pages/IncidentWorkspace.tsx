import { useState } from 'react';
import { Search, Filter, Lock, CheckCircle, Clock, Paperclip, Send } from 'lucide-react';

export default function IncidentWorkspace() {
  const [selectedTicket, setSelectedTicket] = useState(true);

  return (
    <div className="h-full flex flex-col bg-background p-6 space-y-6">
      {/* Header KPIs */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vue globale</h1>
        <div className="flex items-center space-x-3">
          <img src="https://i.pravatar.cc/150?u=marie" alt="User" className="w-8 h-8 rounded-full border border-gray-200" />
          <div className="text-right">
            <p className="text-xs text-gray-500">Incident Manager</p>
            <p className="text-sm font-semibold">Marie Martin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-4xl">
        <div className="card-white p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Lock className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tickets en attente<br/>de validation</p>
            <div className="flex items-end space-x-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-none mt-1">23</h2>
              <span className="text-[10px] text-gray-400 mb-0.5">+0 depuis hier</span>
            </div>
          </div>
        </div>
        <div className="card-white p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">SLA en risque<br/>&nbsp;</p>
            <div className="flex items-end space-x-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-none mt-1">8</h2>
              <span className="text-[10px] text-danger mb-0.5">+2 depuis hier</span>
            </div>
          </div>
        </div>
        <div className="card-white p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Résolus aujourd'hui<br/>&nbsp;</p>
            <div className="flex items-end space-x-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-none mt-1">47</h2>
              <span className="text-[10px] text-success mb-0.5">+15% vs hier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Table View */}
        <div className="flex-1 card-white flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input type="text" placeholder="Rechercher un ticket..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary" />
            </div>
            <button className="flex items-center space-x-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 font-medium sticky top-0 bg-white">
                <tr>
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium">APPLICATION</th>
                  <th className="py-3 px-4 font-medium">CLIENT</th>
                  <th className="py-3 px-4 font-medium">STATUT</th>
                  <th className="py-3 px-4 font-medium">SLA RESTANT</th>
                  <th className="py-3 px-4 font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className={"hover:bg-gray-50 cursor-pointer " + (i === 1 ? "bg-primary/5" : "")} onClick={() => setSelectedTicket(true)}>
                    <td className="py-4 px-4 font-medium text-gray-900">2026-06-23-{i}</td>
                    <td className="py-4 px-4 text-gray-600">Portail RH</td>
                    <td className="py-4 px-4 text-gray-600">Jean Dupont</td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] px-2 py-1 rounded font-bold bg-primary/10 text-primary">EN ATTENTE</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">01h 15m <span className="text-danger font-medium text-xs ml-1">15%</span></td>
                    <td className="py-4 px-4 text-right space-x-2 text-gray-400">
                      <button className="hover:text-success"><CheckCircle className="w-4 h-4 inline" /></button>
                      <button className="hover:text-danger"><span className="font-bold">X</span></button>
                      <button className="hover:text-gray-900">•••</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
            1-5 sur 23 &lt; &gt;
          </div>
        </div>

        {/* Right Drawer - Ticket Details & Chat */}
        {selectedTicket && (
          <div className="w-[450px] card-white flex flex-col shrink-0 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-3">
                <h3 className="font-bold text-gray-900 text-lg">2026-06-23-1</h3>
                <span className="text-[10px] px-2 py-1 rounded font-bold bg-primary/10 text-primary">EN ATTENTE</span>
              </div>
            </div>
            
            <div className="flex border-b border-gray-100 text-sm font-medium">
              <button className="px-4 py-3 border-b-2 border-primary text-primary">Conversation</button>
              <button className="px-4 py-3 text-gray-500 hover:text-gray-900">Détails</button>
              <button className="px-4 py-3 text-gray-500 hover:text-gray-900">Pièces jointes (1)</button>
              <button className="px-4 py-3 text-gray-500 hover:text-gray-900">Historique</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-white flex flex-col">
              <h4 className="font-bold text-gray-900 text-lg mb-4">Problème de connexion sur le Portail RH</h4>
              <p className="text-xs text-gray-500 mb-6">Créé le 23/06/2026 à 10:15 par Jean Dupont</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-gray-100">
                <div><span className="text-gray-500">Application:</span> <span className="font-medium">Portail RH</span></div>
                <div><span className="text-gray-500">Priorité:</span> <span className="font-medium text-danger">Haute</span></div>
                <div><span className="text-gray-500">Assigné à:</span> <span className="font-medium">Marie Martin</span></div>
              </div>

              {/* Chat View */}
              <div className="flex-1 flex flex-col space-y-4">
                {/* Client Message */}
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">JD</div>
                  <div>
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">Jean Dupont</span>
                      <span className="text-[10px] text-gray-400">10:15</span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-700">
                      Bonjour, je n'arrive plus à me connecter au portail RH depuis ce matin.
                    </div>
                  </div>
                </div>
                {/* Support Message */}
                <div className="flex space-x-3 flex-row-reverse space-x-reverse">
                  <img src="https://i.pravatar.cc/150?u=marie" className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline space-x-2 mb-1 flex-row-reverse space-x-reverse">
                      <span className="font-bold text-sm text-gray-900">Marie Martin</span>
                      <span className="text-[10px] text-gray-400">10:17</span>
                    </div>
                    <div className="bg-primary/10 text-primary-dark p-3 rounded-2xl rounded-tr-sm text-sm">
                      Bonjour Jean, nous regardons cela. Pouvez-vous essayer de vider le cache de votre navigateur ?
                    </div>
                  </div>
                </div>
                {/* Client Reply */}
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">JD</div>
                  <div>
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">Jean Dupont</span>
                      <span className="text-[10px] text-gray-400">10:18</span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-700">
                      J'ai essayé, mais le problème persiste.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-primary">
                <input type="text" placeholder="Écrire un message..." className="flex-1 bg-transparent text-sm focus:outline-none" />
                <button className="text-gray-400 hover:text-gray-600"><Paperclip className="w-4 h-4" /></button>
                <button className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center"><Send className="w-4 h-4" /></button>
              </div>
            </div>
            {/* Actions for Manager (Valider/Rejeter) */}
            <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-100">
              <button className="flex-1 btn-primary text-sm shadow-none">Valider le ticket</button>
              <button className="flex-1 bg-danger hover:bg-red-600 text-white font-medium py-2 rounded-xl transition-colors text-sm">Rejeter le ticket</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}