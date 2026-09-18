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
  Mail,
  CheckCircle2,
  Send,
  MapPin,
  MessageSquare,
  X,
  ShieldCheck,
} from 'lucide-react';

export type CotaType = 'OURO' | 'PRATA' | 'BRONZE' | 'PARCEIRO' | 'EXPOSITOR';

interface Partner {
  id: string;
  name: string;
  category: string;
  cota: CotaType;
  cotaLabel: string;
  cotaIcon: string;
  cotaColor: string;
  badgeColor: string;
  tagline: string;
  description: string;
  benefits: string[];
  tags: string[];
  websiteUrl: string;
}

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
      <polygon points="36,12 62,12 74,27 48,27" fill="#fcd535" />
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

    // Escuta eventos diretos de rolagem de tela para ativação reativa
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

    // Feixes suaves de luz / partículas do túnel (opacidade reduzida para conforto visual)
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
    let scrollActivity = 0; // 0 = inativo (parado), 1 = ativo (rolando)

    const render = () => {
      // Amostragem da variação do scrollStep
      const currentStepVal = scrollStep.get();
      const stepDiff = Math.abs(currentStepVal - prevStep);
      prevStep = currentStepVal;

      // O efeito só ativa quando houver scroll ativo ou movimento de tela
      const isMoving = stepDiff > 0.0003 || isUserScrolling;
      const targetActivity = isMoving ? 1 : 0;
      scrollActivity = scrollActivity * 0.88 + targetActivity * 0.12;

      // Se completamente parado e quase 0, limpa e economiza processamento
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

      // 1. Feixes de Luz Suaves / Raios de Sucção do Túnel (Warp Streamlines)
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

        // Opacidade atenuada e suave para não cansar a vista
        const dynamicAlpha = Math.min(
          0.07,
          streak.alpha * Math.sin(streak.dist * Math.PI) * scrollActivity
        );

        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, `rgba(255, 255, 255, ${dynamicAlpha.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = grad;
        ctx.lineWidth = streak.size * (0.6 + streak.dist * 0.4);
        ctx.stroke();
      });

      // 2. Brilho do Vórtice Central Suave e Acolhedor (sem ofuscamento)
      const centralAlpha = Math.min(0.04, 0.04 * scrollActivity);
      const centralGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
      centralGlow.addColorStop(0, `rgba(255, 255, 255, ${centralAlpha.toFixed(3)})`);
      centralGlow.addColorStop(0.4, `rgba(255, 255, 255, ${(centralAlpha * 0.25).toFixed(3)})`);
      centralGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
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
  // Projeção em Profundidade 3D ao longo do Eixo Z (Túnel Sci-Fi)
  const transform = useTransform(currentStep, (cur) => {
    const delta = index - cur;

    if (delta >= 0) {
      // Logos que estão se aproximando do fundo do túnel
      // Z negativo recua no espaço do túnel
      const z = -delta * 650;
      // Leve desvio vertical para efeito de profundidade dinâmica no túnel
      const y = Math.sin(delta * 1.2) * 15;
      return `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px)`;
    } else {
      // Logos que ultrapassaram a câmera (voam para frente e fora da tela)
      const z = -delta * 380;
      const y = -delta * 20;
      return `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px)`;
    }
  });

  // Escala: O logo atinge exatamente 2.0x no ponto focal do scroll (delta = 0)
  const scale = useTransform(currentStep, (cur) => {
    const delta = index - cur;
    if (delta >= 0) {
      // No centro (delta = 0) = 2.0x; no fundo do túnel (delta >= 2.5) diminui suavemente
      return Math.max(0.25, 2.0 - delta * 0.9);
    } else {
      // Quando ultrapassa a câmera, expande como se passasse ao lado do espectador
      return 2.0 + Math.abs(delta) * 0.9;
    }
  });

  // Opacidade com névoa volumétrica no túnel
  const opacity = useTransform(currentStep, (cur) => {
    const delta = index - cur;
    if (delta > 2.2) return 0;
    if (delta >= 0) {
      if (delta < 0.3) return 1;
      return Math.max(0.1, 1 - delta * 0.45);
    } else {
      // Desvanece rapidamente ao passar para trás da câmera
      return Math.max(0, 1 - Math.abs(delta) * 1.8);
    }
  });

  // Destaque de luminosidade no túnel sem desfoques difusos
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
      {/* Container Interativo do Logo Suspenso no Túnel */}
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
        {/* Flutuação Vertical do Logo Suspenso no Túnel */}
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
          {/* Projeção do Logo: 100% suspenso, nítido e sem clarão excessivo */}
          <div
            className={`transition-all duration-200 flex items-center justify-center ${isActive
              ? 'opacity-100'
              : 'grayscale opacity-40'
              }`}
          >
            {renderLogo(
              partner.id,
              'w-72 sm:w-96 md:w-[480px] h-20 sm:h-28 md:h-32 object-contain pointer-events-none'
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const SponsorsMediaKitSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPartnerForModal, setSelectedPartnerForModal] = useState<Partner | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Dúvida Geral');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Framer Motion useScroll atrelado ao container estendido do Túnel 3D
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Mapeia 1 scroll = 1 logotipo com platôs firmes, mantendo fixo até o último parceiro
  const targetStep = useTransform(
    scrollYProgress,
    [0, 0.04, 0.14, 0.20, 0.30, 0.36, 0.46, 0.52, 0.62, 0.68, 0.78, 0.84, 0.98, 1.0],
    [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5]
  );

  // Mola física responsiva (criticamente amortecida) para o movimento suave do túnel
  const smoothStep = useSpring(targetStep, {
    stiffness: 240,
    damping: 28,
    mass: 0.5,
  });

  // Sincroniza o parceiro ativo de 1 em 1
  useMotionValueEvent(smoothStep, 'change', (val) => {
    const nextIdx = Math.min(partners.length - 1, Math.max(0, Math.round(val)));
    if (nextIdx !== activeIndex) {
      setActiveIndex(nextIdx);
    }
  });

  // Pontos de ancoragem para salto suave nos dots
  const stagePlateaus = [0.04, 0.22, 0.38, 0.54, 0.70, 0.90];

  const handleSelectPartner = (idx: number) => {
    const el = containerRef.current;
    if (!el) {
      setActiveIndex(idx);
      return;
    }
    const startY = el.offsetTop;
    const totalScrollable = el.offsetHeight - window.innerHeight;
    const targetY = startY + stagePlateaus[idx] * totalScrollable;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setActiveIndex(idx);
  };

  // Suporte a teclado (Esc para fechar modal, Setas para avançar parceiro)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPartnerForModal) {
        setSelectedPartnerForModal(null);
        return;
      }

      if (!selectedPartnerForModal) {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, selectedPartnerForModal]);

  const renderLogo = (partnerId: string, className?: string) => {
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
      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 6000);
  };

  const currentPartner = partners[activeIndex];

  return (
    <section id="patrocinadores" className="relative bg-[#0b0e11] w-full">
      {/* ══ TRACK ESTENDIDO DE SCROLL EM TÚNEL (520vh) ══ */}
      <div
        ref={containerRef}
        className="relative w-full pt-4"
        style={{ height: '520vh' }}
      >
        {/* Sticky Shell: Ancorado no topo abaixo da Navbar (top-16) até o último parceiro */}
        <div className="sticky top-16 h-[calc(100vh-4rem)] w-full flex flex-col justify-between py-3 sm:py-5 overflow-hidden bg-[#0b0e11]">
          {/* Header da Seção Integrado & Clean */}
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 shrink-0 text-center space-y-1.5 z-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Parceiros Oficiais
            </h2>
            <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#fcd535]">
              {currentPartner?.cotaLabel}
            </p>
          </div>

          {/* ══ PALCO DO TÚNEL 3D EM PROFUNDIDADE (EIXO Z) ══ */}
          <div
            className="relative w-full flex-grow flex items-center justify-center my-auto overflow-hidden"
            style={{
              perspective: '1000px',
              perspectiveOrigin: '50% 50%',
            }}
          >
            {/* Warp Tunnel Canvas Dinâmico 60fps — Efeito de Sucção/Puxando no Túnel */}
            <WarpTunnelCanvas scrollStep={smoothStep} />

            {/* Linhas Laser do Horizonte do Túnel */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

            {/* Container onde os logos viajam em Profundidade no Eixo Z */}
            <div
              className="relative w-full h-[380px] sm:h-[450px] md:h-[480px] flex items-center justify-center overflow-visible"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {partners.map((partner, index) => (
                <TunnelLogo3D
                  key={partner.id}
                  partner={partner}
                  index={index}
                  currentStep={smoothStep}
                  isActive={activeIndex === index}
                  onOpenModal={(p) => setSelectedPartnerForModal(p)}
                  renderLogo={renderLogo}
                />
              ))}
            </div>
          </div>

          {/* ══ INDICADOR MINIMALISTA DE PROGRESSO 1 A 1 & COTAS (SEM CARDS) ══ */}
          <div className="w-full max-w-xl mx-auto px-4 shrink-0 relative z-30 pb-3 text-center space-y-2">
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#fcd535] uppercase tracking-wider">
                {currentPartner.cotaLabel}
              </span>
              <span className="text-[#2b3139]">•</span>
              <span className="text-xs font-mono font-bold text-white">
                {currentPartner.name}
              </span>
              <span className="text-[#2b3139]">•</span>
              <span className="text-[11px] font-mono text-[#fcd535] font-bold">
                0{activeIndex + 1}/06
              </span>
            </div>

            {/* Trilha de Navegação por Dots 1 a 1 */}
            <div className="flex items-center justify-center gap-2">
              {partners.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPartner(idx)}
                  aria-label={`Ir para ${p.name}`}
                  className={`transition-all duration-300 rounded-full ${activeIndex === idx
                    ? 'w-8 h-2 bg-[#fcd535]'
                    : 'w-2 h-2 bg-[#2b3139] hover:bg-[#707a8a]'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ CARD FLUTUANTE ACESSÍVEL (MODAL DE COTA VIA CLIQUE) ══ */}
      <AnimatePresence>
        {selectedPartnerForModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPartnerForModal(null)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Detalhes de ${selectedPartnerForModal.name}`}
              className="relative w-full max-w-lg rounded-2xl bg-[#1e2329] border border-[#2b3139] p-6 sm:p-8 space-y-6"
            >
              {/* Top Bar com Botão Fechar */}
              <div className="flex items-center justify-between border-b border-[#2b3139] pb-3">
                <span className="text-xs font-mono text-[#707a8a] uppercase tracking-wider">
                  Detalhes do Parceiro
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForModal(null)}
                  aria-label="Fechar detalhes"
                  className="p-1.5 rounded-lg text-[#707a8a] hover:text-white hover:bg-[#2b3139] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* No meio do card: Título (Nome), Subtítulo (Stack) e Descrição única em 1 bloco de texto */}
              <div className="space-y-3 py-1">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {selectedPartnerForModal.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-[#fcd535] font-semibold mt-1">
                    {selectedPartnerForModal.category} • {selectedPartnerForModal.tagline}
                  </p>
                </div>

                <p className="text-sm text-[#eaecef] leading-relaxed pt-1">
                  {selectedPartnerForModal.description}
                </p>
              </div>

              {/* No lugar dos botões: Cota e Patrocinador Certificado */}
              <div className="flex items-center justify-between pt-4 border-t border-[#2b3139]">
                <span className="text-xs font-mono font-bold text-[#fcd535] uppercase tracking-wider">
                  {selectedPartnerForModal.cotaLabel}
                </span>
                <span className="text-xs font-mono text-[#0ecb81] flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#0ecb81]" />
                  Patrocinador Certificado
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ CANAL DE ATENDIMENTO E SUPORTE SECOMP ══ */}
      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-[#0b0e11] border-t border-[#2b3139]/40">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#1e2329] border border-[#2b3139]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Info Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b0e11] border border-[#2b3139] text-xs font-mono text-[#fcd535]">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>CENTRAL DE ATENDIMENTO</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Fale com a Equipe SECOMP
                </h3>
                <p className="text-sm text-[#929aa5] leading-relaxed">
                  Tem dúvidas sobre cotas de patrocínio, credenciamento presencial, horários, certificação de horas ou estandes? Envie uma mensagem direta para a nossa equipe de atendimento.
                </p>

                <div className="space-y-3 pt-3 text-xs text-[#eaecef]">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#fcd535] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Localização:</strong>
                      <div className="text-[#707a8a]">UTFPR Câmpus Cornélio Procópio — DACOM (Depto. de Computação)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-[#0ecb81] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">E-mail Acadêmico:</strong>
                      <div>
                        <a href="mailto:dacom@utfpr.edu.br" className="text-[#0ecb81] hover:underline font-mono">
                          dacom@utfpr.edu.br
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Contact Form */}
              <div className="lg:col-span-7">
                <div className="p-6 sm:p-8 rounded-xl bg-[#0b0e11] border border-[#2b3139] space-y-5">
                  <div className="border-b border-[#2b3139] pb-3">
                    <h4 className="text-base font-bold text-white">Formulário de Atendimento & Patrocínio</h4>
                    <p className="text-xs text-[#707a8a]">Preencha os campos abaixo para entrar em contato com nossa equipe.</p>
                  </div>

                  {submitted ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#0ecb81]/20 border border-[#0ecb81] flex items-center justify-center text-[#0ecb81] mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-white">Mensagem Enviada com Sucesso!</h4>
                      <p className="text-xs text-[#929aa5] max-w-sm mx-auto">
                        A equipe da SECOMP 2026 recebeu sua solicitação e responderá no e-mail informado o mais breve possível.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono text-[#707a8a] uppercase mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Jose de Alencar"
                            className="w-full h-10 px-3 rounded-md bg-[#1e2329] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-[#707a8a] uppercase mb-1">
                            Seu E-mail *
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nome@empresa.com.br"
                            className="w-full h-10 px-3 rounded-md bg-[#1e2329] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535] transition-colors font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-[#707a8a] uppercase mb-1">
                          Assunto
                        </label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full h-10 px-3 rounded-md bg-[#1e2329] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535] transition-colors"
                        >
                          <option value="Dúvida Geral">Dúvida Geral</option>
                          <option value="Cotas de Patrocínio (Ouro/Prata/Bronze)">Cotas de Patrocínio (Ouro/Prata/Bronze)</option>
                          <option value="Estande na Feira da Lua">Estande na Feira da Lua</option>
                          <option value="Inscrições e Minicursos">Inscrições e Minicursos</option>
                          <option value="Ideathon UTFPR">Ideathon</option>
                          <option value="Roda de Talentos">Roda de Talentos</option>
                          <option value="Horas complementares">Horas complementares</option>
                          <option value="Contato Institucional">Contato Institucional</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-[#707a8a] uppercase mb-1">
                          Mensagem *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Escreva sua dúvida ou proposta de patrocínio..."
                          className="w-full p-3 rounded-md bg-[#1e2329] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535] transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full h-11 rounded-md bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Mensagem</span>
                      </button>
                    </form>
                  )}
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
