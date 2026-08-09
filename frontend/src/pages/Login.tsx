import { useState, type FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Eye, EyeOff, LogIn, Shield, Settings, Users, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type LoginCredentials, type UserRole } from '../lib/auth';

const demoAccounts: {
  id: UserRole;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  email: string;
  password: string;
  accent: string;
}[] = [
  {
    id: 'client',
    label: 'Client',
    sublabel: 'eddadd361@gmail.com / client123',
    icon: Users,
    email: 'eddadd361@gmail.com',
    password: 'client123',
    accent: 'from-sky-500/20 to-cyan-400/10',
  },
  {
    id: 'manager',
    label: 'Incident Manager',
    sublabel: 'aymanemwa@gmail.com / manager123',
    icon: Shield,
    email: 'aymanemwa@gmail.com',
    password: 'manager123',
    accent: 'from-emerald-500/20 to-lime-400/10',
  },
  {
    id: 'admin',
    label: 'Administrateur',
    sublabel: 'admin_xd@dxc.com / admin123',
    icon: Settings,
    email: 'admin_xd@dxc.com',
    password: 'admin123',
    accent: 'from-amber-500/20 to-orange-400/10',
  },
  {
    id: 'rt',
    label: 'Responsable traitement',
    sublabel: 'amina.elidrissi@dxc.com / rt123',
    icon: Wrench,
    email: 'amina.elidrissi@dxc.com',
    password: 'rt123',
    accent: 'from-violet-500/20 to-fuchsia-400/10',
  },
];

function homeRoute(role: UserRole): string {
  switch (role) {
    case 'client':
      return '/client/home';
    case 'manager':
      return '/manager/home';
    case 'admin':
      return '/admin';
    case 'rt':
      return '/rt/home';
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login({ email, password });
      navigate(homeRoute(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de se connecter.');
    } finally {
      setLoading(false);
    }
  }

  function applyDemoAccount(account: LoginCredentials) {
    setEmail(account.email);
    setPassword(account.password);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(88,28,135,0.35),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.2),_transparent_30%),linear-gradient(135deg,_#070816,_#111827_55%,_#1f1147)] px-6 py-10 text-white">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 backdrop-blur">
              DXC Technology
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Connectez-vous pour piloter le flux d&apos;incidents.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 md:text-base">
              L&apos;authentification utilise maintenant le backend JWT. Choisissez un compte de démonstration ou saisissez vos identifiants réels.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {demoAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => applyDemoAccount(account)}
                  className={`group rounded-3xl border border-white/10 bg-gradient-to-br ${account.accent} p-4 text-left shadow-2xl shadow-black/20 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/20`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Compte démo</p>
                      <h2 className="mt-2 text-lg font-bold text-white">{account.label}</h2>
                      <p className="mt-1 text-xs text-white/70">{account.sublabel}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3 text-white/90 transition group-hover:bg-white/15">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Accès sécurisé</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Connexion</h2>
            <p className="mt-2 text-sm text-white/65">Utilisez votre adresse e-mail et votre mot de passe.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="exemple@dxc.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cyan-300 focus:outline-none"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/35 focus:border-cyan-300 focus:outline-none"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-white/50 transition hover:text-white"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-xs leading-6 text-white/60">
            Comptes de démonstration disponibles avec les mots de passe affichés à gauche. La session est conservée localement jusqu&apos;à la déconnexion.
          </div>
        </section>
      </div>
    </div>
  );
}


