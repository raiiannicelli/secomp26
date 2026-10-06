import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export const EnrollModal: React.FC = () => {
  const {
    isEnrollModalOpen,
    selectedWorkshopForEnroll,
    closeEnrollModal,
    addStamp,
    setUser,
    user,
    workshops,
    updateWorkshop,
  } = useUIStore();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [ra, setRa] = useState(user?.ra || '');
  const [course, setCourse] = useState('Engenharia de Software');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [passportCode, setPassportCode] = useState('');

  const targetWorkshop = workshops.find((w) => w.title === selectedWorkshopForEnroll);

  if (!isEnrollModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !ra) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Informe um e-mail válido (preferencialmente institucional).');
      return;
    }

    const code = `SC26-${Math.floor(100000 + Math.random() * 900000)}`;
    setPassportCode(code);
    setErrorMsg('');
    setSubmitted(true);

    setUser({ name: fullName, email, ra });

    // Decrementar vagas ativas do minicurso se existir
    if (targetWorkshop && targetWorkshop.activeSlots > 0) {
      updateWorkshop(targetWorkshop.id, {
        activeSlots: targetWorkshop.activeSlots - 1,
      });
    }

    // Conceder carimbo de inscrição/minicurso
    addStamp(2);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName('');
    setEmail('');
    setRa('');
    closeEnrollModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150">
      <div
        data-testid="section-inscricao"
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-[#1e2329] border border-[#2b3139]"
      >
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 text-[#707a8a] hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#0ecb81]/20 border border-[#0ecb81] flex items-center justify-center text-[#0ecb81] mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Inscrição Confirmada!</h3>
            <p className="text-sm text-[#929aa5] max-w-md mx-auto">
              Parabéns, <strong>{fullName}</strong>! Seu credenciamento para a <strong>SECOMP 2026</strong> foi emitido com sucesso (+1 Carimbo no Passaporte).
            </p>
            {targetWorkshop ? (
              <div className="p-3.5 rounded-xl bg-[#0b0e11] border border-[#2b3139] text-left space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#707a8a] uppercase text-[10px]">Minicurso Selecionado:</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ color: targetWorkshop.trackColor, backgroundColor: `${targetWorkshop.trackColor}15` }}
                  >
                    {targetWorkshop.trackLabel}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">{targetWorkshop.title}</div>
                <div className="text-[11px] text-[#929aa5]">
                  📅 {targetWorkshop.day} de {targetWorkshop.month} • 📍 {targetWorkshop.location}
                </div>
                <div className="text-[11px] text-[#fcd535]">
                  👤 Instrutor: {targetWorkshop.instructor} ({targetWorkshop.partner})
                </div>
              </div>
            ) : selectedWorkshopForEnroll ? (
              <div className="p-3 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-xs text-[#fcd535] font-mono">
                Minicurso Vinculado: <strong>{selectedWorkshopForEnroll}</strong>
              </div>
            ) : null}
            <div className="p-4 rounded-xl bg-[#0b0e11] border border-[#fcd535]/30 text-left space-y-1 font-mono text-xs">
              <div className="text-[#707a8a]">CÓDIGO DO PASSAPORTE DIGITAL:</div>
              <div className="text-base font-bold text-[#fcd535]">{passportCode}</div>
              <div className="text-[11px] text-[#0ecb81]">
                Apresente este código no credenciamento da segunda-feira para retirar seu kit físico oficial.
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full h-11 rounded-md bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-sm transition-all"
            >
              Concluir & Voltar ao Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <div className="inline-block px-2.5 py-0.5 rounded bg-[#0b0e11] border border-[#2b3139] text-[11px] font-mono text-[#fcd535]">
                CREDENCIAMENTO 100% GRATUITO
              </div>
              <h3 className="text-xl font-bold text-white">
                {targetWorkshop ? `Inscrição: ${targetWorkshop.title}` : selectedWorkshopForEnroll ? `Inscrição: ${selectedWorkshopForEnroll}` : 'Garantir Vaga na SECOMP 2026'}
              </h3>
              {targetWorkshop && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                    style={{ color: targetWorkshop.trackColor, backgroundColor: `${targetWorkshop.trackColor}15` }}
                  >
                    {targetWorkshop.trackLabel}
                  </span>
                  <span className="text-[10px] font-mono text-[#929aa5] px-2 py-0.5 rounded bg-[#0b0e11] border border-[#2b3139]">
                    {targetWorkshop.day} {targetWorkshop.month}
                  </span>
                  <span className="text-[10px] font-mono text-[#0ecb81]">
                    {targetWorkshop.activeSlots} vagas restantes
                  </span>
                </div>
              )}
              <p className="text-xs text-[#929aa5]">
                Preencha os dados abaixo para receber seu acesso aos 3 turnos, minicursos e Passaporte Digital.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-md bg-[#f6465d]/15 border border-[#f6465d]/40 text-xs text-[#f6465d]">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#707a8a] uppercase mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rai Moratto"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-4 rounded-md bg-[#0b0e11] border border-[#2b3139] text-white text-sm focus:outline-none focus:border-[#fcd535] transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#707a8a] uppercase mb-1">
                  E-mail (Institucional ou Pessoal) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu.nome@alunos.utfpr.edu.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-md bg-[#0b0e11] border border-[#2b3139] text-white text-sm focus:outline-none focus:border-[#fcd535] transition-colors font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#707a8a] uppercase mb-1">
                    RA / Matrícula *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: a2489100"
                    value={ra}
                    onChange={(e) => setRa(e.target.value)}
                    className="w-full h-11 px-4 rounded-md bg-[#0b0e11] border border-[#2b3139] text-white text-sm focus:outline-none focus:border-[#fcd535] transition-colors font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#707a8a] uppercase mb-1">
                    Curso / Perfil
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full h-11 px-3 rounded-md bg-[#0b0e11] border border-[#2b3139] text-white text-sm focus:outline-none focus:border-[#fcd535] transition-colors"
                  >
                    <option value="Engenharia de Software">Engenharia de Software</option>
                    <option value="Ciência da Computação">Ciência da Computação</option>
                    <option value="Sistemas de Informação">Sistemas de Informação</option>
                    <option value="Engenharia Elétrica/Outras">Outra Engenharia</option>
                    <option value="Alumni / Comunidade Externa">Alumni / Externo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2b3139] flex items-center justify-between">
              <span className="text-[11px] text-[#707a8a] font-mono">
                Dados protegidos por AES-256-GCM
              </span>
              <button
                type="submit"
                className="h-11 px-6 rounded-md bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-sm flex items-center gap-2 transition-all"
              >
                <span>Confirmar Vaga</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
