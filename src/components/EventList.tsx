import React from 'react';
import type { Event } from '../../types';
import { MetaStrip } from './MetaStrip';
import { EventRow } from './EventRow';

interface EventListProps {
  events: Event[];
  onSelectEvent: (slug: string) => void;
}

interface GroupedEvents {
  monthKey: string;
  monthTitle: string;
  items: Event[];
}

export const EventList: React.FC<EventListProps> = ({ events, onSelectEvent }) => {
  if (events.length === 0) {
    return (
      <div className="py-24 px-4 text-center space-y-4 max-w-md mx-auto">
        <MetaStrip items={['NO CONVENINGS MATCHED', 'QUERY EXHAUSTED']} className="justify-center" />
        <p className="text-[#FAFAFA] text-base leading-relaxed">
          No scheduled assemblies found matching the active filters. Broaden your location, month, or format criteria.
        </p>
      </div>
    );
  }

  // Group events by Month and Year (e.g. "October 2026")
  const grouped: GroupedEvents[] = [];
  const monthMap = new Map<string, Event[]>();

  events.forEach((event) => {
    const d = new Date(event.startDate);
    const monthTitle = d.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }
    monthMap.get(monthKey)!.push(event);
  });

  // Sort groups chronologically
  const sortedMonthKeys = Array.from(monthMap.keys()).sort();
  sortedMonthKeys.forEach((key) => {
    const items = monthMap.get(key)!;
    const firstDate = new Date(items[0].startDate);
    const monthTitle = firstDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    grouped.push({
      monthKey: key,
      monthTitle,
      items,
    });
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      {grouped.map((group) => (
        <section key={group.monthKey} className="relative mb-8 last:mb-0">
          {/* Sticky Month Header */}
          <div className="sticky top-0 z-10 py-3 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#262626]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-[#FAFAFA] inline-block" aria-hidden="true" />
                <h2 className="text-xs font-mono font-bold tracking-[0.24em] text-[#FAFAFA] uppercase">
                  {group.monthTitle}
                </h2>
              </div>
              <MetaStrip items={[`${group.items.length} SESSIONS`]} />
            </div>
          </div>

          {/* Editorial Rows */}
          <div className="divide-y divide-[#262626]" role="list">
            {group.items.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                onSelectEvent={onSelectEvent}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
