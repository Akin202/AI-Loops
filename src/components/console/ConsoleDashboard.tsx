import React, { useEffect, useState } from 'react';
import type { AsyncState, DashboardStats, PipelineStage } from '../../../types';
import { getDashboardStats } from '../../../lib/data-access';
import {
  AlertTriangle,
  Download,
  Calendar,
  Building2,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';
import type { DashboardDevPreset } from './DevStateSwitcher';

interface ConsoleDashboardProps {
  onNavigate: (path: string) => void;
  dashboardPreset?: DashboardDevPreset;
}

export const ConsoleDashboard: React.FC<ConsoleDashboardProps> = ({
  onNavigate,
  dashboardPreset = 'normal',
}) => {
  const [asyncState, setAsyncState] = useState<AsyncState<DashboardStats>>({
    status: 'loading',
  });
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const loadStats = async () => {
    setAsyncState({ status: 'loading' });
    try {
      const override = dashboardPreset === 'normal' ? undefined : dashboardPreset;
      const res = await getDashboardStats(override);
      setAsyncState(res);
    } catch (err: unknown) {
      setAsyncState({
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown data access error',
      });
    }
  };

  useEffect(() => {
    loadStats();
  }, [dashboardPreset]);

  const handleExportCSV = () => {
    // TODO(handoff): CSV export
    setExportMessage('Generating partner pipeline CSV snapshot…');
    setTimeout(() => {
      setExportMessage('CSV snapshot ready (Logged to handoff callback).');
      setTimeout(() => setExportMessage(null), 3500);
    }, 800);
  };

  const stages: PipelineStage[] = [
    'Lead',
    'Contacted',
    'Engaged',
    'Partnered',
    'Champion',
    'Inactive',
  ];

  // 1. Loading State
  if (asyncState.status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-[#E7E5E4] rounded animate-pulse" />
          <div className="h-8 w-24 bg-[#E7E5E4] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-white border border-[#E7E5E4] rounded p-3 space-y-2">
              <div className="h-3 w-16 bg-[#E7E5E4] rounded animate-pulse" />
              <div className="h-6 w-10 bg-[#E7E5E4] rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-64 bg-white border border-[#E7E5E4] rounded p-6 flex flex-col items-center justify-center text-center">
          <RefreshCw className="w-6 h-6 text-[#78716C] animate-spin mb-2" />
          <p className="text-xs font-mono text-[#78716C]">Loading ecosystem telemetry…</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (asyncState.status === 'error') {
    return (
      <div className="bg-white border border-rose-200 rounded p-8 max-w-xl mx-auto my-8 text-center space-y-4 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#1C1917]">Ecosystem Telemetry Unreachable</h2>
          <p className="text-xs text-[#78716C] font-mono">{asyncState.error}</p>
        </div>
        <button
          type="button"
          onClick={loadStats}
          className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Query</span>
        </button>
      </div>
    );
  }

  // 3. Empty State
  if (asyncState.status === 'empty' || !asyncState.data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]">
          <div>
            <h1 className="text-lg font-semibold text-[#1C1917]">Ecosystem Operations</h1>
            <p className="text-xs text-[#78716C]">Quarterly reporting instrument</p>
          </div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded p-12 text-center space-y-3">
          <FolderKanban className="w-8 h-8 text-[#A8A29E] mx-auto" />
          <h3 className="text-sm font-medium text-[#1C1917]">No Partner or Pipeline Activity</h3>
          <p className="text-xs text-[#78716C] max-w-sm mx-auto">
            The organisation pipeline is currently empty. Ingest events or add partner organisations to populate operational indicators.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/console/ingest')}
              className="px-3 py-1.5 bg-[#1D4ED8] text-white text-xs font-semibold rounded"
            >
              Ingest Events
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/console/pipeline')}
              className="px-3 py-1.5 bg-white border border-[#E7E5E4] text-xs font-medium text-[#1C1917] rounded"
            >
              Open Pipeline
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = asyncState.data;

  return (
    <div className="space-y-6">
      {/* Top Header & Reporting Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E4]">
        <div>
          <h1 className="text-lg font-semibold text-[#1C1917] tracking-tight">
            Ecosystem Operations
          </h1>
          <p className="text-xs text-[#78716C] font-mono mt-0.5">
            Snapshot as of 18 Sept 2026, 16:15 WAT · Tabular figures
          </p>
        </div>

        <div className="flex items-center gap-2">
          {exportMessage && (
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
              {exportMessage}
            </span>
          )}
          {/* Export Button */}
          {/* // TODO(handoff): CSV export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F5F5F4] text-[#1C1917] border border-[#E7E5E4] rounded text-xs font-medium transition-colors shadow-2xs min-h-[36px]"
            title="Download pipeline CSV summary"
          >
            <Download className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Row of Primary Figures: Leads by Stage & Partner Status */}
      <section aria-labelledby="figures-heading" className="space-y-2">
        <h2 id="figures-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C]">
          Core Performance Indicators
        </h2>

        {/* 6 Stage Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {stages.map((stg) => {
            const count = stats.leadsByStage[stg] || 0;
            return (
              <div
                key={stg}
                className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3 flex flex-col justify-between shadow-2xs hover:border-[#D6D3D1] transition-colors cursor-pointer"
                onClick={() => onNavigate(`/console/pipeline?stage=${stg}`)}
                title={`View ${stg} organisations`}
              >
                <span className="text-[11px] font-mono text-[#78716C] uppercase font-medium">
                  {stg}
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-semibold tabular-nums text-[#1C1917]">
                    {count}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#A8A29E]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Aggregate Operational Ratios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 pt-1">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3 shadow-2xs">
            <span className="text-[11px] font-mono text-[#78716C] uppercase">Active vs Inactive</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-semibold tabular-nums text-emerald-700">
                {stats.activePartners}
              </span>
              <span className="text-xs text-[#A8A29E] font-mono">/</span>
              <span className="font-mono text-xl font-semibold tabular-nums text-[#78716C]">
                {stats.inactivePartners}
              </span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3 shadow-2xs">
            <span className="text-[11px] font-mono text-[#78716C] uppercase">Q3 Conversions</span>
            <div className="mt-1">
              <span className="font-mono text-xl font-semibold tabular-nums text-[#1C1917]">
                +{stats.conversionsQuarter}
              </span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3 shadow-2xs">
            <span className="text-[11px] font-mono text-[#78716C] uppercase">Upcoming Events</span>
            <div className="mt-1">
              <span className="font-mono text-xl font-semibold tabular-nums text-[#1D4ED8]">
                {stats.upcomingEventsCount}
              </span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3 shadow-2xs">
            <span className="text-[11px] font-mono text-[#78716C] uppercase">Published</span>
            <div className="mt-1">
              <span className="font-mono text-xl font-semibold tabular-nums text-[#1C1917]">
                {stats.publishedEventsCount}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3 shadow-2xs">
            <span className="text-[11px] font-mono text-[#78716C] uppercase">Pending Submissions</span>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-xl font-semibold tabular-nums text-amber-700">
                {stats.pendingSubmissionsCount}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('/console/ingest')}
                className="text-[11px] font-mono text-[#1D4ED8] hover:underline"
              >
                Review Ingest →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Overdue Actions List (High on the page as requested) */}
      <section
        aria-labelledby="overdue-heading"
        className="bg-[#FFFFFF] border border-rose-200 rounded shadow-xs overflow-hidden"
      >
        <div className="px-4 py-3 bg-rose-50/70 border-b border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <h2 id="overdue-heading" className="text-xs font-bold uppercase tracking-wider text-rose-900 font-mono">
              Overdue Actions ({stats.overdueActions.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-rose-800">
            Requires immediate team intervention
          </span>
        </div>

        {stats.overdueActions.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#78716C] flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>All scheduled partner actions are on track. No overdue items.</span>
          </div>
        ) : (
          <div className="divide-y divide-[#E7E5E4] max-h-96 overflow-y-auto">
            {stats.overdueActions.map((item) => (
              <div
                key={item.orgId}
                onClick={() => onNavigate(`/console/pipeline/${item.orgId}`)}
                className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-rose-50/30 transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#1C1917] hover:text-[#1D4ED8]">
                      {item.orgName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F5F5F4] text-[#44403C] border border-[#E7E5E4]">
                      {item.tier}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      {item.stage}
                    </span>
                  </div>
                  <p className="text-xs text-[#44403C] font-normal">{item.nextAction}</p>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono shrink-0">
                  <div className="text-right">
                    <div className="text-rose-700 font-semibold flex items-center gap-1 sm:justify-end">
                      <Clock className="w-3 h-3 text-rose-600" />
                      <span>
                        Due {new Date(item.nextActionAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="text-[#78716C]">{item.owner}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#A8A29E]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* "This Week" - Upcoming Events & Linked Organisations */}
      <section aria-labelledby="this-week-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1D4ED8]" />
            <h2 id="this-week-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C]">
              Upcoming Events & Linked Ecosystem Partners
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/console/events')}
            className="text-xs font-medium text-[#1D4ED8] hover:underline"
          >
            View all {stats.upcomingEventsCount} events →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.thisWeekEvents.map(({ event, linkedOrg }) => (
            <div
              key={event.id}
              className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3.5 space-y-2.5 shadow-2xs hover:border-[#D6D3D1] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F5F5F4] text-[#44403C] border border-[#E7E5E4]">
                  {event.category}
                </span>
                <span className="text-[11px] font-mono font-semibold text-[#1D4ED8]">
                  {new Date(event.startDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>

              <div>
                <h3
                  className="text-xs font-semibold text-[#1C1917] line-clamp-2 hover:text-[#1D4ED8] cursor-pointer"
                  onClick={() => onNavigate(`/events/${event.slug}`)}
                >
                  {event.title}
                </h3>
                <p className="text-[11px] text-[#78716C] mt-0.5">
                  {event.city} · {event.format}
                </p>
              </div>

              {/* Linked Organisation */}
              <div className="pt-2 border-t border-[#E7E5E4] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                  {linkedOrg ? (
                    <button
                      type="button"
                      onClick={() => onNavigate(`/console/pipeline/${linkedOrg.id}`)}
                      className="font-medium text-[#1C1917] hover:text-[#1D4ED8] truncate text-left"
                    >
                      {linkedOrg.name}
                    </button>
                  ) : (
                    <span className="text-[#78716C] truncate">{event.organiser}</span>
                  )}
                </div>

                {linkedOrg?.tier && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                    {linkedOrg.tier}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
