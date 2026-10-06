import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useUIStore, isUserAuthenticated } from '../stores/useUIStore';

interface IdeathonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IdeathonFormModal: React.FC<IdeathonFormModalProps> = ({ isOpen, onClose }) => {
  const { user, cmsContent, addIdeathonTeam, ideathonTeams } = useUIStore();
  const authenticated = isUserAuthenticated(user);

  // Estado das chaves de sessão manual via Admin Switch
  const sessionStatus = cmsContent?.session_status || {};
  const isRegistrationOpen = sessionStatus.ideathon_registration_open ?? true;

  const [teamName, setTeamName] = useState('');
  const [customTrack, setCustomTrack] = useState('');
  const [proposal, setProposal] = useState('');
  const [leaderName, setLeaderName] = useState(user?.name || '');
  const [leaderRa, setLeaderRa] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddMember = () => {
    if (members.length < 4) {
      setMembers([...members, '']);
    }
  };

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      window.location.href = '/auth';
      return;
    }

    if (!teamName.trim()) {
      setStatusMessage({ type: 'error', text: 'Informe o nome da equipe.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const activeMembers = members.filter((m) => m.trim().length > 0);
      const membersText = activeMembers.length > 0 ? `${leaderName.trim()} (${activeMembers.join(', ')})` : leaderName.trim();
      const trackText = customTrack.trim() || 'Inovação & Tech';
      const proposalText = proposal.trim() || 'Solução desenvolvida para o Ideathon SECOMP 2026.';

      // Adiciona na store local
      addIdeathonTeam({
        teamName: teamName.trim(),
        leaderName: leaderName.trim(),
        leaderEmail: user?.email || `${teamName.toLowerCase().replace(/\s+/g, '')}@utfpr.edu.br`,
        members: membersText,
        track: trackText,
        proposal: proposalText,
      });

      // Persiste no PostgreSQL CMS para sincronia broadcast
      const newTeamItem = {
        id: `team-${Date.now()}`,
        teamName: teamName.trim(),
        leaderName: leaderName.trim(),
        leaderEmail: user?.email || `${teamName.toLowerCase().replace(/\s+/g, '')}@utfpr.edu.br`,
        members: membersText,
        track: trackText,
        proposal: proposalText,
        status: 'PENDENTE' as const,
        votingOpen: false,
        votesCount: 0,
        createdAt: new Date().toISOString(),
      };

      const updatedTeams = [...(ideathonTeams || []), newTeamItem];
      await fetch('/api/v1/admin/cms/ideathon_teams', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updatedTeams }),
      });

      setStatusMessage({ type: 'success', text: 'Equipe cadastrada com sucesso no Ideathon!' });
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
        setTeamName('');
        setCustomTrack('');
        setProposal('');
      }, 1500);
    } catch {
      setStatusMessage({ type: 'error', text: 'Erro ao registrar a equipe. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-[#0b0e11] border border-[#2b3139] rounded-2xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2b3139]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fcd535]/10 border border-[#fcd535]/30 flex items-center justify-center text-[#fcd535]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Inscrição de Equipe no Ideathon</h3>
                <p className="text-xs text-[#707a8a]">SECOMP 2026 • Maratona de Inovação Aberta</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#707a8a] hover:text-white rounded-lg hover:bg-[#1e2329] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isRegistrationOpen ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#f6465d]/10 border border-[#f6465d]/30 text-[#f6465d] flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Inscrições Temporariamente Fechadas</h4>
              <p className="text-xs text-[#707a8a] max-w-sm mx-auto">
                A abertura das inscrições para o Ideathon é realizada manualmente pelo moderador no auditório. Aguarde o anúncio oficial!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {statusMessage && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-[#0ecb81]/10 text-[#0ecb81] border border-[#0ecb81]/30'
                      : 'bg-[#f6465d]/10 text-[#f6465d] border border-[#f6465d]/30'
                  }`}
                >
                  {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {statusMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#707a8a] uppercase mb-1">Nome da Equipe</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CodeCraft / DataInnovators"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-[#181a20] border border-[#2b3139] focus:border-[#fcd535] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#707a8a] uppercase mb-1">Tema / Trilha do Projeto (Livre)</label>
                <input
                  type="text"
                  placeholder="Ex: Sustentabilidade & ESG / Inteligência Artificial"
                  value={customTrack}
                  onChange={(e) => setCustomTrack(e.target.value)}
                  className="w-full bg-[#181a20] border border-[#2b3139] focus:border-[#fcd535] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#707a8a] uppercase mb-1">Resumo da Proposta / Ideia</label>
                <textarea
                  rows={2}
                  placeholder="Descreva brevemente a solução desenvolvida pela equipe..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  className="w-full bg-[#181a20] border border-[#2b3139] focus:border-[#fcd535] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#707a8a] uppercase mb-1">Líder da Equipe</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    className="w-full bg-[#181a20] border border-[#2b3139] focus:border-[#fcd535] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#707a8a] uppercase mb-1">RA ou Documento</label>
                  <input
                    type="text"
                    placeholder="Ex: a2489120"
                    value={leaderRa}
                    onChange={(e) => setLeaderRa(e.target.value)}
                    className="w-full bg-[#181a20] border border-[#2b3139] focus:border-[#fcd535] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#707a8a] uppercase">Integrantes (2 a 5 pessoas)</label>
                  {members.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="text-xs text-[#fcd535] font-semibold hover:underline"
                    >
                      + Adicionar Membro
                    </button>
                  )}
                </div>
                {members.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Nome / RA do Integrante ${idx + 2}`}
                      value={member}
                      onChange={(e) => handleMemberChange(idx, e.target.value)}
                      className="flex-1 bg-[#181a20] border border-[#2b3139] focus:border-[#fcd535] rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
                    />
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="p-2 text-[#707a8a] hover:text-[#f6465d] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#fcd535] hover:bg-[#fcd535]/90 text-black font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#fcd535]/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registrando Equipe...' : 'Confirmar Inscrição da Equipe'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
