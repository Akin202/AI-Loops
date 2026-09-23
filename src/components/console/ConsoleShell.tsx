import React from 'react';
import type { ConnectionState, TeamRole } from '../../../types';
import {
  LayoutDashboard,
  Kanban,
  CalendarCheck2,
  FileDown,
  Users,
  ExternalLink,
  Wifi,
  WifiOff,
  RefreshCw,
  Shield,
  Eye,
  LogOut,
} from 'lucide-react';
import { DevStateSwitcher, type PipelineDevPreset, type DashboardDevPreset } from './DevStateSwitcher';

interface ConsoleShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onNavigatePublic: () => void;
  onSignOut?: () => void;
  children: React.ReactNode;

  // Global console dev states
  connectionState: ConnectionState;
  setConnectionState: (c: ConnectionState) => void;
  pendingWritesCount?: number;
  currentRole: TeamRole;
  setCurrentRole: (r: TeamRole) => void;
  pipelinePreset: PipelineDevPreset;
  setPipelinePreset: (p: PipelineDevPreset) => void;
  dashboardPreset?: DashboardDevPreset;
  setDashboardPreset?: (p: DashboardDevPreset) => void;
}

export const ConsoleShell: React.FC<ConsoleShellProps> = ({
  currentPath,
  onNavigate,
  onNavigatePublic,
  onSignOut,
  children,
  connectionState,
  setConnectionState,
  pendingWritesCount = 0,
  currentRole,
  setCurrentRole,
  pipelinePreset,
  setPipelinePreset,
  dashboardPreset = 'normal',
  setDashboardPreset,
}) => {
  const navItems = [
    { label: 'Dashboard', path: '/console', icon: LayoutDashboard },
    { label: 'Pipeline', path: '/console/pipeline', icon: Kanban },
    { label: 'Events', path: '/console/events', icon: CalendarCheck2 },
    { label: 'Ingest', path: '/console/ingest', icon: FileDown },
    { label: 'Team', path: '/console/team', icon: Users },
  ];

  const getBreadcrumb = () => {
    if (currentPath === '/console') return 'Dashboard';
    if (currentPath.startsWith('/console/pipeline/')) return 'Pipeline / Organisation';
    if (currentPath.startsWith('/console/pipeline')) return 'Pipeline';
    if (currentPath.startsWith('/console/events')) return 'Events';
    if (currentPath.startsWith('/console/ingest')) return 'Ingest';
    if (currentPath.startsWith('/console/team')) return 'Team Directory';
    return 'Console';
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex flex-col font-sans selection:bg-[#1D4ED8] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-[#E7E5E4] text-[#1C1917] h-14">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Brand + Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/console')}
              className="text-left font-semibold text-sm tracking-tight text-[#1C1917] hover:text-[#1D4ED8] transition-colors"
            >
              Loops <span className="font-mono text-xs text-[#78716C] font-normal">/ Console</span>
            </button>
            <span className="text-[#E7E5E4] hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
              <span className="font-medium text-[#1C1917]">{getBreadcrumb()}</span>
            </div>
          </div>

          {/* Right: Connection status, Role Badge, Public Portal button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connection Indicator */}
            {/* // TODO(handoff): wire to real connectivity + write queue */}
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border ${
                connectionState === 'online'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : connectionState === 'syncing'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
              title={`System connectivity: ${connectionState}`}
            >
              {connectionState === 'online' && (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span className="hidden md:inline">Online</span>
                </>
              )}
              {connectionState === 'syncing' && (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                  <span className="hidden md:inline">
                    {pendingWritesCount > 0 ? `Syncing (${pendingWritesCount})...` : 'Syncing...'}
                  </span>
                </>
              )}
              {connectionState === 'offline' && (
                <>
                  <WifiOff className="w-3 h-3 text-rose-600" />
                  <span className="hidden md:inline">
                    {pendingWritesCount > 0 ? `Offline (${pendingWritesCount} queued)` : 'Offline'}
                  </span>
                </>
              )}
            </div>

            {/* Role Badge */}
            {/* // TODO(handoff): wire to real auth */}
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border bg-[#F5F5F4] text-[#44403C] border-[#E7E5E4]">
              {currentRole === 'Viewer' ? (
                <Eye className="w-3 h-3 text-[#78716C]" />
              ) : (
                <Shield className="w-3 h-3 text-[#1D4ED8]" />
              )}
              <span className="font-semibold">{currentRole}</span>
            </div>

            {/* Public Portal link */}
            <button
              type="button"
              onClick={onNavigatePublic}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#1C1917] bg-[#FAFAF9] hover:bg-[#F5F5F4] border border-[#E7E5E4] rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] min-h-[36px]"
              title="View Public Loops Directory"
            >
              <span className="hidden sm:inline">Public Portal</span>
              <ExternalLink className="w-3 h-3 text-[#78716C]" />
            </button>

            {/* Sign Out link */}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#78716C] hover:text-[#DC2626] bg-[#FAFAF9] hover:bg-rose-50 border border-[#E7E5E4] rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#DC2626] min-h-[36px]"
                title="Sign out of Console"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Role / Connectivity warning banner if applicable */}
      {currentRole === 'Viewer' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs font-mono text-amber-900 flex items-center justify-center gap-2">
          <Eye className="w-3.5 h-3.5 text-amber-700" />
          <span>Viewer Role Active: Mutating controls, stage drag, and logging are read-only.</span>
        </div>
      )}
      {connectionState === 'offline' && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-1.5 text-center text-xs font-mono text-rose-900 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 text-rose-700" />
          <span>Offline state active: Displaying locally cached data.</span>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 border-r border-[#E7E5E4] bg-[#FFFFFF] p-3 shrink-0">
          <div className="text-[11px] font-mono text-[#A8A29E] uppercase px-3 py-2 font-medium">
            Instruments
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isMatch =
                item.path === '/console'
                  ? currentPath === '/console'
                  : currentPath.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors text-left min-h-[38px] ${
                    isMatch
                      ? 'bg-[#1D4ED8] text-white font-semibold shadow-xs'
                      : 'text-[#44403C] hover:bg-[#F5F5F4] hover:text-[#1C1917]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isMatch ? 'text-white' : 'text-[#78716C]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-[#E7E5E4] px-3 space-y-1 text-[11px] font-mono text-[#78716C]">
            <div className="flex items-center justify-between">
              <span>Environment</span>
              <span className="text-emerald-700 font-bold">LIVE-MOCK</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Timezone</span>
              <span>WAT (UTC+1)</span>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t border-[#E7E5E4] px-2 py-1 flex items-center justify-around shadow-lg"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isMatch =
            item.path === '/console'
              ? currentPath === '/console'
              : currentPath.startsWith(item.path);

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded min-h-[44px] min-w-[56px] transition-colors ${
                isMatch ? 'text-[#1D4ED8] font-bold' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Dev State Switcher */}
      <DevStateSwitcher
        pipelinePreset={pipelinePreset}
        onPipelinePresetChange={setPipelinePreset}
        dashboardPreset={dashboardPreset}
        onDashboardPresetChange={setDashboardPreset}
        connectionState={connectionState}
        onConnectionChange={setConnectionState}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    </div>
  );
};
