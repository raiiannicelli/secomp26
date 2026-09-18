import React, { useState } from 'react';
import { Calendar, ArrowRight, ShieldAlert, ChevronDown, MapPin, User } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

interface Workshop {
  id: string;
  title: string;
  month: 'SETEMBRO' | 'OUTUBRO';
  day: string;
  track: 'DADOS' | 'INFRA' | 'HARDWARE' | 'DEV';
  trackLabel: string;
  trackColor: string;
  partner: string;
  instructor: string;
  location: string;
  activeSlots: number;
  totalSlots: number;
  description: string;
}

interface WorkshopsSectionProps {
  onSelectWorkshop?: (title: string) => void;
}

export const WorkshopsSection: React.FC<WorkshopsSectionProps> = ({ onSelectWorkshop }) => {
  const [selectedMonth, setSelectedMonth] = useState<'ALL' | 'SETEMBRO' | 'OUTUBRO'>('ALL');
  const [selectedTrack, setSelectedTrack] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const openEnrollModal = useUIStore((state) => state.openEnrollModal);

  const workshops: Workshop[] = [
    {
      id: 'ws-1', title: 'Power BI & Engenharia de Dados Corporativa',
      month: 'SETEMBRO', day: '14',
      track: 'DADOS', trackLabel: 'Inteligência & Dados', trackColor: '#fcd535',
      partner: 'TO Brasil', instructor: 'Engenheiro de Analytics Convidado',
      location: 'Laboratório de Redes e Dados', activeSlots: 8, totalSlots: 60,
      description: 'Dashboards corporativos, modelagem tabular e boas práticas de ETL para grandes volumes de dados.',
    },
    {
      id: 'ws-2', title: 'Ethical Hacking & Segurança Ofensiva na Prática',
      month: 'SETEMBRO', day: '14',
      track: 'INFRA', trackLabel: 'Infra & Segurança', trackColor: '#f6465d',
      partner: 'CyberGuard', instructor: 'Especialista em Red Team',
      location: 'Laboratório de Cibersegurança', activeSlots: 4, totalSlots: 35,
      description: 'Varredura de vulnerabilidades, conceitos de pentest e mitigação de brechas em sistemas distribuídos.',
    },
    {
      id: 'ws-3', title: 'Montagem de PC, Arquitetura e Otimização de Hardware',
      month: 'SETEMBRO', day: '29',
      track: 'HARDWARE', trackLabel: 'Hardware & Sistemas', trackColor: '#f0b90b',
      partner: 'UTFPR Maker Lab', instructor: 'Docente & Técnicos de Hardware',
      location: 'Bancada do Laboratório Maker', activeSlots: 6, totalSlots: 25,
      description: 'Arquitetura de barramentos, compatibilidade de peças, condutividade térmica e diagnóstico prático.',
    },
    {
      id: 'ws-4', title: 'Game DEV: Do Zero ao Protótipo Jogável (Prep GameJam)',
      month: 'SETEMBRO', day: '29',
      track: 'DEV', trackLabel: 'Desenvolvimento & UI', trackColor: '#0ecb81',
      partner: 'GameLab Universitário', instructor: 'Desenvolvedor Indie Convidado',
      location: 'Laboratório de Computação Gráfica', activeSlots: 12, totalSlots: 40,
      description: 'Mecânicas fundamentais, física de colisão e assets para criar protótipos ágeis para a GameJam.',
    },
    {
      id: 'ws-5', title: 'Containers & Docker do Zero ao Deploy em Produção',
      month: 'OUTUBRO', day: '14',
      track: 'INFRA', trackLabel: 'Infra & Segurança', trackColor: '#f6465d',
      partner: 'Comunidade DevOps', instructor: 'DevOps Engineer Sênior',
      location: 'Laboratório de Informática 3', activeSlots: 3, totalSlots: 35,
      description: 'Dockerfiles multi-stage otimizados, volumes persistentes, redes e orquestração de microsserviços.',
    },
    {
      id: 'ws-6', title: 'Arduino, STM32 e Aplicações Industriais de IoT',
      month: 'OUTUBRO', day: '14',
      track: 'HARDWARE', trackLabel: 'Hardware & Sistemas', trackColor: '#f0b90b',
      partner: 'Núcleo de Automação', instructor: 'Pesquisador em Sistemas Embarcados',
      location: 'Laboratório Maker', activeSlots: 2, totalSlots: 25,
      description: 'Programação de microcontroladores em C++, leitura de telemetria e comunicação via protocolo MQTT.',
    },
    {
      id: 'ws-7', title: 'Inteligência Artificial Aplicada com Python & LLMs',
      month: 'OUTUBRO', day: '29',
      track: 'DADOS', trackLabel: 'Inteligência & Dados', trackColor: '#fcd535',
      partner: 'Laboratório de IA da UTFPR', instructor: 'Pesquisador em Machine Learning',
      location: 'Laboratório Central de Computação', activeSlots: 7, totalSlots: 45,
      description: 'Integração prática de modelos generativos, embeddings vetoriais, RAG e automação de agentes de código.',
    },
    {
      id: 'ws-8', title: 'UI/UX Design no Figma: Design Systems para Desenvolvedores',
      month: 'OUTUBRO', day: '29',
      track: 'DEV', trackLabel: 'Desenvolvimento & UI', trackColor: '#0ecb81',
      partner: 'Designers Tech', instructor: 'Lead Product Designer',
      location: 'Laboratório Multimídia', activeSlots: 9, totalSlots: 40,
      description: 'Componentização atômica, tokens de design, acessibilidade e handoff perfeito para o front-end.',
    },
  ];

  const trackFilters = [
    { id: 'ALL', label: 'Todas as Trilhas', color: '#707a8a' },
    { id: 'DADOS', label: 'IA & Dados', color: '#fcd535' },
    { id: 'INFRA', label: 'Infra & Cyber', color: '#f6465d' },
    { id: 'HARDWARE', label: 'Hardware & IoT', color: '#f0b90b' },
    { id: 'DEV', label: 'Dev & Design', color: '#0ecb81' },
  ];

  const monthTabs = [
    { id: 'ALL', label: 'Todos os Meses' },
    { id: 'SETEMBRO', label: 'Setembro' },
    { id: 'OUTUBRO', label: 'Outubro' },
  ] as const;

  const filtered = workshops.filter((w) => {
    if (selectedMonth !== 'ALL' && w.month !== selectedMonth) return false;
    if (selectedTrack !== 'ALL' && w.track !== selectedTrack) return false;
    return true;
  });

  // Sidebar context
  const monthLabel = selectedMonth === 'ALL'
    ? 'Set & Out 2026'
    : `${selectedMonth.charAt(0) + selectedMonth.slice(1).toLowerCase()} 2026`;

  const criticalCount = filtered.filter((w) => w.activeSlots <= 4).length;
  const totalSlots = filtered.reduce((acc, w) => acc + w.activeSlots, 0);

  const handleEnroll = (title: string) => {
    if (onSelectWorkshop) {
      onSelectWorkshop(title);
    } else {
      openEnrollModal(title);
    }
  };

  return (
    <section id="minicursos" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0b0e11] border-t border-[#2b3139]/50">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Section Header */}
        <div className="space-y-1">
          <p className="text-xs font-mono font-bold text-[#fcd535] tracking-widest uppercase">Minicursos</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Aprenda fazendo.<br />Antes do evento.
          </h2>
          <p className="text-sm text-[#707a8a] mt-2">
            Workshops práticos com vagas limitadas em setembro e outubro — antes da semana do evento.
          </p>
        </div>

        {/* Month Toolbar (Primary Filter) */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#1e2329] border border-[#2b3139] w-fit">
          {monthTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedMonth(tab.id);
                setExpandedId(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${selectedMonth === tab.id
                ? 'bg-[#fcd535] text-[#181a20] font-bold'
                : 'text-[#929aa5] hover:text-white hover:bg-[#2b3139]/60'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 items-start">

          {/* ── Left Sidebar (sticky) ── */}
          <div className="lg:sticky lg:top-24 space-y-5">

            {/* Month Context */}
            <div className="rounded-xl bg-[#1e2329] border border-[#2b3139] p-5 space-y-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-mono text-[#fcd535] tracking-widest uppercase">Período</p>
                <h3 className="text-xl font-extrabold text-white tracking-tight">{monthLabel}</h3>
                <p className="text-xs text-[#707a8a]">Minicursos presenciais na UTFPR</p>
              </div>
              <div className="pt-3 border-t border-[#2b3139] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707a8a] font-mono">Cursos</span>
                  <span className="text-white font-bold font-mono">{filtered.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707a8a] font-mono">Vagas abertas</span>
                  <span className="text-[#0ecb81] font-bold font-mono">{totalSlots}</span>
                </div>
                {criticalCount > 0 && (
                  <div className="flex items-center gap-1.5 mt-1 px-2.5 py-1.5 rounded-md bg-[#f6465d]/10 border border-[#f6465d]/30">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#f6465d] shrink-0" />
                    <span className="text-[11px] text-[#f6465d] font-mono font-bold">
                      {criticalCount} curso{criticalCount > 1 ? 's' : ''} quase esgotado{criticalCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Track Filter */}
            <div className="rounded-xl bg-[#1e2329] border border-[#2b3139] p-5 space-y-3">
              <p className="text-[10px] font-mono text-[#707a8a] uppercase tracking-widest">Trilha</p>
              <div className="flex flex-col gap-1.5">
                {trackFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedTrack(f.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${selectedTrack === f.id
                      ? 'bg-[#0b0e11] border border-[#fcd535] text-[#fcd535] font-bold'
                      : 'text-[#929aa5] hover:text-white hover:bg-[#2b3139]/60'
                      }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: f.color }}
                    />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Numbered Accordion ── */}
          <div className="space-y-0">
            {filtered.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[#1e2329] border border-[#2b3139] text-[#707a8a] text-sm">
                Nenhum minicurso encontrado para este filtro.
              </div>
            ) : (
              filtered.map((w, idx) => {
                const isOpen = expandedId === w.id;
                const isCritical = w.activeSlots <= 4;

                return (
                  <div
                    key={w.id}
                    className={`border-b border-[#2b3139] transition-colors ${isOpen ? 'bg-[#1e2329]/60' : 'hover:bg-[#1e2329]/30'}`}
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : w.id)}
                      className="w-full flex items-center gap-5 py-5 px-2 text-left group"
                    >
                      {/* Number */}
                      <span className="text-2xl font-mono font-black text-[#2b3139] group-hover:text-[#fcd535] transition-colors w-10 shrink-0 leading-none">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Date badge */}
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0b0e11] border border-[#2b3139] text-[#fcd535]">
                            {w.day} {w.month.charAt(0) + w.month.slice(1).toLowerCase()}
                          </span>
                          {/* Track badge */}
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded border"
                            style={{ color: w.trackColor, borderColor: `${w.trackColor}40`, backgroundColor: `${w.trackColor}15` }}
                          >
                            {w.trackLabel}
                          </span>
                          {/* Slots */}
                          {isCritical ? (
                            <span className="text-[10px] font-mono text-[#f6465d] font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
                              {w.activeSlots} vagas
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-[#0ecb81]">
                              {w.activeSlots} vagas abertas
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-semibold transition-colors ${isOpen ? 'text-[#fcd535]' : 'text-white group-hover:text-[#fcd535]'}`}>
                          {w.title}
                        </p>
                      </div>

                      {/* Chevron */}
                      <ChevronDown
                        className={`w-5 h-5 text-[#707a8a] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#fcd535]' : ''}`}
                      />
                    </button>

                    {/* Accordion Body */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="pl-[60px] pr-2 pb-6 space-y-4">
                        {/* Description */}
                        <p className="text-sm text-[#929aa5] leading-relaxed">
                          {w.description}
                        </p>

                        {/* Meta grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0b0e11] border border-[#2b3139]">
                            <User className="w-4 h-4 text-[#fcd535] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-white">{w.instructor}</p>
                              <p className="text-[11px] text-[#707a8a]">Parceiro: {w.partner}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0b0e11] border border-[#2b3139]">
                            <MapPin className="w-4 h-4 text-[#707a8a] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-white">{w.location}</p>
                              <p className="text-[11px]">
                                {isCritical
                                  ? <span className="text-[#f6465d] font-bold">Apenas {w.activeSlots} de {w.totalSlots} vagas</span>
                                  : <span className="text-[#0ecb81]">{w.activeSlots} de {w.totalSlots} vagas abertas</span>
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <button
                          onClick={() => handleEnroll(w.title)}
                          className="flex items-center gap-1.5 h-9 px-5 rounded-md bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-xs transition-all hover:scale-105 active:scale-95"
                        >
                          <span>Inscrever-se</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
