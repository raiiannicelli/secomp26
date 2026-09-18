import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Clock, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

type ValidationStatus = 'LOADING' | 'SUCCESS' | 'ALREADY_STAMPED' | 'EXPIRED' | 'ERROR';

export const ValidatePage: React.FC = () => {
  const [status, setStatus] = useState<ValidationStatus>('LOADING');
  const [message, setMessage] = useState<string>('Validando credenciais e integridade do token...');
  const [tokenCode, setTokenCode] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutos em segundos

  const { user, validateOneTimeToken, setActiveTab } = useUIStore();

  useEffect(() => {
    // 1. Timer decrescente de 15 minutos
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && status === 'LOADING') {
      setStatus('EXPIRED');
      setMessage('O tempo limite de validação deste token (15 minutos) expirou.');
    }
  }, [timeLeft, status]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const rawToken = params.get('t') || params.get('token');
    const signature = params.get('sig');

    if (!rawToken) {
      setStatus('ERROR');
      setMessage('Nenhum código de carimbo fornecido na URL.');
      return;
    }

    const token = rawToken.toUpperCase().trim();
    setTokenCode(token);

    // 2. Verificar se o participante está autenticado
    // Se não tiver nome cadastrado ou sessão, redireciona para /auth com ?next=
    if (!user || !user.name || user.name === '') {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `/auth?next=${currentUrl}`;
      return;
    }

    // 3. Executar validação no backend PostgreSQL e sincronizar store local
    const validateTokenOnline = async () => {
      try {
        const backendRes = await fetch('/api/v1/passport/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (backendRes.ok) {
          const data = await backendRes.json();
          validateOneTimeToken(token);
          setStatus('SUCCESS');
          setMessage(data.message || 'Presença confirmada e carimbo registrado com sucesso!');
          return;
        } else {
          const errData = await backendRes.json();
          if (errData.error === 'ALREADY_STAMPED' || errData.message?.includes('já foi')) {
            setStatus('ALREADY_STAMPED');
            setMessage(errData.message || 'Você já recebeu o carimbo desta atividade.');
            return;
          }
        }
      } catch {}

      // Validação local
      const res = validateOneTimeToken(token);
      if (res.success) {
        setStatus('SUCCESS');
        setMessage(res.message);
      } else if (res.message.includes('já foi utilizado')) {
        setStatus('ALREADY_STAMPED');
        setMessage(res.message);
      } else {
        setStatus('ERROR');
        setMessage(res.message);
      }
    };

    validateTokenOnline();
  }, [user, validateOneTimeToken]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleGoToPassport = () => {
    setActiveTab('PASSAPORTE');
    window.location.href = '/#passaporte';
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-[#181a20] border border-[#2b3139] rounded-2xl p-6 sm:p-8 space-y-6 text-center">
        {/* Top Mini Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b0e11] border border-[#2b3139] text-xs font-mono text-[#fcd535]">
          <Clock className="w-3.5 h-3.5" />
          <span>LINK ATIVO: {formatTime(timeLeft)}</span>
        </div>

        {/* Status Icon & Main Title */}
        {status === 'LOADING' && (
          <div className="space-y-4 py-6">
            <div className="w-16 h-16 rounded-full border-2 border-[#fcd535] border-t-transparent animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Validando Presença...</h2>
            <p className="text-xs text-[#707a8a]">{message}</p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="space-y-4 py-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#0ecb81]/15 border border-[#0ecb81] flex items-center justify-center text-[#0ecb81] mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                Presença Confirmada!
              </h2>
              <div className="font-mono text-sm text-[#fcd535] font-bold">
                {tokenCode}
              </div>
            </div>
            <p className="text-xs text-[#eaecef] leading-relaxed max-w-xs mx-auto">
              {message}
            </p>
            <button
              onClick={handleGoToPassport}
              className="w-full py-3 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <span>VER MEU PASSAPORTE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'ALREADY_STAMPED' && (
          <div className="space-y-4 py-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#f0b90b]/15 border border-[#f0b90b] flex items-center justify-center text-[#f0b90b] mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white tracking-tight uppercase">
                Carimbo Já Registrado
              </h2>
              <div className="font-mono text-xs text-[#707a8a]">{tokenCode}</div>
            </div>
            <p className="text-xs text-[#929aa5] leading-relaxed max-w-xs mx-auto">
              Você já recebeu o carimbo desta atividade no seu passaporte.
            </p>
            <button
              onClick={handleGoToPassport}
              className="w-full py-3 rounded-lg bg-[#2b3139] hover:bg-[#3a414b] text-white font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <span>IR PARA O PASSAPORTE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'EXPIRED' && (
          <div className="space-y-4 py-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#f6465d]/15 border border-[#f6465d] flex items-center justify-center text-[#f6465d] mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">
              Token Expirado
            </h2>
            <p className="text-xs text-[#929aa5] leading-relaxed max-w-xs mx-auto">
              Este link rápido de 15 minutos perdeu a validade. Peça ao staff ou palestrante um novo QR Code ao vivo.
            </p>
            <a
              href="/"
              className="block w-full py-3 rounded-lg bg-[#2b3139] hover:bg-[#3a414b] text-white font-bold text-xs tracking-wider uppercase transition-colors text-center"
            >
              Voltar ao Início
            </a>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="space-y-4 py-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#f6465d]/15 border border-[#f6465d] flex items-center justify-center text-[#f6465d] mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">
              Falha na Validação
            </h2>
            <p className="text-xs text-[#f6465d] leading-relaxed max-w-xs mx-auto">
              {message}
            </p>
            <a
              href="/"
              className="block w-full py-3 rounded-lg bg-[#2b3139] hover:bg-[#3a414b] text-white font-bold text-xs tracking-wider uppercase transition-colors text-center"
            >
              Voltar ao Início
            </a>
          </div>
        )}

        {/* Footer Note */}
        <div className="border-t border-[#2b3139] pt-4 text-center">
          <p className="text-[11px] text-[#707a8a] font-mono">
            SECOMP 2026 • Sistema de Presença Criptográfico
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValidatePage;
