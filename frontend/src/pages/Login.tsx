import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Users, Shield, Settings, Wrench } from 'lucide-react';
import { useAuth, UserRole } from '../lib/auth';

const roles: {
  id: UserRole;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  homeRoute: string;
}[] = [
  {
    id: 'client',
    label: 'Client',
    sublabel: 'Declarez & suivez\nvos incidents',
    icon: Users,
    homeRoute: '/client/home',
  },
  {
    id: 'manager',
    label: 'Incident Manager',
    sublabel: 'Gerez & pilotez\nles incidents',
    icon: Shield,
    homeRoute: '/manager/home',
  },
  {
    id: 'admin',
    label: 'Administrateur',
    sublabel: 'Gerez les utilisateurs\n& la configuration',
    icon: Settings,
    homeRoute: '/admin',
  },
  {
    id: 'rt',
    label: "Membre d'equipe",
    sublabel: 'Prenez en charge\nles incidents de votre equipe',
    icon: Wrench,
    homeRoute: '/rt/home',
  },
];

function homeRoute(role: UserRole): string {
  return roles.find((item) => item.id === role)?.homeRoute ?? '/client/home';
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selected = roles.find(r => r.id === role)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const user = await login({ email: email.trim(), password });
      navigate(homeRoute(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0b001a] to-[#160033]">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
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
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#3a0088] rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#5c00a3] rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center px-6">
        <div className="flex flex-col items-center mb-8">
          <div className="text-white text-[3rem] bg-gradient-to-r from-blue-500 to-purple-800 bg-clip-text text-transparent font-bold tracking-tighter leading-none mb-1.5">
            DXC
          </div>
          <div className="text-[11px] tracking-[0.35em] text-white font-medium uppercase ml-1">
            Technology
          </div>
        </div>

        <div className="w-full mb-5">
          <p className="text-[11px] text-gray-400 text-center mb-3 tracking-wider uppercase font-medium">
            Je me connecte en tant que
          </p>
          <div className="grid grid-cols-2 gap-3">
            {roles.map(r => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={
                    'flex flex-col items-center gap-1.5 py-3.5 rounded-xl border-2 transition-all duration-200 ' +
                    (isSelected
                      ? 'border-purple-500 bg-purple-500/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10')
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold tracking-wide">{r.label}</span>
                  <span className="text-[10px] opacity-60 leading-tight text-center px-2 whitespace-pre-line">
                    {r.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full bg-white rounded-xl shadow-2xl p-7 mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-700">Adresse e-mail</label>
              <input
                type="email"
                id="email"
                placeholder="exemple@dxc.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#3b0b8c] focus:border-[#3b0b8c] transition-all placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-700">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="????????"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#3b0b8c] focus:ring-[#3b0b8c]" />
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-[11px] text-[#3b0b8c] font-semibold hover:underline">Mot de passe oublie ?</a>
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            ) : null}

            <button
              id="login-submit"
              type="submit"
              className="w-full bg-[#3b0b8c] hover:bg-[#2c086e] text-white font-medium py-3 rounded-md transition-colors text-sm mt-3 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Connexion...' : `Se connecter en tant que ${selected.label}`}
            </button>
          </form>
        </div>

        <div className="text-center text-[10px] text-gray-400 font-light">
          ? 2026 DXC Technology. Tous droits reserves.
        </div>
      </div>
    </div>
  );
}
