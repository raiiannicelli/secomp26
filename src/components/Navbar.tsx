import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number>(54);

  const { openEnrollModal, currentLevel, stampsCount, activeTab, setActiveTab } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const targetDate = new Date('2026-11-09T09:00:00');
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    if (diffDays > 0) setDaysLeft(diffDays);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  interface NavItem {
    name: string;
    href: string;
    tab?: 'EVENTO' | 'PASSAPORTE' | 'PROGRAMACAO';
  }

  const navLinks: NavItem[] = [
    { name: 'Programação', href: '#programacao', tab: 'PROGRAMACAO' },
    { name: 'Minicursos', href: '#minicursos', tab: 'PROGRAMACAO' },
    { name: 'Inscrição', href: '#ideathon-inscricao' },
    { name: 'Passaporte', href: '#passaporte', tab: 'PASSAPORTE' },
    { name: 'Sobre o DACOMP', href: '# sobre-secomp' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, tab?: 'EVENTO' | 'PASSAPORTE' | 'PROGRAMACAO') => {
    e.preventDefault();
    if (tab === 'PROGRAMACAO') {
      setActiveTab('PROGRAMACAO');
      if (href === '#minicursos') {
        setTimeout(() => {
          const el = document.getElementById('minicursos');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 80);
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
        }, 80);
      } else {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (activeTab !== 'EVENTO') {
      setActiveTab('EVENTO');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLinkActive = (link: NavItem) => {
    if (activeTab === 'PROGRAMACAO' && link.name === 'Programação') return true;
    if (activeTab === 'PASSAPORTE' && link.tab === 'PASSAPORTE') return true;
    return false;
  };

  return (
    <header
      data-testid="top-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-150 ${isScrolled
        ? 'bg-[#0b0e11] border-b border-[#2b3139]'
        : 'bg-[#0b0e11] border-b border-[#2b3139]'
        }`}
      style={{ height: '64px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Mark */}
        <a href="#" onClick={handleBrandClick} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-md bg-[#fcd535] flex items-center justify-center font-mono font-black text-[#181a20] text-lg group-hover:scale-105 transition-transform">
            SC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">SECOMP</span>
              <span className="font-mono text-xs font-bold text-[#fcd535]  px-1.5">
                2026
              </span>
            </div>
            <p className="text-[10px] text-[#707a8a] hidden sm:block font-medium">Conexoes AI • UTFPR</p>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.tab)}
                className={`text-xs font-medium transition-colors ${active
                  ? 'text-[#fcd535] font-bold border-b border-[#fcd535] pb-0.5'
                  : 'text-[#eaecef] hover:text-[#fcd535]'
                  }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Center Date Badge */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#707a8a]">09 A 13 NOV</span>
            <span className="text-xs font-mono text-[#0ecb81] bg-[#0b0e11] px-2 py-0.5 rounded border border-[#2b3139]">
              {daysLeft} DIAS
            </span>
          </div>
          <button
            onClick={() => openEnrollModal()}
            className="px-3.5 py-1.5 rounded-md bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-xs font-mono transition-colors"
          >
            Garantir Vaga
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#eaecef] hover:text-[#fcd535] focus:outline-none"
          aria-label="Abrir Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1e2329] border-b border-[#2b3139] px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2b3139]">
            <span className="text-xs font-mono text-[#707a8a]">DATA: 09 A 13 NOV</span>
            <span className="text-xs font-mono text-[#0ecb81] bg-[#0b0e11] px-2 py-0.5 rounded border border-[#2b3139]">
              {daysLeft} DIAS
            </span>
          </div>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, link.href, link.tab);
              }}
              className={`block text-sm font-medium py-1.5 ${isLinkActive(link)
                ? 'text-[#fcd535] font-bold'
                : 'text-[#eaecef] hover:text-[#fcd535]'
                }`}
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openEnrollModal();
            }}
            className="w-full mt-2 h-11 rounded-md bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-semibold text-sm flex items-center justify-center gap-2"
          >
            <span>Garantir Vaga</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
