import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useMotionValue,
  AnimatePresence,
  MotionValue,
} from 'framer-motion';
import {
  CheckCircle2,
  Send,
  MapPin,
  MessageSquare,
  X,
  Building,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useUIStore, isUserAuthenticated } from '../stores/useUIStore';
import { CMSPartnerItem, CotaType } from '../stores/slices/cmsSlice';
import { AnimatedAIChat } from './ui/animated-ai-chat';

export type { CotaType };
export type Partner = CMSPartnerItem;

// 1. TO Brasil Logo
const ToBrasilLogo: React.FC<{ className?: string }> = ({ className = "h-20" }) => (
  <svg viewBox="0 0 320 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      <rect x="15" y="18" width="44" height="13" rx="3" fill="#fcd535" />
      <rect x="30" y="27" width="14" height="46" rx="3" fill="#fcd535" />
      <circle cx="86" cy="50" r="23" stroke="#fcd535" strokeWidth="11" />
      <circle cx="86" cy="50" r="7" fill="#fcd535" />
      <circle cx="102" cy="34" r="4.5" fill="#0ecb81" />
    </g>
    <text x="130" y="47" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="2">
      TO BRASIL
    </text>
    <text x="131" y="67" fill="#fcd535" fontSize="9.5" fontWeight="700" fontFamily="monospace" letterSpacing="3">
      INTELIGÊNCIA & DADOS
    </text>
  </svg>
);

// 2. ForLogic Logo
const ForLogicLogo: React.FC<{ className?: string }> = ({ className = "h-20" }) => (
  <svg viewBox="0 0 320 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="forlogic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ecb81" />
        <stop offset="100%" stopColor="#0ecb81" />
      </linearGradient>
    </defs>
    <g transform="translate(10, 14)">
      <path
        d="M28 6 C14 6, 6 18, 6 31 C6 44, 16 54, 28 54 C45 54, 52 36, 66 36 C75 36, 82 43, 82 50 C82 58, 74 63, 64 63"
        stroke="url(#forlogic-grad)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="28" cy="31" r="5" fill="#0ecb81" />
      <circle cx="66" cy="36" r="4.5" fill="#0ecb81" />
    </g>
    <text x="110" y="47" fill="#FFFFFF" fontSize="28" fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="-0.5">
      for<tspan fill="#0ecb81">logic</tspan>
    </text>
    <text x="111" y="67" fill="#929aa5" fontSize="9.5" fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="3">
      SOFTWARE & QUALIDADE
    </text>
  </svg>
);

// 3. TCS Logo
const TcsLogo: React.FC<{ className?: string }> = ({ className = "h-20" }) => (
  <svg viewBox="0 0 320 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="tcs-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fcd535" />
        <stop offset="100%" stopColor="#f0b90b" />
      </linearGradient>
    </defs>
    <path
      d="M15 48 C25 22, 55 22, 70 48 C80 66, 100 66, 110 48"
      stroke="url(#tcs-grad)"
      strokeWidth="7"
      strokeLinecap="round"
      fill="none"
    />
    <text x="126" y="47" fill="#FFFFFF" fontSize="33" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="-0.5">
      tcs
    </text>
    <circle cx="178" cy="40" r="3.5" fill="#fcd535" />
    <text x="127" y="66" fill="#fcd535" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="1.5">
      TATA CONSULTANCY SERVICES
    </text>
  </svg>
);

// 4. CyberGuard Logo
const CyberGuardLogo: React.FC<{ className?: string }> = ({ className = "h-20" }) => (
  <svg viewBox="0 0 320 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="cg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f6465d" />
        <stop offset="100%" stopColor="#f6465d" />
      </linearGradient>
    </defs>
    <g transform="translate(16, 12)">
      <polygon
        points="38,5 68,22 68,50 38,67 8,50 8,22"
        fill="rgba(246, 70, 93, 0.14)"
        stroke="url(#cg-grad)"
        strokeWidth="3.5"
      />
      <circle cx="38" cy="36" r="11" stroke="#f6465d" strokeWidth="2.5" fill="#181a20" />
      <path d="M38 28 L38 44 M30 36 L46 36" stroke="#f6465d" strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="36" r="3" fill="#FFFFFF" />
    </g>
    <text x="105" y="47" fill="#FFFFFF" fontSize="25" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="1.5">
      CYBER<tspan fill="#f6465d">GUARD</tspan>
    </text>
    <text x="106" y="67" fill="#f6465d" fontSize="9" fontWeight="800" fontFamily="monospace" letterSpacing="3">
      RED TEAM & DEFENSE
    </text>
  </svg>
);

