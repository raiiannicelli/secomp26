import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Bell, Check, ChevronDown, Zap, Sun, CloudSun, Moon } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export interface ScheduleEvent {
  id: string;
  dayIndex: number;
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  shiftLabel: string;
  time: string;
  title: string;
  description: string;
  speaker: string;
  speakerRole: string;
  speakerImage?: string;
  location: string;
  theme: 'TECHNOLOGY' | 'MANAGEMENT' | 'INNOVATION' | 'CAREER';
  themeLabel: string;
  availableSeats: number;
  totalSeats: number;
}

export const ScheduleSection: React.FC = () => {
  const {
    activeDayIndex,
    setActiveDayIndex,
    selectedTurn,
    setSelectedTurn,
    selectedTheme,
    setSelectedTheme,
    enrolledActivities,
    enrollInActivity,
  } = useUIStore();

  const lectures = useUIStore((state) => state.lectures);
  const events = lectures;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  const toggleReminder = (id: string) => {
    setReminders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const days = [
    { index: 0, code: 'SEG', name: 'O MUNDO', subtitle: 'Tecnologia & Tendências', date: '09 Nov' },
    { index: 1, code: 'TER', name: 'O MERCADO', subtitle: 'Carreira & Conexão Alumni', date: '10 Nov' },
    { index: 2, code: 'QUA', name: 'OS PROJETOS', subtitle: 'Ideathon & Inovação Aberta', date: '11 Nov' },
    { index: 3, code: 'QUI', name: 'O HUMANO', subtitle: 'Emocional & Soft Skills', date: '12 Nov' },
    { index: 4, code: 'SEX', name: 'O FUTURO', subtitle: 'Shark Tank & Feira da Lua', date: '13 Nov' },
  ];

  const themeColors: Record<string, string> = {
    TECHNOLOGY: '#f0b90b',
    MANAGEMENT: '#eaecef',
    INNOVATION: '#fcd535',
    CAREER: '#0ecb81',
  };

  const shiftFilters = [
    { id: 'ALL', label: 'Todos os Turnos', Icon: Zap },
    { id: 'MORNING', label: 'Manhã (09h)', Icon: Sun },
    { id: 'AFTERNOON', label: 'Tarde (14h)', Icon: CloudSun },
    { id: 'NIGHT', label: 'Noite (19h)', Icon: Moon },
  ];

  const themeFilters = [
    { id: 'ALL', label: 'Todos os Temas' },
    { id: 'TECHNOLOGY', label: 'Tecnologia' },
    { id: 'MANAGEMENT', label: 'Estratégia' },
    { id: 'INNOVATION', label: 'Inovação' },
    { id: 'CAREER', label: 'Carreira' },
  ];

  const activeDay = days[activeDayIndex];

  const filteredEvents = events.filter((e) => {
    if (e.dayIndex !== activeDayIndex) return false;
    if (selectedTurn !== 'ALL' && e.shift !== selectedTurn) return false;
    if (selectedTheme !== 'ALL' && e.theme !== selectedTheme) return false;
    return true;
  });

  return (
    <section id="programacao" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0b0e11]">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Section Header */}
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            OS <span className="text-2xl text-[#fcd535]">5 DIAS</span>
          </h2>
          <p className="text-xs font-mono font-bold text-[#fcd535] tracking-widest uppercase">
            Palestras & Painéis • Vitrine Pública de Atrações
          </p>
        </div>

        {/* 5-Day Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-xl ">
          {days.map((day) => {
            const isActive = activeDayIndex === day.index;
            return (
              <button
                key={day.index}
                data-testid={day.index === 2 ? 'tab-quarta' : `tab-${day.code.toLowerCase()}`}
                onClick={() => {
                  setActiveDayIndex(day.index);
                  setExpandedId(null);
                }}
                className={`py-3 px-3 rounded-lg text-left transition-all duration-150 relative ${isActive
                  ? 'bg-[#0b0e11] border border-[#fcd535] text-white'
                  : 'text-[#707a8a] hover:text-[#eaecef] hover:bg-[#2b3139]/40 border border-transparent'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-[#fcd535]' : 'text-[#707a8a]'}`}>
                    {day.code} • {day.date}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#fcd535]" />}
                </div>
                <div className="text-xs sm:text-sm font-bold mt-1 tracking-tight text-white">
                  {day.name}
                </div>
                <div className="text-[10px] text-[#707a8a] truncate mt-0.5 hidden sm:block">
                  {day.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* FAQ Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 items-start">

          {/* ── Left Sidebar (sticky on desktop) ── */}
          <div className="lg:sticky lg:top-24 space-y-6">

            {/* Theme Filter */}
            <div className="rounded-xl p-5 space-y-3">
              <p className="text-[10px] font-mono text-[#707a8a] uppercase tracking-widest">Tema</p>
              <div className="flex flex-col gap-1.5">
                {themeFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedTheme(f.id as any)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${selectedTheme === f.id
                      ? 'text-[#fcd535] font-bold bg-[#2b3139]/60'
                      : 'text-[#929aa5] hover:text-white'
                      }`}
                  >
                    {f.id !== 'ALL' && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: themeColors[f.id] ?? '#707a8a' }}
                      />
                    )}
                    {f.id === 'ALL' && (
                      <span className="w-2 h-2 rounded-full shrink-0 bg-[#707a8a]" />
                    )}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Numbered Accordion List ── */}
          <div className="space-y-0">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center rounded-xl text-[#707a8a] text-sm">
                Nenhuma atividade encontrada para este filtro.
              </div>
            ) : (
              filteredEvents.map((ev, idx) => {
                const isOpen = expandedId === ev.id;
                const isEnrolled = enrolledActivities.includes(ev.id);
                const isLimited = ev.availableSeats / ev.totalSeats <= 0.2;
                const themeColor = themeColors[ev.theme] ?? '#707a8a';

                return (
                  <div
                    key={ev.id}
                    className={`border-b border-[#2b3139] transition-colors ${isOpen ? 'bg-[#1e2329]/60' : 'hover:bg-[#1e2329]/30'}`}
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : ev.id)}
                      className="w-full flex items-center gap-5 py-5 px-2 text-left group"
                    >
                      {/* Number */}
                      <span className="text-2xl font-mono font-black text-[#2b3139] group-hover:text-[#fcd535] transition-colors w-10 shrink-0 leading-none">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded"
                            style={{ color: themeColor }}
                          >
                            {ev.themeLabel}
                          </span>
                          <span className="text-[10px] font-mono text-[#707a8a]">
                            {ev.shiftLabel} • {ev.time}
                          </span>
                        </div>
                        <p className={`text-sm font-semibold transition-colors ${isOpen ? 'text-[#fcd535]' : 'text-white group-hover:text-[#fcd535]'}`}>
                          {ev.title}
                        </p>
                      </div>

                      {/* Expand icon */}
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
                                <p className="text-xs font-bold text-[#707a8a]">{ev.speaker}</p>
                                <p className="text-[11px] text-[#707a8a]">{ev.speakerRole}</p>
                              </div>
                            </div>
                            {ev.speakerImage && (
                              <div className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden shrink-0 group/photo">
                                <img
                                  src={ev.speakerImage}
                                  alt={ev.speaker}
                                  className="w-full h-full object-cover object-center aspect-square transition-transform duration-300 group-hover/photo:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e11]/40 to-transparent pointer-events-none" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-start p-3.5 flex-1">
                            <div className="space-y-1.5">
                              <p className="text-xs font-bold text-[#707a8a]">{ev.location}</p>
                              <p className="text-[11px] text-[#707a8a]">
                                <span className="text-[#fcd535] font-bold">● Vitrine Pública de Atrações</span> • Livre Acesso
                              </p>
                              <p className="text-xs text-[#ffffff] leading-relaxed pt-1">
                                {ev.description}
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
