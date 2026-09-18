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

  const events: ScheduleEvent[] = [
    {
      id: 'seg-1', dayIndex: 0, shift: 'MORNING', shiftLabel: 'Manhã', time: '09h00 - 11h30',
      title: 'Abertura Oficial & Keynote: A Revolução da IA Generativa',
      description: 'Abertura magna da SECOMP 2026 com os novos paradigmas de engenharia de software e modelos de linguagem.',
      speaker: 'Gustavo Meirelles', speakerRole: 'Especialista em IA & Arquiteto de Soluções',
      location: 'Auditório Principal', theme: 'TECHNOLOGY', themeLabel: 'Tecnologia',
      availableSeats: 35, totalSeats: 250,
    },
    {
      id: 'seg-2', dayIndex: 0, shift: 'AFTERNOON', shiftLabel: 'Tarde', time: '14h00 - 17h00',
      title: 'Startup Day Summit & Mostra de Inovação Aberta',
      description: 'Estandes interativos de startups e projetos acadêmicos no saguão, com rodada de apresentações e mentoria prática.',
      speaker: 'Startups Convidadas & Startx', speakerRole: 'Ecossistema de Inovação Regional',
      location: 'Pátio Coberto & Saguão', theme: 'INNOVATION', themeLabel: 'Inovação',
      availableSeats: 120, totalSeats: 200,
    },
    {
      id: 'seg-3', dayIndex: 0, shift: 'NIGHT', shiftLabel: 'Noite', time: '19h00 - 22h00',
      title: 'Painel Executivo: Bastidores das Big Techs & Liderança Global',
      description: 'Mesa-redonda com diretores técnicos e CTOs sobre desafios de altíssima escala, arquitetura e cultura de engenharia.',
      speaker: 'CTOs & Líderes Globais (Híbrido)', speakerRole: 'Painelistas de Big Techs',
      location: 'Auditório Principal', theme: 'MANAGEMENT', themeLabel: 'Estratégia',
      availableSeats: 15, totalSeats: 250,
    },
    {
      id: 'ter-1', dayIndex: 1, shift: 'MORNING', shiftLabel: 'Manhã', time: '09h00 - 11h30',
      title: 'Palestra: Arquitetura de Carreira Tech & Tendências',
      description: 'Mapeamento pragmático de especializações: Software Engineering, Data & AI, Cloud/DevOps e Gestão de Produto.',
      speaker: 'Líderes de Engenharia Convidados', speakerRole: 'Especialistas de Carreira Tech',
      location: 'Auditório Principal', theme: 'CAREER', themeLabel: 'Carreira',
      availableSeats: 80, totalSeats: 200,
    },
    {
      id: 'ter-2', dayIndex: 1, shift: 'AFTERNOON', shiftLabel: 'Tarde', time: '14h00 - 17h00',
      title: 'Consultorias Express: Café com Ex-Alunos (Alumni)',
      description: 'Mesas temáticas no pátio para mentoria direta de 30 minutos com egressos atuando no Brasil e exterior.',
      speaker: 'Comunidade Alumni DACOM', speakerRole: 'Egressos de Sucesso',
      location: 'Pátio Coberto', theme: 'CAREER', themeLabel: 'Carreira',
      availableSeats: 25, totalSeats: 60,
    },
    {
      id: 'ter-3', dayIndex: 1, shift: 'NIGHT', shiftLabel: 'Noite', time: '19h00 - 22h00',
      title: 'Keynote CyberGuard: O Frontline da CyberSegurança Real',
      description: 'Ameaças cibernéticas contemporâneas, técnicas de defesa ativa e panorama de contratação na área de segurança.',
      speaker: 'CyberGuard Team', speakerRole: 'Líderes de Red Team & Defesa',
      location: 'Auditório Principal', theme: 'TECHNOLOGY', themeLabel: 'Tecnologia',
      availableSeats: 18, totalSeats: 200,
    },
    {
      id: 'qua-1', dayIndex: 2, shift: 'MORNING', shiftLabel: 'Manhã', time: '09h00 - 11h30',
      title: 'Da Faculdade ao Mercado: Transformando TCCs em Startups',
      description: 'Como pesquisas acadêmicas podem se tornar produtos reais e captar investimentos através da Sprint.',
      speaker: 'Cesar Augusto Dias', speakerRole: 'Incubadora Sprint & UTFPR',
      location: 'Auditório Principal', theme: 'INNOVATION', themeLabel: 'Inovação',
      availableSeats: 90, totalSeats: 200,
    },
    {
      id: 'qua-2', dayIndex: 2, shift: 'AFTERNOON', shiftLabel: 'Tarde', time: '14h00 - 18h00',
      title: 'IDEATHON EXPRESS & GAMEJAM: Maratona Prática de 4 Horas',
      description: 'Resolução prática de desafios em equipe com mentoria ao vivo, prototipagem rápida e certificação.',
      speaker: 'Equipes Inscritas & Mentores', speakerRole: 'Desafio Colaborativo',
      location: 'Laboratórios Maker & Informática', theme: 'INNOVATION', themeLabel: 'Inovação',
      availableSeats: 25, totalSeats: 100,
    },
    {
      id: 'qua-3', dayIndex: 2, shift: 'NIGHT', shiftLabel: 'Noite', time: '19h00 - 22h00',
      title: 'Trilha de Aceleração: Validação de Ideias & Pitches do Ideathon',
      description: 'Apresentação dos resultados da maratona da tarde, banca de mentores e entrega de premiações do Ideathon.',
      speaker: 'Consultores de Startups & Jurados', speakerRole: 'Mentores da Incubadora Sprint & Sebrae',
      location: 'Auditório Principal', theme: 'MANAGEMENT', themeLabel: 'Estratégia',
      availableSeats: 40, totalSeats: 100,
    },
    {
      id: 'qui-1', dayIndex: 3, shift: 'MORNING', shiftLabel: 'Manhã', time: '09h00 - 11h30',
      title: 'Inteligência Emocional e Equilíbrio no Meio Tech',
      description: 'Roda de conversa sobre síndrome do impostor, estresse acadêmico e rotina saudável de desenvolvimento.',
      speaker: 'Psicólogos NUAPE & Convidados', speakerRole: 'Apoio Psicológico Universitário',
      location: 'Auditório Principal', theme: 'CAREER', themeLabel: 'Carreira',
      availableSeats: 110, totalSeats: 200,
    },
    {
      id: 'qui-2', dayIndex: 3, shift: 'AFTERNOON', shiftLabel: 'Tarde', time: '14h00 - 17h00',
      title: 'Roda de Talentos: Simulações Reais de Entrevista (Speed Interview)',
      description: 'Slots individuais de 15 minutos com profissionais de RH de grandes empresas de TI. Feedback imediato.',
      speaker: 'RHs ForLogic, TCS, TO Brasil, CyberGuard', speakerRole: 'Recrutadores Corporativos',
      location: 'Pátio Coberto & Salas de Apoio', theme: 'CAREER', themeLabel: 'Carreira',
      availableSeats: 12, totalSeats: 80,
    },
    {
      id: 'qui-3', dayIndex: 3, shift: 'NIGHT', shiftLabel: 'Noite', time: '19h00 - 22h00',
      title: 'Palestra Magna: Liderança com Empatia e Desenvolvimento de Equipes',
      description: 'Como liderar equipes multidisciplinares com alta performance e acolhimento humano.',
      speaker: 'Eloah Bueno', speakerRole: 'Especialista em Liderança & Pessoas',
      location: 'Auditório Principal', theme: 'MANAGEMENT', themeLabel: 'Estratégia',
      availableSeats: 75, totalSeats: 200,
    },
    {
      id: 'sex-1', dayIndex: 4, shift: 'MORNING', shiftLabel: 'Manhã', time: '09h00 - 11h30',
      title: 'O Futuro do Trabalho e as Novas Fronteiras da Computação',
      description: 'Painel sobre computação quântica, bioinformática e novas profissões do ecossistema tecnológico.',
      speaker: 'Pesquisadores & Docentes UTFPR', speakerRole: 'Comunidade Acadêmica de Pesquisa',
      location: 'Auditório Principal', theme: 'TECHNOLOGY', themeLabel: 'Tecnologia',
      availableSeats: 130, totalSeats: 200,
    },
    {
      id: 'sex-2', dayIndex: 4, shift: 'AFTERNOON', shiftLabel: 'Tarde', time: '14h00 - 17h00',
      title: 'Mostra Tecnológica & Conexão Comunidade',
      description: 'Estandes interativos de protótipos de robótica, projetos de extensão e networking com a comunidade.',
      speaker: 'Grupos de Pesquisa & DACOM', speakerRole: 'Ecossistema Acadêmico',
      location: 'Saguão Central & Salas Maker', theme: 'INNOVATION', themeLabel: 'Inovação',
      availableSeats: 80, totalSeats: 200,
    },
    {
      id: 'sex-3', dayIndex: 4, shift: 'NIGHT', shiftLabel: 'Noite', time: '19h00 - 22h00',
      title: 'SHARK TANK UTFPR: Batalha de Pitches ao Vivo com Votação',
      description: 'Competição oficial de startups e projetos acadêmicos com banca de investidores do Sebrae e votação popular em tempo real.',
      speaker: 'Startups Concorrentes & Banca', speakerRole: 'Sprint • Sebrae • Investidores',
      location: 'Auditório Principal', theme: 'INNOVATION', themeLabel: 'Inovação',
      availableSeats: 10, totalSeats: 250,
    },
    {
      id: 'sex-4', dayIndex: 4, shift: 'NIGHT', shiftLabel: 'Noite', time: '21h30 em diante',
      title: 'Cerimônia de Premiação & Grande Feira da Lua',
      description: 'Reconhecimento oficial dos melhores projetos da maratona e hackathon, confraternização acadêmica e atrações culturais.',
      speaker: 'Coordenação DACOM & Comunidade', speakerRole: 'Comunidade Aberta',
      location: 'Auditório & Pátio Externo', theme: 'CAREER', themeLabel: 'Encerramento',
      availableSeats: 300, totalSeats: 500,
    },
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
          <p className="text-xs font-mono font-bold text-[#fcd535] tracking-widest uppercase">Programação</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            5 dias de<br />conteúdo intenso
          </h2>
          <p className="text-sm text-[#707a8a] mt-2">
            Palestras, painéis e atividades práticas para conectar você ao que há de melhor na computação.
          </p>
        </div>

        {/* 5-Day Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-xl bg-[#1e2329] border border-[#2b3139]">
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

            {/* Day Context Block */}
            <div className="rounded-xl bg-[#1e2329] border border-[#2b3139] p-5 space-y-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-mono text-[#fcd535] tracking-widest uppercase">
                  {activeDay.code} • {activeDay.date}
                </p>
                <h3 className="text-xl font-extrabold text-white tracking-tight">{activeDay.name}</h3>
                <p className="text-xs text-[#707a8a]">{activeDay.subtitle}</p>
              </div>
              <div className="pt-2 border-t border-[#2b3139] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#fcd535]" />
                <span className="text-xs font-mono text-[#929aa5]">
                  {filteredEvents.length} atividade{filteredEvents.length !== 1 ? 's' : ''} encontrada{filteredEvents.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Shift Filter */}
            <div className="rounded-xl bg-[#1e2329] border border-[#2b3139] p-5 space-y-3">
              <p className="text-[10px] font-mono text-[#707a8a] uppercase tracking-widest">Turno</p>
              <div className="flex flex-col gap-1.5">
                {shiftFilters.map((f) => {
                  const ShiftIcon = f.Icon;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedTurn(f.id as any)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${selectedTurn === f.id
                        ? 'bg-[#fcd535] text-[#181a20] font-bold'
                        : 'text-[#929aa5] hover:text-white hover:bg-[#2b3139]/60'
                        }`}
                    >
                      <ShiftIcon className="w-3.5 h-3.5 shrink-0" />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Filter */}
            <div className="rounded-xl bg-[#1e2329] border border-[#2b3139] p-5 space-y-3">
              <p className="text-[10px] font-mono text-[#707a8a] uppercase tracking-widest">Tema</p>
              <div className="flex flex-col gap-1.5">
                {themeFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedTheme(f.id as any)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${selectedTheme === f.id
                      ? 'bg-[#0b0e11] border border-[#fcd535] text-[#fcd535] font-bold'
                      : 'text-[#929aa5] hover:text-white hover:bg-[#2b3139]/60'
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
              <div className="p-12 text-center rounded-xl bg-[#1e2329] border border-[#2b3139] text-[#707a8a] text-sm">
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
                            className="text-[10px] font-mono px-2 py-0.5 rounded border"
                            style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}15` }}
                          >
                            {ev.themeLabel}
                          </span>
                          <span className="text-[10px] font-mono text-[#707a8a]">
                            {ev.shiftLabel} • {ev.time}
                          </span>
                          {isLimited && (
                            <span className="text-[10px] font-mono text-[#f6465d] font-bold">
                              {ev.availableSeats} vagas restantes
                            </span>
                          )}
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
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="pl-[60px] pr-2 pb-6 space-y-4">
                        {/* Description */}
                        <p className="text-sm text-[#929aa5] leading-relaxed">
                          {ev.description}
                        </p>

                        {/* Meta grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0b0e11] border border-[#2b3139]">
                            <User className="w-4 h-4 text-[#fcd535] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-white">{ev.speaker}</p>
                              <p className="text-[11px] text-[#707a8a]">{ev.speakerRole}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0b0e11] border border-[#2b3139]">
                            <MapPin className="w-4 h-4 text-[#707a8a] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-white">{ev.location}</p>
                              <p className="text-[11px] text-[#707a8a]">
                                {isLimited
                                  ? <span className="text-[#f6465d] font-bold">{ev.availableSeats} vagas restantes</span>
                                  : <span className="text-[#0ecb81]">Vagas disponíveis</span>
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            data-testid="btn-pre-inscricao"
                            onClick={() => enrollInActivity(ev.id)}
                            disabled={isEnrolled}
                            className={`h-9 px-5 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 ${isEnrolled
                              ? 'bg-[#3a3a1f] text-[#fcd535] cursor-default border border-[#fcd535]/30'
                              : 'bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] hover:scale-105 active:scale-95'
                              }`}
                          >
                            {isEnrolled ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Inscrito</span>
                              </>
                            ) : (
                              <span>Pré-inscrever</span>
                            )}
                          </button>

                          <button
                            onClick={() => toggleReminder(ev.id)}
                            className={`text-xs font-mono flex items-center gap-1.5 px-3 h-9 rounded-md border transition-colors ${reminders[ev.id]
                              ? 'border-[#0ecb81]/40 text-[#0ecb81] bg-[#0ecb81]/10'
                              : 'border-[#2b3139] text-[#707a8a] hover:text-[#eaecef] hover:border-[#707a8a]'
                              }`}
                          >
                            <Bell className="w-3.5 h-3.5" />
                            <span>{reminders[ev.id] ? 'Lembrete Ativo' : 'Lembrete'}</span>
                          </button>
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