// 5. Incubadora Sprint UTFPR Logo
const SprintUtfprLogo: React.FC<{ className?: string }> = ({ className = "h-20" }) => (
  <svg viewBox="0 0 320 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="sprint-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f0b90b" />
        <stop offset="100%" stopColor="#fcd535" />
      </linearGradient>
    </defs>
    <g transform="translate(18, 14)">
      <path
        d="M36 4 C43 17, 52 34, 52 46 C52 58, 44 62, 36 62 C28 62, 20 58, 20 46 C20 34, 29 17, 36 4 Z"
        fill="url(#sprint-grad)"
      />
      <path d="M12 43 C19 43, 21 53, 17 62 C11 58, 9 50, 12 43 Z" fill="#f0b90b" />
      <path d="M60 43 C53 43, 51 53, 55 62 C61 58, 63 50, 60 43 Z" fill="#fcd535" />
      <circle cx="36" cy="30" r="5.5" fill="#181a20" />
    </g>
    <text x="100" y="46" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="2">
      SPRINT
    </text>
    <text x="101" y="66" fill="#fcd535" fontSize="8.5" fontWeight="700" fontFamily="monospace" letterSpacing="1.8">
      INCUBADORA DE INOVAÇÃO • UTFPR
    </text>
  </svg>
);

// 6. Sebrae Paraná Logo
const SebraePrLogo: React.FC<{ className?: string }> = ({ className = "h-20" }) => (
  <svg viewBox="0 0 320 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="sebrae-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ecb81" />
        <stop offset="100%" stopColor="#0ecb81" />
      </linearGradient>
    </defs>
    <g transform="translate(12, 16)">
      <polygon points="12,46 36,12 48,27 24,58" fill="url(#sebrae-grad)" />
      <polygon points="36,12 62,12t 74,27 48,27" fill="#fcd535" />
      <polygon points="48,27 74,27 62,46 36,46" fill="#0ecb81" />
      <polygon points="24,58 48,27 62,46 38,58" fill="#0ecb81" />
    </g>
    <text x="102" y="47" fill="#FFFFFF" fontSize="28" fontWeight="900" fontFamily="system-ui, sans-serif" fontStyle="italic" letterSpacing="1">
      SEBRAE
    </text>
    <text x="104" y="66" fill="#0ecb81" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="2.5">
      PARANÁ
    </text>
  </svg>
);

export const partners: Partner[] = [
  {
    id: 'to-brasil',
    name: 'TO Brasil',
    category: 'Inteligência & Big Data',
    cota: 'OURO',
    cotaLabel: 'Cota Ouro',
    cotaIcon: 'OURO',
    cotaColor: '#fcd535',
    badgeColor: 'bg-[#fcd535]/15 text-[#fcd535] border-[#fcd535]/50',
    tagline: 'Inteligência Analítica, Big Data & Engenharia de Dados',
    description: 'Líder nacional em arquitetura corporativa de analytics e dados, patrocinadora máster das trilhas de IA da SECOMP.',
    benefits: [
      'Keynote Magna no Palco Principal da SECOMP',
      'Oferecimento de 2 Minicursos Práticos de Engenharia de Dados',
      'Bancada VIP de Recrutamento na Roda de Talentos',
      'Divulgação prioritária em crachás, passaportes e telões',
    ],
    tags: ['Analytics Corporativo', 'Engenharia de Dados', 'Minicursos Práticos'],
    websiteUrl: 'https://www.tobrasil.com.br',
    orderIndex: 0,
  },
  {
    id: 'forlogic',
    name: 'ForLogic Software',
    category: 'Qualidade & SaaS',
    cota: 'PRATA',
    cotaLabel: 'Cota Prata',
    cotaIcon: 'PRATA',
    cotaColor: '#eaecef',
    badgeColor: 'bg-[#eaecef]/15 text-[#eaecef] border-[#eaecef]/40',
    tagline: 'Qualidade de Software, Governança Ágil & Plataformas SaaS',
    description: 'Pioneira em soluções de gestão da qualidade e software corporativo, com tradição contínua na contratação de talentos da UTFPR.',
    benefits: [
      'Estande Corporativo no Saguão Maker',
      'Mentoria Técnica Oficial nos Squads do Ideathon Express',
      'Bancada exclusiva de entrevistas rápidas na Roda de Talentos',
      'Inserção de marca no Passaporte Universitário',
    ],
    tags: ['Qualidade de Software', 'Recrutamento Ativo', 'SaaS de Alta Escala'],
    websiteUrl: 'https://forlogic.net',
    orderIndex: 1,
  },
  {
    id: 'tcs',
    name: 'TCS (Tata Consultancy)',
    category: 'Soluções Globais & Cloud',
    cota: 'OURO',
    cotaLabel: 'Cota Ouro',
    cotaIcon: 'OURO',
    cotaColor: '#fcd535',
    badgeColor: 'bg-[#fcd535]/15 text-[#fcd535] border-[#fcd535]/50',
    tagline: 'Líder Global em Transformação Digital e Nuvem',
    description: 'Multinacional presente em mais de 50 países, conectando estudantes da UTFPR a oportunidades globais e estágios internacionais de nuvem.',
    benefits: [
      'Palestra Internacional sobre Tendências de Carreira Big Tech',
      'Trilha de Certificação e Laboratório Cloud & DevOps',
      'Slots prioritários de contratação para formandos',
      'Naming rights de um dos laboratórios temáticos da SECOMP',
    ],
    tags: ['Carreira Global Big Tech', 'Cloud Solutions', 'Estágio Internacional'],
    websiteUrl: 'https://www.tcs.com',
    orderIndex: 2,
  },
  {
    id: 'cyberguard',
    name: 'CyberGuard Security',
    category: 'Cibersegurança & Red Team',
    cota: 'BRONZE',
    cotaLabel: 'Cota Bronze',
    cotaIcon: 'BRONZE',
    cotaColor: '#f0b90b',
    badgeColor: 'bg-[#f0b90b]/15 text-[#f0b90b] border-[#f0b90b]/40',
    tagline: 'Segurança Ofensiva, Red Team & Defesa Crítica',
    description: 'Especialistas em proteção de infraestruturas críticas e cibersegurança avançada, operando as bancadas de desafios práticos.',
    benefits: [
      'Bancada de WarGame & Simulação de Invasão Red Team',
      'Mentoria técnica especializada em segurança da informação',
      'Vagas de estágio técnico em segurança de aplicações',
      'Logotipo no media kit oficial e certificados de minicursos',
    ],
    tags: ['Red Team & Defesa', 'Infraestrutura Crítica', 'Bancadas Práticas'],
    websiteUrl: 'https://cyberguard.security',
    orderIndex: 3,
  },
  {
    id: 'incubadora-sprint',
    name: 'Incubadora Sprint UTFPR',
    category: 'Inovação & Startups',
    cota: 'PARCEIRO',
    cotaLabel: 'Parceiro Institucional',
    cotaIcon: 'INSTITUCIONAL',
    cotaColor: '#ffffff',
    badgeColor: 'bg-white/15 text-white border-white/40',
    tagline: 'Agência de Inovação & Incubação de Projetos UTFPR',
    description: 'Aceleradora oficial do Câmpus Cornélio Procópio, articulando os desafios do mercado acadêmico e as premiações do Ideathon Express.',
    benefits: [
      'Curadoria técnica e banca examinadora do Ideathon Express',
      'Vagas de pré-aceleração para os 3 squads finalistas',
      'Mentoria contínua de modelagem de negócio e captação de editais',
      'Integração direta com o ecossistema regional de startups',
    ],
    tags: ['Incubação de Startups', 'Mentoria Ideathon', 'Aceleração UTFPR'],
    websiteUrl: 'https://sprint.utfpr.edu.br',
    orderIndex: 4,
  },
  {
    id: 'sebrae-pr',
    name: 'Sebrae Paraná',
    category: 'Fomento Empreendedor',
    cota: 'EXPOSITOR',
    cotaLabel: 'Expositor & Fomento',
    cotaIcon: 'ECOSSISTEMA',
    cotaColor: '#0ecb81',
    badgeColor: 'bg-[#0ecb81]/15 text-[#0ecb81] border-[#0ecb81]/40',
    tagline: 'Fomento ao Empreendedorismo e Novos Negócios',
    description: 'Instituição líder no apoio e fortalecimento de novos negócios inovadores, integrando a banca oficial de jurados do Shark Tank UTFPR.',
    benefits: [
      'Composição da banca oficial de jurados do Shark Tank',
      'Estande de atendimento e consultorias express na Feira da Lua',
      'Acesso facilitado aos editais de inovação e bolsas Sebrae',
      'Workshops práticos de validação e pitch para empreendedores',
    ],
    tags: ['Banca Shark Tank', 'Consultoria Empresarial', 'Fomento a Projetos'],
    websiteUrl: 'https://sebraepr.com.br',
    orderIndex: 5,
  },
];

