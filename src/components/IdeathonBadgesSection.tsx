import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
  MotionValue,
} from 'framer-motion';
import {
  Sparkles,
  Download,
  Check,
  Flame,
  Clock,
  Award,
  Copy,
  CheckCircle2,
  Users,
  Cpu,
  Trophy,
  ShieldCheck,
  ArrowDown,
} from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

interface IdeathonPhase {
  number: string;
  time: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: 'users' | 'sparkles' | 'cpu' | 'trophy';
  accentColor: string;
  bgAccent: string;
  borderAccent: string;
  tag: string;
  bubbleLabel: string;
  highlights: string[];
}

interface Card3DProps {
  phase: IdeathonPhase;
  index: number;
  currentStep: MotionValue<number>;
  isActive: boolean;
  onSelect: () => void;
  renderIcon: (name: string) => React.ReactNode;
}

const Card3D: React.FC<Card3DProps> = ({
  phase,
  index,
  currentStep,
  isActive,
  onSelect,
  renderIcon,
}) => {
  // Posicionamento e curvatura do Cilindro 3D Frontal com DESTAQUE na Fase Ativa
  const transform = useTransform(currentStep, (cur) => {
    const delta = index - cur;
    // Ângulo de curvatura ao redor do eixo X cilíndrico (-58° a +58°)
    const angleDeg = Math.max(-58, Math.min(58, delta * 26));
    const angleRad = (angleDeg * Math.PI) / 180;

    // Raio do cilindro frontal (em pixels)
    const radius = 540;

    // Deslocamento Y ao longo da face curva do cilindro
    const y = Math.sin(angleRad) * radius;

    // Profundidade Z: o card em seleção projeta-se à frente (+40px),
    // enquanto os demais recuam na curvatura natural do cilindro
    const zApex = Math.max(0, 1 - Math.abs(delta) * 1.6) * 40;
    const z = (Math.cos(angleRad) - 1) * radius + zApex;

    // Rotação tangencial sobre o eixo X cilíndrico
    const rotateX = angleDeg * 0.94;

    return `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg)`;
  });

  const scale = useTransform(currentStep, (cur) => {
    const delta = Math.abs(index - cur);
    // Destaque nítido: Card ativo fica em 1.02, cards inativos encolhem
    return Math.max(0.78, 1.02 - delta * 0.14);
  });

  const opacity = useTransform(currentStep, (cur) => {
    const delta = index - cur;
    if (delta < -1.1) {
      return Math.max(0, 1 - (Math.abs(delta) - 1.1) * 2.5);
    }
    if (delta > 2.2) {
      return 0.12;
    }
    const absDelta = Math.abs(delta);
    if (absDelta < 0.4) {
      return 1;
    }
    return Math.max(0.22, 1 - absDelta * 0.65);
  });

  const filter = useTransform(currentStep, (cur) => {
    const delta = Math.abs(index - cur);
    const b = Math.max(0.35, 1 - delta * 0.45);
    return `brightness(${b.toFixed(2)})`;
  });

  const zIndex = useTransform(currentStep, (cur) => {
    const delta = Math.abs(index - cur);
    return Math.round(50 - delta * 10);
  });

  return (
    <motion.div
      onClick={onSelect}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        transform,
        scale,
        opacity,
        filter,
        zIndex,
        transformStyle: 'preserve-3d',
        transformOrigin: '50% 50%',
        maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
      }}
      className={`w-full border-y transition-all duration-200 select-none flex flex-col justify-center relative overflow-hidden ${isActive
        ? 'border-y-[#fcd535] bg-[#181a20] pointer-events-auto cursor-default'
        : 'border-y-[#2b3139] bg-[#10141b] pointer-events-auto cursor-pointer hover:border-y-[#474d57]'
        }`}
    >
      {/* Linha horizontal superior na cor da fase */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] pointer-events-none transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${isActive ? phase.accentColor : 'rgba(255,255,255,0.1)'} 50%, transparent 100%)`,
          opacity: isActive ? 1 : 0.25,
        }}
      />

      {/* Linha horizontal inferior */}
      <div
        className="absolute inset-x-0 bottom-0 h-[1.5px] pointer-events-none transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${isActive ? phase.accentColor : 'rgba(255,255,255,0.08)'} 50%, transparent 100%)`,
          opacity: isActive ? 0.8 : 0.2,
        }}
      />

      {/* Conteúdo Centralizado com Grid Responsivo */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex flex-col justify-between relative z-10">
        {/* Header Bar do Card com Informações */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b transition-colors ${isActive ? 'border-[#2b3139]/80' : 'border-[#2b3139]/30'
            }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-all duration-300 ${isActive
                ? 'scale-110 ring-2 ring-[#fcd535]/40'
                : 'opacity-40 grayscale'
                }`}
              style={{
                backgroundColor: phase.bgAccent,
                borderColor: phase.borderAccent,
              }}
            >
              {renderIcon(phase.icon)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono font-bold uppercase tracking-wider block transition-colors"
                  style={{ color: isActive ? phase.accentColor : '#707a8a' }}
                >
                  FASE {phase.number} • {phase.time}
                </span>
              </div>
            </div>
          </div>

          {/* Step Indicator no topo do card */}
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono ${isActive ? 'text-[#929aa5]' : 'text-[#555e6b]'}`}>
              ETAPA:
            </span>
            <span className={`text-xs font-mono font-bold ${isActive ? 'text-[#fcd535]' : 'text-[#707a8a]'}`}>
              0{index + 1}/04
            </span>
          </div>
        </div>

        {/* Content Body com todas as informações completas */}
        <div className="pt-3 space-y-2.5">
          <div>
            <h4
              className={`font-extrabold tracking-tight uppercase transition-all ${isActive
                ? 'text-white text-lg sm:text-2xl'
                : 'text-[#707a8a] text-base sm:text-xl'
                }`}
            >
              {phase.title}
            </h4>
            <p
              className={`text-xs sm:text-sm font-mono mt-0.5 font-medium transition-colors ${isActive ? 'text-[#fcd535]' : 'text-[#707a8a]'
                }`}
            >
              {phase.subtitle}
            </p>
          </div>

          <p
            className={`text-xs sm:text-sm leading-relaxed max-w-4xl transition-colors ${isActive ? 'text-[#eaecef]' : 'text-[#707a8a]'
              }`}
          >
            {phase.desc}
          </p>

          {/* Lista Simples de Highlights */}
          <ul className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {phase.highlights.map((h, hIdx) => (
              <li
                key={hIdx}
                className={`flex items-center gap-2 transition-colors ${
                  isActive ? 'text-[#eaecef]' : 'text-[#707a8a]'
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'opacity-100' : 'opacity-40'}`}
                  style={{ color: isActive ? phase.accentColor : '#707a8a' }}
                />
                <span className="font-medium truncate">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

const ideathonPhases: IdeathonPhase[] = [
  {
    number: '01',
    time: '14H00 PONTUAL',
    title: 'Formação dos Squads Multidisciplinares',
    subtitle: 'Engenharia de Software, Ciência da Computação, Elétrica & Design',
    desc: 'Equipes multidisciplinares de 3 a 4 integrantes formadas no local ou pré-inscritas. Recomenda-se a mescla de cursos para cobrir programação, UX e viabilidade de negócio.',
    icon: 'users',
    accentColor: '#fcd535',
    bgAccent: 'rgba(252, 213, 53, 0.1)',
    borderAccent: 'rgba(252, 213, 53, 0.3)',
    tag: 'SQUAD BUILDING',
    bubbleLabel: 'ETAPA 01 • FORMAÇÃO DOS SQUADS',
    highlights: [
      'Squads de 3 a 4 estudantes',
      'Mesas dedicadas no Laboratório Maker',
      'Credenciamento presencial e identificação de squad',
    ],
  },
  {
    number: '02',
    time: '14H15',
    title: 'Briefing Executivo & Liberação das APIs',
    subtitle: 'Problema real de impacto acadêmico e tecnológico',
    desc: 'O desafio oficial é revelado na abertura pelos mentores da Incubadora Sprint. São liberados os critérios objetivos de avaliação, datasets e endpoints de teste.',
    icon: 'sparkles',
    accentColor: '#0ecb81',
    bgAccent: 'rgba(14, 203, 129, 0.1)',
    borderAccent: 'rgba(14, 203, 129, 0.3)',
    tag: 'PROBLEM BRIEFING',
    bubbleLabel: 'ETAPA 02 • BRIEFING & APIS',
    highlights: [
      'Briefing executivo com matriz de critérios',
      'APIs públicas e dados sintéticos disponibilizados',
      'Alinhamento com mentores da banca examinadora',
    ],
  },
  {
    number: '03',
    time: '14H15 ÀS 17H15',
    title: 'Sprint de Prototipação & Mentoria Técnica',
    subtitle: '3 horas de código extremo, arquitetura e refinamento',
    desc: 'Desenvolvimento intensivo com rodadas de mentoria técnica nas bancadas. Especialistas de nuvem, arquitetura de software e design orientam cada equipe rumo ao MVP.',
    icon: 'cpu',
    accentColor: '#f0b90b',
    bgAccent: 'rgba(240, 185, 11, 0.1)',
    borderAccent: 'rgba(240, 185, 11, 0.3)',
    tag: 'DEEP WORK SPRINT',
    bubbleLabel: 'ETAPA 03 • PROTOTIPAGEM & ARQUITETURA',
    highlights: [
      '2 rodadas de mentoria obrigatórias na mesa',
      'Salas de ideação com lousas e prototipagem rápida',
      'Ambiente dedicado para suporte aos squads',
    ],
  },
  {
    number: '04',
    time: '17H30',
    title: 'Pitch Final & Avaliação da Banca',
    subtitle: 'Apresentação no palco principal & banca avaliadora',
    desc: 'Cada squad tem 3 minutos cronometrados de pitch + 2 minutos de arguição da banca. A consagração dos vencedores e anúncio de bolsas acontece na sessão de encerramento.',
    icon: 'trophy',
    accentColor: '#fcd535',
    bgAccent: 'rgba(252, 213, 53, 0.12)',
    borderAccent: 'rgba(252, 213, 53, 0.4)',
    tag: 'DEMO DAY',
    bubbleLabel: 'ETAPA 04 • BANCA EXAMINADORA & DEMO',
    highlights: [
      'Pitch cronometrado no telão principal',
      'Certificado de Destaque Ideathon SECOMP 2026',
      'Vaga de pré-aceleração na Incubadora Sprint',
    ],
  },
];

export const IdeathonBadgesSection: React.FC = () => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Framer Motion useScroll atrelado ao container estendido do Ideathon
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Mapeia o scroll de forma suave com platôs dedicados para cada fase (01 a 04)
  // para que as fases 03 e 04 NUNCA sumam prematuramente
  const targetStep = useTransform(
    scrollYProgress,
    [0, 0.12, 0.32, 0.44, 0.64, 0.76, 0.92, 1.0],
    [0, 0, 1, 1, 2, 2, 3, 3]
  );

  // Mola física responsiva (criticamente amortecida) sem lag excessivo
  const smoothStep = useSpring(targetStep, {
    stiffness: 240,
    damping: 28,
    mass: 0.5,
  });

  // Sincroniza o índice da fase ativa perfeitamente com o passo atual
  useMotionValueEvent(smoothStep, 'change', (val) => {
    const nextIdx = Math.min(3, Math.max(0, Math.round(val)));
    if (nextIdx !== activePhaseIndex) {
      setActivePhaseIndex(nextIdx);
    }
  });

  // Pontos de ancoragem otimizados para clique direto nas abas F01 a F04
  const stagePlateaus = [0.06, 0.38, 0.70, 0.96];
  const handleStageClick = (idx: number) => {
    const el = containerRef.current;
    if (!el) return;
    const startY = el.offsetTop;
    const totalScrollable = el.offsetHeight - window.innerHeight;
    const targetY = startY + stagePlateaus[idx] * totalScrollable;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setActivePhaseIndex(idx);
  };

  const activePhase = ideathonPhases[activePhaseIndex];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return <Users className="w-5 h-5 text-[#fcd535]" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-[#0ecb81]" />;
      case 'cpu':
        return <Cpu className="w-5 h-5 text-[#f0b90b]" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-[#fcd535]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#fcd535]" />;
    }
  };

  return (
    <div
      ref={containerRef}
      id="ideathon"
      className="relative bg-[#0b0e11] w-full mt-24 sm:mt-36 lg:mt-44 pt-8"
      style={{ height: '420vh' }}
    >
      {/* Sticky Shell: Ancorado no topo abaixo da Navbar (top-16) com altura da tela e respiro generoso */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] w-full flex flex-col justify-between py-4 sm:py-6 overflow-hidden bg-[#0b0e11]">
        {/* Header da Seção Integrado & Sem F01-F04 */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 shrink-0 text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Ideathon Express
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2329] border border-[#2b3139] text-[11px] sm:text-xs font-mono text-[#fcd535]">
            <Sparkles className="w-3.5 h-3.5 text-[#fcd535]" />
            <span>QUARTA-FEIRA • 14H ÀS 18H</span>
          </div>
        </div>

        {/* ══ PALCO CILÍNDRICO FRONTAL COM BORDAS INFINITAS (Com Maior Distância) ══ */}
        <div
          className="relative w-full flex-grow flex items-center justify-center my-auto mt-6 sm:mt-10 py-4 overflow-visible"
          style={{
            perspective: '1000px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          {/* Linhas Laser Infinitas do Cilindro */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#2b3139] to-transparent pointer-events-none z-20" />
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#2b3139] to-transparent pointer-events-none z-20" />

          {/* Top Cylinder Horizon Occlusion Mask */}
          <div
            className="absolute -top-6 inset-x-0 h-16 z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, #0b0e11 30%, transparent)',
            }}
          />

          {/* Bottom Cylinder Horizon Occlusion Mask */}
          <div
            className="absolute -bottom-6 inset-x-0 h-16 z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(0deg, #0b0e11 30%, transparent)',
            }}
          />

          {/* Container onde os cards coexistem no Cilindro 3D Frontal com Bordas Infinitas */}
          <div
            className="relative w-full min-h-[300px] sm:min-h-[320px] flex items-center justify-center"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {ideathonPhases.map((phase, idx) => (
              <Card3D
                key={phase.number}
                phase={phase}
                index={idx}
                currentStep={smoothStep}
                isActive={activePhaseIndex === idx}
                onSelect={() => handleStageClick(idx)}
                renderIcon={renderIcon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const IdeathonSection = IdeathonBadgesSection;
