import React, { useEffect, useState, useMemo } from 'react';
import type { Event, EventCategory, EventStatus, TeamRole } from '../../../types';
import { getManageableEvents, updateEventStatus } from '../../../lib/data-access';
import {
  Search,
  ExternalLink,
  Plus,
  CheckCircle2,
  Archive,
  Calendar,
  MapPin,
  Clock,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';

interface ConsoleEventsProps {
  onNavigate: (path: string) => void;
  currentRole: TeamRole;
}

export const ConsoleEvents: React.FC<ConsoleEventsProps> = ({
  onNavigate,
  currentRole,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Upcoming' | 'Past'>('All');

  // Selected for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionNotice, setBulkActionNotice] = useState<string | null>(null);

  const statuses: EventStatus[] = ['draft', 'pending_review', 'approved', 'published', 'archived'];
  const categories: EventCategory[] = [
    'Conference',
    'Meetup',
    'Hackathon',
    'Workshop',
    'Demo Day',
  ];

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getManageableEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const now = useMemo(() => new Date('2026-09-22T00:00:00Z').getTime(), []);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedStatus !== 'All' && ev.status !== selectedStatus) return false;
      if (selectedCategory !== 'All' && ev.category !== selectedCategory) return false;
      if (dateFilter === 'Upcoming' && new Date(ev.startDate).getTime() < now) return false;
      if (dateFilter === 'Past' && new Date(ev.startDate).getTime() >= now) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchOrganiser = ev.organiser.toLowerCase().includes(q);
        const matchCity = ev.city.toLowerCase().includes(q);
        if (!matchTitle && !matchOrganiser && !matchCity) return false;
      }
      return true;
    });
  }, [events, selectedStatus, selectedCategory, dateFilter, searchQuery, now]);

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredEvents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEvents.map((e) => e.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (targetStatus: EventStatus) => {
    if (currentRole === 'Viewer' || selectedIds.length === 0) return;

    try {
      // TODO(handoff): bulk publish / archive
      await updateEventStatus(selectedIds, targetStatus);
      setEvents((prev) =>
        prev.map((ev) => (selectedIds.includes(ev.id) ? { ...ev, status: targetStatus } : ev))
      );
      setBulkActionNotice(
        `Bulk operation complete: ${selectedIds.length} event(s) marked as ${targetStatus}.`
      );
      setSelectedIds([]);
      setTimeout(() => setBulkActionNotice(null), 3500);
    } catch (err) {
      console.error('Failed to update event statuses:', err);
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'approved':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'pending_review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'draft':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'archived':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Ingest Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E5E4]">
        <div>
          <h1 className="text-lg font-semibold text-[#1C1917] tracking-tight flex items-center gap-2">
            <span>Event Management</span>
            <span className="text-xs font-mono font-normal text-[#78716C]">
              ({events.length} total)
            </span>
          </h1>
          <p className="text-xs text-[#78716C] font-mono mt-0.5">
            Internal event operations, moderation queue, and public releases
          </p>
        </div>

        {/* Link to Ingest Screen */}
        <button
          type="button"
          onClick={() => onNavigate('/console/ingest')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-xs font-semibold transition-colors shadow-2xs min-h-[36px]"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest Events</span>
        </button>
      </div>

      {/* Filter and Bulk Action Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, organiser, city…"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            >
              <option value="All">All Statuses</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            >
              <option value="All">All Dates</option>
              <option value="Upcoming">Upcoming Only</option>
              <option value="Past">Past Only</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E7E5E4]/70 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#44403C] hover:text-[#1C1917]"
            >
              {selectedIds.length > 0 && selectedIds.length === filteredEvents.length ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#1D4ED8]" />
              ) : (
                <Square className="w-3.5 h-3.5 text-[#78716C]" />
              )}
              <span>
                {selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select All'}
              </span>
            </button>

            {selectedIds.length > 0 && currentRole !== 'Viewer' && (
              <div className="flex items-center gap-1.5 ml-2">
                {/* // TODO(handoff): bulk publish / archive */}
                <button
                  type="button"
                  onClick={() => handleBulkStatusChange('published')}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-mono text-[11px] font-medium transition-colors"
                >
                  Publish Selected
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkStatusChange('archived')}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded font-mono text-[11px] font-medium transition-colors"
                >
                  Archive Selected
                </button>
              </div>
            )}
          </div>

          {bulkActionNotice && (
            <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              {bulkActionNotice}
            </span>
          )}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[#78716C] font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3 font-semibold">Title & Organiser</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Date & Location</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-mono text-[#78716C]">
                    Querying events repository…
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-mono text-[#78716C]">
                    No events found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const isSelected = selectedIds.includes(ev.id);

                  return (
                    <tr
                      key={ev.id}
                      className={`hover:bg-[#FAFAF9] transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(ev.id)}
                          className="text-[#78716C] hover:text-[#1C1917]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-[#1D4ED8]" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-[#A8A29E]" />
                          )}
                        </button>
                      </td>

                      {/* Title & Organiser */}
                      <td className="py-2.5 px-3 max-w-sm">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-xs text-[#1C1917] block line-clamp-1">
                            {ev.title}
                          </span>
                          <span className="text-[11px] text-[#78716C] block">{ev.organiser}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F5F5F4] text-[#44403C] border border-[#E7E5E4]">
                          {ev.category}
                        </span>
                      </td>

                      {/* Date & Location */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-[#44403C]">
                        <div>
                          {new Date(ev.startDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-[#78716C]">
                          {ev.city} · {ev.format}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getStatusBadge(
                            ev.status || 'draft'
                          )}`}
                        >
                          {(ev.status || 'draft').replace('_', ' ')}
                        </span>
                      </td>

                      {/* Row Action: Open Public Detail Page */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/events/${ev.slug}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#1D4ED8] hover:bg-blue-50 rounded transition-colors"
                          title="View Public Event Detail"
                        >
                          <span>Public Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
