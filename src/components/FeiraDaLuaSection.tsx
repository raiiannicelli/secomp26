import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Utensils, Music, Sparkles, Trophy } from 'lucide-react';

interface TopicItem {
  id: string;
  title: string;
  shortDesc: string;
  category: string;
  icon: typeof Utensils;
}

const TOPICS: TopicItem[] = [
  {
    id: 'food-trucks',
    title: 'Food Trucks',
    shortDesc:
      'Hambúrgueres artesanais, pizzas napolitanas, crepes, pastéis tradicionais, chopp artesanal e sobremesas locais.',
    category: 'Gastronomia',
    icon: Utensils,
  },
  {
    id: 'shows-ao-vivo',
    title: 'Música ao Vivo',
    shortDesc:
      'Bandas e DJs convidados no palco externo em frente ao câmpus UTFPR.',
    category: 'Line-up',
    icon: Music,
  },
];

export const FeiraDaLuaSection: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('food-trucks');

  const activeIndex = TOPICS.findIndex((t) => t.id === activeId);

  return (
    <section
      id="feira-da-lua"
      className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0e11] relative overflow-hidden select-none"
    >

      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        {/* Header Editorial da Seção Alinhado à Esquerda */}
        <div className="text-left space-y-2">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase leading-none">
            Feira da Lua
          </h2>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono text-[#fcd535]">
            <span>SEXTA-FEIRA • ESTACIONAMENTO UTFPR</span>
          </div>
        </div>

        {/* ══ HOOK SIDEBAR / CONTENTS (MODELO EXATO INSPORA DESIGN) ══ */}
        <div className="p-4 sm:p-10 rounded-2xl sm:rounded-3xl space-y-6 sm:space-y-8">
          {/* Header "CONTENTS" */}
          <div className="flex items-center justify-between border-b border-[#2b3139]/80 pb-4">
            <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] text-[#929aa5] uppercase">
              PROGRAMAÇÃO
            </span>
          </div>

          {/* Lista com o Hook Dotted Vertical Preenchido */}
          <div className="space-y-1 relative">
            {TOPICS.map((topic, index) => {
              const isActive = topic.id === activeId;
              const isAbove = index < activeIndex;
              const isBelow = index > activeIndex;

              return (
                <div key={topic.id} className="relative flex items-stretch group">
                  {/* Calha da Linha Vertical Tracejada (Hook Column) */}
                  <div className="relative w-8 sm:w-10 shrink-0 flex justify-start">
                    {/* Caso 1: Itens Anteriores ao Ativo -> Linha Amarela Preenchida Contínua */}
                    {isAbove && (
                      <div className="absolute left-2.5 top-0 bottom-0 w-0 border-l-2 border-dashed border-[#fcd535] transition-colors duration-300" />
                    )}

                    {/* Caso 2: Item Ativo -> Linha Amarela vindo do topo com a Curva 90° (Hook) para o título */}
                    {isActive && (
                      <div className="absolute left-2.5 top-0 bottom-0 right-0 pointer-events-none">
                        {/* Linha amarela do topo até o hook */}
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

                        {/* Linha cinza residual abaixo do hook para itens seguintes */}
                        <div className="absolute left-0 top-7 bottom-0 w-0 border-l-2 border-dashed border-[#2b3139]" />
                      </div>
                    )}

                    {/* Caso 3: Itens Posteriores ao Ativo -> Linha Cinza Tracejada Inativa */}
                    {isBelow && (
                      <div className="absolute left-2.5 top-0 bottom-0 w-0 border-l-2 border-dashed border-[#2b3139] transition-colors duration-300" />
                    )}
                  </div>

                  {/* Conteúdo do Tópico */}
                  <div className="flex-grow py-2.5 pl-2">
                    <button
                      onClick={() => setActiveId(topic.id)}
                      className="w-full text-left focus:outline-none flex flex-col items-start gap-1"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-base sm:text-lg font-medium transition-all duration-200 ${isActive
                            ? 'text-white font-bold tracking-tight text-lg sm:text-xl'
                            : 'text-[#707a8a] hover:text-[#eaecef]'
                            }`}
                        >
                          {topic.title}
                        </span>
                      </div>

                      {/* Descrição Curta de 2 Linhas Revelada ao Clicar */}
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
                              {topic.shortDesc}
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
    </section>
  );
};

export default FeiraDaLuaSection;
