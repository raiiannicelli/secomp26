import React from 'react';
import { Moon, Music, Utensils, Sparkles, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

export const FeiraDaLuaSection: React.FC = () => {
  const attractions = [
    {
      title: 'Circuito de Food Trucks',
      icon: Utensils,
      desc: 'Hambúrgueres artesanais, pizzas napolitanas, crepes, pastéis tradicionais, chopp artesanal e sobremesas locais.',
    },
    {
      title: 'Atrações Musicais ao Vivo',
      icon: Music,
      desc: 'Bandas e DJs formados por alunos e músicos convidados da cena regional no palco externo em frente ao câmpus.',
    },
    {
      title: 'Feirinha de Projetos & Inovação',
      icon: Sparkles,
      desc: 'Bancas com demonstrações interativas de robôs, protótipos do Ideathon Express e projetos comunitários.',
    },
    {
      title: 'Premiação dos Destaques Técnicos',
      icon: Moon,
      desc: 'Reconhecimento solene no telão dos projetos de maior impacto, maratona de programação e menções honrosas.',
    },
  ];

  return (
    <section id="feira-da-lua" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0b0e11] border-t border-[#2b3139] relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Grande Feira da Lua
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2329] border border-[#2b3139] text-xs font-mono text-[#fcd535]">
            <Moon className="w-3.5 h-3.5" />
            <span>SEXTA-FEIRA • 20H30</span>
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {attractions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl bg-[#1e2329] border border-[#2b3139] hover:border-[#fcd535]/50 transition-all duration-200 card-hover-tilt space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0b0e11] border border-[#2b3139] flex items-center justify-center text-[#fcd535]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-[#929aa5] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Highlight Banner */}
        <div className="p-6 rounded-xl bg-[#1e2329] border border-[#2b3139] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0ecb81]/15 text-[#0ecb81] flex items-center justify-center font-bold shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Entrada Franca para Toda a Comunidade</div>
              <div className="text-xs text-[#707a8a]">Espaço aberto na entrada principal da universidade para confraternização e networking.</div>
            </div>
          </div>

          <a
            href="#programacao"
            className="h-10 px-5 rounded-md bg-[#2b3139] hover:bg-[#fcd535] hover:text-[#181a20] text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <span>Ver Horários do Encerramento</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
