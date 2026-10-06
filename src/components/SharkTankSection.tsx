import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Vote, CheckCircle2, Award, Trophy, Sparkles } from 'lucide-react';
import { useUIStore, isUserAuthenticated } from '../stores/useUIStore';

export interface SharkTankPitch {
  id: string;
  title: string;
  founders: string;
  incubator: string;
  summary: string;
  votes: number;
  highlightBadge: string;
  status: 'PENDENTE' | 'APROVADO' | 'FINALISTA' | 'REJEITADO';
  votingOpen: boolean;
}

interface PitchCardProps {
  pitch: SharkTankPitch;
  totalVotes: number;
  isMyVote: boolean;
  hasVoted: boolean;
  isGlobalVotingActive: boolean;
  onVote: (id: string) => void;
}

const PitchCard: React.FC<PitchCardProps> = ({
  pitch,
  totalVotes,
  isMyVote,
  hasVoted,
  isGlobalVotingActive,
  onVote,
}) => {
  const currentVotes = pitch.votes;
  const percentage = totalVotes > 0 ? Math.round((currentVotes / totalVotes) * 100) : 0;
  const canVote = isGlobalVotingActive && pitch.votingOpen && !hasVoted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl bg-[#14181d] border p-6 flex flex-col justify-between transition-all duration-300 ${
        isMyVote
          ? 'border-[#0ecb81] shadow-[0_0_25px_rgba(14,203,129,0.15)]'
          : pitch.status === 'FINALISTA'
          ? 'border-[#fcd535]/50 shadow-[0_0_20px_rgba(252,213,53,0.1)]'
          : 'border-[#2b3139] hover:border-[#474d57]'
      }`}
    >
      <div className="space-y-4">
        {/* Badges de Trilha e Status do Ideathon */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded bg-[#0b0e11] text-[11px] font-mono text-[#fcd535] border border-[#fcd535]/20 font-bold">
            {pitch.highlightBadge}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 ${
              pitch.status === 'FINALISTA'
                ? 'bg-[#fcd535]/15 border border-[#fcd535] text-[#fcd535]'
                : 'bg-[#0ecb81]/15 border border-[#0ecb81] text-[#0ecb81]'
            }`}
          >
            <Trophy className="w-3 h-3" />
            {pitch.status === 'FINALISTA' ? 'TIME FINALISTA' : 'PROJETO APROVADO'}
          </span>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white tracking-tight">
            {pitch.title}
          </h4>
          <p className="text-xs text-[#707a8a] mt-1">
            Fundadores: <strong className="text-[#eaecef] font-medium">{pitch.founders}</strong>
          </p>
        </div>

        <p className="text-xs text-[#929aa5] leading-relaxed">
          {pitch.summary}
        </p>

        {/* Barra de Apuração e Preferência do Público */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#707a8a]">Preferência da Plateia:</span>
            <span className="font-bold text-[#fcd535]">
              {percentage}% ({currentVotes} votos)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#0b0e11] overflow-hidden border border-[#2b3139]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#fcd535] to-[#0ecb81] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Rodapé e Botão de Votação */}
      <div className="pt-4 border-t border-[#2b3139] mt-5 flex items-center justify-between">
        <div className="text-[11px] text-[#707a8a] font-mono flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0ecb81]" />
          <span>Banca: <strong className="text-[#eaecef]">Sprint Incubadora</strong></span>
        </div>

        <button
          type="button"
          onClick={() => onVote(pitch.id)}
          disabled={!canVote && !isMyVote}
          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-2 ${
            isMyVote
              ? 'bg-[#0ecb81] text-[#0b0e11] font-bold cursor-default shadow-md'
              : hasVoted
              ? 'bg-[#2b3139] text-[#707a8a] cursor-not-allowed opacity-60'
              : !pitch.votingOpen || !isGlobalVotingActive
              ? 'bg-[#2b3139] border border-[#474d57] text-[#707a8a] cursor-not-allowed'
              : 'bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold active:scale-95 shadow-md'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>
            {isMyVote
              ? 'Voto Registrado'
              : hasVoted
              ? 'Voto Computado'
              : !pitch.votingOpen || !isGlobalVotingActive
              ? 'Votação Pausada'
              : 'Votar no Pitch'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export const SharkTankSection: React.FC = () => {
  const {
    ideathonTeams,
    castIdeathonTeamVote,
    votedPitchId,
    castSharkVote,
    addStamp,
    isSharkModalOpen,
    user,
    cmsContent,
  } = useUIStore();
  const authenticated = isUserAuthenticated(user);

  const sessionStatus = cmsContent?.session_status || {};
  const isSharkTankActive = sessionStatus.shark_tank_voting_active ?? true;

  // Sincronização em Tempo Real com as equipes do Ideathon cadastradas na store/admin
  const pitches: SharkTankPitch[] = (ideathonTeams || []).map((t) => ({
    id: t.id,
    title: t.teamName,
    founders: `${t.leaderName} (${t.members})`,
    incubator: 'Sprint Incubadora',
    summary: t.proposal,
    votes: t.votesCount ?? 0,
    highlightBadge: t.track || 'Inovação & Tech',
    status: t.status,
    votingOpen: t.votingOpen ?? true,
  }));

  // Rola suavemente até o container se o modal for chamado via CTA global
  useEffect(() => {
    if (isSharkModalOpen) {
      const el = document.getElementById('shark-tank');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isSharkModalOpen]);

  // Consulta no banco se o usuário logado já possui voto registrado
  useEffect(() => {
    if (!authenticated || !user?.id) return;
    fetch('/api/v1/shark-tank/my-vote', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.voted) {
          // Se o usuário já votou no banco, define no estado
          castSharkVote(data.pitchId || 'voted');
        }
      })
      .catch(() => {});
  }, [authenticated, user?.id]);

  const activePitches = pitches.filter((p) => p.status === 'APROVADO' || p.status === 'FINALISTA');
  const totalVotes = activePitches.reduce((acc, p) => acc + (p.votes || 0), 0);

  const handleVote = async (id: string) => {
    const targetPitch = pitches.find((p) => p.id === id);
    if (!targetPitch || !targetPitch.votingOpen || !isSharkTankActive) return;

    if (!authenticated) {
      window.location.href = '/auth?next=' + encodeURIComponent(window.location.pathname + '#shark-tank');
      return;
    }
    if (votedPitchId) return;
    castSharkVote(id);
    castIdeathonTeamVote(id);
    addStamp(5);

    try {
      const userEmail = user?.email || 'guest';
      const fp = 'fp_' + userEmail.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Math.random().toString(36).substring(2, 8);
      await fetch('/api/v1/shark-tank/vote', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchId: id,
          clientFingerprint: fp,
        }),
      });
    } catch {}
  };

  return (
    <section id="shark-tank" className="relative w-full py-16 bg-[#0b0e11] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">

        {/* ========================================================================= */}
        {/* HEADER NEUTRO MODELO AWARD SHOWCASE (CONSISTENTE COM SECOMP 2026)         */}
        {/* ========================================================================= */}
        <div className="relative w-full bg-[#14181d] border border-[#2b3139] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#2b3139] pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcd535]/10 border border-[#fcd535]/30 text-[#fcd535] text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>IDEATHON & SHARK TANK UTFPR • ARENA DE PITCHES</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Votação dos Pitches Finalistas</span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-[#fcd535] text-[#0b0e11] font-mono font-bold">
                  SECOMP 2026
                </span>
              </h3>

              <p className="text-sm text-[#eaecef] leading-relaxed">
                As equipes aprovadas no Ideathon apresentam suas soluções inovadoras diante da banca de investidores e mentores. Escolha o seu projeto favorito da noite para computar o seu voto e conceder o carimbo no passaporte!
              </p>
            </div>

            {/* Total de Votos Computados e Status Geral */}
            <div className="p-4 rounded-xl bg-[#0b0e11] border border-[#2b3139] flex flex-col items-start gap-1 shrink-0 font-mono text-xs">
              <div className="text-[#707a8a]">Status da Apuração:</div>
              {isSharkTankActive ? (
                <div className="text-[#0ecb81] font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0ecb81] animate-pulse" />
                  <span>VOTAÇÃO AO VIVO</span>
                </div>
              ) : (
                <div className="text-[#f6465d] font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f6465d]" />
                  <span>VOTAÇÃO BLOQUEADA</span>
                </div>
              )}
              <div className="text-[#fcd535] font-bold mt-1 text-sm">
                TOTAL: {totalVotes} VOTOS
              </div>
            </div>
          </div>

          {/* Regras e Informações da Banca */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#707a8a]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#fcd535] shrink-0" />
              <span>Banca Oficial: <strong className="text-[#eaecef]">Sprint Incubadora • Sebrae • Investidores Anjo</strong></span>
            </div>
            <div className="font-mono text-[#eaecef]">
              Regra: 1 Voto Por Participante (Proteção Anti-Fraude Ativa)
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GRID DOS TIMES PITCHES APROVADOS / FINALISTAS DO IDEATHON                  */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#2b3139] pb-3">
            <h4 className="text-base font-bold text-white uppercase font-mono tracking-tight">
              Projetos Apresentados em Palco ({pitches.filter((p) => p.status === 'APROVADO' || p.status === 'FINALISTA').length})
            </h4>
            <span className="text-xs font-mono text-[#707a8a]">
              Selecione o pitch para registrar o voto
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePitches.map((p) => (
              <PitchCard
                key={p.id}
                pitch={p}
                totalVotes={totalVotes}
                isMyVote={votedPitchId === p.id}
                hasVoted={votedPitchId !== null}
                isGlobalVotingActive={isSharkTankActive}
                onVote={handleVote}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default SharkTankSection;
