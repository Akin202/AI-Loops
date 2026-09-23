import React from 'react';
import { loopsConfig } from '../../config/loops.config';
import { ContourLines } from './ContourLines';
import { MetaStrip } from './MetaStrip';

interface HeroProps {
  onNavigateSubmit: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateSubmit }) => {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] border-b border-[#262626]">
      {/* Contour lines background at 6% opacity (Static, Hero only) */}
      <ContourLines />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div className="max-w-4xl space-y-6">
          {/* Tagline from config rendered as a MetaStrip */}
          <div>
            <MetaStrip
              items={[
                loopsConfig.tagline,
                'VOL. IV',
                'SEPT - DEC 2026',
              ]}
              className="text-[#B5B5B5]"
            />
          </div>

          {/* Large Wordmark */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-[#FAFAFA] tracking-[-0.04em] leading-none uppercase select-none">
            {loopsConfig.name}
          </h1>

          {/* One line of description */}
          <p className="text-base sm:text-lg md:text-xl text-[#B5B5B5] leading-relaxed max-w-2xl font-normal">
            {loopsConfig.description}
          </p>

          {/* Quick action bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onNavigateSubmit}
              className="min-h-[48px] px-6 py-3 bg-[#FAFAFA] text-[#0A0A0A] text-xs uppercase font-bold tracking-[0.14em] hover:bg-[#E5E5E5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FAFAFA] touch-manipulation"
            >
              + Submit Convening
            </button>
            <div className="hidden sm:block">
              <MetaStrip items={['VERIFIED REGISTRY', 'OPEN ACCESS', 'ZERO TRACKING']} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
