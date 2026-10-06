import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Trophy, Award, Flame, Users, CheckCircle2, ShieldCheck, Sparkles, BookOpen, Mic, MessageSquare, Clock } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export const ArenaLivePage: React.FC = () => {
  const { lectures, workshops, ideathonTeams, cmsContent } = useUIStore();
  const sessionStatus = cmsContent?.session_status || {};
  const isLiveActive = sessionStatus.shark_tank_voting_active ?? true;

  const [activeTab, setActiveTab] = useState<'CURSOS' | 'PALESTRAS' | 'RODAS' | 'SHARK_TANK'>('SHARK_TANK');

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // 1. Pitches Shark Tank
  const activePitches = (ideathonTeams || []).filter(
    (t) => t.status === 'APROVADO' || t.status === 'FINALISTA'
  );
  const totalSharkVotes = activePitches.reduce((acc, p) => acc + (p.votesCount || 0), 0);

  // 2. Minicursos
  const activeWorkshops = workshops || [];
  const totalWorkshopPresences = activeWorkshops.reduce((acc, w) => acc + (w.totalSlots - w.activeSlots), 0);

  // 3. Palestras
  const activeLectures = lectures || [];
  const totalLecturePresences = activeLectures.reduce((acc, l) => acc + (l.totalSeats - l.availableSeats), 0);

  // 4. Rodas de Conversa (1 Plataforma 1 QR Code - 100% lido de talentPlatforms do CMS)
  const { talentPlatforms } = useUIStore();
  const rodasPlataformas = (talentPlatforms && talentPlatforms.length > 0)
    ? talentPlatforms.map((plat) => ({
        id: plat.id,
        name: plat.title || plat.companyName,
        topic: `${plat.companyName} • Responsável: ${plat.hostName}`,
        location: plat.location,
        slots: plat.slots || [],
      }))
    : [];

  // Gera o QR Code dinâmico para o item selecionado
  useEffect(() => {
    let targetUrl = `${window.location.origin}/validate`;

    if (activeTab === 'SHARK_TANK') {
      targetUrl = selectedItemId
        ? `${window.location.origin}/votar?pitch=${selectedItemId}`
        : `${window.location.origin}/votar`;
    } else if (activeTab === 'CURSOS') {
      targetUrl = selectedItemId
        ? `${window.location.origin}/validate?activityId=CURSO_${selectedItemId}`
        : `${window.location.origin}/validate?type=CURSOS`;
    } else if (activeTab === 'PALESTRAS') {
      targetUrl = selectedItemId
        ? `${window.location.origin}/validate?activityId=PALESTRA_${selectedItemId}`
        : `${window.location.origin}/validate?type=PALESTRAS`;
    } else if (activeTab === 'RODAS') {
      targetUrl = selectedItemId
        ? `${window.location.origin}/validate?activityId=${selectedItemId}`
        : `${window.location.origin}/validate?type=RODAS`;
    }

    QRCode.toDataURL(targetUrl, {
      width: 340,
      margin: 2,
      color: {
        dark: '#fcd535',
        light: '#0b0e11',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch(() => {});
  }, [activeTab, selectedItemId]);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] p-6 sm:p-10 font-sans flex flex-col justify-between selection:bg-[#fcd535] selection:text-[#181a20]">
      {/* Header do Telão Ao Vivo */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#2b3139] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#fcd535]/10 border border-[#fcd535]/30 flex items-center justify-center text-[#fcd535]">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                ARENA LIVE TELÃO SECOMP 2026
              </h1>
              <span className="bg-[#fcd535] text-[#181a20] text-xs font-mono font-bold px-2.5 py-1 rounded">
                AO VIVO
              </span>
            </div>
            <p className="text-sm font-mono text-[#929aa5]">
              Placar Oficial de Apuração, Presenças e QR Codes Exclusivos por Atividade
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO DE MODALIDADES NO TELÃO */}
        <div className="flex flex-wrap items-center gap-2 bg-[#181a20] p-2 rounded-2xl border border-[#2b3139]">
          <button
            onClick={() => { setActiveTab('SHARK_TANK'); setSelectedItemId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'SHARK_TANK'
                ? 'bg-[#fcd535] text-[#181a20] shadow-md'
                : 'text-[#929aa5] hover:text-white hover:bg-[#2b3139]'
            }`}
          >
            <Trophy className="w-4 h-4" /> SHARK TANK
          </button>
          <button
            onClick={() => { setActiveTab('CURSOS'); setSelectedItemId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'CURSOS'
                ? 'bg-[#fcd535] text-[#181a20] shadow-md'
                : 'text-[#929aa5] hover:text-white hover:bg-[#2b3139]'
            }`}
          >
            <BookOpen className="w-4 h-4" /> CURSOS ({activeWorkshops.length})
          </button>
          <button
            onClick={() => { setActiveTab('PALESTRAS'); setSelectedItemId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'PALESTRAS'
                ? 'bg-[#fcd535] text-[#181a20] shadow-md'
                : 'text-[#929aa5] hover:text-white hover:bg-[#2b3139]'
            }`}
          >
            <Mic className="w-4 h-4" /> PALESTRAS ({activeLectures.length})
          </button>
          <button
            onClick={() => { setActiveTab('RODAS'); setSelectedItemId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'RODAS'
                ? 'bg-[#fcd535] text-[#181a20] shadow-md'
                : 'text-[#929aa5] hover:text-white hover:bg-[#2b3139]'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> RODAS DE CONVERSA
          </button>
        </div>
      </header>

      {/* Conteúdo Principal (Telão 2 Colunas) */}
      <main className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-grow">
        
        {/* COLUNA ESQUERDA: ESTATÍSTICAS E SELEÇÃO DE ITEM (8 cols) */}
        <section className="lg:col-span-8 space-y-4">

          {/* TAB 1: SHARK TANK */}
          {activeTab === 'SHARK_TANK' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono text-[#fcd535] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#fcd535]" />
                  Shark Tank UTFPR • Pitches Finalistas ({activePitches.length})
                </h2>
                <span className="text-xs text-[#0ecb81] font-mono font-bold">{totalSharkVotes} Votos Computados</span>
              </div>
              <div className="space-y-3">
                {activePitches.map((pitch, index) => {
                  const votes = pitch.votesCount || 0;
                  const pct = totalSharkVotes > 0 ? Math.round((votes / totalSharkVotes) * 100) : 0;
                  const isSelected = selectedItemId === pitch.id;

                  return (
                    <div
                      key={pitch.id}
                      onClick={() => setSelectedItemId(isSelected ? null : pitch.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#181a20] border-[#fcd535] shadow-lg shadow-[#fcd535]/10'
                          : 'bg-[#181a20] border-[#2b3139] hover:border-[#474d57]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-[#0b0e11] font-mono font-bold text-sm text-[#fcd535] border border-[#2b3139] flex items-center justify-center">
                            #{index + 1}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">{pitch.teamName}</h3>
                            <p className="text-xs text-[#929aa5]">{pitch.proposal}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-mono font-black text-[#fcd535]">{pct}%</div>
                          <div className="text-[11px] font-mono text-[#707a8a]">{votes} votos</div>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-[#0b0e11] rounded-full overflow-hidden border border-[#2b3139]">
                        <div className="h-full bg-gradient-to-r from-[#fcd535] to-[#f0b90b]" style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CURSOS */}
          {activeTab === 'CURSOS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono text-[#fcd535] uppercase font-bold tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#fcd535]" />
                  Estatísticas de Minicursos Cadastrados ({activeWorkshops.length})
                </h2>
                <span className="text-xs text-[#0ecb81] font-mono font-bold">{totalWorkshopPresences} Inscrições/Presenças</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeWorkshops.map((ws) => {
                  const isSelected = selectedItemId === ws.id;
                  const filledSeats = ws.totalSlots - ws.activeSlots;
                  const pct = Math.round((filledSeats / ws.totalSlots) * 100);

                  return (
                    <div
                      key={ws.id}
                      onClick={() => setSelectedItemId(isSelected ? null : ws.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#181a20] border-[#fcd535] shadow-lg shadow-[#fcd535]/10'
                          : 'bg-[#181a20] border-[#2b3139] hover:border-[#474d57]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#fcd535]/10 border border-[#fcd535]/30 text-[#fcd535]">
                          {ws.trackLabel}
                        </span>
                        <span className="text-xs font-mono text-[#0ecb81] font-bold">{filledSeats}/{ws.totalSlots} inscritos</span>
                      </div>
                      <h3 className="font-bold text-white text-base mb-1">{ws.title}</h3>
                      <p className="text-xs text-[#929aa5] mb-3">Instrutor: {ws.instructor}</p>
                      <div className="w-full h-2 bg-[#0b0e11] rounded-full overflow-hidden border border-[#2b3139]">
                        <div className="h-full bg-[#0ecb81]" style={{ width: `${Math.max(pct, 4)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PALESTRAS */}
          {activeTab === 'PALESTRAS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono text-[#fcd535] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#fcd535]" />
                  Estatísticas das Palestras da Semana ({activeLectures.length})
                </h2>
                <span className="text-xs text-[#0ecb81] font-mono font-bold">{totalLecturePresences} Presenças Computadas</span>
              </div>
              <div className="space-y-3">
                {activeLectures.map((lec) => {
                  const isSelected = selectedItemId === lec.id;
                  const presences = lec.totalSeats - lec.availableSeats;

                  return (
                    <div
                      key={lec.id}
                      onClick={() => setSelectedItemId(isSelected ? null : lec.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#181a20] border-[#fcd535] shadow-lg shadow-[#fcd535]/10'
                          : 'bg-[#181a20] border-[#2b3139] hover:border-[#474d57]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0e11] border border-[#2b3139] text-[#fcd535] mr-2">
                            {lec.shiftLabel} • {lec.time}
                          </span>
                          <span className="text-xs text-[#707a8a]">{lec.location}</span>
                        </div>
                        <span className="text-xs font-mono text-[#fcd535] font-bold">{presences} auditório</span>
                      </div>
                      <h3 className="font-bold text-white text-base mb-1">{lec.title}</h3>
                      <p className="text-xs text-[#929aa5]">{lec.speaker} ({lec.speakerRole})</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: RODAS DE CONVERSA */}
          {activeTab === 'RODAS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono text-[#fcd535] uppercase font-bold tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#fcd535]" />
                  Plataformas de Rodas de Conversa (1 QR Code por Plataforma)
                </h2>
                <span className="text-xs font-mono text-[#707a8a]">Clique na Plataforma para Projetar seu QR Code</span>
              </div>
              <div className="space-y-4">
                {rodasPlataformas.map((plat) => {
                  const isSelected = selectedItemId === plat.id;

                  return (
                    <div
                      key={plat.id}
                      onClick={() => setSelectedItemId(isSelected ? null : plat.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-[#181a20] border-[#fcd535] shadow-lg shadow-[#fcd535]/10'
                          : 'bg-[#181a20] border-[#2b3139] hover:border-[#474d57]'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[#2b3139] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-lg">{plat.name}</h3>
                            {isSelected && (
                              <span className="bg-[#fcd535] text-[#181a20] text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                                QR CODE PROJETADO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#929aa5]">{plat.topic}</p>
                        </div>
                        <span className="text-xs font-mono text-[#0ecb81] bg-[#0b0e11] px-2.5 py-1 rounded border border-[#2b3139]">
                          7 Slots Internos
                        </span>
                      </div>

                      {/* Grade Visual Interna dos Slots Cadastrados (Informativa, sem divisão de QR Code por slot) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                        {(plat.slots && plat.slots.length > 0 ? plat.slots : [1, 2, 3, 4, 5, 6, 7].map(n => ({ slotNum: n, bookedCount: 0, maxCapacity: 5, status: 'OPEN' }))).map((slot: any, idx: number) => {
                          const slotNum = slot.slotNum || (idx + 1);
                          const isOpen = slot.status === 'OPEN' || slot.status === 'AVAILABLE';
                          const booked = slot.bookedCount || (slot.status === 'OCCUPIED' ? 1 : 0);
                          const max = slot.maxCapacity || 5;

                          return (
                            <div
                              key={slotNum}
                              className="p-2 rounded-xl bg-[#0b0e11] border border-[#2b3139] text-center font-mono space-y-0.5"
                            >
                              <div className="text-[10px] text-[#707a8a]">Slot #{slotNum}</div>
                              <div className={`text-[11px] font-bold ${isOpen ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                {isOpen ? `${booked}/${max}` : 'Ocupado'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </section>

        {/* COLUNA DIREITA: QR CODE DE VALIDAÇÃO (4 cols) */}
        <section className="lg:col-span-4 bg-[#181a20] p-6 rounded-2xl border border-[#2b3139] flex flex-col items-center text-center sticky top-6">
          <div className="w-full flex items-center justify-between border-b border-[#2b3139] pb-4 mb-4">
            <span className="text-xs font-mono text-[#fcd535] uppercase font-bold flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> PROJEÇÃO QR CODE
            </span>
            <span className="text-[10px] font-mono bg-[#0b0e11] px-2 py-1 rounded text-[#929aa5] border border-[#2b3139]">
              {selectedItemId ? 'Item Selecionado' : 'Geral'}
            </span>
          </div>

          <p className="text-xs text-[#929aa5] mb-6">
            Aponte a câmera do seu celular para registrar presença na atividade escolhida e receber +1 carimbo automático no Passaporte!
          </p>

          {/* Frame do QR Code */}
          <div className="p-4 bg-[#0b0e11] rounded-2xl border-2 border-[#fcd535] shadow-2xl mb-4 relative group">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code Ao Vivo" className="w-64 h-64 rounded-lg object-contain" />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-[#707a8a]">Gerando QR...</div>
            )}
          </div>

          <div className="w-full space-y-2 mt-2">
            <div className="p-3 rounded-xl bg-[#0b0e11] border border-[#2b3139] text-[11px] font-mono text-[#929aa5] flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0ecb81]" />
              <span>Concede +1 Carimbo Direto no Passaporte</span>
            </div>
            {selectedItemId && (
              <button
                onClick={() => setSelectedItemId(null)}
                className="w-full py-2 rounded-xl bg-[#2b3139] hover:bg-[#474d57] text-white text-xs font-mono transition-colors"
              >
                Resetar Seleção
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Rodapé do Telão */}
      <footer className="border-t border-[#2b3139] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#707a8a] font-mono gap-2">
        <div>SECOMP 2026 • Painel do Telão de Presenças e Apuração Ao Vivo</div>
        <div className="flex items-center gap-2 text-[#0ecb81]">
          <CheckCircle2 className="w-4 h-4" />
          <span>Sistema de Auditoria e Apuração 100% Operacional</span>
        </div>
      </footer>
    </div>
  );
};
