import React from 'react';
import type { Event } from '../../types';
import { MetaStrip } from './MetaStrip';
import { ExportCalendarMenu } from './ExportCalendarMenu';

export interface EventRowProps {
  event: Event;
  onSelectEvent?: (slug: string) => void;
  className?: string;
  isInteractive?: boolean;
}

export const EventRow: React.FC<EventRowProps> = ({
  event,
  onSelectEvent,
  className = '',
  isInteractive = true,
}) => {
  let dayNumeral = '--';
  let monthShort = 'TBD';

  if (event.startDate) {
    const d = new Date(event.startDate);
    if (!isNaN(d.getTime())) {
      dayNumeral = String(d.getUTCDate()).padStart(2, '0');
      monthShort = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    }
  }

  const priceDisplay =
    event.priceType === 'Free'
      ? 'FREE ACCESS'
      : event.price
      ? event.price.toUpperCase()
      : 'PAID ADMISSION';

  const handleClick = () => {
    if (isInteractive && onSelectEvent) {
      onSelectEvent(event.slug || event.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInteractive && onSelectEvent && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelectEvent(event.slug || event.id);
    }
  };

  return (
    <div
      role={isInteractive && onSelectEvent ? 'listitem' : 'article'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isInteractive && onSelectEvent ? 0 : undefined}
      aria-label={`${event.title || 'Untitled Event'}, on ${monthShort} ${dayNumeral}, in ${event.city || 'TBD'}`}
      className={`group block transition-colors duration-150 ${
        isInteractive && onSelectEvent
          ? 'cursor-pointer hover:bg-[#141414] focus:bg-[#141414] focus:outline-none'
          : ''
      } ${className}`}
    >
      <div className="py-5 sm:py-6 flex items-start gap-4 sm:gap-8">
        {/* Date Block Left */}
        <div className="flex-shrink-0 w-16 sm:w-20 pt-0.5 select-none">
          <span className="block font-display text-3xl sm:text-4xl font-extrabold text-[#FAFAFA] tracking-tighter leading-none group-hover:text-white tabular-nums">
            {dayNumeral}
          </span>
          <span className="block mt-1 text-[11px] font-semibold tracking-[0.18em] text-[#8A8A8A] uppercase">
            {monthShort}
          </span>
        </div>

        {/* Main Event Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <h3 className="font-display text-[18px] sm:text-[20px] font-bold text-[#FAFAFA] leading-snug tracking-[-0.02em] group-hover:underline underline-offset-4 decoration-[#525252] break-words">
              {event.title || 'Untitled Event'}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
              <ExportCalendarMenu event={event} variant="compact" />
              {isInteractive && onSelectEvent && (
                <span
                  aria-hidden="true"
                  className="hidden sm:inline-block text-[#525252] group-hover:text-[#FAFAFA] group-hover:translate-x-1 transition-all duration-150 text-sm font-mono flex-shrink-0"
                >
                  →
                </span>
              )}
            </div>
          </div>

          {/* Organiser or short note */}
          <p className="mt-1 text-sm text-[#A3A3A3] line-clamp-1">
            Hosted by {event.organiser || 'Organiser TBD'} · {event.venue || 'Venue TBD'}
          </p>

          {/* MetaStrip beneath with city / category / format / price */}
          <div className="mt-2.5">
            <MetaStrip
              items={[
                event.slug === 'nigeria-blockchain-and-ai-week-2026'
                  ? '★ BIGGEST AI EVENT 2026'
                  : event.featured
                  ? 'MAJOR AI FOCUS'
                  : null,
                event.city || 'Nigeria',
                event.category || 'Convening',
                event.format || 'Format TBD',
                priceDisplay,
              ]}
              itemClassName={
                event.featured ? 'text-[#FAFAFA]' : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
