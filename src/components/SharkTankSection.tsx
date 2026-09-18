import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
} from 'framer-motion';
import {
  Trophy,
  Vote,
  CheckCircle2,
  Award,
  Star,
  ChevronDown,
} from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

interface Pitch {
  id: string;
  title: string;
  founders: string;
  incubator: string;
  summary: string;
  votes: number;
  highlightBadge: string;
}

interface PitchCardProps {
  pitch: Pitch;
  totalVotes: number;
  isMyVote: boolean;
  hasVoted: boolean;
  onVote: (id: string) => void;
}

const PitchCard: React.FC<PitchCardProps> = ({
  pitch,
  totalVotes,
  isMyVote,
  hasVoted,
  onVote,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardMouseX = useMotionValue(-1000);
  const cardMouseY = useMotionValue(-1000);

  const handleCardMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    cardMouseX.set(clientX - left);
    cardMouseY.set(clientY - top);
  };

  const handleCardMouseLeave = () => {
    cardMouseX.set(-1000);
    cardMouseY.set(-1000);
  };

  const handleCardTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      cardMouseX.set(e.touches[0].clientX - left);
      cardMouseY.set(e.touches[0].clientY - top);
    }
  };

  const handleCardTouchEnd = () => {
    cardMouseX.set(-1000);
    cardMouseY.set(-1000);
  };

  const currentVotes = pitch.votes + (isMyVote ? 1 : 0);
  const percentage = Math.round((currentVotes / totalVotes) * 100);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      onTouchMove={handleCardTouchMove}
      onTouchStart={handleCardTouchMove}
      onTouchEnd={handleCardTouchEnd}
      className={`relative group/pitch rounded-xl bg-[#1e2329]/90 border p-5 flex flex-col justify-between transition-all duration-300 overflow-hidden ${isMyVote
        ? 'border-[#fcd535]'
        : 'border-[#2b3139] hover:border-[#fcd535]/50'
        }`}
    >
      {/* Feixe de luz no ponteiro do mouse no card individual */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover/pitch:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              280px circle at ${cardMouseX}px ${cardMouseY}px,
              rgba(252, 213, 53, 0.14),
              transparent 80%
            )
          `,
        }}
      />
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover/pitch:opacity-100 border border-[#fcd535]/60"
        style={{
          maskImage: useMotionTemplate`
            radial-gradient(
              160px circle at ${cardMouseX}px ${cardMouseY}px,
              black,
              transparent 80%
            )
          `,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              160px circle at ${cardMouseX}px ${cardMouseY}px,
              black,
              transparent 80%
            )
          `,
        }}
      />

      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded bg-[#0b0e11] border border-[#2b3139] text-[11px] font-mono text-[#fcd535]">
            {pitch.highlightBadge}
          </span>
          <span className="text-[11px] text-[#0ecb81] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {pitch.incubator}
          </span>
        </div>

        <div>
          <h4 className="text-base font-bold text-white group-hover/pitch:text-[#fcd535] transition-colors">
            {pitch.title}
          </h4>
          <p className="text-[11px] text-[#707a8a] mt-0.5">
            Fundadores: <strong className="text-[#eaecef]">{pitch.founders}</strong>
          </p>
        </div>

        <p className="text-xs text-[#929aa5] leading-relaxed">
          {pitch.summary}
        </p>

        {/* Barra de Progresso em Tempo Real */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#707a8a]">Preferência do Público:</span>
            <span className="font-bold text-[#fcd535]">
              {percentage}% ({currentVotes} votos)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#0b0e11] overflow-hidden border border-[#2b3139]">
            <div
              className="h-full bg-gradient-to-r from-[#fcd535] to-[#0ecb81] transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#2b3139]/80 mt-4 flex items-center justify-between relative z-10">
        <div className="text-[10px] text-[#707a8a] font-mono">
          Banca: <span className="text-[#eaecef]">Sprint • Sebrae</span>
        </div>

        <button
          type="button"
          onClick={() => onVote(pitch.id)}
          disabled={hasVoted}
          className={`px-3.5 py-1.5 rounded-md font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${isMyVote
            ? 'bg-[#0ecb81] text-[#181a20] font-bold cursor-default'
            : hasVoted
              ? 'bg-[#2b3139] text-[#707a8a] cursor-not-allowed opacity-60'
              : 'bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold active:scale-95'
            }`}
        >
          <Vote className="w-3.5 h-3.5" />
          <span>
            {isMyVote ? 'Voto Registrado' : hasVoted ? 'Voto Computado' : 'Votar no Pitch'}
          </span>
        </button>
      </div>
    </div>
  );
};

