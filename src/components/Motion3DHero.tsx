import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useUIStore, isUserAuthenticated } from '../stores/useUIStore';
import { motion } from 'framer-motion';

export const Motion3DHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setActiveTab, user } = useUIStore();
  const authenticated = isUserAuthenticated(user);

  const handleHeroEnroll = () => {
    if (!authenticated) {
      window.location.href = '/auth';
      return;
    }
    setActiveTab('PASSAPORTE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

    // Mouse tracking com suavização (lerp)
    const mouse = {
      x: width * 0.72,
      y: height * 0.48,
      targetX: width * 0.72,
      targetY: height * 0.48,
      isHovered: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
      mouse.targetX = width > 1024 ? width * 0.72 : width * 0.5;
      mouse.targetY = height * 0.48;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const pointsCount = 56;
    const points: Array<{
      baseX: number;
      baseY: number;
      baseZ: number;
      size: number;
    }> = [];

    // Distribuição esférica de Fibonacci com variações de raio para volume 3D orgânico
    for (let i = 0; i < pointsCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 220 + Math.random() * 110;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      points.push({ baseX: x, baseY: y, baseZ: z, size: 2 + Math.random() * 2.5 });
    }

    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Interpolação suave do mouse (Lerp)
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const baseCenterX = width > 1024 ? width * 0.72 : width * 0.5;
      const baseCenterY = height * 0.48;

      // O centro do grafo tem um deslocamento sutil (paralaxe leve)
      const centerX = baseCenterX + (mouse.x - baseCenterX) * 0.08;
      const centerY = baseCenterY + (mouse.y - baseCenterY) * 0.08;

      // Rotação 3D sutil orientada pelo cursor do mouse
      const normMouseX = (mouse.x - width / 2) / (width / 2);
      const normMouseY = (mouse.y - height / 2) / (height / 2);

      // Velocidade de rotação natural somada a uma aceleração suave quando o mouse se desloca
      targetRotY += 0.002 + normMouseX * 0.003;
      targetRotX = normMouseY * 0.28;

      rotX += (targetRotX - rotX) * 0.04;
      rotY += 0.002;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY + normMouseX * 0.35);
      const sinY = Math.sin(rotY + normMouseX * 0.35);

      const projected = points.map((p) => {
        // Rotação Y (horizontal)
        const x1 = p.baseX * cosY - p.baseZ * sinY;
        const z1 = p.baseZ * cosY + p.baseX * sinY;

        // Rotação X (vertical guiada pelo mouse)
        const y2 = p.baseY * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.baseY * sinX;

        const fov = 460;
        const scale = fov / (fov + z2);

        let screenX = x1 * scale + centerX;
        let screenY = y2 * scale + centerY;

        // Atração magnética delicada dos nós próximos ao cursor
        const dx = mouse.x - screenX;
        const dy = mouse.y - screenY;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 140 && distToMouse > 1) {
          const force = (1 - distToMouse / 140) * 10;
          screenX += (dx / distToMouse) * force;
          screenY += (dy / distToMouse) * force;
        }

        return {
          x: screenX,
          y: screenY,
          scale,
          z: z2,
          size: p.size * scale,
          distToMouse,
        };
      });

      // 1. Conexões entre os nós do Grafo
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            const alpha = (1 - dist / 125) * 0.4;
            ctx.strokeStyle = `rgba(252, 213, 53, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // 2. Conexões magnéticas dinâmicas do Grafo diretamente ao ponteiro do Mouse
      if (mouse.isHovered) {
        for (let i = 0; i < projected.length; i++) {
          const p = projected[i];
          if (p.distToMouse < 190) {
            const alpha = (1 - p.distToMouse / 190) * 0.75;
            ctx.strokeStyle = `rgba(252, 213, 53, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        // Ponto central de conexão do mouse
        ctx.fillStyle = 'rgba(252, 213, 53, 0.9)';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Aura pulsante no cursor
        ctx.strokeStyle = 'rgba(252, 213, 53, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Renderização dos Nós do Grafo 3D
      projected.forEach((p) => {
        const depthAlpha = Math.max(0.18, Math.min(1, (p.z + 300) / 600));
        ctx.fillStyle = `rgba(252, 213, 53, ${depthAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.2, p.size), 0, Math.PI * 2);
        ctx.fill();

        // Brilho extra nos nós mais próximos da câmera
        if (p.z > 60) {
          ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.8, p.size * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-[85vh] sm:min-h-[92vh] pt-20 sm:pt-44 pb-12 sm:pb-1 flex items-center bg-[#0b0e11] overflow-hidden">
      {/* 3D Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-7 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines, Value Prop & CTAs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] break-words">
              <span className="text-[#fcd535] decoration-[#fcd535]/30 underline-offset-8">
                Conexões
              </span>{' '}
              Reais.
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-lg text-[#929aa5] max-w-xl leading-relaxed">
              A principal semana da computação. 5 dias de imersão em engenharia de software, inteligência artificial, segurança e inovação com os principais líderes do setor.
            </p>

            {/* CTA Button Cluster */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                data-testid="hero-cta-btn"
                onClick={handleHeroEnroll}
                className="h-12 px-7 rounded-md hover:bg-[#f0b90b] text-[#ffffff] hover:text-[#000000] font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-95"              >
                <span>{authenticated ? 'Inscrever-se' : 'Acessar Passaporte'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('PROGRAMACAO');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-12 px-6 rounded-md hover:bg-[#f0b90b] text-[#ffffff] hover:text-[#000000] font-semibold text-sm transition-all flex items-center justify-center gap-2"              >
                <span>Explorar a Programação</span>
              </button>
            </div>

            {/* Authority Trust Badges */}
            <div className="pt-6">
              <p className="text-xs font-mono text-[#707a8a] uppercase tracking-wider mb-3">
                Realização:
              </p>
              <div className="flex flex-wrap items-center gap-6 text-xs text-[#eaecef] opacity-90 font-mono">
                <span className="flex items-center gap-1.5 font-bold">
                  UTFPR
                </span>
                <span className="flex items-center gap-1.5 font-bold">
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
      </div>
    </section>
  );
};
