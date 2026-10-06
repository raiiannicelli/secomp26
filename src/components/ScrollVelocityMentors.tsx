import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MoveHorizontal,
} from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export const ScrollVelocityMentors: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragConstraintWidth, setDragConstraintWidth] = useState(0);
  const x = useMotionValue(0);

  // Garante a extração estrita de mentores únicos por id (prevenindo acúmulo no localStorage)
  const rawMentors = useUIStore((state) => state.mentors);
  const baseMentors = React.useMemo(() => {
    return Array.from(new Map(rawMentors.map((m) => [m.id, m])).values());
  }, [rawMentors]);

  // Duplica a lista única em 3 sequências idênticas para a fita infinita
  const mentors = React.useMemo(() => {
    return [...baseMentors, ...baseMentors, ...baseMentors];
  }, [baseMentors]);

  const [isHovered, setIsHovered] = useState(false);
  const singleSequenceWidthRef = useRef<number>(0);

  // Calcula a largura exata de 1 ciclo completo (largura de baseMentors)
  useEffect(() => {
    const updateConstraints = () => {
      if (trackRef.current && containerRef.current) {
        const fullTrackWidth = trackRef.current.scrollWidth;
        // 1 bloco completo da lista base de mentores
        const singleWidth = fullTrackWidth / 3;
        singleSequenceWidthRef.current = singleWidth;
        const containerWidth = containerRef.current.offsetWidth;
        setDragConstraintWidth(Math.min(0, containerWidth - fullTrackWidth));
      }
    };

    // Aguarda montagem dos cards para medição precisa
    const timer = setTimeout(updateConstraints, 100);
    window.addEventListener('resize', updateConstraints);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateConstraints);
    };
  }, [baseMentors.length]);

  // Efeito "Cobra Comendo o Próprio Rabo" (Ouroboros Infinity Loop) — Sem pulo, sem voltar para o 0
  useEffect(() => {
    if (isHovered) return;

    let animationFrameId: number;
    const speed = 2.0; // Velocidade contínua da passarela

    const stepAnimation = () => {
      const currentX = x.get();
      const singleWidth = singleSequenceWidthRef.current;

      // Assim que percorre exatamente a distância de 1 sequência inteira, soma +singleWidth.
      // Como os cards são idênticos nos blocos duplicados, esse ajuste é 100% invisível na tela!
      if (singleWidth > 0 && Math.abs(currentX) >= singleWidth) {
        x.set(currentX + singleWidth);
      } else {
        x.set(currentX - speed);
      }
      animationFrameId = requestAnimationFrame(stepAnimation);
    };

    animationFrameId = requestAnimationFrame(stepAnimation);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, x]);

  const handleArrowSlide = (direction: 'left' | 'right') => {
    const currentX = x.get();
    const step = 420;
    const newX = direction === 'left' ? currentX + step : currentX - step;
    const boundedX = Math.max(dragConstraintWidth, Math.min(0, newX));
    x.set(boundedX);
  };

  return (
    <section
      id="mentores"
      ref={containerRef}
      className="py-12 sm:py-24 bg-[#0b0e11] relative overflow-hidden select-none"
    >

      {/* Top Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-30">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight uppercase leading-none">
            Mentores <span className="text-[#fcd535]">Convidados</span>
          </h2>
          <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full text-xs font-mono text-[#fcd535]">
            <span>CORPO TÉCNICO & BANCA EXAMINADORA</span>
          </div>
        </div>

        {/* Interactive Controls & Drag Tip */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleArrowSlide('left')}
              className="w-10 h-10 rounded-lg bg-[#1e2329] hover:bg-[#2b3139] hover:border-[#fcd535] text-white flex items-center justify-center transition-colors active:scale-95"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleArrowSlide('right')}
              className="w-10 h-10 rounded-lg bg-[#1e2329] hover:bg-[#2b3139] hover:border-[#fcd535] text-white flex items-center justify-center transition-colors active:scale-95"
              aria-label="Próximo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ══ TRANSVERSAL 3D DIAGONAL RUNWAY STAGE ══ */}
      <div
        className="relative w-full py-12 overflow-visible"
        style={{
          perspective: '1800px',
          perspectiveOrigin: '70% 30%',
        }}
      >
        {/* Left and Right Horizon Gradient Masks */}
        <div className="absolute left-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-r from-[#0b0e11] via-[#0b0e11]/30 to-transparent z-10 pointer-events-none" />

        {/* Transversal Skewed Diagonal Rail (Passarela Cinematográfica 3D) */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full flex items-center py-6"
          style={{
            transform: 'rotateX(10deg) rotateY(-18deg) rotateZ(4deg) translateZ(0)',
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div
            ref={trackRef}
            drag="x"
            dragConstraints={{ left: dragConstraintWidth, right: 0 }}
            dragElastic={0.1}
            style={{ x, touchAction: 'pan-y' }}
            className="flex items-center gap-8 sm:gap-10 px-8 sm:px-20 cursor-grab active:cursor-grabbing shrink-0 select-none"
          >
            {mentors.map((mentor, index) => {
              const realIndex = (index % baseMentors.length) + 1;
              const mentorNumber = String(realIndex).padStart(2, '0');
              return (
                <div
                  key={`${mentor.id}-${index}`}
                  className="relative group flex flex-col shrink-0 transition-transform duration-300 hover:-translate-y-6"
                  style={{
                    width: typeof window !== 'undefined' && window.innerWidth < 640 ? '200px' : '300px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Number Monospace Badge Floating Above Card (Estilo Esteira 01 / 06) */}
                  <div className="flex items-center justify-between px-1 mb-1.5">
                    <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest text-[#fcd535] px-2 py-0.5 sm:py-1 rounded-md">
                      {mentorNumber} / {String(baseMentors.length).padStart(2, '0')}
                    </span>
                    <span
                      className="text-[9px] sm:text-[10px] font-mono uppercase px-1.5 py-0.5 rounded tracking-wider text-slate-300"
                    >
                      {mentor.tag}
                    </span>
                  </div>

                  {/* Main 3D Card Body with Portrait Atmosphere */}
                  <div
                    className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#181a20] transition-all duration-300 flex flex-col justify-between"
                    style={{
                      height: typeof window !== 'undefined' && window.innerWidth < 640 ? '310px' : '440px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 15px rgba(252, 213, 53, 0.05)',
                    }}
                  >
                    {/* Photo with Atmospheric Backdrop */}
                    <div className="absolute inset-0 z-0">
                      <img
                        src={mentor.avatarUrl}
                        alt={mentor.name}
                        draggable={false}
                        className="w-full h-full object-cover object-center filter grayscale contrast-125 brightness-75 group-hover:grayscale-0 group-hover:brightness-95 group-hover:scale-105 transition-all duration-500 pointer-events-none"
                      />
                      {/* Atmospheric Dark & Color Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e11] via-[#0b0e11]/50 to-transparent" />
                      <div
                        className="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity duration-300 mix-blend-color-dodge pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 50% 20%, ${mentor.accentColor}, transparent 70%)`,
                        }}
                      />
                    </div>

                    {/* Top Header Monospace Number badge inside Card */}
                    <div className="relative z-10 p-3 sm:p-5 flex items-start justify-between">
                    </div>

                    {/* Bottom Text Details */}
                    <div className="relative z-10 p-3 sm:p-5 space-y-1.5 sm:space-y-2 bg-gradient-to-t from-[#0b0e11] via-[#0b0e11]/90 to-transparent pt-8 sm:pt-14">
                      <div>
                        <h3 className="text-sm sm:text-xl font-bold text-white group-hover:text-[#fcd535] transition-colors leading-tight">
                          {mentor.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-[#929aa5] font-medium mt-0.5 truncate">
                          {mentor.organization}
                        </p>
                      </div>

                      <div className="pt-1.5 sm:pt-2 border-t border-[#2b3139]/50 flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                        <span className="text-[#fcd535] font-semibold truncate">{mentor.role}</span>
                      </div>

                      <p className="text-[10px] sm:text-[11px] text-[#707a8a] line-clamp-2 leading-tight font-sans">
                        {mentor.topic}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ScrollVelocityMentors;
