import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Briefcase,
  Sparkles,
  Zap,
  Award,
  ChevronLeft,
  ChevronRight,
  Radio,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  RotateCw,
  Crosshair,
  ShieldAlert
} from 'lucide-react';
import { useUIStore, isUserAuthenticated } from '../stores/useUIStore';
import { useIsMobile } from '../hooks/useIsMobile';

interface SlotItem {
  id: string;
  companyName: string;
  interviewerName: string;
  slotTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'COMPLETED';
  isBooked: boolean;
}

interface CompanyProfile {
  id: string;
  name: string;
  badge: string;
  chamber: string;
  area: string;
  openings: string;
  techStack: string[];
  recruiter: string;
  color: string;
  glow: string;
  description: string;
}





const CYLINDER_RADIUS = 380; // Depth radius of the revolver cylinder

export const TalentArenaSection: React.FC = () => {
  const isMobile = useIsMobile(640);
  const { addStamp, user, talentPlatforms } = useUIStore();
  const authenticated = isUserAuthenticated(user);

  // Zero-Fallback: Mapeia plataformas cadastradas no CMS ou deriva diretamente dos slots reais do banco
  const cmsPlatforms: CompanyProfile[] = (talentPlatforms || []).map((plat, idx) => ({
    id: plat.id,
    name: plat.companyName || plat.title,
    badge: 'RODA DE TALENTOS',
    chamber: `PLATAFORMA ${String(idx + 1).padStart(2, '0')}`,
    area: plat.title || 'Conexão com Recrutadores & RH',
    openings: `Entrevistas em ${plat.location}`,
    techStack: [plat.hostName || 'Recrutador RH', plat.location || 'Saguão Central'],
    recruiter: plat.hostName || 'Responsável pela Plataforma',
    color: '#fcd535',
    glow: 'rgba(252, 213, 53, 0.45)',
    description: `Plataforma ${plat.title} conduzida por ${plat.hostName} representando ${plat.companyName}.`,
  }));

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [slotsList, setSlotsList] = useState<SlotItem[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string | null>(null);
  const [booked, setBooked] = useState<boolean>(false);
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Deriva plataformas dinamicamente: prioriza CMS, fallback para as empresas dos slots do banco
  const activeCompaniesList: CompanyProfile[] = React.useMemo(() => {
    if (cmsPlatforms.length > 0) return cmsPlatforms;

    if (!slotsList || slotsList.length === 0) return [];

    const grouped = new Map<string, SlotItem[]>();
    for (const slot of slotsList) {
      const list = grouped.get(slot.companyName) || [];
      list.push(slot);
      grouped.set(slot.companyName, list);
    }

    const palette = ['#fcd535', '#0ecb81', '#3b82f6', '#8a3ffc', '#f6465d'];
    return Array.from(grouped.entries()).map(([compName, items], idx) => {
      const color = palette[idx % palette.length];
      const recruiter = items[0]?.interviewerName || 'Recrutador Técnico';
      return {
        id: `db-plat-${idx + 1}`,
        name: compName,
        badge: 'RODA DE TALENTOS',
        chamber: `PLATAFORMA ${String(idx + 1).padStart(2, '0')}`,
        area: 'Conexão com Recrutadores & RH',
        openings: `${items.length} horários disponíveis`,
        techStack: [recruiter, 'Saguão Central UTFPR'],
        recruiter,
        color,
        glow: `${color}70`,
        description: `Entrevistas de 15 minutos com a equipe de recrutamento da ${compName}.`,
      };
    });
  }, [cmsPlatforms, slotsList]);

  const totalCompanies = activeCompaniesList.length;
  const anglePerItem = totalCompanies > 0 ? 360 / totalCompanies : 0;
  const activeCompany = activeCompaniesList[activeIndex] || activeCompaniesList[0] || {
    id: 'empty',
    name: 'Nenhuma Plataforma',
    badge: 'RODA DE TALENTOS',
    chamber: 'PLATAFORMA 00',
    area: 'Sem plataformas cadastradas',
    openings: 'Sem entrevistas',
    techStack: [],
    recruiter: 'N/A',
    color: '#fcd535',
    glow: 'rgba(252, 213, 53, 0.45)',
    description: 'Nenhuma plataforma cadastrada no CMS no momento.',
  };

  const handleRotatePrev = () => {
    setRotationAngle((prev) => prev + anglePerItem);
    setActiveIndex((prev) => (prev - 1 + totalCompanies) % totalCompanies);
    setSelectedSlotId(null);
    setSelectedSlotLabel(null);
  };

  const handleRotateNext = () => {
    setRotationAngle((prev) => prev - anglePerItem);
    setActiveIndex((prev) => (prev + 1) % totalCompanies);
    setSelectedSlotId(null);
    setSelectedSlotLabel(null);
  };

  const handleSelectIndex = (idx: number) => {
    const diff = idx - activeIndex;
    setRotationAngle((prev) => prev - diff * anglePerItem);
    setActiveIndex(idx);
    setSelectedSlotId(null);
    setSelectedSlotLabel(null);
  };

  // Deriva horários avaliativos para a empresa ativa ou fallback para todos os slots
  const companySlots = React.useMemo(() => {
    if (!slotsList || slotsList.length === 0) return [];
    const filtered = slotsList.filter((slot) => {
      if (!slot.companyName) return true;
      const compLower = activeCompany.name.toLowerCase();
      const slotCompLower = slot.companyName.toLowerCase();
      return slotCompLower.includes(compLower) || compLower.includes(slotCompLower);
    });
    return filtered.length > 0 ? filtered : slotsList;
  }, [slotsList, activeCompany]);

  // Fetch slots from backend
  useEffect(() => {
    fetch('/api/v1/talent-arena/slots')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.slots && Array.isArray(data.slots) && data.slots.length > 0) {
          setSlotsList(data.slots);
        }
      })
      .catch(() => { });
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    if (!authenticated) {
      window.location.href = '/auth?next=' + encodeURIComponent(window.location.pathname + '#talentos');
      return;
    }
    if (!selectedSlotLabel && !selectedSlotId) return;

    setSubmitting(true);
    try {
      if (selectedSlotId) {
        const res = await fetch(`/api/v1/talent-arena/slots/${selectedSlotId}/book`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fieldInterest: activeCompany.name,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || 'Não foi possível agendar este horário avaliativo.');
        }
      }

      setBooked(true);
      addStamp(6, 2);
    } catch (err: any) {
      setBookingError(err.message || 'Falha ao confirmar agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="talentos"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0e11] relative overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Section Header & Navigation Row */}
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-8">
          {/* Left: Title & Tag */}
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">
              Roda de <span className="text-[#fcd535]">Talentos</span>
            </h2>
            <div className="inline-flex items-center gap-2 flex-wrap px-3.5 py-1 rounded-full text-xs font-mono text-[#fcd535]">
              <span>QUINTA-FEIRA • 12 NOV</span>
            </div>
          </div>

          {/* Right: Slide / Rotate Action Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleRotatePrev}
              aria-label="Girar para Esquerda"
              className="w-10 h-10 rounded-lg bg-[#1e2329] hover:bg-[#2b3139] disabled:opacity-50 hover:border-[#fcd535] text-white flex items-center justify-center transition-colors active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleRotateNext}
              aria-label="Girar para Direita"
              className="w-10 h-10 rounded-lg bg-[#1e2329] hover:bg-[#2b3139] disabled:opacity-50 hover:border-[#fcd535] text-white flex items-center justify-center transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Cyber Podium Base on Floor with Revolver Drum Hologram Projector */}
        <div className="relative max-w-5xl mx-auto min-h-[640px] flex flex-col items-center justify-center">

          {/* Upward Hologram Projection Cone (Feixe de Luz Emitido da Base para Cima) */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[320px] sm:max-w-[480px] md:max-w-[720px] h-[400px] sm:h-[520px] pointer-events-none z-10">
            <div
              className="w-full h-full opacity-35 transition-all duration-700"
              style={{
                background: `conic-gradient(from 180deg at 50% 100%, ${activeCompany.color} 0deg, transparent 40deg, transparent 320deg, ${activeCompany.color} 360deg)`,
                filter: 'blur(25px)',
              }}
            />
          </div>

          {/* 3D Revolver Drum Rotor / Carousel Engine (Planar Billboard Hologram) */}
          <div className="relative w-full h-[580px] sm:h-[610px] flex items-center justify-center overflow-visible z-20">
            {activeCompaniesList.length === 0 ? (
              <div className="text-center p-8 bg-[#14181d]/80 rounded-2xl max-w-md backdrop-blur-md">
                <AlertCircle className="w-12 h-12 text-[#fcd535] mx-auto mb-4 opacity-80" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                  Nenhuma Plataforma Disponível
                </h3>
                <p className="text-xs text-[#848e9c] font-mono">
                  As plataformas de atendimento da Roda de Talentos serão disponibilizadas em breve.
                </p>
              </div>
            ) : (
              activeCompaniesList.map((company, index) => {
                // Calculate angular position on the revolver cylinder
                const itemAngle = index * anglePerItem;
                // Angle relative to current rotation
                const normalizedAngle = ((itemAngle + rotationAngle) % 360 + 360) % 360;
                const rad = (normalizedAngle * Math.PI) / 180;

                // Planar Cylinder Horizontal Translation & Depth Scale
                const radius = isMobile ? 180 : 330;
                const xPos = Math.sin(rad) * radius;
                const depthFactor = (Math.cos(rad) + 1) / 2; // 1 at front (0 deg), 0 at back (180 deg)

                // Front-facing chamber status
                const isFront = normalizedAngle < anglePerItem / 2 || normalizedAngle > 360 - anglePerItem / 2;
                const opacity = Math.max(0.2, Math.pow(depthFactor, 1.2));
                const scale = 0.78 + depthFactor * 0.22; // Exactly 1.0 when in front
                const zIndex = Math.round(depthFactor * 30);
                const chamberNumber = String(index + 1).padStart(2, '0');
                const totalChambers = String(activeCompaniesList.length).padStart(2, '0');

                // Render visible cards in 3D perspective
                if (depthFactor < 0.08) return null;

                return (
                  <motion.div
                    key={company.id}
                    drag={isFront ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragEnd={(e, { offset: dragOffset, velocity }) => {
                      const swipeThreshold = 50;
                      if (dragOffset.x < -swipeThreshold || velocity.x < -300) {
                        handleRotateNext();
                      } else if (dragOffset.x > swipeThreshold || velocity.x > 300) {
                        handleRotatePrev();
                      }
                    }}
                    onClick={() => {
                      if (!isFront) {
                        handleSelectIndex(index);
                      }
                    }}
                    initial={false}
                    animate={{
                      x: xPos,
                      scale: scale,
                      opacity: opacity,
                    }}
                    transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                    style={{
                      zIndex,
                    }}
                    className={`absolute w-full max-w-[92vw] sm:max-w-xl flex flex-col ${isFront ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer pointer-events-auto'
                      }`}
                  >
                    {/* Number Monospace Label Floating Above Card (Idêntico ao estilo dos Mentores: 01/06 + PLATAFORMA) */}
                    <div className="flex items-center justify-between px-2 mb-2 select-none">
                      <span className="font-mono text-sm font-bold tracking-widest text-[#707a8a]">
                        <span className={isFront ? 'text-[#707a8a]' : 'text-[#707a8a]'}>{chamberNumber}</span>
                        <span className="text-[#707a8a]">/{totalChambers}</span>
                      </span>
                      <span
                        className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded tracking-wider flex items-center gap-1.5"
                        style={{
                          color: isFront ? company.color : '#707a8a',
                        }}
                      >
                        {isFront && <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: company.color }} />}
                        PLATAFORMA • [{company.id}]
                      </span>
                    </div>

                    {/* Main 3D Card Body */}
                    <div
                      className="relative w-full rounded-2xl p-6 sm:p-7 shadow-2xl transition-colors"
                      style={{
                        borderColor: isFront ? `${company.color}80` : '#2b3139',
                      }}
                    >
                      {/* Holographic Pure Glass Background & Rim Glow */}
                      <div
                        className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500 backdrop-blur-2xl"
                        style={{
                          background: isFront
                            ? `linear-gradient(135deg, rgba(12, 16, 22, 0.95) 0%, rgba(6, 8, 12, 0.95) 100%)`
                            : 'linear-gradient(135deg, rgba(12, 16, 22, 0.95) 0%, rgba(6, 8, 12, 0.95) 100%)',
                          borderColor: isFront ? `${company.color}80` : '#2b3139',
                        }}
                      />

                      {/* Holographic Scanlines, Laser Matrix & HUD Grid Effect */}
                      {isFront && (
                        <>

                          {/* Corner Tech Reticles */}
                          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: company.color }} />
                          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: company.color }} />
                          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: company.color }} />
                          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: company.color }} />
                          {/* Top Hologram Beam Accent Line */}
                        </>
                      )}

                      <div className="relative z-10 space-y-4">
                        {/* Header: Company, Chamber Number & Live Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12  flex items-center justify-center font-black text-xl shrink-0 backdrop-blur-md"
                              style={{
                                borderColor: `${company.color}30`,
                                color: company.color,
                                backgroundColor: `${company.color}20`,
                              }}
                            >
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="py-0.5 rounded text-[10px] font-mono font-bold tracking-wider "
                                  style={{
                                    color: company.color,
                                    borderColor: `${company.color}40`,
                                  }}
                                >
                                  {company.badge}
                                </span>
                              </div>
                              <p className="text-xs text-[#929aa5] font-sans mt-0.5">{company.area}</p>
                            </div>
                          </div>

                        </div>

                        {/* Description & Vacancy info */}
                        <p className="text-xs text-[#c5cbd3] leading-relaxed line-clamp-2">
                          {company.description}
                        </p>

                        {/* Highlight Box */}
                        <div className="p-3 rounded-xl bg-[#0f0a0f] space-y-1.5 text-xs font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-[#707a8a] flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-[#fcd535]" /> Vagas:
                            </span>
                            <span className="font-bold text-white truncate max-w-[260px]"></span>
                          </div>
                        </div>

                        {/* Speed Interview Booking Form (Integrated inside Front Card) */}
                        {isFront ? (
                          booked ? (
                            <div className="p-4 rounded-xl bg-[#0ecb81]/10 border border-[#0ecb81]/40 text-center space-y-3">
                              <div className="inline-flex items-center gap-2 text-[#0ecb81] font-bold text-sm">
                                <span>Horário Avaliativo Confirmado na {company.name}!</span>
                              </div>
                              <p className="text-xs text-[#eaecef]">
                                Horário reservado para <strong>Quinta-feira ({selectedSlotLabel})</strong> (+2 Carimbos no Passaporte).
                              </p>
                            </div>
                          ) : (
                            <form onSubmit={handleBooking} className="space-y-3 pt-1">
                              {/* Time Slots Grid */}
                              <div>
                                <div className="flex items-center justify-between text-[11px] font-mono text-[#707a8a] uppercase mb-1.5">
                                  <span>Horários Avaliativos (15 min):</span>
                                </div>

                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                                  {companySlots.map((slot) => {
                                    const timeStr = new Date(slot.slotTime).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    });
                                    const isSelected = selectedSlotId === slot.id;
                                    const isBooked = slot.isBooked || slot.status !== 'AVAILABLE';
                                    return (
                                      <button
                                        key={slot.id}
                                        type="button"
                                        disabled={isBooked}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSlotId(slot.id);
                                          setSelectedSlotLabel(timeStr);
                                        }}
                                        className={`py-1.5 px-1 rounded-md text-[11px] font-mono text-center transition-all cursor-pointer ${isBooked
                                          ? 'bg-[#181a20] text-[#707a8a] cursor-not-allowed opacity-40 line-through'
                                          : isSelected
                                            ? 'bg-[#fcd535] text-[#181a20] font-bold shadow-md'
                                            : 'bg-[#080a0d] text-[#eaecef] hover:text-white hover:bg-[#181a20] border border-[#2b3139]'
                                          }`}
                                      >
                                        {timeStr}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="flex flex-col sm:flex-row items-center gap-2 pt-3">
                                <button
                                  type="submit"
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={(!selectedSlotLabel && !selectedSlotId) || submitting}
                                  className={`w-full sm:w-auto h-9 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${(selectedSlotLabel || selectedSlotId) && !submitting
                                    ? 'bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] shadow-md shadow-[#fcd535]/25 active:scale-95'
                                    : 'bg-[#2b3139] text-[#707a8a] cursor-not-allowed opacity-60'
                                    }`}
                                >
                                  {submitting ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Agendando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Agendar Horário Avaliativo</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </>
                                  )}
                                </button>
                              </div>
                            </form>
                          )
                        ) : (
                          /* Preview Stacks on background inactive cards */
                          <div className="pt-2">
                            <div className="text-[10px] font-mono text-[#707a8a] uppercase tracking-wider mb-1.5">
                              Tecnologias & Skills:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {company.techStack.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#080a0d] border border-[#2b3139] text-[#eaecef]"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Revolver Chamber Selector Buttons Row directly on floor */}

        </div>
      </div>
    </section>
  );
};



