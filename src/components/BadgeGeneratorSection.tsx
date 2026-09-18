import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Download, Copy, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export const BadgeGeneratorSection: React.FC = () => {
  const { stampsCount, currentLevel, user } = useUIStore();

  const [badgeType, setBadgeType] = useState<'ATTENDEE' | 'MASTER'>('MASTER');
  const [participantName, setParticipantName] = useState(user?.name || 'Rai Moratto');
  const [copiedText, setCopiedText] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize with user name if changed
  useEffect(() => {
    if (user?.name) {
      setParticipantName(user.name);
    }
  }, [user?.name]);

  // Draw 1200x630 Badge on Canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 1200;
    const h = 630;

    // Background: High-Voltage Dark
    ctx.fillStyle = '#0b0e11';
    ctx.fillRect(0, 0, w, h);



    // Outer Golden Border Frame
    ctx.strokeStyle = '#fcd535';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Inner Subtle Frame
    ctx.strokeStyle = '#fcd535';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, w - 80, h - 80);


    // Main Badge Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 44px sans-serif';
    if (badgeType === 'MASTER') {
      ctx.fillText(`NÍVEL ${currentLevel.name} CONQUISTADO`, 70, 160);
    } else if (badgeType === 'ATTENDEE') {
      ctx.fillText('SEMANA DA COMPUTAÇÃO 2026', 70, 160);
    } else {
      ctx.fillText(`${currentLevel.name} DE`, 70, 160);
    }

    // Subtitle
    ctx.fillStyle = '#2b3139';
    ctx.font = 'bold 22px sans-serif';

    // Separator Line
    ctx.strokeStyle = '#fcd535';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 225);
    ctx.lineTo(w - 70, 225);
    ctx.stroke();

    // Participant Name Box
    ctx.fillStyle = '#1e2329';
    ctx.fillRect(70, 255, 680, 100);
    ctx.strokeStyle = '#2b3139';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(70, 255, 680, 100);

    ctx.fillStyle = '#707a8a';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('PARTICIPANTE CERTIFICADO:', 90, 285);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(participantName || 'Nome do Participante', 90, 332);

    // Stats Grid on the Left
    const hours = Math.max(15, stampsCount * 3);

    // Metric 1: Horas Complementares
    ctx.fillStyle = '#1e2329';
    ctx.fillRect(70, 380, 210, 85);
    ctx.strokeStyle = '#2b3139';
    ctx.strokeRect(70, 380, 210, 85);
    ctx.fillStyle = '#707a8a';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('CARGA HORÁRIA', 90, 405);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`${hours} Horas`, 90, 442);

    // Metric 2: Selos Acumulados
    ctx.fillStyle = '#1e2329';
    ctx.fillRect(305, 380, 210, 85);
    ctx.strokeStyle = '#2b3139';
    ctx.strokeRect(305, 380, 210, 85);
    ctx.fillStyle = '#707a8a';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('SELOS PASSAPORTE', 325, 405);
    ctx.fillStyle = '#fcd535';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`${stampsCount} Carimbos`, 325, 442);

    // Metric 3: Nível de Maestria
    ctx.fillStyle = '#1e2329';
    ctx.fillRect(540, 380, 210, 85);
    ctx.strokeStyle = '#2b3139';
    ctx.strokeRect(540, 380, 210, 85);
    ctx.fillStyle = '#707a8a';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('MAESTRIA', 560, 405);
    ctx.fillStyle = currentLevel.color;
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(currentLevel.name, 560, 442);

    // QR Code Simulated Box on the Right
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w - 360, 255, 290, 210);
    ctx.strokeStyle = '#fcd535';
    ctx.lineWidth = 3;
    ctx.strokeRect(w - 360, 255, 290, 210);

    // QR Code Simulation Grid pattern
    ctx.fillStyle = '#0b0e11';
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if ((r + c) % 2 === 0 || (r * c) % 3 === 0) {
          ctx.fillRect(w - 340 + c * 35, 275 + r * 24, 25, 18);
        }
      }
    }

    // Bottom Institutional Accreditation Bar
    ctx.fillStyle = '#14181c';
    ctx.fillRect(70, 500, w - 140, 60);
    ctx.strokeStyle = '#2b3139';
    ctx.strokeRect(70, 500, w - 140, 60);

    ctx.fillStyle = '#707a8a';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('PASSAPORTE OFICIAL:', 90, 523);

    ctx.fillStyle = '#fcd535';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(
      'UNIVERSIDADE TECNOLÓGICA FEDERAL DO PARANÁ — UTFPR • DACOM',
      90,
      545
    );

    // Department Watermark
    ctx.fillStyle = '#0ecb81';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('utfpr.edu.br/secomp2026', w - 240, 545);
  };

  useEffect(() => {
    renderCanvas();
  }, [badgeType, participantName, stampsCount, currentLevel]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `secomp2026-${badgeType.toLowerCase()}-badge.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyPostText = () => {
    const postText = `Orgulho em participar da #SECOMP2026 na Universidade Tecnológica Federal do Paraná (@UTFPR)!\n\nForam 5 dias intensos de imersão em Inteligência Artificial, Engenharia de Software, Cibersegurança e Inovação, conquistando o badge oficial de nível ${currentLevel.name} com mais de ${Math.max(15, stampsCount * 3)} horas de capacitação prática.\n\nParabéns à coordenação do DACOM e a todos os palestrantes e patrocinadores envolvidos nessa semana histórica!\n\n#SECOMP2026 #UTFPR #Tech #OpenSource #SoftwareEngineering #Inovacao`;

    navigator.clipboard.writeText(postText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 4000);
  };

  return (
    <section id="gerador-badge" className="py-12 px-4 sm:px-6 lg:px-8 bg-[#0b0e11] border-t border-[#2b3139]/60">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2b3139]/40">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Badge Oficial do Participante
            </h3>
            <span className="text-xs font-mono text-[#fcd535] uppercase font-bold flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-4 h-4" />
              <span>COMPARTILHE SUAS CONQUISTAS NO LINKEDIN</span>
            </span>
          </div>

          {/* Template Selector Tabs */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setBadgeType('MASTER')}
              className={`px-3 py-2 rounded-md text-xs font-mono font-bold transition-all ${badgeType === 'MASTER'
                ? 'bg-[#fcd535] text-[#181a20]'
                : 'bg-[#0b0e11] text-[#eaecef] border border-[#2b3139] hover:border-[#fcd535]/50'
                }`}
            >
              Nível Mestre
            </button>
            <button
              onClick={() => setBadgeType('ATTENDEE')}
              className={`px-3 py-2 rounded-md text-xs font-mono font-bold transition-all ${badgeType === 'ATTENDEE'
                ? 'bg-[#fcd535] text-[#181a20]'
                : 'bg-[#0b0e11] text-[#eaecef] border border-[#2b3139] hover:border-[#fcd535]/50'
                }`}
            >
              Eu Estive Lá
            </button>
          </div>
        </div>

        {/* Name Customizer Input */}
        <div className="max-w-md space-y-1.5">
          <label className="block text-xs font-mono text-[#707a8a] uppercase">
            Nome no Badge:
          </label>
          <input
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Digite seu nome completo"
            className="w-full h-10 px-4 rounded-md bg-[#0b0e11] border border-[#2b3139] text-white text-sm focus:outline-none focus:border-[#fcd535] transition-colors font-sans"
          />
        </div>

        {/* Responsive Canvas Container with Aspect Ratio */}
        <div className="w-full overflow-x-auto rounded-xl border border-[#2b3139] bg-[#0b0e11] p-2 flex justify-center">
          <canvas
            ref={canvasRef}
            width={1200}
            height={630}
            className="w-full max-w-[900px] h-auto rounded-lg border border-[#2b3139]/60"
          />
        </div>

        {/* Action Buttons: Download PNG & Copy Text */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs font-mono text-[#707a8a]">
            Resolução 1200x630px para o feed do LinkedIn.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopyPostText}
              className="flex-1 sm:flex-initial h-11 px-5 rounded-md bg-[#1e2329] hover:bg-[#2b3139] text-[#eaecef] font-bold text-xs border border-[#2b3139] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {copiedText ? <CheckCircle2 className="w-4 h-4 text-[#0ecb81]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Texto Copiado!' : 'Copiar Texto para Post'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial h-11 px-6 rounded-md bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Badge PNG</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
