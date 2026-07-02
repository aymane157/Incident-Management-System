import { ArrowLeft, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateIncident() {
  const navigate = useNavigate();
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 pb-2">
        <button onClick={() => navigate('/home')} className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Créer un nouveau ticket</span>
        </button>
        <div className="text-xs text-gray-400 mt-2 ml-6">Accueil &gt; Nouveau ticket</div>
      </div>

      <div className="flex-1 flex px-12 py-4 gap-12">
        {/* Stepper */}
        <div className="w-48 space-y-6 pt-4">
          <div className="flex items-center space-x-3 text-primary">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-sm font-semibold">Informations</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-sm font-medium">Détails</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-sm font-medium">Confirmation</span>
          </div>
          
          <div className="pt-20">
            {/* Isometric illustration placeholder */}
            <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto relative overflow-hidden flex items-center justify-center">
               <div className="w-20 h-20 bg-primary/20 rotate-45 transform"></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 max-w-3xl">
          <div className="card-white p-8 space-y-8 relative">
            <h2 className="text-xl font-bold text-gray-900">Informations générales</h2>
            
            <div className="flex gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">ID du ticket (généré automatiquement)</label>
                  <div className="font-bold text-gray-900">2026-06-23-1</div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Application <span className="text-danger">*</span></label>
                  <select className="input-field appearance-none bg-gray-50">
                    <option>Sélectionnez une application</option>
                    <option>Portail RH</option>
                    <option>ERP Finance</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Description <span className="text-danger">*</span></label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                    <div className="bg-gray-50 border-b border-gray-200 p-2 flex space-x-2">
                      <button className="p-1 hover:bg-gray-200 rounded font-bold text-gray-600 text-sm">B</button>
                      <button className="p-1 hover:bg-gray-200 rounded italic text-gray-600 text-sm">I</button>
                      <button className="p-1 hover:bg-gray-200 rounded underline text-gray-600 text-sm">U</button>
                      <div className="w-px h-4 bg-gray-300 my-auto mx-1"></div>
                      <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Paperclip className="w-4 h-4" /></button>
                    </div>
                    <textarea rows={6} placeholder="Décrivez votre problème en détail..." className="w-full p-4 text-sm focus:outline-none resize-none"></textarea>
                    <div className="bg-white p-2 text-right text-xs text-gray-400">0 / 3000</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Capture d'écran</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Glissez-déposez votre fichier ici</p>
                  <p className="text-xs text-gray-400 mt-1">ou</p>
                  <button className="mt-2 text-primary font-semibold text-sm hover:underline">Parcourir les fichiers</button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">Formats acceptés : PNG, JPG, GIF (max. 5 Mo)</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <button className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Annuler</button>
              <button className="btn-primary">Suivant</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}