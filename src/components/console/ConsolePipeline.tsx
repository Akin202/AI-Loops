import React, { useEffect, useState, useMemo } from 'react';
import type {
  Organisation,
  OrganisationTier,
  PipelineFilters,
  PipelineStage,
  Sector,
  TeamRole,
} from '../../../types';
import {
  getPipelineOrganisations,
  updateOrganisationStage,
} from '../../../lib/data-access';
import { offlineQueue } from '../../../lib/offline-queue';
import {
  Search,
  SlidersHorizontal,
  Table as TableIcon,
  Kanban,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  Lock,
  ChevronRight,
  X,
  AlertCircle,
  Download,
} from 'lucide-react';
import type { PipelineDevPreset } from './DevStateSwitcher';

interface ConsolePipelineProps {
  onNavigate: (path: string) => void;
  currentRole: TeamRole;
  pipelinePreset?: PipelineDevPreset;
}

type SortField = 'name' | 'sector' | 'tier' | 'stage' | 'owner' | 'nextActionAt';

export const ConsolePipeline: React.FC<ConsolePipelineProps> = ({
  onNavigate,
  currentRole,
  pipelinePreset = 'normal',
}) => {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [selectedMobileStage, setSelectedMobileStage] = useState<PipelineStage>('Lead');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<PipelineStage | 'All'>('All');
  const [selectedTier, setSelectedTier] = useState<OrganisationTier | 'All'>('All');
  const [selectedSector, setSelectedSector] = useState<Sector | 'All'>('All');
  const [selectedOwner, setSelectedOwner] = useState<string | 'All'>('All');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('nextActionAt');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Inactive Reason Required Prompt
  const [inactiveModal, setInactiveModal] = useState<{
    orgId: string;
    orgName: string;
    targetStage: PipelineStage;
  } | null>(null);
  const [inactiveReasonInput, setInactiveReasonInput] = useState('');
  const [inactiveError, setInactiveError] = useState<string | null>(null);

  const stages: PipelineStage[] = [
    'Lead',
    'Contacted',
    'Engaged',
    'Partnered',
    'Champion',
    'Inactive',
  ];

  const tiers: OrganisationTier[] = ['Tier 1', 'Tier 2', 'Tier 3'];
  const sectors: Sector[] = [
    'Artificial Intelligence',
    'Fintech',
    'HealthTech',
    'GovTech',
    'EdTech',
    'AgriTech',
    'Creative Tech',
  ];

  const now = useMemo(() => new Date('2026-09-18T16:15:25Z').getTime(), []);

  // Fetch from data-access
  const loadOrganisations = async () => {
    setIsLoading(true);
    try {
      const filters: PipelineFilters = {
        stage: selectedStage,
        tier: selectedTier,
        sector: selectedSector,
        owner: selectedOwner,
        overdueOnly,
        searchQuery,
      };
      const data = await getPipelineOrganisations(filters);
      setOrganisations(data);
    } catch (err) {
      console.error('Failed to load organisations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganisations();
  }, [
    searchQuery,
    selectedStage,
    selectedTier,
    selectedSector,
    selectedOwner,
    overdueOnly,
    pipelinePreset,
  ]);

  // Unique owners for filter dropdown
  const ownersList = useMemo(() => {
    const set = new Set<string>();
    organisations.forEach((o) => {
      if (o.owner) set.add(o.owner);
    });
    return Array.from(set).sort();
  }, [organisations]);

  // Handle stage change request (Table or Board drag)
  const handleStageChangeRequest = (orgId: string, orgName: string, targetStage: PipelineStage) => {
    if (currentRole === 'Viewer') {
      alert('Viewer role: Pipeline stages are read-only.');
      return;
    }

    if (targetStage === 'Inactive') {
      // Inactive without a reason must NOT be possible!
      setInactiveModal({ orgId, orgName, targetStage });
      setInactiveReasonInput('');
      setInactiveError(null);
      return;
    }

    executeStageChange(orgId, targetStage);
  };

  const executeStageChange = async (orgId: string, targetStage: PipelineStage, reason?: string) => {
    const previous = organisations;
    // 1. Optimistic update
    setOrganisations((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? {
              ...o,
              stage: targetStage,
              status: targetStage === 'Inactive' ? 'inactive' : 'active',
              inactiveReason: reason,
            }
          : o
      )
    );
    setInactiveModal(null);

    // 2. Persist to backend
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineQueue.enqueue('updateOrganisationStage', { id: orgId, newStage: targetStage, reason });
      return;
    }

    try {
      await updateOrganisationStage(orgId, targetStage, reason);
    } catch (err: any) {
      console.warn('Network issue during stage transition, saving to offline queue:', err);
      offlineQueue.enqueue('updateOrganisationStage', { id: orgId, newStage: targetStage, reason });
    }
  };

  const submitInactiveReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inactiveModal) return;
    if (!inactiveReasonInput.trim() || inactiveReasonInput.trim().length < 5) {
      setInactiveError('A detailed reason (at least 5 characters) is mandatory.');
      return;
    }
    executeStageChange(inactiveModal.orgId, inactiveModal.targetStage, inactiveReasonInput.trim());
  };

  // Sort organisations
  const sortedOrganisations = useMemo(() => {
    return [...organisations].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortField === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortField === 'sector') {
        valA = a.sector.toLowerCase();
        valB = b.sector.toLowerCase();
      } else if (sortField === 'tier') {
        valA = a.tier || '';
        valB = b.tier || '';
      } else if (sortField === 'stage') {
        valA = stages.indexOf(a.stage || 'Lead');
        valB = stages.indexOf(b.stage || 'Lead');
      } else if (sortField === 'owner') {
        valA = (a.owner || '').toLowerCase();
        valB = (b.owner || '').toLowerCase();
      } else if (sortField === 'nextActionAt') {
        valA = a.nextActionAt ? new Date(a.nextActionAt).getTime() : Infinity;
        valB = b.nextActionAt ? new Date(b.nextActionAt).getTime() : Infinity;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [organisations, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Stage color badge helper
  const getStageBadge = (stage?: PipelineStage) => {
    switch (stage) {
      case 'Champion':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Partnered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Engaged':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Lead':
        return 'bg-stone-100 text-stone-800 border-stone-200';
      case 'Inactive':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header: Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E5E4]">
        <div>
          <h1 className="text-lg font-semibold text-[#1C1917] tracking-tight flex items-center gap-2">
            <span>Partner Pipeline</span>
            <span className="text-xs font-mono font-normal text-[#78716C]">
              ({organisations.length} organisations)
            </span>
          </h1>
          <p className="text-xs text-[#78716C] font-mono mt-0.5">
            Ecosystem outreach, stage transitions, and overdue accountability
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV Button */}
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams();
              if (selectedStage !== 'All') params.set('stage', selectedStage);
              if (selectedSector !== 'All') params.set('sector', selectedSector);
              if (selectedTier !== 'All') params.set('tier', selectedTier);
              window.location.href = `/api/export/organisations?${params.toString()}`;
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#E7E5E4] bg-[#FFFFFF] hover:bg-[#F5F5F4] text-[#1C1917] transition-colors shadow-2xs cursor-pointer min-h-[32px]"
            title="Export filtered pipeline to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Export CSV</span>
          </button>

          {/* View Toggle */}
          <div className="inline-flex rounded border border-[#E7E5E4] bg-[#FFFFFF] p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#1D4ED8] text-white'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewMode === 'board'
                  ? 'bg-[#1D4ED8] text-white'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board (6 Stages)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded p-3 space-y-2.5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organisation name, sector, or owner…"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:bg-white"
            />
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            >
              <option value="All">All Stages</option>
              {stages.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            >
              <option value="All">All Tiers</option>
              {tiers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            >
              <option value="All">All Sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Owner Filter */}
          <div>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            >
              <option value="All">All Owners</option>
              {ownersList.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Overdue Only Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-[#E7E5E4]/60 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="w-3.5 h-3.5 text-[#1D4ED8] rounded border-[#E7E5E4] focus:ring-0"
            />
            <span className="font-mono text-[11px] text-rose-800 font-medium">
              Overdue actions only
            </span>
          </label>

          {(searchQuery || selectedStage !== 'All' || selectedTier !== 'All' || selectedSector !== 'All' || selectedOwner !== 'All' || overdueOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedStage('All');
                setSelectedTier('All');
                setSelectedSector('All');
                setSelectedOwner('All');
                setOverdueOnly(false);
              }}
              className="text-[11px] font-mono text-[#78716C] hover:text-[#1C1917]"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* ----------------- TABLE VIEW ----------------- */}
      {viewMode === 'table' && (
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[#78716C] font-mono uppercase text-[10px]">
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#1C1917]"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Organisation</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#1C1917]"
                    onClick={() => toggleSort('sector')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Sector</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#1C1917]"
                    onClick={() => toggleSort('tier')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Tier</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#1C1917]"
                    onClick={() => toggleSort('stage')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Stage</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#1C1917]"
                    onClick={() => toggleSort('owner')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Owner</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 font-semibold">Next Action</th>
                  <th
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#1C1917] text-right"
                    onClick={() => toggleSort('nextActionAt')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Next Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs font-mono text-[#78716C]">
                      Querying pipeline organisations…
                    </td>
                  </tr>
                ) : sortedOrganisations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs font-mono text-[#78716C]">
                      No organisations match your query criteria.
                    </td>
                  </tr>
                ) : (
                  sortedOrganisations.map((org) => {
                    const isOverdue =
                      Boolean(org.nextActionAt) &&
                      org.stage !== 'Inactive' &&
                      new Date(org.nextActionAt!).getTime() < now;

                    return (
                      <tr
                        key={org.id}
                        className="hover:bg-[#FAFAF9] transition-colors group cursor-pointer"
                        onClick={() => onNavigate(`/console/pipeline/${org.id}`)}
                      >
                        {/* Name */}
                        <td className="py-2.5 px-3 font-medium text-[#1C1917] group-hover:text-[#1D4ED8]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{org.name}</span>
                            <ChevronRight className="w-3 h-3 text-[#A8A29E] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>

                        {/* Sector */}
                        <td className="py-2.5 px-3 text-[#44403C] whitespace-nowrap">
                          {org.sector}
                        </td>

                        {/* Tier */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F5F5F4] text-[#44403C] border border-[#E7E5E4]">
                            {org.tier || 'Tier 2'}
                          </span>
                        </td>

                        {/* Stage Badge (Clickable to change quickly unless viewer) */}
                        <td
                          className="py-2.5 px-3 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {currentRole === 'Viewer' ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${getStageBadge(
                                org.stage
                              )}`}
                            >
                              {org.stage || 'Lead'}
                            </span>
                          ) : (
                            <select
                              value={org.stage || 'Lead'}
                              onChange={(e) =>
                                handleStageChangeRequest(org.id, org.name, e.target.value as PipelineStage)
                              }
                              className={`text-[10px] font-mono font-medium rounded border py-0.5 px-1.5 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] ${getStageBadge(
                                org.stage
                              )}`}
                            >
                              {stages.map((stg) => (
                                <option key={stg} value={stg}>
                                  {stg}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* Owner */}
                        <td className="py-2.5 px-3 text-[#44403C] font-mono text-[11px] whitespace-nowrap">
                          {org.owner || 'Unassigned'}
                        </td>

                        {/* Next Action */}
                        <td className="py-2.5 px-3 text-[#44403C] max-w-xs truncate" title={org.nextAction}>
                          {org.nextAction || '-'}
                        </td>

                        {/* Next Date (Red when overdue) */}
                        <td className="py-2.5 px-3 font-mono text-[11px] text-right whitespace-nowrap">
                          {org.nextActionAt ? (
                            <span
                              className={
                                isOverdue
                                  ? 'text-rose-700 font-bold flex items-center justify-end gap-1'
                                  : 'text-[#78716C]'
                              }
                            >
                              {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                              <span>
                                {new Date(org.nextActionAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[#A8A29E]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Rows View */}
          <div className="md:hidden divide-y divide-[#E7E5E4]">
            {sortedOrganisations.map((org) => {
              const isOverdue =
                Boolean(org.nextActionAt) &&
                org.stage !== 'Inactive' &&
                new Date(org.nextActionAt!).getTime() < now;

              return (
                <div
                  key={org.id}
                  onClick={() => onNavigate(`/console/pipeline/${org.id}`)}
                  className="p-3.5 space-y-2 hover:bg-[#FAFAF9] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-[#1C1917]">{org.name}</h3>
                      <p className="text-[11px] text-[#78716C]">{org.sector}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${getStageBadge(
                        org.stage
                      )}`}
                    >
                      {org.stage || 'Lead'}
                    </span>
                  </div>

                  <div className="text-xs text-[#44403C] bg-[#FAFAF9] p-2 rounded border border-[#E7E5E4]/80 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#78716C]">Next Action:</div>
                    <p className="font-medium text-xs">{org.nextAction || 'None scheduled'}</p>
                    {org.nextActionAt && (
                      <div
                        className={`text-[10px] font-mono ${
                          isOverdue ? 'text-rose-700 font-bold' : 'text-[#78716C]'
                        }`}
                      >
                        Due:{' '}
                        {new Date(org.nextActionAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        ({org.owner || 'Unassigned'})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- BOARD VIEW (6 STAGES) ----------------- */}
      {viewMode === 'board' && (
        <div className="space-y-4">
          {/* Mobile Stage Switcher */}
          <div className="md:hidden flex overflow-x-auto pb-1 gap-1.5">
            {stages.map((stg) => {
              const count = organisations.filter((o) => (o.stage || 'Lead') === stg).length;
              const isSelected = selectedMobileStage === stg;
              return (
                <button
                  key={stg}
                  type="button"
                  onClick={() => setSelectedMobileStage(stg)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-[#1D4ED8] text-white font-semibold'
                      : 'bg-white border border-[#E7E5E4] text-[#44403C]'
                  }`}
                >
                  {stg} ({count})
                </button>
              );
            })}
          </div>

          {/* Desktop 6 Columns & Mobile Single Column */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-start">
            {stages.map((stg) => {
              // On mobile, only display the selectedMobileStage column
              const isHiddenOnMobile = selectedMobileStage !== stg;
              const columnOrgs = organisations.filter((o) => (o.stage || 'Lead') === stg);

              return (
                <div
                  key={stg}
                  className={`bg-[#F5F5F4] border border-[#E7E5E4] rounded flex flex-col min-h-[480px] ${
                    isHiddenOnMobile ? 'hidden md:flex' : 'flex'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (currentRole !== 'Viewer') {
                      e.dataTransfer.dropEffect = 'move';
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const orgId = e.dataTransfer.getData('text/plain');
                    const org = organisations.find((o) => o.id === orgId);
                    if (org && org.stage !== stg) {
                      handleStageChangeRequest(org.id, org.name, stg);
                    }
                  }}
                >
                  {/* Column Header */}
                  <div className="p-2.5 border-b border-[#E7E5E4] bg-[#FFFFFF] rounded-t flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#1C1917] uppercase">
                      {stg}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F5F5F4] text-[#78716C] border border-[#E7E5E4]">
                      {columnOrgs.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[75vh]">
                    {columnOrgs.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-[#E7E5E4] rounded flex items-center justify-center text-center p-2">
                        <span className="text-[11px] font-mono text-[#A8A29E]">Drop cards here</span>
                      </div>
                    ) : (
                      columnOrgs.map((org) => {
                        const isOverdue =
                          Boolean(org.nextActionAt) &&
                          stg !== 'Inactive' &&
                          new Date(org.nextActionAt!).getTime() < now;

                        return (
                          <div
                            key={org.id}
                            draggable={currentRole !== 'Viewer'}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', org.id);
                            }}
                            onClick={() => onNavigate(`/console/pipeline/${org.id}`)}
                            className={`bg-[#FFFFFF] border border-[#E7E5E4] rounded p-2.5 space-y-2 shadow-2xs hover:border-[#1D4ED8] transition-all cursor-pointer ${
                              currentRole === 'Viewer' ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-semibold text-xs text-[#1C1917] hover:text-[#1D4ED8] line-clamp-2">
                                {org.name}
                              </span>
                              <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-[#F5F5F4] text-[#78716C] border border-[#E7E5E4] shrink-0">
                                {org.tier}
                              </span>
                            </div>

                            <p className="text-[10px] text-[#78716C] truncate">{org.sector}</p>

                            {org.nextAction && (
                              <div className="pt-1.5 border-t border-[#E7E5E4]/70 space-y-0.5 text-[10px]">
                                <div className="text-[#44403C] line-clamp-2 leading-tight">
                                  {org.nextAction}
                                </div>
                                {org.nextActionAt && (
                                  <div
                                    className={`font-mono text-[9px] ${
                                      isOverdue ? 'text-rose-700 font-bold' : 'text-[#78716C]'
                                    }`}
                                  >
                                    {isOverdue && '⚠️ '}
                                    Due{' '}
                                    {new Date(org.nextActionAt).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[9px] font-mono text-[#A8A29E] pt-1">
                              <span>{org.owner || 'Unassigned'}</span>
                              <span className="text-[#1D4ED8] hover:underline">Detail →</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- INACTIVE REASON REQUIRED MODAL ----------------- */}
      {inactiveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <h3 className="font-semibold text-sm text-[#1C1917]">
                  Reason Required for Inactive Status
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInactiveModal(null)}
                className="text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#78716C]">
              You are moving{' '}
              <strong className="text-[#1C1917]">{inactiveModal.orgName}</strong> to{' '}
              <span className="font-mono font-semibold text-rose-700">Inactive</span>. A clear,
              justified reason must be recorded in the audit history.
            </p>

            <form onSubmit={submitInactiveReason} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#78716C] mb-1 font-medium">
                  Deactivation Reason (Mandatory)
                </label>
                <textarea
                  rows={3}
                  value={inactiveReasonInput}
                  onChange={(e) => {
                    setInactiveReasonInput(e.target.value);
                    if (inactiveError) setInactiveError(null);
                  }}
                  placeholder="e.g. Pivot away from open infrastructure; founder relocated; funding freeze until Q2 2027…"
                  className="w-full text-xs p-2.5 border border-[#E7E5E4] rounded bg-[#FAFAF9] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-rose-500"
                  autoFocus
                />
                {inactiveError && (
                  <p className="text-[11px] font-mono text-rose-700 mt-1">{inactiveError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setInactiveModal(null)}
                  className="px-3 py-1.5 text-xs text-[#44403C] hover:bg-[#F5F5F4] rounded border border-[#E7E5E4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inactiveReasonInput.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-50 disabled:pointer-events-none rounded transition-colors"
                >
                  Confirm Deactivation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