// Componente de Canvas 60fps para o Túnel Sci-Fi de Sucção / Warp Speed Streamlines
interface WarpTunnelCanvasProps {
  scrollStep: MotionValue<number>;
}

const WarpTunnelCanvas: React.FC<WarpTunnelCanvasProps> = ({ scrollStep }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let isUserScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const onUserScroll = () => {
      isUserScrolling = true;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isUserScrolling = false;
      }, 300);
    };

    window.addEventListener('scroll', onUserScroll, { passive: true });
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });

    const numStreaks = 75;
    interface Streak {
      angle: number;
      dist: number;
      speed: number;
      length: number;
      size: number;
      alpha: number;
      swirl: number;
    }

    const streaks: Streak[] = [];
    for (let i = 0; i < numStreaks; i++) {
      streaks.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random(),
        speed: 0.006 + Math.random() * 0.012,
        length: 20 + Math.random() * 45,
        size: 0.8 + Math.random() * 0.8,
        alpha: 0.03 + Math.random() * 0.07,
        swirl: (Math.random() - 0.5) * 0.003,
      });
    }

    let prevStep = scrollStep.get();
    let scrollActivity = 0;

    const render = () => {
      const currentStepVal = scrollStep.get();
      const stepDiff = Math.abs(currentStepVal - prevStep);
      prevStep = currentStepVal;

      const isMoving = stepDiff > 0.0003 || isUserScrolling;
      const targetActivity = isMoving ? 1 : 0;
      scrollActivity = scrollActivity * 0.88 + targetActivity * 0.12;

      if (scrollActivity < 0.008) {
        ctx.clearRect(0, 0, width, height);
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      const warpSpeed = Math.max(1, stepDiff * 90) * scrollActivity;

      streaks.forEach((streak) => {
        streak.dist += streak.speed * warpSpeed;
        streak.angle += streak.swirl * warpSpeed;

        if (streak.dist > 1) {
          streak.dist = 0.03;
          streak.angle = Math.random() * Math.PI * 2;
        }

        const r1 = Math.pow(streak.dist, 1.9) * maxDist;
        const streakLen = streak.length * Math.min(2.2, warpSpeed) * (0.35 + streak.dist);
        const r0 = Math.max(0, r1 - streakLen);

        const cosA = Math.cos(streak.angle);
        const sinA = Math.sin(streak.angle);

        const x0 = cx + cosA * r0;
        const y0 = cy + sinA * r0;
        const x1 = cx + cosA * r1;
        const y1 = cy + sinA * r1;

        const dynamicAlpha = Math.min(
          0.07,
          streak.alpha * Math.sin(streak.dist * Math.PI) * scrollActivity
        );

        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, `rgba(0, 225, 255, ${dynamicAlpha.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = grad;
        ctx.lineWidth = streak.size * (0.6 + streak.dist * 0.4);
        ctx.stroke();
      });

      const centralAlpha = Math.min(0.04, 0.04 * scrollActivity);
      const centralGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
      centralGlow.addColorStop(0, `rgba(0, 225, 255, ${centralAlpha.toFixed(3)})`);
      centralGlow.addColorStop(0.4, `rgba(0, 225, 255, ${(centralAlpha * 0.25).toFixed(3)})`);
      centralGlow.addColorStop(1, 'rgba(0, 225, 255, 0)');
      ctx.fillStyle = centralGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', onUserScroll);
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
      cancelAnimationFrame(animId);
    };
  }, [scrollStep]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

// Componente de Projeção em Profundidade 3D dos Banners no Túnel Holográfico
interface TunnelLogo3DProps {
  partner: Partner;
  index: number;
  currentStep: MotionValue<number>;
  isActive: boolean;
  onOpenModal: (partner: Partner) => void;
  renderLogo: (id: string, className?: string) => React.ReactNode;
}

const TunnelLogo3D: React.FC<TunnelLogo3DProps> = ({
  partner,
  index,
  currentStep,
  isActive,
  onOpenModal,
  renderLogo,
}) => {
  // Projeção 3D ao longo do Eixo Z (Túnel Sci-Fi)
  const transform = useTransform(currentStep, (cur) => {
    const delta = index - cur;

    if (delta >= 0) {
      const z = -delta * 650;
      const y = Math.sin(delta * 1.2) * 15;
      return `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px)`;
    } else {
      const z = -delta * 380;
      const y = -delta * 20;
      return `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px)`;
    }
  });

  const scale = useTransform(currentStep, (cur) => {
    const delta = index - cur;
    if (delta >= 0) {
      return Math.max(0.25, 2.0 - delta * 0.9);
    } else {
      return 2.0 + Math.abs(delta) * 0.9;
    }
  });

  const opacity = useTransform(currentStep, (cur) => {
    const delta = index - cur;
    if (delta > 2.2) return 0;
    if (delta >= 0) {
      if (delta < 0.3) return 1;
      return Math.max(0.1, 1 - delta * 0.45);
    } else {
      return Math.max(0, 1 - Math.abs(delta) * 1.8);
    }
  });

  const filter = useTransform(currentStep, (cur) => {
    const delta = Math.abs(index - cur);
    const brightness = Math.max(0.3, 1 - delta * 0.35);
    return `brightness(${brightness.toFixed(2)})`;
  });

  const zIndex = useTransform(currentStep, (cur) => {
    const delta = Math.abs(index - cur);
    return Math.round(50 - delta * 12);
  });

  return (
    <motion.div
      style={{
        position: 'absolute',
        transform,
        scale,
        opacity,
        filter,
        zIndex,
        transformStyle: 'preserve-3d',
        transformOrigin: '50% 50%',
      }}
      className="select-none flex flex-col items-center justify-center p-4 pointer-events-none"
    >
      <div
        role="button"
        tabIndex={isActive ? 0 : -1}
        aria-label={`Ver detalhes da cota de ${partner.name}`}
        onClick={() => isActive && onOpenModal(partner)}
        onKeyDown={(e) => {
          if (isActive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onOpenModal(partner);
          }
        }}
        className={`relative flex flex-col items-center justify-center transition-transform duration-300 ${isActive ? 'pointer-events-auto cursor-pointer group hover:scale-105 focus:outline-none' : ''
          }`}
      >
        <motion.div
          animate={{
            y: isActive ? [0, -10, 0] : [0, -3, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative flex flex-col items-center justify-center"
        >
          <div
            className={`transition-all duration-200 flex items-center justify-center ${isActive
              ? 'opacity-100 drop-shadow-[0_0_30px_rgba(0,225,255,0.85)]'
              : 'grayscale opacity-40'
              }`}
          >
            {renderLogo(
              partner.id,
              'w-52 sm:w-80 md:w-[480px] h-16 sm:h-24 md:h-32 object-contain pointer-events-none'
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface SpaceshipFlybyProps {
  progress: MotionValue<number>;
  onExplode?: () => void;
}

export const SpaceshipFlyby: React.FC<SpaceshipFlybyProps> = ({ progress }) => {
  // Trajetória cinemática com mergulho 3D e colisão direta na TELA DO USUÁRIO
  const shipX = useTransform(
    progress,
    [0, 0.1, 0.2, 0.25, 0.28],
    ['48vw', '18vw', '-4vw', '-1vw', '0vw']
  );

  const shipY = useTransform(
    progress,
    [0, 0.1, 0.2, 0.25, 0.28],
    ['30vh', '-6vh', '-10vh', '-2vh', '0vh']
  );

  // Aumenta drasticamente de tamanho no eixo Z vindo em direção à lente da tela do usuário
  const shipScale = useTransform(
    progress,
    [0, 0.1, 0.2, 0.26, 0.28],
    [0.4, 1.2, 2.8, 5.5, 8.5]
  );

  const shipOpacity = useTransform(
    progress,
    [0, 0.03, 0.25, 0.27, 0.28],
    [0, 1, 1, 1, 0]
  );

  // Tremor e inclinação de colisão física ao se chocar contra o vidro da tela
  const shipRotateZ = useTransform(
    progress,
    [0, 0.1, 0.2, 0.25, 0.27, 0.28],
    [-18, -6, 14, -28, 35, 0]
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex items-center justify-center">
      <motion.div
        style={{
          x: shipX,
          y: shipY,
          scale: shipScale,
          rotateZ: shipRotateZ,
          opacity: shipOpacity,
          perspective: 1400,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-[280px] sm:w-[360px] md:w-[440px] lg:w-[500px] flex items-center justify-center"
      >
        {/* Propulsor e aura de impacto iminente na tela */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.0,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-56 h-56 bg-gradient-to-t from-cyan-400 via-amber-400 to-transparent rounded-full blur-3xl pointer-events-none"
        />

        <img
          src="/spaceship.png?v=20260925"
          alt="Espaçonave 3D Cósmica"
          className="w-full h-auto object-contain select-none drop-shadow-[0_30px_70px_rgba(0,225,255,0.8)] filter contrast-125 brightness-115"
          draggable={false}
        />
      </motion.div>
    </div>
  );
};

// Componente da Cortina de Fumaça Volumétrica pós-colisão
const SmokeCurtainEffect: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 pointer-events-none z-35 flex items-center justify-center overflow-hidden"
        >
          {/* Cortina volumétrica central de fumaça preenchendo o palco */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 120 }}
            animate={{ scale: [0.8, 1.6, 2.4], opacity: [0, 0.95, 0.8, 0], y: [120, 0, -60] }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#161c24]/90 to-transparent blur-3xl backdrop-blur-md"
          />

          {/* Cortina de Fumaça vindo da esquerda */}
          <motion.div
            initial={{ x: '-80%', opacity: 0 }}
            animate={{ x: ['-80%', '0%', '30%'], opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute top-0 bottom-0 left-0 w-4/5 bg-[#121820]/90 blur-3xl rounded-r-full"
          />

          {/* Cortina de Fumaça vindo da direita */}
          <motion.div
            initial={{ x: '80%', opacity: 0 }}
            animate={{ x: ['80%', '0%', '-30%'], opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute top-0 bottom-0 right-0 w-4/5 bg-[#171f2a]/90 blur-3xl rounded-l-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente do Efeito de Impacto Direto na Tela (Trincado de Vidro + Estilhaços + Explosão Cinemática)
const ExplosionEffect: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{
            opacity: 1,
            x: [-28, 28, -20, 20, -12, 12, -6, 6, 0],
            y: [-24, 24, -18, 18, -10, 10, -4, 4, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
        >
          {/* 1. Flash de Impacto Direto na Lente da Tela */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 bg-gradient-to-r from-amber-100 via-white to-red-600 z-50 mix-blend-screen"
          />

          {/* 2. VIDRO TRINCADO DA TELA DO USUÁRIO (Glass Crack Impact Lines) */}
          <motion.div
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: [0.2, 1.3, 1.8], opacity: [1, 0.9, 0] }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-45"
          >
            <svg viewBox="0 0 800 600" className="w-full h-full stroke-cyan-300 drop-shadow-[0_0_15px_#00f0ff] opacity-90">
              {/* Linhas de fratura em rede da tela trincada */}
              <g strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 400 300 L 150 50 M 400 300 L 650 80 M 400 300 L 720 420 M 400 300 L 80 520 M 400 300 L 380 580 M 400 300 L 580 550 M 400 300 L 50 250 M 400 300 L 750 200" />
                <path d="M 320 220 L 480 200 L 520 360 L 300 380 Z" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 220 150 L 580 130 L 620 480 L 180 460 Z" strokeWidth="1" strokeDasharray="6 6" />
              </g>
            </svg>
          </motion.div>

          {/* 3. Bola de Fogo Principal Cinemática (Fireball Core) */}
          <motion.div
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: [0.1, 4.8, 6.2], opacity: [1, 0.95, 0] }}
            transition={{ duration: 0.88, ease: 'easeOut' }}
            className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-yellow-200 via-orange-500 to-red-700 blur-sm shadow-[0_0_140px_#ff4500] mix-blend-screen"
          />

          {/* 4. Núcleo Secundário de Calor Extremo (White Hot Core) */}
          <motion.div
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute w-56 h-56 rounded-full bg-gradient-to-r from-white via-amber-300 to-orange-500 shadow-[0_0_100px_#ffffff]"
          />

          {/* 5. Nuvem de Fumaça Escura Volumétrica */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0.95 }}
            animate={{ scale: 6.5, opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute w-96 h-96 rounded-full bg-[#160d0b]/85 blur-2xl mix-blend-multiply"
          />

          {/* 6. Onda de Choque Blast Wave Concentrada */}
          <motion.div
            initial={{ scale: 0.1, opacity: 1, borderWidth: '32px' }}
            animate={{ scale: 5.8, opacity: 0, borderWidth: '1px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute w-80 h-80 rounded-full border-orange-500 shadow-[0_0_120px_#ff6600]"
          />

          {/* 7. Estilhaços de Vidro Translucidos Flying Outward */}
          {Array.from({ length: 30 }).map((_, i) => {
            const angle = (i / 30) * Math.PI * 2;
            const distance = 300 + Math.random() * 400;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            return (
              <motion.div
                key={`glass-${i}`}
                initial={{ x: 0, y: 0, scale: 2.0, opacity: 1, rotate: 0 }}
                animate={{
                  x: tx,
                  y: ty,
                  scale: 0,
                  opacity: 0,
                  rotate: Math.random() * 1080,
                }}
                transition={{
                  duration: 0.7 + Math.random() * 0.4,
                  ease: 'easeOut',
                }}
                className="absolute w-4 h-6 bg-cyan-200/60 border border-white/80 backdrop-blur-sm shadow-[0_0_15px_#00f0ff] transform rotate-45"
              />
            );
          })}

          {/* 8. Fragmentos da Nave / Brasas e Estilhaços Incandescentes */}
          {Array.from({ length: 50 }).map((_, i) => {
            const angle = (i / 50) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
            const distance = 320 + Math.random() * 420;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const isRed = i % 3 === 0;
            const isYellow = i % 3 === 1;

            return (
              <motion.div
                key={`ember-${i}`}
                initial={{ x: 0, y: 0, scale: 2.4, opacity: 1, rotate: 0 }}
                animate={{
                  x: tx,
                  y: ty,
                  scale: 0,
                  opacity: 0,
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 0.6 + Math.random() * 0.45,
                  ease: 'easeOut',
                }}
                className={`absolute rounded-sm ${isRed
                  ? 'w-4 h-4 bg-red-600 shadow-[0_0_25px_#ff0000]'
                  : isYellow
                    ? 'w-3 h-3 bg-yellow-400 shadow-[0_0_25px_#ffea00]'
                    : 'w-3.5 h-3.5 bg-orange-500 shadow-[0_0_25px_#ff6600]'
                  }`}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente de Palco Central Industrial de Destaque com Carrossel Plano Elegante
interface PartnersRunway3DStageProps {
  partners: Partner[];
  renderLogo: (partnerId: string, className?: string) => React.ReactNode;
  onOpenModal: (partner: Partner) => void;
}

const PartnersRunway3DStage: React.FC<PartnersRunway3DStageProps> = ({
  partners,
  renderLogo,
  onOpenModal,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const basePartners = React.useMemo(() => {
    return Array.from(new Map(partners.map((p) => [p.id, p])).values());
  }, [partners]);

  const currentPartner = basePartners[activeIndex] || basePartners[0];

  // Alternância automática de 3 segundos por parceiro (TV, monitor, tablet e celular)
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % basePartners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, basePartners.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex flex-col justify-between overflow-hidden select-none p-4 sm:p-6"
    >
      {/* 1. IMAGEM DE FUNDO DA SALA DA NAVE (/image.png) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/image.png?v=20260925"
          alt="Ponte de Comando SECOMP"
          className="w-full h-full object-cover object-center filter brightness-75 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090c]/90 via-[#07090c]/75 to-[#07090c]/95" />
      </div>

      {/* 2. Header Limpo Executivo */}
      <div className="w-full max-w-7xl mx-auto z-20 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
            Parceiros <span className="text-[#fcd535]">Oficiais</span>
          </h2>
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono text-[#fcd535]">
            ECOSSISTEMA DE INOVAÇÃO
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : basePartners.length - 1))}
              className="w-9 h-9 rounded-lg bg-[#181a20]/90 hover:bg-[#2b3139] hover:border-[#fcd535] text-white flex items-center justify-center transition-colors"
              aria-label="Anterior"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev < basePartners.length - 1 ? prev + 1 : 0))}
              className="w-9 h-9 rounded-lg bg-[#181a20]/90 hover:bg-[#2b3139] hover:border-[#fcd535] text-white flex items-center justify-center transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. PALCO CENTRAL DE DESTAQUE PREMIUM (DESIGN INDUSTRIAL PLANO E NÍTIDO) */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full mx-auto my-auto z-20"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPartner.id}
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col justify-center items-center sm:p-10 flex flex-col md:flex-row items-center relative overflow-hidden"
          >

            {/* Container da Logo com Fundo Escuro Sólido Limpo */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 rounded-2xl shadow-inner shrink-0 min-h-[180px] sm:min-h-[220px]">
              {renderLogo(
                currentPartner.id,
                'w-full max-h-28 object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]'
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. BARRA ORBITAL DE MINIATURAS E SELEÇÃO RÁPIDA (CARROSSEL PLANO) */}
      <div className="w-full max-w-5xl mx-auto z-20 pb-2">
        <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 px-4 no-scrollbar">
          {basePartners.map((partner, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={partner.id}
              >
                <div className="w-20 h-20 flex items-center justify-center pointer-events-none">
                  {renderLogo(partner.id, 'max-h-15 max-w-full object-contain')}
                </div>

              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export const SponsorsMediaKitSection: React.FC = () => {
  const partners = useUIStore((state) => state.partners);
  const user = useUIStore((state) => state.user);
  const authenticated = isUserAuthenticated(user);

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // FAQ state
  const [activeFaqId, setActiveFaqId] = useState<string>('faq-cotas');

  // Framer Motion useScroll atrelado ao container estendido
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 25,
    mass: 0.5,
  });

  // A nave voa até scroll 0.45. Ao exceder esse limite (0.45+), o usuário entra na nave/sala sci-fi com os banners parceiros
  const isInsideShip = useTransform(smoothProgress, (v) => v >= 0.45);
  const [hasEnteredShip, setHasEnteredShip] = useState(false);

  useMotionValueEvent(smoothProgress, 'change', (v) => {
    if (v >= 0.45 && !hasEnteredShip) {
      setHasEnteredShip(true);
    } else if (v < 0.35 && hasEnteredShip) {
      setHasEnteredShip(false);
    }
  });

  // Mapeia o progresso do scroll (de 0.45 até 1.0) para navegar suavemente por cada parceiro
  const targetStep = useTransform(
    smoothProgress,
    [0.45, 1],
    [0, Math.max(0, partners.length - 1)]
  );

  const smoothStep = useSpring(targetStep, {
    stiffness: 240,
    damping: 28,
    mass: 0.5,
  });

  useMotionValueEvent(smoothStep, 'change', (val) => {
    if (!hasEnteredShip) return;
    const nextIdx = Math.min(partners.length - 1, Math.max(0, Math.round(val)));
    if (nextIdx !== activeIndex) {
      setActiveIndex(nextIdx);
    }
  });

  const handleSelectPartner = (idx: number) => {
    if (!hasEnteredShip) setHasEnteredShip(true);
    setActiveIndex(idx);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasEnteredShip) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = activeIndex > 0 ? activeIndex - 1 : partners.length - 1;
          handleSelectPartner(prev);
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = activeIndex < partners.length - 1 ? activeIndex + 1 : 0;
          handleSelectPartner(next);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, partners.length, hasEnteredShip]);

  const renderLogo = (partnerId: string, className?: string) => {
    const customPartner = partners.find((p) => p.id === partnerId);
    if (customPartner?.logoUrl) {
      return (
        <div className={`${className || 'h-20'} flex items-center justify-center p-2`}>
          <img
            src={customPartner.logoUrl}
            alt={customPartner.name}
            className="max-h-20 max-w-[280px] w-auto h-auto object-contain"
          />
        </div>
      );
    }

    switch (partnerId) {
      case 'to-brasil':
        return <ToBrasilLogo className={className} />;
      case 'forlogic':
        return <ForLogicLogo className={className} />;
      case 'tcs':
        return <TcsLogo className={className} />;
      case 'cyberguard':
        return <CyberGuardLogo className={className} />;
      case 'incubadora-sprint':
        return <SprintUtfprLogo className={className} />;
      case 'sebrae-pr':
        return <SebraePrLogo className={className} />;
      default: {
        return (
          <div className={`${className || 'h-20'} flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-[#181a20] border border-[#2b3139]`}>
            <Building className="w-8 h-8 text-[#fcd535]" />
            <div className="text-left">
              <div className="text-xl font-black text-white uppercase tracking-wider">{customPartner?.name || 'PARCEIRO'}</div>
              <div className="text-[10px] font-mono text-[#fcd535] uppercase">{customPartner?.category || 'PATROCINADOR'}</div>
            </div>
          </div>
        );
      }
    }
  };

  const currentPartner = partners[activeIndex] || partners[0];

  return (
    <section id="patrocinadores" className="relative w-full bg-[#07090c] text-white">
      {/* ══ TRACK ESTENDIDO DE SCROLL ══ */}
      <div
        ref={containerRef}
        className="relative w-full pt-4 h-[220vh] sm:h-[350vh]"
      >
        {/* Sticky Shell: Mantém o palco visível enquanto o usuário navega */}
        <div className="sticky top-16 h-[calc(100vh-4rem)] w-full flex flex-col justify-between py-3 sm:py-5 overflow-hidden bg-[#07090c]">

          {/* ══ FASE 1: NAVE VOANDO ATÉ EXCEDER A TELA ══ */}
          <AnimatePresence>
            {!hasEnteredShip && (
              <motion.div
                key="flyby-stage"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none z-10"
              >
                {/* Warp Tunnel Canvas de Fundo */}
                <WarpTunnelCanvas scrollStep={smoothProgress} />

                {/* Header durante o voo da nave */}
                <div className="w-full max-w-4xl mx-auto px-4 text-center space-y-2 pt-4 sm:pt-6 z-20">
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                    Estação Espacial
                  </h2>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full text-[#fcd535] uppercase tracking-widest">
                    Navegação SECOMP 2026
                  </span>
                </div>

                {/* Trajetória da Nave Espacial */}
                <SpaceshipFlyby progress={smoothProgress} />

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
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══ FASE 2: ENTRADA NA NAVE / ESTAÇÃO SPATIAL + ESTEIRA 3D EM LOOPING CONTINUO DE PARCEIROS (ESTILO MENTORES) ══ */}
          <AnimatePresence>
            {hasEnteredShip && (
              <PartnersRunway3DStage
                partners={partners}
                renderLogo={renderLogo}
                onOpenModal={(partner) => {
                  // Pode abrir detalhes se desejado
                }}
              />
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ══ CANAL DE ATENDIMENTO E SUPORTE SECOMP (ANIMATED AI CHAT + FAQ) ══ */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div id="contato" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Coluna Esquerda: Animated AI Chat */}
            <div className="lg:col-span-6 w-full">
              <AnimatedAIChat />
            </div>

            {/* Coluna Direita:t FAQ Interativo Hook Sidebar */}
            <div className="lg:col-span-6 w-full">
              <div className="p-6 sm:p-10 rounded-3xl space-y-8">
                <div className="flex items-center justify-between border-b border-[#2b3139]/80 pb-4">
                  <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] text-[#929aa5] uppercase">
                    FAQ & DÚVIDAS FREQUENTES
                  </span>
                </div>

                <div className="space-y-1 relative">
                  {[
                    {
                      id: 'faq-cotas',
                      title: 'Como solicitar cotas de patrocínio corporativo?',
                      shortDesc:
                        'Selecione a cota desejada (Diamante, Ouro ou Prata) no formulário ao lado para receber o Media Kit executivo e a minuta contratual.',
                      category: 'Patrocínio',
                    },
                    {
                      id: 'faq-certificados',
                      title: 'Emissão de certificados e validação de horas complementares',
                      shortDesc:
                        'Os certificados oficiais de 30 horas são gerados automaticamente no Passaporte Digital após a validação dos carimbos OTT de presença.',
                      category: 'Certificados',
                    },
                    {
                      id: 'faq-ideathon',
                      title: 'Submissão de propostas para o Ideathon Express',
                      shortDesc:
                        'Envie o resumo da proposta e integrantes no comando /ideathon para análise prévia da banca de mentores convidados.',
                      category: 'Ideathon',
                    },
                    {
                      id: 'faq-prazo',
                      title: 'Qual o prazo de retorno da coordenação acadêmica?',
                      shortDesc:
                        'Todas as mensagens enviadas por participantes autenticados são respondidas em até 24 horas úteis pela comissão da UTFPR.',
                      category: 'Atendimento',
                    },
                    {
                      id: 'faq-imprensa',
                      title: 'Credenciamento de imprensa e convidados institucionais',
                      shortDesc:
                        'Envie sua solicitação informando seu veículo de mídia ou empresa parceira para emissão de crachá VIP.',
                      category: 'Institucional',
                    },
                  ].map((faq, index, arr) => {
                    const isActive = faq.id === activeFaqId;
                    const activeIndex = arr.findIndex((item) => item.id === activeFaqId);
                    const isAbove = index < activeIndex;
                    const isBelow = index > activeIndex;

                    return (
                      <div key={faq.id} className="relative flex items-stretch group">
                        <div className="relative w-8 sm:w-10 shrink-0 flex justify-start">
                          {isAbove && (
                            <div className="absolute left-2.5 top-0 bottom-0 w-0 border-l-2 border-dashed border-[#fcd535] transition-colors duration-300" />
                          )}

                          {isActive && (
                            <div className="absolute left-2.5 top-0 bottom-0 right-0 pointer-events-none">
                              <svg
                                className="w-full h-7 text-[#fcd535] stroke-current overflow-visible"
                                viewBox="0 0 32 28"
                                fill="none"
                              >
                                <path
                                  d="M 0 0 V 12 Q 0 20 8 20 H 26"
                                  strokeWidth="2"
                                  strokeDasharray="3 3"
                                  fill="none"
                                />
                              </svg>
                              <div className="absolute left-0 top-7 bottom-0 w-0 border-l-2 border-dashed border-[#2b3139]" />
                            </div>
                          )}

                          {isBelow && (
                            <div className="absolute left-2.5 top-0 bottom-0 w-0 border-l-2 border-dashed border-[#2b3139] transition-colors duration-300" />
                          )}
                        </div>

                        <div className="flex-grow py-2.5 pl-2">
                          <button
                            onClick={() => setActiveFaqId(faq.id)}
                            className="w-full text-left focus:outline-none flex flex-col items-start gap-1"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-sm sm:text-base font-medium transition-all duration-200 ${isActive
                                  ? 'text-white font-bold tracking-tight text-base sm:text-lg'
                                  : 'text-[#707a8a] hover:text-[#eaecef]'
                                  }`}
                              >
                                {faq.title}
                              </span>
                            </div>

                            <AnimatePresence initial={false}>
                              {isActive && (
                                <motion.div
                                  key="short-desc"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.22, ease: 'easeOut' }}
                                  className="overflow-hidden"
                                >
                                  <p className="pt-2 text-xs sm:text-sm text-[#929aa5] leading-relaxed font-sans line-clamp-2 max-w-xl">
                                    {faq.shortDesc}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsMediaKitSection;

