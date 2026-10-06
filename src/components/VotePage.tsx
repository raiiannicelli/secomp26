import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useUIStore, isUserAuthenticated } from '../stores/useUIStore';

export const VotePage: React.FC = () => {
  const { ideathonTeams, castSharkVote, castIdeathonTeamVote, addStamp, user } = useUIStore();
  const authenticated = isUserAuthenticated(user);

  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lê parametro `pitch` da URL caso tenha vindo via QR Code específico
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pitchParam = params.get('pitch');
    if (pitchParam) {
      setSelectedPitchId(pitchParam);
    }
  }, []);

  const activePitches = (ideathonTeams || []).filter(
    (t) => t.status === 'APROVADO' || t.status === 'FINALISTA'
  );

  const handleVoteSubmit = async () => {
    if (!selectedPitchId) return;

    if (!authenticated) {
      window.location.href = `/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const userEmail = user?.email || 'guest';
      const fp = 'fp_' + userEmail.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Math.random().toString(36).substring(2, 8);

      const res = await fetch('/api/v1/shark-tank/vote', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchId: selectedPitchId,
          clientFingerprint: fp,
        }),
      });

      if (res.ok) {
        castSharkVote(selectedPitchId);
        castIdeathonTeamVote(selectedPitchId);
        addStamp(5);
        setVoted(true);
      } else {
        const errData = await res.json();
        if (errData.error === 'ALREADY_VOTED') {
          setErrorMsg('Você já possui um voto computado neste evento!');
          setVoted(true);
        } else {
          setErrorMsg(errData.message || 'Falha ao registrar voto.');
        }
      }
    } catch {
      setErrorMsg('Erro de conexão ao enviar voto.');
    } finally {
      setSubmitting(false);
    }
  };

  if (voted) {
    return (
      <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] p-6 flex flex-col items-center justify-center text-center font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#181a20] border border-[#2b3139] space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#0ecb81]/10 border border-[#0ecb81]/30 flex items-center justify-center text-[#0ecb81]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Voto Registrado com Sucesso!
            </h1>
            <p className="text-xs text-[#929aa5] mt-2 font-mono">
              Seu voto foi computado no banco de dados e adicionado ao placar do telão em tempo real.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b0e11] border border-[#2b3139] text-xs font-mono text-[#fcd535] flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>+1 Carimbo Concedido no Passaporte SECOMP</span>
          </div>

          <a
            href="/"
            className="w-full py-3.5 rounded-xl bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>VOLTAR AO PORTAL PRINCIPAL</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] p-6 font-sans flex flex-col items-center justify-center">
      <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-[#181a20] border border-[#2b3139] space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <span className="bg-[#fcd535]/10 border border-[#fcd535]/30 text-[#fcd535] text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase">
            VOTAÇÃO PRESENCIAL VIA QR CODE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Escolha seu Pitch Favorito
          </h1>
          <p className="text-xs font-mono text-[#929aa5]">
            Shark Tank UTFPR • SECOMP 2026
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-[#f6465d]/10 border border-[#f6465d]/30 text-[#f6465d] text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          {activePitches.map((pitch) => {
            const isSelected = selectedPitchId === pitch.id;
            return (
              <div
                key={pitch.id}
                onClick={() => setSelectedPitchId(pitch.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#0b0e11] border-[#fcd535] shadow-lg shadow-[#fcd535]/10'
                    : 'bg-[#0b0e11] border-[#2b3139] hover:border-[#474d57]'
                }`}
              >
                <div>
                  <h3 className="font-bold text-white text-base">{pitch.teamName}</h3>
                  <p className="text-xs text-[#929aa5]">{pitch.proposal}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-[#fcd535] bg-[#fcd535]' : 'border-[#474d57]'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#181a20]" />}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleVoteSubmit}
          disabled={!selectedPitchId || submitting}
          className="w-full py-4 rounded-2xl bg-[#fcd535] hover:bg-[#f0b90b] disabled:opacity-40 text-[#181a20] font-mono font-extrabold text-sm uppercase transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? 'PROCESSANDO VOTO...' : 'CONFIRMAR VOTO NO PALCO'}
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#707a8a]">
          <ShieldCheck className="w-4 h-4 text-[#0ecb81]" />
          <span>Voto protegido e auditado anti-duplicação por conta</span>
        </div>
      </div>
    </div>
  );
};
