import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ShieldCheck, Trophy, Flame, Cpu, Users, Award } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export const Motion3DHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { openEnrollModal } = useUIStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const pointsCount = 48;
    const points: Array<{
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      size: number;
    }> = [];

    for (let i = 0; i < pointsCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 250 + Math.random() * 80;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      points.push({ x, y, z, baseX: x, baseY: y, baseZ: z, size: 2 + Math.random() * 2.5 });
    }

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width > 1024 ? width * 0.72 : width * 0.5;
      const centerY = height * 0.48;

      angleY += 0.003 + mousePos.x * 0.00008;
      angleX += 0.0015 + mousePos.y * 0.00008;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projected = points.map((p) => {
        const x1 = p.baseX * cosY - p.baseZ * sinY;
        const z1 = p.baseZ * cosY + p.baseX * sinY;
        const y2 = p.baseY * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.baseY * sinX;
        const fov = 420;
        const scale = fov / (fov + z2);
        return { x: x1 * scale + centerX, y: y2 * scale + centerY, scale, z: z2, size: p.size * scale };
      });

      // Conexões
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const alpha = (1 - dist / 115) * 0.35;
            ctx.strokeStyle = `rgba(252, 213, 53, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Nós
      projected.forEach((p) => {
        const alpha = Math.max(0.2, (p.z + 280) / 560);
        ctx.fillStyle = `rgba(252, 213, 53, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX - window.innerWidth / 2,
        y: e.clientY - window.innerHeight / 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos.x, mousePos.y]);

  return (
    <section className="relative min-h-[92vh] pt-24 pb-16 flex items-center bg-[#0b0e11] overflow-hidden">
      {/* 3D Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines, Value Prop & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Indicator Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2329] border border-[#2b3139] text-xs font-mono text-[#fcd535]">
              <span className="w-2 h-2 rounded-full bg-[#0ecb81]" />
              <span>SEMANA OFICIAL • 09 A 13 DE NOVEMBRO DE 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
              <span className="text-[#fcd535] underline decoration-[#fcd535]/30 underline-offset-8">
                Conexões
              </span>{' '}
              Reais.
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-[#929aa5] max-w-xl leading-relaxed">
              A principal conferência acadêmica e executiva de tecnologia da UTFPR: 5 dias de imersão em engenharia de software, inteligência artificial, segurança e inovação com os principais líderes do setor.
            </p>

            {/* CTA Button Cluster */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                data-testid="hero-cta-btn"
                onClick={() => openEnrollModal()}
                className="h-12 px-7 rounded-md bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Garantir Vaga</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#programacao"
                className="h-12 px-6 rounded-md bg-[#1e2329] hover:bg-[#2b3139] text-white border border-[#2b3139] font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Explorar a Programação</span>
              </a>
            </div>

            {/* Authority Trust Badges */}
            <div className="pt-6">
              <p className="text-xs font-mono text-[#707a8a] uppercase tracking-wider mb-3">
                Realização:
              </p>
              <div className="flex flex-wrap items-center gap-6 text-xs text-[#eaecef] opacity-90 font-mono">
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#fcd535]" /> UTFPR
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-[#929aa5]">
                  DACOM
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-[#929aa5]">
                  Incubadora Sprint
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-[#929aa5]">
                  Sebrae Paraná
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
