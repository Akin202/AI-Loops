import React from 'react';
import { loopsConfig } from '../../config/loops.config';
import { MetaStrip } from './MetaStrip';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateSubmit: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateHome, onNavigateSubmit }) => {
  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-[#262626] mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Top bar: Co-branding lockup & Submit link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[#262626]">
          {/* Co-branding lockup: AI Loops + org from config */}
          <div className="flex flex-wrap items-center gap-4 select-none">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xl font-display font-extrabold uppercase tracking-tight text-[#FAFAFA] hover:text-white"
            >
              {loopsConfig.name}
            </button>
            <span className="text-[#404040]" aria-hidden="true">
              ×
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 border border-[#404040] bg-[#141414] flex items-center justify-center text-[10px] font-mono font-bold text-[#FAFAFA]"
                aria-hidden="true"
              >
                AI
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#FAFAFA] leading-tight">
                  {loopsConfig.org.name}
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#737373]">
                  {loopsConfig.org.subLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Submission CTA link */}
          <button
            type="button"
            onClick={onNavigateSubmit}
            className="min-h-[48px] px-4 py-2 border border-[#404040] text-xs font-semibold uppercase tracking-[0.18em] text-[#FAFAFA] hover:bg-[#141414] hover:border-[#FAFAFA] transition-colors"
          >
            + Submit an Event to Registry
          </button>
        </div>

        {/* UNDP Programme line from config */}
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm text-[#A3A3A3] leading-relaxed">
            {loopsConfig.undpProgrammeLine}
          </p>
          <MetaStrip
            items={[
              'NIGERIA DIGITAL ECOSYSTEM',
              'PUBLIC REGISTRY PROTOCOL',
              'ARCHIVE 2026',
            ]}
          />
        </div>

        {/* Bottom copyright / minimal hairline */}
        <div className="pt-4 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#737373] font-mono">
          <p>© 2026 AI Loops. All rights reserved.</p>
          <p>Designed for mid-tier mobile networks · Zero trackers</p>
        </div>
      </div>
    </footer>
  );
};
