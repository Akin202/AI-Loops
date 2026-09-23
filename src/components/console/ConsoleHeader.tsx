import React from 'react';

interface ConsoleHeaderProps {
  onNavigatePublic: () => void;
  pendingCount?: number;
}

export const ConsoleHeader: React.FC<ConsoleHeaderProps> = ({
  onNavigatePublic,
  pendingCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFFFFF] border-b border-[#E7E5E4] text-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand + Breadcrumb */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm tracking-tight text-[#1C1917]">
            AI Loops <span className="font-mono text-xs text-[#78716C] font-normal">/ Console</span>
          </span>
          <span className="text-[#E7E5E4]">|</span>
          <div className="flex items-center gap-1 text-xs text-[#78716C]">
            <span>Events</span>
            <span className="text-[#A8A29E]">/</span>
            <span className="font-medium text-[#1C1917]">Ingest</span>
          </div>
          {pendingCount > 0 && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
              {pendingCount} in queue
            </span>
          )}
        </div>

        {/* Right: Environment Info & Return to Public */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[11px] text-[#78716C] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" aria-hidden="true" />
            <span>BATCH: OCT–DEC 2026</span>
          </div>

          <button
            type="button"
            onClick={onNavigatePublic}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1C1917] bg-[#FAFAF9] hover:bg-[#F5F5F4] border border-[#E7E5E4] rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-1 min-h-[36px]"
          >
            <span>Public Portal</span>
            <span className="text-[#78716C]" aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </header>
  );
};
