import React from 'react';
import type { EventCategory, EventCity, EventFormat, FilterState } from '../../types';
import { loopsConfig } from '../../config/loops.config';
import { MetaStrip } from './MetaStrip';
import { Download } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
  onExportFilteredIcs?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalCount,
  filteredCount,
  onExportFilteredIcs,
}) => {
  const isFiltered =
    filters.city !== 'All' ||
    filters.category !== 'All' ||
    filters.month !== 'All' ||
    filters.format !== 'All';

  const handleReset = () => {
    onFilterChange({
      city: 'All',
      category: 'All',
      month: 'All',
      format: 'All',
    });
  };

  return (
    <section aria-label="Event filters" className="w-full border-y border-[#262626] bg-[#0D0D0D]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-3.5">
        {/* Status header, export iCal & clear button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MetaStrip
            items={[
              'INDEX FILTERS',
              `${filteredCount} OF ${totalCount} CONVENINGS`,
              isFiltered ? 'FILTERED VIEW' : 'COMPLETE REPOSITORY',
            ]}
          />
          <div className="flex items-center gap-3">
            {onExportFilteredIcs && (
              <button
                type="button"
                onClick={onExportFilteredIcs}
                title="Download .ics file for personal Apple or Google Calendar"
                className="text-[11px] font-mono font-medium uppercase tracking-[0.14em] text-[#B5B5B5] hover:text-[#FAFAFA] min-h-[40px] px-2.5 py-1 border border-[#333333] hover:border-[#FAFAFA] bg-[#141414] hover:bg-[#1C1C1C] inline-flex items-center gap-1.5 transition-colors select-none"
              >
                <Download className="w-3.5 h-3.5 text-[#8A8A8A]" />
                <span>Export iCal (.ics)</span>
              </button>
            )}
            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FAFAFA] hover:text-[#8A8A8A] min-h-[40px] px-2 inline-flex items-center transition-opacity"
              >
                Reset [×]
              </button>
            )}
          </div>
        </div>

        {/* Primary Filter Pill Group: Category */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-mono tracking-[0.18em] text-[#737373]">
            DISCIPLINE / CATEGORY
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {loopsConfig.categories.map((cat) => {
              const active = filters.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      category: cat as EventCategory | 'All',
                    })
                  }
                  className={`min-h-[48px] px-4 py-2.5 text-xs tracking-wider uppercase font-semibold border transition-all whitespace-nowrap select-none touch-manipulation ${
                    active
                      ? 'bg-[#FAFAFA] text-[#0A0A0A] border-[#FAFAFA]'
                      : 'bg-[#141414] text-[#A3A3A3] border-[#262626] hover:text-[#FAFAFA] hover:border-[#404040]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filters: City, Month, Format */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* City selector */}
          <div className="space-y-1">
            <label
              htmlFor="filter-city"
              className="block text-[10px] uppercase font-mono tracking-[0.18em] text-[#737373]"
            >
              LOCATION / REGION
            </label>
            <div className="relative">
              <select
                id="filter-city"
                value={filters.city}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    city: e.target.value as EventCity | 'All',
                  })
                }
                className="w-full min-h-[48px] px-3.5 py-2.5 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-xs uppercase tracking-wider font-semibold rounded-none focus:outline-none focus:border-[#FAFAFA] appearance-none cursor-pointer"
              >
                {loopsConfig.cities.map((city) => (
                  <option key={city} value={city} className="bg-[#141414] text-[#FAFAFA]">
                    {city === 'All' ? 'All Locations' : city}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#8A8A8A] text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* Month selector */}
          <div className="space-y-1">
            <label
              htmlFor="filter-month"
              className="block text-[10px] uppercase font-mono tracking-[0.18em] text-[#737373]"
            >
              TIMELINE / MONTH
            </label>
            <div className="relative">
              <select
                id="filter-month"
                value={filters.month}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    month: e.target.value,
                  })
                }
                className="w-full min-h-[48px] px-3.5 py-2.5 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-xs uppercase tracking-wider font-semibold rounded-none focus:outline-none focus:border-[#FAFAFA] appearance-none cursor-pointer"
              >
                {loopsConfig.months.map((m) => (
                  <option key={m} value={m} className="bg-[#141414] text-[#FAFAFA]">
                    {m === 'All' ? 'All Months (Q4 2026)' : m}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#8A8A8A] text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* Format selector */}
          <div className="space-y-1">
            <label
              htmlFor="filter-format"
              className="block text-[10px] uppercase font-mono tracking-[0.18em] text-[#737373]"
            >
              ATTENDANCE / FORMAT
            </label>
            <div className="relative">
              <select
                id="filter-format"
                value={filters.format}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    format: e.target.value as EventFormat | 'All',
                  })
                }
                className="w-full min-h-[48px] px-3.5 py-2.5 bg-[#141414] border border-[#262626] text-[#FAFAFA] text-xs uppercase tracking-wider font-semibold rounded-none focus:outline-none focus:border-[#FAFAFA] appearance-none cursor-pointer"
              >
                {loopsConfig.formats.map((fmt) => (
                  <option key={fmt} value={fmt} className="bg-[#141414] text-[#FAFAFA]">
                    {fmt === 'All' ? 'All Formats' : fmt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#8A8A8A] text-[10px]">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
