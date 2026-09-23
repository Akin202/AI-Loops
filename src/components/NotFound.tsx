import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { loopsConfig } from '../../config/loops.config';

interface NotFoundProps {
  onNavigate: (path: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Background motif */}
      <div className="relative max-w-md w-full space-y-6">
        <div className="inline-flex p-3 rounded-full bg-[#171717] border border-[#262626] text-[#A3A3A3]">
          <Compass className="w-8 h-8 text-[#E5E5E5]" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs text-[#737373] tracking-widest uppercase">
            Error 404 · Unmapped Route
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFFFF]">
            Convening Not Found
          </h1>
          <p className="text-sm text-[#A3A3A3] leading-relaxed max-w-sm mx-auto">
            The requested page or convening identifier does not exist in the {loopsConfig.name} national index.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#FFFFFF] text-[#0A0A0A] font-medium text-xs hover:bg-[#E5E5E5] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to National Registry</span>
          </button>
        </div>
      </div>
    </div>
  );
};