export const SharkTankSection: React.FC = () => {
  const {
    votedPitchId,
    castSharkVote,
    addStamp,
    isSharkModalOpen,
  } = useUIStore();

  const [isExpanded, setIsExpanded] = useState(false);

  // Motion values para o feixe de luz que acompanha o ponteiro no card
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const handleMouseLeave = () => {
    mouseX.set(-1000);
    mouseY.set(-1000);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.touches[0].clientX - left);
      mouseY.set(e.touches[0].clientY - top);
    }
  };

  const handleTouchEnd = () => {
    mouseX.set(-1000);
    mouseY.set(-1000);
  };

  // Máscara dinâmica: texto transparente fora do feixe e revelado sob a luz
  const textFlashlightMask = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, black 0%, black 60%, transparent 100%)`;

  const [pitches, setPitches] = useState<Pitch[]>([
    {
      id: 'p-1',
      title: 'InovaTech Agro — Drones com Visão Computacional',
      founders: 'Carlos Andrade (Eng. Computação), Beatriz Lima (Agronomia)',
      incubator: 'Incubada Sprint',
      summary: 'Visão computacional embarcada em drones para detecção de pragas em tempo real.',
      votes: 42,
      highlightBadge: 'Agritech & IA',
    },
    {
      id: 'p-2',
      title: 'CyberShield Zero — Defesa Biométrica',
      founders: 'Lucas Ferreira, Tiago Rocha (Eng. de Software)',
      incubator: 'Pré-Incubação Sprint',
      summary: 'Proteção biométrica comportamental contínua para aplicativos bancários.',
      votes: 38,
      highlightBadge: 'CyberSec & FinTech',
    },
    {
      id: 'p-3',
      title: 'LearnLoop AI — Tutor Adaptativo de Código',
      founders: 'Mariana Costa, Rodrigo Gomes (Ciência da Computação)',
      incubator: 'Pesquisa Aplicada',
      summary: 'Tutor de programação adaptativo gerado por IA para cursos de exatas.',
      votes: 55,
      highlightBadge: 'EdTech & IA',
    },
    {
      id: 'p-4',
      title: 'EcoTrack IoT — Telemetria Hídrica Urbana',
      founders: 'Felipe Neves, Amanda Souza (Eng. Eletrônica)',
      incubator: 'Startup Universitária',
      summary: 'Rede LoRaWAN de sensores autônomos para telemetria hídrica em bacias urbanas.',
      votes: 29,
      highlightBadge: 'Hardware & IoT',
    },
  ]);

  // Carrega Pitches reais do banco PostgreSQL
  useEffect(() => {
    fetch('/api/v1/shark-tank/pitches')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.pitches && Array.isArray(data.pitches) && data.pitches.length > 0) {
          setPitches(
            data.pitches.map((p: any) => ({
              id: p.id,
              title: p.startupName,
              founders: p.teamMembers || 'Equipe Universitária UTFPR',
              incubator: 'Incubadora Sprint',
              summary: p.oneLiner,
              votes: p.voteCount,
              highlightBadge: 'Startup Finalista',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const IS_SESSION_LIVE = false;

  // Se a abertura externa for solicitada, rola suavemente até o card
  useEffect(() => {
    if (isSharkModalOpen) {
      if (IS_SESSION_LIVE) setIsExpanded(true);
      const el = document.getElementById('shark-tank');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isSharkModalOpen]);

  const totalVotes = pitches.reduce((acc, p) => acc + p.votes, 0) + (votedPitchId ? 1 : 0);

  const handleVote = async (id: string) => {
    if (votedPitchId) return;
    castSharkVote(id);
    addStamp(5);

    try {
      let fp = localStorage.getItem('secomp_fp');
      if (!fp) {
        fp = 'fp_' + Math.random().toString(36).substring(2, 12);
        localStorage.setItem('secomp_fp', fp);
      }
      await fetch('/api/v1/shark-tank/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchId: id,
          clientFingerprint: fp,
        }),
      });
    } catch {}
  };

  return (
    <section
      id="shark-tank"
      className="py-8 bg-[#0b0e11] relative overflow-hidden w-full"
    >
      <div className="w-full">
        {/* Card Shark Tank com bordas infinitas na lateral, feixe de luz revelando mensagem oculta */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative group w-full bg-gradient-to-r from-transparent via-[#14181d] to-transparent py-8 px-4 sm:px-8 space-y-4 overflow-hidden"
        >
          {/* Linhas Laser Horizontais com bordas infinitas nas laterais */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#2b3139]/80 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#2b3139]/80 to-transparent pointer-events-none" />

          {/* Feixe de Luz que acompanha o ponteiro no card */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  380px circle at ${mouseX}px ${mouseY}px,
                  rgba(252, 213, 53, 0.16),
                  rgba(252, 213, 53, 0.03) 50%,
                  transparent 80%
                )
              `,
            }}
          />

          {/* Mensagem oculta revelada pelo feixe de luz */}
          <motion.div
            style={{
              maskImage: textFlashlightMask,
              WebkitMaskImage: textFlashlightMask,
            }}
            className="max-w-4xl mx-auto space-y-2 relative z-10 select-none"
          >
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>SHARK UTFPR</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#eaecef] max-w-2xl leading-relaxed">
              Batalha de pitches ao vivo com banca de investidores no auditório principal.
              <br />
              <span className="font-mono block sm:inline mt-1 sm:mt-0 sm:ml-1 text-[#fcd535]">
                Vote, ganhe carimbos e ajude a escolher o vencedor da plateia!
              </span>
            </p>
          </motion.div>

          {/* Painel Expansível (quando o dossiê for liberado ao vivo) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto overflow-hidden space-y-6 pt-6 border-t border-[#2b3139]/80 relative z-10"
              >
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-[#0b0e11]/90 border border-[#2b3139] font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0ecb81]" />
                    <span className="text-[#0ecb81] font-bold">VOTAÇÃO AO VIVO</span>
                    <span className="text-[#707a8a] hidden sm:inline">• SEXTA 13 NOV 19H</span>
                  </div>
                  <div className="text-[#fcd535] font-bold">
                    TOTAL: {totalVotes} VOTOS
                  </div>
                </div>

                {/* Grid dos Pitches */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pitches.map((p) => (
                    <PitchCard
                      key={p.id}
                      pitch={p}
                      totalVotes={totalVotes}
                      isMyVote={votedPitchId === p.id}
                      hasVoted={votedPitchId !== null}
                      onVote={handleVote}
                    />
                  ))}
                </div>

                {/* Footer da Banca */}
                <div className="p-4 rounded-xl bg-[#0b0e11]/80 border border-[#2b3139] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#929aa5]">
                    <Star className="w-4 h-4 text-[#fcd535] shrink-0" />
                    <span>Banca oficial composta por investidores parceiros.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default SharkTankSection;
