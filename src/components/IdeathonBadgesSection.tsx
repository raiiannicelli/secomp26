import React, { useState, useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  MotionValue,
} from 'framer-motion';
import {
  Sparkles,
  Check,
  Users,
  Cpu,
  Trophy,
} from 'lucide-react';

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
  // Posicionamento e rotação 3D simétrica (Flip no Eixo X)
  const transform = useTransform(currentStep, (cur) => {
    const delta = index - cur;

    // Rotação suave no eixo X: card ativo fica reto (0deg), os acima giram para trás (-35deg), os abaixo giram (+35deg)
    const rotateX = Math.max(-45, Math.min(45, delta * -35));

    // Deslocamento Y vertical adaptado para mobile vs desktop para evitar sobreposição em telas pequenas
    const stepDistance = typeof window !== 'undefined' && window.innerWidth < 640 ? 95 : 160;
    const y = delta * stepDistance;

    // Recuo em Z: card ativo vem para a frente (Z: 0), os inativos recuam para o fundo
    const z = -Math.abs(delta) * (typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 120);

    return `translate3d(0, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rotateX.toFixed(1)}deg)`;
  });

  const scale = useTransform(currentStep, (cur) => {
    const absDelta = Math.abs(index - cur);
    // Card ativo no centro em tamanho total (1.0), cards de trás encolhem para 0.75
    return Math.max(0.75, 1 - absDelta * 0.20);
  });

  const opacity = useTransform(currentStep, (cur) => {
    const absDelta = Math.abs(index - cur);
    // Card principal (absDelta < 0.2): 100% opaco
    // Cards de trás (absDelta >= 0.8): 25% de opacidade para contraste máximo
    if (absDelta < 0.2) return 1;
    return Math.max(0.20, 1 - absDelta * 0.80);
  });

  const filter = useTransform(currentStep, (cur) => {
    const absDelta = Math.abs(index - cur);
    if (absDelta < 0.2) return 'brightness(1) blur(0px)';
    // Reduz brilho dos secundários e aplica leve desfoque para reforçar a profundidade de campo
    const b = Math.max(0.25, 1 - absDelta * 0.65);
    const blur = Math.min(3, absDelta * 2.5);
    return `brightness(${b.toFixed(2)}) blur(${blur.toFixed(1)}px)`;
  });

  const zIndex = useTransform(currentStep, (cur) => {
    const absDelta = Math.abs(index - cur);
    // Garantir que o card mais próximo do centro (menor delta) fique no topo absoluto
    return Math.round(100 - absDelta * 20);
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
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
      }}

    >

      {/* Conteúdo Centralizado com Grid Responsivo */}
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-8 py-3 sm:py-5 flex flex-col justify-between relative z-10">
        {/* Header Bar do Card com Informações */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b transition-colors ${isActive ? 'border-[#2b3139]/80' : 'border-[#2b3139]/30'
            }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 bg-[#fcd535] transition-all duration-300" />
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono font-bold uppercase tracking-wider block transition-colors"
                  style={{ color: isActive ? phase.accentColor : '#8491a4ff' }}
                >
                  FASE {phase.number} • {phase.time}
                </span>
              </div>
            </div>
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
                className={`flex items-center gap-2 transition-colors ${isActive ? 'text-[#eaecef]' : 'text-[#707a8a]'
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
    time: 'QUA 14H00',
    title: 'Formação de equipes',
    subtitle: 'Engenharia de Software, Engenharia da Computação e ADS.',
    desc: 'Equipes de 3 a 4 pessoas, formadas na hora ou previamente inscritas no site. O aluno que não se inscreveu previamente deverá chorar por ter feito essa má escolha ou correr atrás de uma equipe e se inscrever.',
    icon: 'users',
    accentColor: '#fcd535',
    bgAccent: 'rgba(252, 213, 53, 0.1)',
    borderAccent: 'rgba(252, 213, 53, 0.3)',
    tag: 'SQUAD BUILDING',
    bubbleLabel: 'ETAPA 01 • FORMAÇÃO DOS SQUADS',
    highlights: [
      'Equipes de 3 a 4 estudantes',
      'Mesas dedicadas no hall UTFPR.',
      'Credenciamento presencial com crachá',
    ],
  },
  {
    number: '02',
    time: 'QUA 14H30',
    title: 'Definindo objetivos',
    subtitle: 'Problema real de impacto acadêmico e tecnológico',
    desc: 'O desafio oficial é revelado na abertura pelos mentores da Incubadora Sprint ou diretório acadêmico. Serão disponibilizados os critérios objetivos de avaliação, datasets e endpoints de fases do 0 ao Pitch.',
    icon: 'sparkles',
    accentColor: '#f0b90b',
    bgAccent: 'rgba(240, 185, 11, 0.1)',
    borderAccent: 'rgba(240, 185, 11, 0.3)',
    tag: 'PROBLEM BRIEFING',
    bubbleLabel: 'ETAPA 02 • BRIEFING & APIS',
    highlights: [
      'Briefing com matriz de critérios',
      'APIs públicas e dados disponibilizados',
      'Alinhamento com mentores da banca',
    ],
  },
  {
    number: '03',
    time: 'ATÉ SEXTA!',
    title: 'Sprint de Prototipação',
    subtitle: 'Desenvolvimento livre até a entrega final na sexta-feira.',
    desc: 'Desenvolvimento intensivo com rodadas de mentoria técnica nas bancadas. Especialistas de nuvem, arquitetura de software e design orientam cada equipe rumo ao MVP. Aproveite em paralelo a SECOMP2026.',
    icon: 'cpu',
    accentColor: '#f0b90b',
    bgAccent: 'rgba(240, 185, 11, 0.1)',
    borderAccent: 'rgba(240, 185, 11, 0.3)',
    tag: 'DEEP WORK SPRINT',
    bubbleLabel: 'ETAPA 03 • PROTOTIPAGEM & ARQUITETURA',
    highlights: [
      'Rodadas de mentoria técnica na mesa',
      'Salas de ideação rápida',
      'Ambiente dedicado para o time',
    ],
  },
  {
    number: '04',
    time: 'SEX 17H30',
    title: 'Final & Avaliação da Banca',
    subtitle: 'Apresentação no palco principal, banca avaliadora & premiação',
    desc: 'Cada squad tem 3 minutos cronometrados de pitch + 2 minutos de arguição da banca. A consagração dos vencedores e anúncio de premios acontece na sessão de encerramento.',
    icon: 'trophy',
    accentColor: '#fcd535',
    bgAccent: 'rgba(252, 213, 53, 0.12)',
    borderAccent: 'rgba(252, 213, 53, 0.4)',
    tag: 'DEMO DAY',
    bubbleLabel: 'ETAPA 04 • BANCA EXAMINADORA & DEMO',
    highlights: [
      'Pitch cronometrado no telão principal',
      'Certificado SECOMP2026',
      'Premiação de talentos',
    ],
  },
];

export interface IdeathonBadgesSectionProps {
  onOpenRegisterModal?: () => void;
}

export const IdeathonBadgesSection: React.FC<IdeathonBadgesSectionProps> = ({ onOpenRegisterModal }) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Framer Motion useScroll atrelado ao container estendido do Ideathon
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Mapeia o progresso bruto para o índice da fase ativada
  const rawStep = useTransform(
    scrollYProgress,
    [0, 0.22, 0.52, 0.82, 1.0],
    [0, 1, 2, 3, 3]
  );

  // Força a snap estrita nos inteiros [0, 1, 2, 3] sem permitir paradas intermediárias decimais
  const targetStep = useTransform(rawStep, (v) => Math.round(v));

  // Mola física de alta rigidez e amortecimento rápido para encaixe imediato e preciso no centro
  const smoothStep = useSpring(targetStep, {
    stiffness: 380,
    damping: 38,
    mass: 0.3,
  });

  // Sincroniza o índice da fase ativa perfeitamente com o passo atual
  useMotionValueEvent(smoothStep, 'change', (val) => {
    const nextIdx = Math.min(3, Math.max(0, Math.round(val)));
    if (nextIdx !== activePhaseIndex) {
      setActivePhaseIndex(nextIdx);
    }
  });

  // Pontos de ancoragem otimizados para clique direto nas abas F01 a F04
  const stagePlateaus = [0.05, 0.32, 0.62, 0.93];
  const handleStageClick = (idx: number) => {
    const el = containerRef.current;
    if (!el) return;
    const startY = el.offsetTop;
    const totalScrollable = el.offsetHeight - window.innerHeight;
    const targetY = startY + stagePlateaus[idx] * totalScrollable;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setActivePhaseIndex(idx);
  };

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
      className="relative bg-[#0b0e11] w-full mt-16 sm:mt-36 lg:mt-44 pt-6 sm:pt-8 h-[250vh] sm:h-[420vh]"
    >
      {/* Sticky Shell: Ancorado no topo abaixo da Navbar (top-16) com altura da tela e respiro generoso */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] w-full flex flex-col justify-between py-4 sm:py-6 overflow-hidden bg-[#0b0e11]">
        {/* Header da Seção Integrado & Navegador Magnético das 4 Fases */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 shrink-0 text-center space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Ideathon Express
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-[11px] sm:text-xs font-mono text-[#fcd535]">
              MARATONA DA INOVAÇÃO
            </span>
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

        {/* Indicador Flutuante Único de Mouse com Seta Animada */}
        <div className="shrink-0 flex justify-center items-center pb-2 z-30 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[#fcd535] text-xs font-mono">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-2"
            >
              {/* Ícone de Mouse Ilustrando Rolagem */}
              <svg className="w-4 h-4 text-[#fcd535]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="7" />
                <path d="M12 6v4" />
              </svg>
              {/* Seta animada indicando descida / navegação até o final */}
              <motion.div
                animate={{ y: [0, 3, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg className="w-3.5 h-3.5 text-[#fcd535]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const IdeathonSection = IdeathonBadgesSection;
