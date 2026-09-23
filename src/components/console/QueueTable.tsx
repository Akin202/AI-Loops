import React from 'react';
import type { QueueItem } from '../../../types';

interface QueueTableProps {
  items: QueueItem[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
}

export const QueueTable: React.FC<QueueTableProps> = ({
  items,
  selectedId,
  onSelectItem,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg p-8 text-center">
        <p className="text-xs text-[#78716C] font-mono">
          Nothing in the queue. Paste a link above.
        </p>
      </div>
    );
  }

  const renderStatusBadge = (status: QueueItem['status']) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            Ready
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Partial
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-stone-100 text-stone-700 border border-stone-200">
            Pending
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-red-50 text-red-800 border border-red-200">
            Error
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200">
            Approved
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-50 text-purple-800 border border-purple-200">
            Draft
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-stone-200 text-stone-600 border border-stone-300">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-[#FAFAF9] border-b border-[#E7E5E4] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1917]">
            Batch Ingest Queue
          </h3>
          <span className="text-xs font-mono text-[#78716C] tabular-nums">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </div>
        <span className="text-[11px] text-[#78716C] font-mono">
          Click any row to load into review card
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]/50 text-[#78716C] font-mono text-[11px]">
              <th className="py-2.5 px-4 font-medium">Source / Raw Input</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium">Extracted Title</th>
              <th className="py-2.5 px-4 font-medium text-right">Time</th>
              <th className="py-2.5 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E5E4]">
            {items.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectItem(item.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/50 hover:bg-blue-50'
                      : 'hover:bg-[#FAFAF9]'
                  }`}
                >
                  {/* Raw Input Truncated */}
                  <td className="py-3 px-4 max-w-[200px] sm:max-w-xs truncate font-mono text-[11px] text-[#1C1917]">
                    <span title={item.rawInput}>
                      {item.rawInput.replace(/^https?:\/\//, '')}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {renderStatusBadge(item.status)}
                  </td>

                  {/* Extracted Title */}
                  <td className="py-3 px-4 max-w-[200px] sm:max-w-sm truncate text-[#1C1917] font-medium">
                    {item.extractedTitle || (
                      <span className="text-[#A8A29E] font-normal italic">
                        — Not extracted —
                      </span>
                    )}
                  </td>

                  {/* Timestamp Tabular */}
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-[11px] text-[#78716C] tabular-nums">
                    {item.timestamp}
                  </td>

                  {/* Row Action */}
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item.id);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:text-blue-800 focus:outline-none min-h-[32px] px-2"
                    >
                      <span>Review</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
