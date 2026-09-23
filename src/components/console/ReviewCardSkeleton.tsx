import React from 'react';

export const ReviewCardSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Reading the page"
      className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg p-5 sm:p-6 space-y-6"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse inline-block" />
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#1D4ED8]">
            Reading the page…
          </span>
        </div>
        <div className="h-4 w-32 bg-stone-200 rounded animate-pulse" />
      </div>

      {/* Two Column Skeleton matching Review Card layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {/* Left Column Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-stone-200 rounded" />
            <div className="h-9 w-full bg-stone-100 border border-stone-200 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-stone-200 rounded" />
              <div className="h-9 w-full bg-stone-100 border border-stone-200 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-stone-200 rounded" />
              <div className="h-9 w-full bg-stone-100 border border-stone-200 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-stone-200 rounded" />
              <div className="h-9 w-full bg-stone-100 border border-stone-200 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-stone-200 rounded" />
              <div className="h-9 w-full bg-stone-100 border border-stone-200 rounded" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-stone-200 rounded" />
            <div className="h-9 w-full bg-stone-100 border border-stone-200 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-stone-200 rounded" />
              <div className="h-9 w-full bg-stone-100 border border-stone-200 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-stone-200 rounded" />
              <div className="h-9 w-full bg-stone-100 border border-stone-200 rounded" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-stone-200 rounded" />
            <div className="h-9 w-full bg-stone-100 border border-stone-200 rounded" />
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-stone-200 rounded" />
            <div className="h-20 w-full bg-stone-100 border border-stone-200 rounded" />
          </div>
        </div>

        {/* Right Column: Public Preview Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-36 bg-stone-200 rounded" />
            <div className="h-3 w-20 bg-stone-200 rounded" />
          </div>
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-md p-5 h-64 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-7 w-12 bg-neutral-800 rounded" />
              <div className="h-5 w-3/4 bg-neutral-800 rounded" />
              <div className="h-3.5 w-1/2 bg-neutral-800 rounded" />
            </div>
            <div className="h-3 w-2/3 bg-neutral-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
