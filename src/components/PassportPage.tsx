import React, { useEffect } from 'react';
import { PassportSection } from './PassportSection';
import { BadgeGeneratorSection } from './BadgeGeneratorSection';

export const PassportPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] pt-16">
      <PassportSection />
      <BadgeGeneratorSection />
    </div>
  );
};

export default PassportPage;
