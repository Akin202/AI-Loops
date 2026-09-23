import React from 'react';
import { loopsConfig } from '../../config/loops.config';
import { MetaStrip } from './MetaStrip';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#262626]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Wordmark */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-baseline gap-2 text-left focus:outline-none focus:ring-1 focus:ring-[#FAFAFA]"
          >
            <span className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#FAFAFA]">
              {loopsConfig.name}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-[#737373] uppercase tracking-widest">
              [INDEX]
            </span>
          </button>

          <div className="hidden md:block">
            <MetaStrip items={['SEPT—DEC 2026', 'NIGERIA']} />
          </div>
        </div>

        {/* Navigation links */}
        <nav aria-label="Main Navigation" className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className={`min-h-[48px] px-3 sm:px-4 inline-flex items-center text-xs uppercase font-semibold tracking-[0.14em] transition-colors ${
              currentPath === '/'
                ? 'text-[#FAFAFA] border-b-2 border-[#FAFAFA]'
                : 'text-[#8A8A8A] hover:text-[#FAFAFA]'
            }`}
          >
            Index
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/submit')}
            className={`min-h-[48px] px-3 sm:px-4 inline-flex items-center text-xs uppercase font-semibold tracking-[0.14em] transition-colors ${
              currentPath === '/submit'
                ? 'text-[#FAFAFA] border-b-2 border-[#FAFAFA]'
                : 'text-[#8A8A8A] hover:text-[#FAFAFA]'
            }`}
          >
            + Submit
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/console')}
            className={`min-h-[48px] px-3 sm:px-4 inline-flex items-center text-xs uppercase font-semibold tracking-[0.14em] transition-colors ${
              currentPath.startsWith('/console')
                ? 'text-[#FAFAFA] border-b-2 border-[#FAFAFA]'
                : 'text-[#8A8A8A] hover:text-[#FAFAFA]'
            }`}
          >
            Console
          </button>
        </nav>
      </div>
    </header>
  );
};
