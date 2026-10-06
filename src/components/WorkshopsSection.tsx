import React, { useState } from 'react';
import { ChevronDown, ShieldAlert } from 'lucide-react';
import { useUIStore, isUserAuthenticated } from '../stores/useUIStore';
import { CMSWorkshopItem } from '../stores/slices/cmsSlice';

export type Workshop = CMSWorkshopItem;

interface WorkshopsSectionProps {
  onSelectWorkshop?: (title: string) => void;
}

export const WorkshopsSection: React.FC<WorkshopsSectionProps> = ({ onSelectWorkshop }) => {
  const [selectedMonth, setSelectedMonth] = useState<'SETEMBRO' | 'OUTUBRO'>('SETEMBRO');
  const [selectedTrack, setSelectedTrack] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { setActiveTab, user } = useUIStore();
  const authenticated = isUserAuthenticated(user);

  // Lista dinâmica gerenciada pelo Mini-CMS
  const workshops = useUIStore((state) => state.workshops);

  const months = [
    {
      id: 'SETEMBRO' as const,
      code: 'SET',
      date: '14 & 29 Set',
      name: 'SETEMBRO',
      subtitle: 'Certificados com horas complementares',
    },
    {
      id: 'OUTUBRO' as const,
      code: 'OUT',
      date: '14 & 29 Out',
      name: 'OUTUBRO',
      subtitle: 'Certificados com horas complementares',
    },
  ];

  const trackFilters = [
    { id: 'ALL', label: 'Todas as Trilhas', color: '#707a8a' },
    { id: 'DADOS', label: 'IA & Dados', color: '#fcd535' },
    { id: 'INFRA', label: 'Infra & Cyber', color: '#f6465d' },
    { id: 'HARDWARE', label: 'Hardware & IoT', color: '#2dbdb6' },
    { id: 'DEV', label: 'Dev & Design', color: '#0ecb81' },
  ];

  const filtered = workshops.filter((w) => {
    if (w.month !== selectedMonth) return false;
    if (selectedTrack !== 'ALL' && w.track !== selectedTrack) return false;
    return true;
  });

  const handleEnroll = (title: string) => {
    if (!authenticated) {
      window.location.href = '/auth';
      return;
    }
    if (onSelectWorkshop) {
      onSelectWorkshop(title);
    } else {
      setActiveTab('PASSAPORTE');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section id="minicursos" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0b0e11] border-t border-[#2b3139]/50">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Section Header */}
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            FAZENDO <span className="text-2xl text-[#fcd535]">SETEMBRO & OUTUBRO</span>
          </h2>
          <p className="text-xs font-mono font-bold text-[#fcd535] tracking-widest uppercase">
            Minicursos Práticos • Vitrine de Atrações
          </p>
        </div>

        {/* Month Toolbar - Idêntico ao padrão dos 5 dias */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl">
          {months.map((m) => {
            const isActive = selectedMonth === m.id;
            return (
              <button
                key={m.id}
                data-testid={`tab-${m.id.toLowerCase()}`}
                onClick={() => {
                  setSelectedMonth(m.id);
                  setExpandedId(null);
                }}
                className={`py-3 px-3 rounded-lg text-left transition-all duration-150 relative ${isActive
                  ? 'bg-[#0b0e11] border border-[#fcd535] text-white'
                  : 'text-[#707a8a] hover:text-[#eaecef] hover:bg-[#2b3139]/40 border border-transparent'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-[#fcd535]' : 'text-[#707a8a]'}`}>
                    {m.code} • {m.date}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#fcd535]" />}
                </div>
                <div className="text-xs sm:text-sm font-bold mt-1 tracking-tight text-white">
                  {m.name}
                </div>
                <div className="text-[10px] text-[#707a8a] truncate mt-0.5 hidden sm:block">
                  {m.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* FAQ Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 items-start">

          {/* ── Left Sidebar (sticky) ── */}
          <div className="lg:sticky lg:top-24 space-y-5">

            {/* Track Filter */}
            <div className="rounded-xl p-5 space-y-3">
              <p className="text-[10px] font-mono text-[#707a8a] uppercase tracking-widest">Trilha</p>
              <div className="flex flex-col gap-1.5">
                {trackFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedTrack(f.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${selectedTrack === f.id
                      ? 'bg-[#2b3139] text-[#fcd535] font-bold'
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
              <div className="p-12 text-center rounded-xl text-[#707a8a] text-sm">
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
                          {/* Track badge */}
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded"
                            style={{ color: w.trackColor }}
                          >
                            {w.trackLabel}
                          </span>
                          {/* Date badge */}
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded text-[#fcd535]">
                            {w.day} {w.month.charAt(0) + w.month.slice(1).toLowerCase()}
                          </span>
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
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="pl-[60px] pr-2 pb-6 space-y-4">

                        {/* Meta container lado a lado */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-40">
                          <div className="flex flex-col gap-3 p-3.5 rounded-lg shrink-0">
                            <div className="flex items-start gap-2.5">
                              <div>
                                <p className="text-xs font-bold text-[#707a8a]">{w.instructor}</p>
                                <p className="text-[11px] text-[#707a8a]">Parceiro: {w.partner}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start p-3.5 flex-1">
                            <div className="space-y-1.5">
                              <p className="text-xs font-bold text-[#707a8a]">{w.location}</p>
                              <p className="text-[11px] text-[#707a8a]">
                                <span className="text-[#707a8a] font-bold">{w.activeSlots}/{w.totalSlots} vagas restantes</span>
                              </p>
                              <p className="text-xs text-[#ffffff] leading-relaxed pt-1">
                                {w.description}
                              </p>
                            </div>
                          </div>
                        </div>


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
