import React, { useState } from 'react';
import {
  Award,
  Check,
  Terminal,
  Coffee,
  KeyRound,
  Trophy,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

interface StampDefinition {
  id: number;
  label: string;
  category: string;
  points: number;
}

interface PassportSectionProps {
  isEmbedded?: boolean;
}

export const PassportSection: React.FC<PassportSectionProps> = ({ isEmbedded = false }) => {
  const {
    stampsCount,
    currentLevel,
    earnedStampIds,
    addStamp,
    validateOneTimeToken,
    user,
  } = useUIStore();

  const [tokenInput, setTokenInput] = useState('');
  const [tokenFeedback, setTokenFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const stamps: StampDefinition[] = [
    { id: 1, label: 'Keynote Abertura (IA & Tendências)', category: 'Palestra', points: 1 },
    { id: 2, label: 'Minicurso Pré-Evento (Laboratório)', category: 'Laboratório', points: 1 },
    { id: 3, label: 'Visita Estande Startup Day', category: 'Networking', points: 1 },
    { id: 4, label: 'Mentoria Café com Alumni', category: 'Carreira', points: 1 },
    { id: 5, label: 'Voto no Shark Tank UTFPR', category: 'Inovação', points: 1 },
    { id: 6, label: 'Roda de Talentos (Speed Interview)', category: 'Empregabilidade', points: 2 },
    { id: 7, label: 'Laboratório Prático de Algoritmos', category: 'Engenharia', points: 1 },
    { id: 8, label: 'Ideathon Express / Feira da Lua', category: 'Encerramento', points: 1 },
  ];

  const handleToggleStamp = (stampId: number) => {
    addStamp(stampId);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    const res = validateOneTimeToken(tokenInput);
    setTokenFeedback(res);

    if (res.success) {
      setTokenInput('');
    }

    setTimeout(() => {
      setTokenFeedback(null);
    }, 5000);
  };

  // Mock Leaderboard estilo Binance (emails anonimizados)
  const leaderboardData = [
    { rank: 1, handle: 'rai***@utfpr.edu.br', stamps: 12, level: 'Mestre da SECOMP', color: '#fcd535' },
    { rank: 2, handle: 'jul***@alunos.utfpr.edu.br', stamps: 11, level: 'Mestre da SECOMP', color: '#fcd535' },
    { rank: 3, handle: 'mar***@utfpr.edu.br', stamps: 10, level: 'Mestre da SECOMP', color: '#fcd535' },
    { rank: 4, handle: 'gab***@alunos.utfpr.edu.br', stamps: 9, level: 'Iniciado', color: '#f0b90b' },
    { rank: 5, handle: 'ana***@alunos.utfpr.edu.br', stamps: 8, level: 'Iniciado', color: '#f0b90b' },
    { rank: 6, handle: 'luc***@alunos.utfpr.edu.br', stamps: 7, level: 'Adepto', color: '#0ecb81' },
    { rank: 7, handle: 'car***@utfpr.edu.br', stamps: 7, level: 'Adepto', color: '#0ecb81' },
  ];

  const boardContent = (
    <>
      {/* Passport Board */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#1e2329] border border-[#2b3139] space-y-6">
        {/* Header de Nível */}
        <div className="flex flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#2b3139]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-[#0b0e11] border border-[#2b3139] flex items-center justify-center font-bold"
              style={{ color: currentLevel.color }}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-[#707a8a] uppercase tracking-wider">Passaporte Acadêmico</span>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-white">Nível Atual:</span>
                <span className="text-base font-extrabold font-mono" style={{ color: currentLevel.color }}>
                  {currentLevel.name}
                </span>
                <span className="text-xs font-mono text-[#707a8a]">
                  • {stampsCount} de 8 presenças validadas
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-white">Participante:</span>
                <span className="text-base font-extrabold font-mono" style={{ color: currentLevel.color }}>
                  {user?.name || 'Estudante'}
                </span>
              </div>
            </div>
          </div>

          <button
            data-testid="section-ranking"
            onClick={() => setIsLeaderboardOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#0b0e11] border border-[#2b3139] hover:border-[#fcd535] text-xs font-mono text-[#eaecef] hover:text-[#fcd535] transition-colors flex items-center gap-1.5 shrink-0 self-end sm:self-center"
          >
            <Trophy className="w-3.5 h-3.5 text-[#fcd535]" />
            <span>QUADRO GERAL</span>
          </button>
        </div>

        {/* Barra Checkpoint */}
        <div className="relative py-2 px-1">
          <div className="absolute top-1/2 left-2 right-2 -translate-y-1/2 h-1 bg-[#0b0e11] border border-[#2b3139] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#fcd535] to-[#0ecb81] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (stampsCount / 8) * 100)}%` }}
            />
          </div>

          {/* Checkpoints circulares */}
          <div className="relative z-10 flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((cp) => {
              const isAchieved = stampsCount >= cp;
              const isSpecialMilestone = cp === 7;

              return (
                <div
                  key={cp}
                  className={`rounded-full transition-colors duration-200 ${isAchieved
                    ? isSpecialMilestone
                      ? 'w-4 h-4 bg-[#0ecb81] border border-[#0ecb81]'
                      : 'w-3.5 h-3.5 bg-[#fcd535] border border-[#fcd535]'
                    : isSpecialMilestone
                      ? 'w-3.5 h-3.5 bg-[#0b0e11] border border-[#0ecb81]/60'
                      : 'w-2.5 h-2.5 bg-[#0b0e11] border border-[#2b3139]'
                    }`}
                />
              );
            })}
          </div>
        </div>

        {tokenFeedback && (
          <div
            className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${tokenFeedback.success
              ? 'bg-[#0ecb81]/15 text-[#0ecb81] border border-[#0ecb81]/40'
              : 'bg-[#f6465d]/15 text-[#f6465d] border border-[#f6465d]/40'
              }`}
          >
            {tokenFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{tokenFeedback.message}</span>
          </div>
        )}

        {/* Stamps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stamps.map((stamp) => {
            const isChecked = earnedStampIds.includes(stamp.id);
            return (
              <button
                key={stamp.id}
                onClick={() => handleToggleStamp(stamp.id)}
                className={`p-4 rounded-xl border text-left transition-colors duration-150 flex flex-col justify-between h-32 relative group ${isChecked
                  ? 'bg-[#0b0e11] border-[#fcd535]'
                  : 'bg-[#0b0e11]/60 border-[#2b3139] hover:border-[#fcd535]/50 opacity-75 hover:opacity-100'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#707a8a]">{stamp.category}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${isChecked
                      ? 'bg-[#fcd535] text-[#181a20]'
                      : 'bg-[#2b3139] text-[#707a8a]'
                      }`}
                  >
                    {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stamp.id}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#fcd535] transition-colors leading-tight">
                    {stamp.label}
                  </div>
                  <div className="text-[10px] font-mono text-[#0ecb81] mt-1 font-semibold">
                    +{stamp.points} {stamp.points > 1 ? 'créditos' : 'crédito'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Qualification Footer Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#2b3139]">
          <p className="text-[11px] text-[#707a8a] font-mono text-center sm:text-left">
            * A validação definitiva de horas complementares é homologada ao término da conferência.
          </p>
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-[#1e2329] border border-[#2b3139] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#0b0e11] border border-[#2b3139] flex items-center justify-center text-[#fcd535]">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Laboratórios & Prática</h3>
          <p className="text-xs text-[#929aa5] leading-relaxed">
            Ambientes com estações completas para execução dos minicursos de IA, redes e sistemas embarcados.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#1e2329] border border-[#2b3139] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#0b0e11] border border-[#2b3139] flex items-center justify-center text-[#fcd535]">
            <Coffee className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Networking & Conexão</h3>
          <p className="text-xs text-[#929aa5] leading-relaxed">
            Intervalos dedicados para troca de contatos diretos entre estudantes, pesquisadores e executivos de tech.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#1e2329] border border-[#2b3139] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#0b0e11] border border-[#2b3139] flex items-center justify-center text-[#fcd535]">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Certificação UTFPR</h3>
          <p className="text-xs text-[#929aa5] leading-relaxed">
            Certificado de participação oficial com discriminação de atividades e carga horária para horas complementares.
          </p>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-[#1e2329] border border-[#2b3139] space-y-6">
            <div className="flex items-center justify-between border-b border-[#2b3139] pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Trophy className="w-5 h-5 text-[#fcd535]" />
                <span>QUADRO DE PARTICIPAÇÃO</span>
              </div>
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="p-1.5 text-[#707a8a] hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {leaderboardData.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${item.rank === 1
                        ? 'bg-[#fcd535] text-[#181a20]'
                        : item.rank === 2
                          ? 'bg-[#eaecef] text-[#181a20]'
                          : item.rank === 3
                            ? 'bg-[#f0b90b] text-[#181a20]'
                            : 'bg-[#2b3139] text-[#707a8a]'
                        }`}
                    >
                      {item.rank}
                    </span>
                    <div>
                      <div className="text-white font-bold">{item.handle}</div>
                      <div className="text-[10px]" style={{ color: item.color }}>
                        {item.level}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#fcd535] font-bold text-sm">{item.stamps} Atividades</div>
                    <div className="text-[10px] text-[#0ecb81]">Certificado Apto</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-center text-[#707a8a] font-mono">
              * Dados anônimos segundo diretrizes LGPD da UTFPR.
            </p>
          </div>
        </div>
      )}
    </>
  );

  if (isEmbedded) {
    return boardContent;
  }

  return (
    <section
      id="passaporte"
      data-testid="section-passaporte"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0b0e11] relative"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Passaporte SECOMP 2026
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2329] border border-[#2b3139] text-xs font-mono text-[#fcd535]">
            <Award className="w-3.5 h-3.5" />
            <span>JORNADA ACADÊMICA & CERTIFICAÇÃO</span>
          </div>
        </div>

        {boardContent}
      </div>
    </section>
  );
};

export default PassportSection;
