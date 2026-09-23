import React, { useState } from 'react';
import type { ConnectionState, TeamRole } from '../../../types';
import { setPipelineDevMode } from '../../../lib/data-access';

export type IngestPreset =
  | 'idle'
  | 'extracting'
  | 'ready'
  | 'partial'
  | 'error'
  | 'empty queue'
  | 'long title'
  | 'missing date'
  | '12-item queue';

export type DevStatePreset = IngestPreset;

export type PipelineDevPreset =
  | 'normal'
  | 'empty pipeline'
  | '200 organisations'
  | 'all overdue';

export type DashboardDevPreset = 'normal' | 'loading' | 'empty' | 'error';

export interface DevStateContextValue {
  ingestPreset: IngestPreset | null;
  setIngestPreset: (p: IngestPreset | null) => void;
  pipelinePreset: PipelineDevPreset;
  setPipelinePreset: (p: PipelineDevPreset) => void;
  dashboardPreset: DashboardDevPreset;
  setDashboardPreset: (p: DashboardDevPreset) => void;
  connectionState: ConnectionState;
  setConnectionState: (c: ConnectionState) => void;
  currentRole: TeamRole;
  setCurrentRole: (r: TeamRole) => void;
}

interface DevStateSwitcherProps {
  // Ingest preset support
  activePreset?: IngestPreset | null;
  onSelectPreset?: (preset: IngestPreset) => void;

  // Global console dev states
  pipelinePreset?: PipelineDevPreset;
  onPipelinePresetChange?: (preset: PipelineDevPreset) => void;

  dashboardPreset?: DashboardDevPreset;
  onDashboardPresetChange?: (preset: DashboardDevPreset) => void;

  connectionState?: ConnectionState;
  onConnectionChange?: (state: ConnectionState) => void;

  currentRole?: TeamRole;
  onRoleChange?: (role: TeamRole) => void;
}

export const DevStateSwitcher: React.FC<DevStateSwitcherProps> = ({
  activePreset,
  onSelectPreset,
  pipelinePreset = 'normal',
  onPipelinePresetChange,
  dashboardPreset = 'normal',
  onDashboardPresetChange,
  connectionState = 'online',
  onConnectionChange,
  currentRole = 'Lead',
  onRoleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Hidden in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const ingestPresets: IngestPreset[] = [
    'idle',
    'extracting',
    'ready',
    'partial',
    'error',
    'empty queue',
    'long title',
    'missing date',
    '12-item queue',
  ];

  const pipelinePresets: PipelineDevPreset[] = [
    'normal',
    'empty pipeline',
    '200 organisations',
    'all overdue',
  ];

  const connectivityOptions: ConnectionState[] = ['online', 'syncing', 'offline'];
  const roles: TeamRole[] = ['Lead', 'Admin', 'Editor', 'Viewer'];

  const handleSelectPipeline = (preset: PipelineDevPreset) => {
    if (preset === 'empty pipeline') {
      setPipelineDevMode('empty');
    } else if (preset === '200 organisations') {
      setPipelineDevMode('200-orgs');
    } else if (preset === 'all overdue') {
      setPipelineDevMode('all-overdue');
    } else {
      setPipelineDevMode('normal');
    }
    if (onPipelinePresetChange) {
      onPipelinePresetChange(preset);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans text-xs">
      {isOpen ? (
        <div className="bg-[#1C1917] text-[#FAFAF9] border border-stone-700 rounded-lg shadow-2xl p-3.5 max-w-sm w-84 max-h-[85vh] overflow-y-auto space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-700">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Console Dev Switcher
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-stone-800"
              aria-label="Collapse dev panel"
            >
              ✕
            </button>
          </div>

          {/* User Role */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-stone-400 uppercase">Simulated Role:</span>
              {currentRole === 'Viewer' && (
                <span className="text-[10px] text-amber-300 font-mono">READ-ONLY UI</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRoleChange?.(r)}
                  className={`py-1 px-1.5 rounded text-center text-[10px] font-mono transition-colors ${
                    currentRole === r
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Connectivity State */}
          <div>
            <span className="block font-mono text-[10px] text-stone-400 uppercase mb-1">
              Connection State:
            </span>
            <div className="grid grid-cols-3 gap-1">
              {connectivityOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onConnectionChange?.(c)}
                  className={`py-1 px-1.5 rounded text-center text-[10px] font-mono capitalize transition-colors ${
                    connectionState === c
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline Scenarios */}
          <div>
            <span className="block font-mono text-[10px] text-stone-400 uppercase mb-1">
              Pipeline Scenarios:
            </span>
            <div className="grid grid-cols-2 gap-1">
              {pipelinePresets.map((preset) => {
                const isSelected = pipelinePreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPipeline(preset)}
                    className={`py-1 px-2 rounded text-left text-[10px] font-mono transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dashboard Async State */}
          {onDashboardPresetChange && (
            <div>
              <span className="block font-mono text-[10px] text-stone-400 uppercase mb-1">
                Dashboard Async State:
              </span>
              <div className="grid grid-cols-4 gap-1">
                {(['normal', 'loading', 'empty', 'error'] as DashboardDevPreset[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDashboardPresetChange(d)}
                    className={`py-1 px-1 rounded text-center text-[10px] font-mono capitalize transition-colors ${
                      dashboardPreset === d
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ingest Presets */}
          {onSelectPreset && (
            <div>
              <span className="block font-mono text-[10px] text-stone-400 uppercase mb-1">
                Ingest UI Presets:
              </span>
              <div className="grid grid-cols-2 gap-1">
                {ingestPresets.map((preset) => {
                  const isSelected = activePreset === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onSelectPreset(preset)}
                      className={`text-left px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 font-bold'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1917] text-[#FAFAF9] border border-stone-700 shadow-lg hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
            Dev States [{currentRole} / {connectionState}]
          </span>
        </button>
      )}
    </div>
  );
};
