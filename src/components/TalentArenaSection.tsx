import React, { useState } from 'react';
import { Users, Clock, Building2, CheckCircle2, Calendar, FileText, ArrowRight, Award } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export const TalentArenaSection: React.FC = () => {
  const { addStamp } = useUIStore();

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('ForLogic');
  const [booked, setBooked] = useState<boolean>(false);
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');

  const companies = [
    { name: 'ForLogic', area: 'Software Quality & SaaS', openings: 'Estágio Dev & QA' },
    { name: 'TCS (Tata Consultancy)', area: 'Consultoria Global & Cloud', openings: 'Trainee Full Stack' },
    { name: 'TO Brasil', area: 'Data Analytics & Cloud', openings: 'Estágio Dados & BI' },
    { name: 'CyberGuard', area: 'Segurança & Red Team', openings: 'Júnior CyberSec' },
    { name: 'NUAPE / Psicologia', area: 'Aconselhamento de Carreira', openings: 'Feedback de Postura' },
  ];

  const slots = [
    '14h00 - 14h15',
    '14h20 - 14h35',
    '14h40 - 14h55',
    '15h00 - 15h15',
    '15h20 - 15h35',
    '15h40 - 15h55',
    '16h00 - 16h15',
    '16h20 - 16h35',
    '16h40 - 16h55',
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setBooked(true);
    addStamp(6, 2);
  };

  return (
    <section id="talentos" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0b0e11]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Roda de Talentos
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2329] border border-[#2b3139] text-xs font-mono text-[#fcd535]">
            <Users className="w-3.5 h-3.5" />
            <span>QUINTA-FEIRA • 14H00 ÀS 17H00</span>
          </div>
        </div>

        {/* Interactive Booking Container */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#1e2329] border border-[#2b3139]">
          {booked ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#0ecb81]/20 border border-[#0ecb81] flex items-center justify-center text-[#0ecb81] mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Sessão Agendada com Sucesso</h3>
              <p className="text-sm text-[#929aa5] max-w-md mx-auto">
                Horário reservado com a banca da <strong>{selectedCompany}</strong> para <strong>Quinta-feira ({selectedSlot})</strong>. Credencial e horário confirmados no sistema acadêmico.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0b0e11] border border-[#2b3139] text-[#0ecb81] text-xs font-mono font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>AGENDAMENTO CONFIRMADO • CREDENCIAL ATIVA</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setBooked(false);
                    setSelectedSlot(null);
                  }}
                  className="text-xs text-[#707a8a] hover:text-white underline font-mono"
                >
                  Alterar agendamento
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-6">
              {/* Step 1: Select Company / Bank */}
              <div>
                <label className="block text-xs font-mono text-[#707a8a] uppercase mb-2">
                  1. Escolha a Empresa ou Banca:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {companies.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedCompany(c.name)}
                      className={`p-3 rounded-lg text-left border transition-all ${selectedCompany === c.name
                        ? 'bg-[#0b0e11] border-[#fcd535]'
                        : 'bg-[#0b0e11]/60 border-[#2b3139] hover:border-[#fcd535]/40 text-[#707a8a]'
                        }`}
                    >
                      <div className="text-sm font-bold text-white">{c.name}</div>
                      <div className="text-[11px] text-[#0ecb81] font-medium">{c.openings}</div>
                      <div className="text-[10px] text-[#707a8a] mt-0.5 truncate">{c.area}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select 15-min Slot */}
              <div>
                <label className="block text-xs font-mono text-[#707a8a] uppercase mb-2">
                  2. Escolha o Horário Disponível:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2 rounded text-xs font-mono text-center border transition-all ${isSelected
                          ? 'bg-[#fcd535] text-[#181a20] font-bold border-[#fcd535]'
                          : 'bg-[#0b0e11] text-[#eaecef] border-[#2b3139] hover:border-[#fcd535]/50'
                          }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Candidate Info */}
              <div>
                <label className="block text-xs font-mono text-[#707a8a] uppercase mb-2">
                  3. Link do Perfil no LinkedIn ou Portfólio (Opcional):
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/seu-perfil"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full h-11 px-4 rounded-md bg-[#0b0e11] border border-[#2b3139] text-[#eaecef] placeholder-[#707a8a] text-sm focus:outline-none focus:border-[#fcd535] transition-colors font-mono"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#2b3139] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#707a8a]">
                  Vagas limitadas por ordem de agendamento no sistema.
                </div>
                <button
                  type="submit"
                  disabled={!selectedSlot}
                  className={`h-11 px-6 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2 ${selectedSlot
                    ? 'bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold active:scale-95'
                    : 'bg-[#2b3139] text-[#707a8a] cursor-not-allowed opacity-60'
                    }`}
                >
                  <span>Confirmar Inscrição</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
