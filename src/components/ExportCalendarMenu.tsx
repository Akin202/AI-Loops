import React, { useState, useRef, useEffect } from 'react';
import type { Event } from '../../types';
import {
  downloadIcsFile,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
} from '../../lib/calendar';
import { Calendar, Check, ExternalLink, Download } from 'lucide-react';

interface ExportCalendarMenuProps {
  event: Event;
  variant?: 'compact' | 'prominent';
  className?: string;
}

export const ExportCalendarMenu: React.FC<ExportCalendarMenuProps> = ({
  event,
  variant = 'compact',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
      setIsOpen(false);
    }, 1800);
  };

  const handleAppleIcsExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      downloadIcsFile(event);
      showStatus('✓ Apple iCal (.ics) saved');
    } catch (err) {
      console.error('Failed to export iCal:', err);
    }
  };

  const handleGoogleCalendarExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = generateGoogleCalendarUrl(event);
      window.open(url, '_blank', 'noopener,noreferrer');
      showStatus('✓ Opening Google Calendar...');
    } catch (err) {
      console.error('Failed to open Google Calendar:', err);
    }
  };

  const handleOutlookExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = generateOutlookCalendarUrl(event);
      window.open(url, '_blank', 'noopener,noreferrer');
      showStatus('✓ Opening Outlook...');
    } catch (err) {
      console.error('Failed to open Outlook:', err);
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (variant === 'prominent') {
    return (
      <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
        <button
          type="button"
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="min-h-[52px] px-6 py-3.5 border border-[#FAFAFA] bg-[#FAFAFA] text-[#0A0A0A] hover:bg-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors flex items-center justify-center gap-2 select-none"
        >
          <Calendar className="w-4 h-4 text-[#0A0A0A]" aria-hidden="true" />
          <span>Add to Calendar</span>
          <span className="font-mono text-[10px] ml-1 opacity-70">▾</span>
        </button>

        {isOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-72 bg-[#141414] border border-[#333333] shadow-2xl z-50 p-2 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {statusMessage ? (
              <div className="py-4 px-3 text-center text-xs font-mono text-[#FAFAFA] bg-[#1C1C1C] flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{statusMessage}</span>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-[#262626]">
                  <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-[#737373]">
                    EXPORT TO PERSONAL CALENDAR
                  </span>
                </div>

                {/* Apple Calendar (.ics) */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleAppleIcsExport}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#222222] transition-colors flex items-start gap-3 group"
                >
                  <div className="w-7 h-7 bg-[#262626] flex items-center justify-center text-[#FAFAFA] flex-shrink-0 mt-0.5 group-hover:bg-[#FAFAFA] group-hover:text-[#0A0A0A] transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">
                      Apple Calendar (.ics)
                    </span>
                    <span className="block text-[11px] text-[#8A8A8A] leading-tight mt-0.5">
                      Direct iCal download for macOS, iOS & iPadOS
                    </span>
                  </div>
                </button>

                {/* Google Calendar Direct */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleGoogleCalendarExport}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#222222] transition-colors flex items-start gap-3 group"
                >
                  <div className="w-7 h-7 bg-[#262626] flex items-center justify-center text-[#FAFAFA] flex-shrink-0 mt-0.5 group-hover:bg-[#FAFAFA] group-hover:text-[#0A0A0A] transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">
                      Google Calendar
                    </span>
                    <span className="block text-[11px] text-[#8A8A8A] leading-tight mt-0.5">
                      Sync directly into your personal Google Calendar
                    </span>
                  </div>
                </button>

                {/* Outlook Web / Desktop */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleOutlookExport}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#222222] transition-colors flex items-start gap-3 group"
                >
                  <div className="w-7 h-7 bg-[#262626] flex items-center justify-center text-[#FAFAFA] flex-shrink-0 mt-0.5 group-hover:bg-[#FAFAFA] group-hover:text-[#0A0A0A] transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">
                      Outlook / Other (.ics)
                    </span>
                    <span className="block text-[11px] text-[#8A8A8A] leading-tight mt-0.5">
                      Outlook 365, Live, or standard CalDAV
                    </span>
                  </div>
                </button>

                <div className="pt-2 px-3 pb-1 border-t border-[#262626]">
                  <span className="block text-[9px] font-mono text-[#666666] uppercase tracking-wider">
                    RFC 5545 SPEC · WEST AFRICA TIME (WAT)
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Compact variant for Event Rows in the list
  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label={`Export ${event.title} to calendar`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="min-h-[40px] px-2.5 py-1.5 border border-[#333333] hover:border-[#FAFAFA] bg-[#141414] hover:bg-[#1C1C1C] text-[11px] font-mono font-medium uppercase tracking-[0.14em] text-[#B5B5B5] hover:text-[#FAFAFA] transition-colors flex items-center gap-1.5 select-none"
      >
        <Calendar className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#FAFAFA]" aria-hidden="true" />
        <span className="hidden sm:inline">+ Cal</span>
        <span className="sm:hidden">+</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-1 w-64 bg-[#141414] border border-[#333333] shadow-2xl z-50 p-1.5 space-y-1"
          onClick={(e) => e.stopPropagation()}
        >
          {statusMessage ? (
            <div className="py-3 px-2 text-center text-[11px] font-mono text-[#FAFAFA] bg-[#1C1C1C] flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          ) : (
            <>
              <div className="px-2 py-1.5 border-b border-[#262626]">
                <span className="block text-[9px] font-mono uppercase tracking-[0.18em] text-[#737373]">
                  ADD TO CALENDAR
                </span>
              </div>

              {/* Apple Calendar iCal */}
              <button
                type="button"
                role="menuitem"
                onClick={handleAppleIcsExport}
                className="w-full text-left px-2 py-2 hover:bg-[#222222] transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#FAFAFA]" />
                  <span className="text-xs font-medium text-[#E5E5E5] group-hover:text-[#FAFAFA]">
                    Apple Calendar (.ics)
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#737373] group-hover:text-[#A3A3A3]">
                  iCal
                </span>
              </button>

              {/* Google Calendar Web */}
              <button
                type="button"
                role="menuitem"
                onClick={handleGoogleCalendarExport}
                className="w-full text-left px-2 py-2 hover:bg-[#222222] transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#FAFAFA]" />
                  <span className="text-xs font-medium text-[#E5E5E5] group-hover:text-[#FAFAFA]">
                    Google Calendar
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#737373] group-hover:text-[#A3A3A3]">
                  Web
                </span>
              </button>

              {/* Universal .ics Download */}
              <button
                type="button"
                role="menuitem"
                onClick={handleAppleIcsExport}
                className="w-full text-left px-2 py-2 hover:bg-[#222222] transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#FAFAFA]" />
                  <span className="text-xs font-medium text-[#E5E5E5] group-hover:text-[#FAFAFA]">
                    Outlook / Other (.ics)
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#737373] group-hover:text-[#A3A3A3]">
                  File
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
