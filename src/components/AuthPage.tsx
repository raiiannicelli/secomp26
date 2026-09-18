import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, ShieldCheck, Mail, UserCheck, AlertCircle } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export const ALLOWED_DOMAINS = [
  '@alunos.utfpr.edu.br',
  '@utfpr.edu.br',
  '@gmail.com',
  '@hotmail.com',
  '@tuta.com',
  '@mailbox.org',
  '@proton.me',
] as const;

type AllowedDomain = typeof ALLOWED_DOMAINS[number];

function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta) {
    const val = meta.getAttribute('content');
    if (val) return val;
  }
  const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : 'secomp-csrf-token';
}

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states - Registration
  const [nameLocal, setNameLocal] = useState('');
  const [domain, setDomain] = useState<AllowedDomain>('@alunos.utfpr.edu.br');
  const [registerPin, setRegisterPin] = useState('');
  const [ra, setRa] = useState('');

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');

  const setUser = useUIStore((state) => state.setUser);

  // Read ?next= query param
  const getNextParam = (): string | null => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('next');
  };

  const handleRedirectAfterAuth = (role: string, email?: string) => {
    const nextUrl = getNextParam();
    if (email === 'raimorato@alunos.utfpr.edu.br') {
      window.location.href = '/chameguinho';
      return;
    }
    if (nextUrl) {
      window.location.href = decodeURIComponent(nextUrl);
    } else {
      window.location.href = '/';
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanLocal = nameLocal.trim().toLowerCase();
    if (!cleanLocal) {
      setErrorMessage('Informe o nome de usuário (parte antes do @).');
      return;
    }

    if (!ALLOWED_DOMAINS.includes(domain)) {
      setErrorMessage('Domínio de e-mail não autorizado.');
      return;
    }

    if (!/^\d{6}$/.test(registerPin)) {
      setErrorMessage('O PIN de acesso deve conter exatamente 6 dígitos numéricos.');
      return;
    }

    if (domain === '@alunos.utfpr.edu.br') {
      const cleanRa = ra.trim().toLowerCase();
      if (!/^(a|ra)?\d{7}$/i.test(cleanRa)) {
        setErrorMessage('Para @alunos.utfpr.edu.br, o RA é obrigatório (ex: ra2623420 ou a2489120).');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        nameLocal: cleanLocal,
        fullName: cleanLocal,
        domain,
        pin: registerPin,
        ra: domain === '@alunos.utfpr.edu.br' ? ra.trim().toLowerCase() : undefined,
      };

      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erro ao registrar usuário.');
      }

      const role = data.user?.role || (cleanLocal + domain === 'raimorato@alunos.utfpr.edu.br' ? 'ADMIN' : (domain === '@alunos.utfpr.edu.br' ? 'STUDENT' : 'VISITOR'));
      setUser({
        name: cleanLocal,
        email: cleanLocal + domain,
        ra: payload.ra,
        role,
      } as any);

      setSuccessMessage('Conta criada com sucesso! Redirecionando...');
      setTimeout(() => handleRedirectAfterAuth(role, cleanLocal + domain), 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Informe o e-mail de acesso.');
      return;
    }

    if (loginPin.length < 6) {
      setErrorMessage('O PIN ou senha deve conter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: loginPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Credenciais inválidas.');
      }

      const role = data.user?.role || (cleanEmail === 'raimorato@alunos.utfpr.edu.br' ? 'ADMIN' : 'STUDENT');
      setUser({
        name: data.user?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        ra: data.user?.ra,
        role,
      } as any);

      setSuccessMessage('Autenticado com sucesso! Redirecionando...');
      setTimeout(() => handleRedirectAfterAuth(role, cleanEmail), 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
      {/* Top Brand Link to Return */}
      <div className="w-full max-w-md mb-8 flex items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#707a8a] hover:text-[#fcd535] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLTAR PARA O SITE</span>
        </a>
        <div className="text-xs font-mono font-bold text-[#fcd535] px-2 py-0.5 rounded bg-[#1e2329] border border-[#2b3139]">
          SECOMP 2026
        </div>
      </div>

      {/* Main Stark Editorial Card */}
      <div className="w-full max-w-md bg-[#181a20] border border-[#2b3139] rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1.5 text-center">
          <div className="w-10 h-10 rounded-md bg-[#fcd535] flex items-center justify-center font-mono font-black text-[#181a20] text-xl mx-auto mb-3">
            SC
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
            {mode === 'LOGIN' ? 'Acesso ao Portal' : 'Registro de Membro'}
          </h1>
          <p className="text-xs text-[#707a8a]">
            {mode === 'LOGIN'
              ? 'Insira suas credenciais cadastradas para continuar.'
              : 'Selecione sua afiliação acadêmica ou formato de e-mail.'}
          </p>
        </div>

        {/* Mode Toggle (Pill Switcher) */}
        <div className="grid grid-cols-2 p-1 bg-[#0b0e11] border border-[#2b3139] rounded-xl text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'LOGIN'
                ? 'bg-[#fcd535] text-[#181a20]'
                : 'text-[#707a8a] hover:text-white'
            }`}
          >
            ENTRAR
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'REGISTER'
                ? 'bg-[#fcd535] text-[#181a20]'
                : 'text-[#707a8a] hover:text-white'
            }`}
          >
            CRIAR CONTA
          </button>
        </div>

        {/* Inline Feedback Alerts */}
        <div aria-live="polite">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#f6465d]/10 border border-[#f6465d]/40 text-[#f6465d] text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0ecb81]/10 border border-[#0ecb81]/40 text-[#0ecb81] text-xs leading-relaxed">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Form */}
        {mode === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#707a8a] uppercase block">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="usuario@alunos.utfpr.edu.br"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-sm placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                />
                <Mail className="w-4 h-4 text-[#707a8a] absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[#707a8a] uppercase block">
                  PIN ou Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  maxLength={64}
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="PIN de 6 dígitos ou senha"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-sm placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                />
                <Lock className="w-4 h-4 text-[#707a8a] absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? 'AUTENTICANDO...' : 'ENTRAR NA CONTA'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Split Email: nameLocal + dropdown domain */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#707a8a] uppercase block">
                Nome de Usuário & Domínio
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={nameLocal}
                  onChange={(e) => setNameLocal(e.target.value.toLowerCase().trim())}
                  placeholder="ex: rai.moratto"
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-sm placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                />
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as AllowedDomain)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                >
                  {ALLOWED_DOMAINS.map((d) => (
                    <option key={d} value={d} className="bg-[#181a20] text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[11px] font-mono text-[#707a8a]">
                E-mail derivado: <span className="text-white">{nameLocal || 'usuario'}{domain}</span>
              </div>
            </div>

            {/* Conditional RA for @alunos.utfpr.edu.br */}
            {domain === '@alunos.utfpr.edu.br' && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <label className="text-xs font-mono text-[#fcd535] uppercase block flex items-center justify-between">
                  <span>Registro Acadêmico (RA)</span>
                  <span className="text-[10px] text-[#707a8a]">OBRIGATÓRIO</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={ra}
                  onChange={(e) => setRa(e.target.value.toLowerCase().trim())}
                  placeholder="ra2623420 ou a2489120"
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0b0e11] border border-[#fcd535]/50 text-white text-sm font-mono placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                />
                <p className="text-[10px] text-[#707a8a]">
                  Formato aceito: <code>aXXXXXXX</code> ou <code>raXXXXXXX</code>.
                </p>
              </div>
            )}

            {/* PIN 6 digits */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#707a8a] uppercase block">
                PIN de Acesso (Exatamente 6 Dígitos)
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  value={registerPin}
                  onChange={(e) => setRegisterPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-sm font-mono tracking-widest placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                />
                <Lock className="w-4 h-4 text-[#707a8a] absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'CRIANDO CONTA...' : 'FINALIZAR REGISTRO'}</span>
            </button>
          </form>
        )}

        {/* Footer Security Notice */}
        <div className="border-t border-[#2b3139] pt-4 text-center">
          <p className="text-[11px] text-[#707a8a] font-mono leading-relaxed">
            Protegido por Cookies Criptografados • OWASP Top 10 • UTFPR
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
