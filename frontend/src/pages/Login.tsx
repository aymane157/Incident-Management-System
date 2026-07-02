import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0b001a] to-[#160033]">
      {/* Background Graphic - Sweeping Lines and Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Abstract SVG Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Bottom left to top right curves */}
          <path d="M-200,1000 C300,700 500,400 1200,-100" fill="none" stroke="url(#grad1)" strokeWidth="1.5" opacity="0.6" />
          <path d="M-200,1050 C350,750 550,450 1250,-50" fill="none" stroke="url(#grad1)" strokeWidth="1" opacity="0.4" />
          <path d="M-200,1100 C400,800 600,500 1300,0" fill="none" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.2" />
          
          <path d="M-200,1150 C200,900 800,200 1500,100" fill="none" stroke="url(#grad1)" strokeWidth="1" opacity="0.5" />
          <path d="M-200,1200 C250,950 850,250 1550,150" fill="none" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.3" />

          <defs>
            <linearGradient id="grad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b300ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8a2be2" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4b0082" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Deep glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#3a0088] rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#5c00a3] rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-6">
        
        {/* DXC Logo Placeholder */}
        <div className="flex flex-col items-center mb-10">
          <div className="text-white text-[3rem] font-bold tracking-tighter leading-none mb-1.5 flex items-center">
            DXC
          </div>
          <div className="text-[11px] tracking-[0.35em] text-white font-medium uppercase ml-1">
            Technology
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-4 leading-snug">
            Bienvenue sur<br />DXC Incident Hub
          </h1>
          <p className="text-xs text-gray-200 font-light leading-relaxed">
            Connectez-vous pour accéder<br />à votre espace de gestion des incidents.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white rounded-xl shadow-2xl p-7 mb-8">
          <form onSubmit={(e) => { e.preventDefault(); navigate('/home'); }} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-700">Adresse e-mail</label>
              <input 
                type="email" 
                placeholder="exemple@dxc.com" 
                className="w-full bg-white border border-gray-200 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#3b0b8c] focus:border-[#3b0b8c] transition-all placeholder:text-gray-400" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-700">Mot de passe</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#3b0b8c] focus:border-[#3b0b8c] transition-all font-serif tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-gray-400" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#3b0b8c] focus:ring-[#3b0b8c]" />
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-[11px] text-[#3b0b8c] font-semibold hover:underline">Mot de passe oublié ?</a>
            </div>
            
            <button type="submit" className="w-full bg-[#3b0b8c] hover:bg-[#2c086e] text-white font-medium py-3 rounded-md transition-colors text-sm mt-3">
              Se connecter
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-gray-400 font-light">
          © 2026 DXC Technology. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}