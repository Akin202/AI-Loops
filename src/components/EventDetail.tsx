// TODO(handoff): generateMetadata for link previews

import React, { useEffect, useState } from 'react';
import type { Event } from '../../types';
import { getEventBySlug, getRelatedEvents } from '../../lib/data-access';
import { MetaStrip } from './MetaStrip';
import { ExportCalendarMenu } from './ExportCalendarMenu';

interface EventDetailProps {
  slug: string;
  onNavigateHome: () => void;
  onSelectEvent: (slug: string) => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({
  slug,
  onNavigateHome,
  onSelectEvent,
}) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [related, setRelated] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Scroll to top on slug change
    window.scrollTo({ top: 0, behavior: 'instant' });

    Promise.all([getEventBySlug(slug), getRelatedEvents(slug, 3)]).then(
      ([eventData, relatedData]) => {
        if (isMounted) {
          setEvent(eventData);
          setRelated(relatedData);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 space-y-6">
        <MetaStrip items={['RETRIEVING ARCHIVAL RECORD', slug.toUpperCase()]} />
        <div className="h-10 bg-[#141414] animate-pulse w-3/4" />
        <div className="h-6 bg-[#141414] animate-pulse w-1/2" />
        <div className="h-32 bg-[#141414] animate-pulse w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 space-y-6">
        <MetaStrip items={['REGISTRY ERROR 404', 'CONVENING NOT FOUND']} />
        <h1 className="font-display text-3xl font-bold text-[#FAFAFA]">
          Event Record Not Found
        </h1>
        <p className="text-base text-[#B5B5B5]">
          The event slug "{slug}" does not exist in the archival database or has been rescheduled.
        </p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="min-h-[48px] px-6 py-3 border border-[#404040] text-xs font-bold uppercase tracking-[0.14em] text-[#FAFAFA] hover:bg-[#141414]"
        >
          ← Back to All Convenings
        </button>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const formattedStartDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const priceLabel =
    event.priceType === 'Free'
      ? 'FREE ADMISSION'
      : event.price
      ? event.price.toUpperCase()
      : 'PAID TICKET';

  return (
    <article className="w-full">
      {/* Top Breadcrumb / Back Link */}
      <div className="border-b border-[#262626] bg-[#0D0D0D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="min-h-[48px] inline-flex items-center text-xs font-semibold uppercase tracking-[0.16em] text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors"
          >
            ← Back to All Events
          </button>
          <MetaStrip items={[event.city, event.category]} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Header Block */}
        <header className="space-y-6">
          <MetaStrip
            items={[
              event.slug === 'nigeria-blockchain-and-ai-week-2026'
                ? '★ BIGGEST AI CONVENING 2026'
                : event.featured
                ? 'MAJOR AI FOCUS'
                : null,
              event.city,
              event.category,
              event.format,
              priceLabel,
            ]}
            itemClassName={event.featured ? 'text-[#FAFAFA]' : undefined}
          />

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#FAFAFA] tracking-[-0.03em] leading-tight">
            {event.title}
          </h1>

          <p className="text-base sm:text-lg text-[#A3A3A3]">
            Organised by <strong className="text-[#FAFAFA] font-semibold">{event.organiser}</strong>
          </p>
        </header>

        {/* Date and Venue Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 bg-[#141414] border border-[#262626]">
          {/* Date Column */}
          <div className="space-y-2">
            <span className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[#737373]">
              DATE & TIME
            </span>
            <p className="text-base sm:text-lg font-bold text-[#FAFAFA]">
              {formattedStartDate}
            </p>
            {endDate && (
              <p className="text-sm text-[#A3A3A3]">
                Through{' '}
                {endDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
            <p className="text-sm text-[#8A8A8A] font-mono pt-1">
              Commences at {formattedTime}
            </p>
          </div>

          {/* Venue Column */}
          <div className="space-y-2 md:border-l md:border-[#262626] md:pl-6">
            <span className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[#737373]">
              LOCATION & ACCESS
            </span>
            <p className="text-base sm:text-lg font-bold text-[#FAFAFA]">
              {event.venue}
            </p>
            <p className="text-sm text-[#A3A3A3]">
              Format: {event.format} ({event.city})
            </p>
            <p className="text-sm text-[#8A8A8A] font-mono pt-1">
              Pricing: {priceLabel}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons: Register + Export to Calendar + Index */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-wrap">
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[52px] px-8 py-3.5 bg-[#FAFAFA] text-[#0A0A0A] font-bold text-xs uppercase tracking-[0.16em] inline-flex items-center justify-center hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#FAFAFA]"
            onClick={() => {
              // TODO(handoff): registration analytics hook
            }}
          >
            Register for This Convening ↗
          </a>
          <ExportCalendarMenu event={event} variant="prominent" />
          <button
            type="button"
            onClick={onNavigateHome}
            className="min-h-[52px] px-6 py-3.5 border border-[#404040] text-xs font-semibold uppercase tracking-[0.14em] text-[#FAFAFA] hover:bg-[#141414] transition-colors"
          >
            Index Catalog
          </button>
        </div>

        {/* Description Section */}
        <section className="space-y-4 pt-4 border-t border-[#262626]">
          <span className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[#737373]">
            OVERVIEW & OBJECTIVES
          </span>
          <div className="prose prose-invert max-w-none text-[#E5E5E5] text-base sm:text-lg leading-relaxed space-y-4 font-normal">
            <p>{event.description}</p>
            <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
              This session is recorded in the official AI Loops repository under the Nigerian AI Ecosystem framework. Attendance verification and credential issuance are administered directly by the convening host.
            </p>
          </div>
        </section>

        {/* Related Events Section (Three related events) */}
        <section className="pt-12 border-t border-[#262626] space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#FAFAFA]">
              RELATED SESSIONS IN ARCHIVE
            </span>
            <MetaStrip items={[`${related.length} CONVENINGS`]} />
          </div>

          <div className="divide-y divide-[#262626] border-y border-[#262626]">
            {related.map((rel) => {
              const d = new Date(rel.startDate);
              const day = String(d.getUTCDate()).padStart(2, '0');
              const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectEvent(rel.slug)}
                  className="group py-4 sm:py-5 flex items-start gap-4 cursor-pointer hover:bg-[#141414] transition-colors px-2"
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectEvent(rel.slug);
                    }
                  }}
                >
                  <div className="w-14 flex-shrink-0 select-none">
                    <span className="block font-display text-2xl font-bold text-[#FAFAFA] leading-none">
                      {day}
                    </span>
                    <span className="block text-[10px] font-semibold tracking-widest text-[#8A8A8A] uppercase">
                      {month}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-base sm:text-lg font-bold text-[#FAFAFA] group-hover:underline underline-offset-2">
                      {rel.title}
                    </h4>
                    <div className="mt-1">
                      <MetaStrip items={[rel.city, rel.category, rel.format]} />
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="text-[#525252] group-hover:text-[#FAFAFA] text-sm font-mono pr-2"
                  >
                    →
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </article>
  );
};
