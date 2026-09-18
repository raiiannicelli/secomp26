import React, { useEffect } from 'react';
import { ScheduleSection } from './ScheduleSection';
import { WorkshopsSection } from './WorkshopsSection';

export const SchedulePage: React.FC = () => {
  useEffect(() => {
    // Se houver hash #minicursos, faz scroll suave até ele, senão rola ao topo
    if (typeof window !== 'undefined' && window.location.hash === '#minicursos') {
      setTimeout(() => {
        const el = document.getElementById('minicursos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] pt-16">
      <ScheduleSection />
      <WorkshopsSection />
    </div>
  );
};

export default SchedulePage;
