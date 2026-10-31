import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Camera, RotateCcw, ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export const defaultEventPhotos = [
  {
    id: 'ph-1',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
    caption: 'Palco Principal • Keynotes Magnas de Inteligência Artificial',
    category: 'Palestra',
    orderIndex: 0,
  },
  {
    id: 'ph-2',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200',
    caption: 'Hackathon & Ideathon Express • Maratona de Squads UTFPR',
    category: 'Ideathon',
    orderIndex: 1,
  },
  {
    id: 'ph-3',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200',
    caption: 'Roda de Talentos & Entrevistas Rápidas com Recrutadores Tech',
    category: 'Talentos',
    orderIndex: 2,
  },
  {
    id: 'ph-4',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
    caption: 'Minicursos Práticos de Engenharia, Nuvem e Cibersegurança',
    category: 'Minicurso',
    orderIndex: 3,
  },
  {
    id: 'ph-5',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
    caption: 'Feira da Lua & Encerramento Solene no Estacionamento UTFPR',
    category: 'Encerramento',
    orderIndex: 4,
  },
];

export const CardStackGallery: React.FC = () => {
  const storePhotos = useUIStore((state) => state.eventPhotos);
  const eventPhotos = React.useMemo(() => {
    return storePhotos && storePhotos.length > 0 ? storePhotos : defaultEventPhotos;
  }, [storePhotos]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const topCardRef = useRef<{ swipe: (dir: 'left' | 'right') => Promise<void> } | null>(null);

  // Sincroniza o índice se o array de fotos mudar no Mini-CMS
  useEffect(() => {
    if (eventPhotos.length > 0 && currentIndex >= eventPhotos.length) {
      setCurrentIndex(0);
    }
  }, [eventPhotos.length, currentIndex]);

  const handleNext = async () => {
    if (eventPhotos.length <= 1 || isSwiping) return;
    if (topCardRef.current) {
      await topCardRef.current.swipe('right');
    } else {
      setCurrentIndex((prev) => (prev + 1) % eventPhotos.length);
    }
  };

  const handlePrev = async () => {
    if (eventPhotos.length <= 1 || isSwiping) return;
    if (topCardRef.current) {
      await topCardRef.current.swipe('left');
    } else {
      setCurrentIndex((prev) => (prev - 1 + eventPhotos.length) % eventPhotos.length);
    }
  };

  const handleReset = () => {
    if (isSwiping) return;
    setCurrentIndex(0);
  };

  if (!eventPhotos || eventPhotos.length === 0) return null;

  return (
    <section
      id="galeria"
      className="py-24 bg-[#0b0e11] relative overflow-hidden select-none"
    >

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase leading-none">
              Mural do Evento
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-[#fcd535]">
              <span>REGISTROS & MOMENTOS</span>
            </div>
          </div>

          {/* Controles do Deck Superior */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={isSwiping}
                className="w-10 h-10 rounded-lg bg-[#1e2329] hover:bg-[#2b3139] disabled:opacity-50 hover:border-[#fcd535] text-white flex items-center justify-center transition-colors active:scale-95"
                aria-label="Foto Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={isSwiping}
                className="w-10 h-10 rounded-lg bg-[#1e2329] hover:bg-[#2b3139] disabled:opacity-50 hover:border-[#fcd535] text-white flex items-center justify-center transition-colors active:scale-95"
                aria-label="Próxima Foto"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ══ PALCO DO DECK POLAROID CENTRALIZADO & ESPALHADO ══ */}
        <div className="flex flex-col items-center justify-center pt-4 pb-8">
          {/* Deck de Fotos Polaroid Espalhadas */}
          <div className="relative w-full max-w-[320px] sm:w-[380px] md:w-[420px] h-[400px] sm:h-[510px] md:h-[540px] flex items-center justify-center">
            <ul className="relative w-full h-full list-none p-0 m-0">
              {eventPhotos.map((photo, index) => {
                const offset = (index - currentIndex + eventPhotos.length) % eventPhotos.length;
                const isTop = offset === 0;

                return (
                  <PolaroidStackItem
                    key={photo.id}
                    photo={photo}
                    index={index}
                    currentIndex={currentIndex}
                    totalImages={eventPhotos.length}
                    isTop={isTop}
                    offset={offset}
                    isSwiping={isSwiping}
                    setIsSwiping={setIsSwiping}
                    onFinishSwipe={() => {
                      setCurrentIndex((prev) => (prev + 1) % eventPhotos.length);
                    }}
                    ref={isTop ? topCardRef : null}
                  />
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

interface PolaroidStackItemProps {
  photo: {
    id: string;
    url: string;
    caption: string;
    category?: string;
    orderIndex: number;
  };
  index: number;
  currentIndex: number;
  totalImages: number;
  isTop: boolean;
  offset: number;
  isSwiping: boolean;
  setIsSwiping: (v: boolean) => void;
  onFinishSwipe: () => void;
}

// Ângulos e posições orgânicas de mesa para as fotos espalhadas embaixo
const SCATTER_PRESETS = [
  { rotate: 0, x: 0, y: 0 },
  { rotate: -6, x: 10, y: 14 },
  { rotate: 7, x: -14, y: 34 },
  { rotate: -8, x: 16, y: 54 },
  { rotate: 5, x: -10, y: 74 },
];

const PolaroidStackItem = React.forwardRef<
  { swipe: (dir: 'left' | 'right') => Promise<void> },
  PolaroidStackItemProps
>(
  (
    {
      photo,
      index,
      totalImages,
      isTop,
      offset,
      isSwiping,
      setIsSwiping,
      onFinishSwipe,
    },
    ref
  ) => {
    const x = useMotionValue(0);

    // Distância total para atravessar a tela inteira até sumir além das bordas do viewport
    const getThrowDistance = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1400;
      return Math.max(width * 0.9, 1000);
    };

    // Rotação fluida que acompanha o arraste por toda a largura da tela
    const rotateDrag = useTransform(x, [-1200, 0, 1200], [-35, 0, 35]);

    // Opacidade se mantém 100% nítida até atingir a borda exterior da tela
    const opacityDrag = useTransform(
      x,
      [-1200, -700, 0, 700, 1200],
      [0, 1, 1, 1, 0]
    );

    const performSwipe = async (dir: 'left' | 'right', customVelocity?: number) => {
      if (isSwiping) return;
      setIsSwiping(true);

      const throwDistance = getThrowDistance();
      const targetX = dir === 'right' ? throwDistance : -throwDistance;
      const vel = customVelocity || (dir === 'right' ? 800 : -800);

      // Animação 100% contínua e ultra-fluida arremessando até fora da tela
      await animate(x, targetX, {
        type: 'spring',
        stiffness: 220,
        damping: 24,
        mass: 0.8,
        velocity: vel,
      });

      // Atualiza o estado da lista encadeada e reseta a posição após sair do viewport
      onFinishSwipe();
      x.set(0);
      setIsSwiping(false);
    };

    React.useImperativeHandle(ref, () => ({
      swipe: performSwipe,
    }));

    const handleDragEnd = async (_: any, info: any) => {
      const swipeThreshold = 60;
      const velocityThreshold = 220;
      const isSwiped =
        Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > velocityThreshold;

      if (isSwiped) {
        const isRight = info.offset.x > 0 || info.velocity.x > 0;
        await performSwipe(isRight ? 'right' : 'left', info.velocity.x);
      } else {
        // Retorna suavemente para o centro da bancada
        animate(x, 0, {
          type: 'spring',
          stiffness: 450,
          damping: 30,
        });
      }
    };

    // Mostramos até 5 polaroids espalhadas na bancada
    const isVisible = offset < 5;
    if (!isVisible) return null;

    const scatter = SCATTER_PRESETS[offset] || {
      rotate: (index % 2 === 0 ? 1 : -1) * (offset * 3),
      x: (index % 2 === 0 ? 8 : -8) * offset,
      y: offset * 12,
    };

    const offsetScale = 1 - offset * 0.04;

    return (
      <motion.li
        style={{
          x: isTop ? x : scatter.x,
          rotate: isTop ? rotateDrag : `${scatter.rotate}deg`,
          opacity: isTop ? opacityDrag : Math.max(0, 1 - offset * 0.15),
          zIndex: totalImages - offset,
          touchAction: 'pan-y',
          boxShadow: isTop
            ? '0 30px 60px -12px rgba(0, 0, 0, 0.9), 0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            : '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 5px 15px -3px rgba(0, 0, 0, 0.4)',
        }}
        animate={{
          scale: offsetScale,
          y: scatter.y,
          transition: { type: 'spring', stiffness: 300, damping: 26 },
        }}
        drag={isTop && !isSwiping ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        className={`absolute inset-0 rounded-2xl overflow-hidden bg-[#fafafa] p-3.5 sm:p-4 pb-4 sm:pb-5 flex flex-col justify-between will-change-transform ${isTop ? 'cursor-grab active:cursor-grabbing hover:shadow-2xl' : 'pointer-events-none'
          }`}
      >
        {/* Moldura Fotográfica Superior da Polaroid */}
        <div className="relative w-full aspect-[4/3] sm:h-[300px] md:h-[330px] rounded-lg overflow-hidden bg-[#181a20] shadow-inner shrink-0">
          <img
            src={photo.url}
            alt={photo.caption}
            draggable={false}
            className="w-full h-full object-cover object-center pointer-events-none select-none filter contrast-105 brightness-95"
          />

          {/* Vinheta Fotográfica Suave */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 pointer-events-none" />
        </div>

        {/* ══ REGIÃO BRANCA DA POLAROID COM INFORMAÇÕES ══ */}
        <div className="pt-3 sm:pt-4 px-1 flex flex-col justify-between flex-grow">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[#181a20] tracking-tight leading-snug line-clamp-2">
              {photo.caption || 'Registro SECOMP 2026'}
            </h3>
          </div>

          {/* Rodapé da Polaroid: Monospace Timestamp / Registro UTFPR */}
          <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#64748b]">
            <span className="font-semibold tracking-wider text-[#475569]">
              SECOMP 2026
            </span>
            <span className="text-[#fcd535] font-bold uppercase">
              #{String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </motion.li>
    );
  }
);

PolaroidStackItem.displayName = 'PolaroidStackItem';

export default CardStackGallery;
