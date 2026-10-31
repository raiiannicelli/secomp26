import React from 'react';
import { Mail } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export const Footer: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    tab?: 'EVENTO' | 'PASSAPORTE' | 'PROGRAMACAO'
  ) => {
    e.preventDefault();
    if (tab === 'PROGRAMACAO') {
      setActiveTab('PROGRAMACAO');
      if (href === '#minicursos') {
        setTimeout(() => {
          const el = document.getElementById('minicursos');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (tab === 'PASSAPORTE') {
      setActiveTab('PASSAPORTE');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (activeTab !== 'EVENTO') {
        setActiveTab('EVENTO');
        setTimeout(() => {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      } else {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <footer className="bg-[#0b0e11] text-[#eaecef] pt-16 pb-12 border-t border-[#2b3139] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 text-xs">
          {/* Col 1 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider">Programação</h4>
            <ul className="space-y-2 text-[#707a8a]">
              <li><a href="#programacao" onClick={(e) => handleNavClick(e, '#programacao', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Segunda: O Mundo</a></li>
              <li><a href="#programacao" onClick={(e) => handleNavClick(e, '#programacao', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Terça: O Mercado</a></li>
              <li><a href="#programacao" onClick={(e) => handleNavClick(e, '#programacao', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Quarta: Os Projetos</a></li>
              <li><a href="#programacao" onClick={(e) => handleNavClick(e, '#programacao', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Quinta: O Humano</a></li>
              <li><a href="#programacao" onClick={(e) => handleNavClick(e, '#programacao', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Sexta: O Futuro</a></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider">Ativação</h4>
            <ul className="space-y-2 text-[#707a8a]">
              <li><a href="#minicursos" onClick={(e) => handleNavClick(e, '#minicursos', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Minicursos de Setembro</a></li>
              <li><a href="#minicursos" onClick={(e) => handleNavClick(e, '#minicursos', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Minicursos de Outubro</a></li>
              <li><a href="#minicursos" onClick={(e) => handleNavClick(e, '#minicursos', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Trilha IA & Dados</a></li>
              <li><a href="#minicursos" onClick={(e) => handleNavClick(e, '#minicursos', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Trilha Infra & Cyber</a></li>
              <li><a href="#minicursos" onClick={(e) => handleNavClick(e, '#minicursos', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Trilha Hardware & IoT</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider">Sessões</h4>
            <ul className="space-y-2 text-[#707a8a]">
              <li><a href="#programacao" onClick={(e) => handleNavClick(e, '#programacao', 'PROGRAMACAO')} className="hover:text-[#fcd535] transition-colors">Palestras Técnicas</a></li>
              <li><a href="#ideathon" onClick={(e) => handleNavClick(e, '#ideathon', 'EVENTO')} className="hover:text-[#fcd535] transition-colors">Ideathon Express</a></li>
              <li><a href="#talentos" onClick={(e) => handleNavClick(e, '#talentos', 'EVENTO')} className="hover:text-[#fcd535] transition-colors">Roda de Talentos</a></li>
              <li><a href="#feira-da-lua" onClick={(e) => handleNavClick(e, '#feira-da-lua', 'EVENTO')} className="hover:text-[#fcd535] transition-colors">Feira da Lua</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider">Acadêmico</h4>
            <ul className="space-y-2 text-[#707a8a]">
              <li><a href="#passaporte" onClick={(e) => handleNavClick(e, '#passaporte', 'PASSAPORTE')} className="hover:text-[#fcd535] transition-colors">Credenciamento & Presença</a></li>
              <li><a href="#patrocinadores" onClick={(e) => handleNavClick(e, '#patrocinadores', 'EVENTO')} className="hover:text-[#fcd535] transition-colors">Incubadora Sprint</a></li>
              <li><a href="#passaporte" onClick={(e) => handleNavClick(e, '#passaporte', 'PASSAPORTE')} className="hover:text-[#fcd535] transition-colors">Laboratórios de Engenharia</a></li>
              <li><a href="#feira-da-lua" onClick={(e) => handleNavClick(e, '#feira-da-lua', 'EVENTO')} className="hover:text-[#fcd535] transition-colors">Encerramento Solene</a></li>
            </ul>
          </div>

          {/* Col 5: Contato & Informações */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider">Contato & Apoio</h4>
            <ul className="space-y-2 text-[#707a8a]">
              <li><a href="#patrocinadores" onClick={(e) => handleNavClick(e, '#patrocinadores', 'EVENTO')} className="hover:text-[#fcd535] transition-colors">Empresas Parceiras</a></li>
              <li><a href="#patrocinadores" onClick={(e) => handleNavClick(e, '#patrocinadores', 'EVENTO')} className="hover:text-[#fcd535] transition-colors">Apoio Institucional</a></li>
              <li><a href="mailto:secomp2026@utfpr.edu.br" className="hover:text-[#fcd535] transition-colors flex items-center gap-1"><Mail className="w-3 h-3" /> dacom@utfpr.edu.br</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#707a8a]">
          © 2026 SECOMP UTFPR-CP • Departamento Acadêmico de Computação. • Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};
