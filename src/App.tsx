import React, { useEffect, useMemo, useState } from 'react';
import type {
  ConnectionState,
  Event,
  EventSubmission,
  FilterState,
  SubmissionState,
  TeamRole,
} from '../types';
import { getAllEvents } from '../lib/data-access';
import { downloadIcsFile } from '../lib/calendar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FilterBar } from './components/FilterBar';
import { EventList } from './components/EventList';
import { EventDetail } from './components/EventDetail';
import { SubmitForm } from './components/SubmitForm';
import { Footer } from './components/Footer';
import { NotFound } from './components/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded Console Surfaces to optimize public bundle size
const ConsoleShell = React.lazy(() =>
  import('./components/console/ConsoleShell').then((m) => ({ default: m.ConsoleShell }))
);
const ConsoleDashboard = React.lazy(() =>
  import('./components/console/ConsoleDashboard').then((m) => ({ default: m.ConsoleDashboard }))
);
const ConsolePipeline = React.lazy(() =>
  import('./components/console/ConsolePipeline').then((m) => ({ default: m.ConsolePipeline }))
);
const ConsoleOrganisationDetail = React.lazy(() =>
  import('./components/console/ConsoleOrganisationDetail').then((m) => ({
    default: m.ConsoleOrganisationDetail,
  }))
);
const ConsoleEvents = React.lazy(() =>
  import('./components/console/ConsoleEvents').then((m) => ({ default: m.ConsoleEvents }))
);
const ConsoleIngest = React.lazy(() =>
  import('./components/console/ConsoleIngest').then((m) => ({ default: m.ConsoleIngest }))
);
const ConsoleTeam = React.lazy(() =>
  import('./components/console/ConsoleTeam').then((m) => ({ default: m.ConsoleTeam }))
);
const ConsoleLogin = React.lazy(() =>
  import('./components/console/ConsoleLogin.tsx').then((m) => ({ default: m.ConsoleLogin }))
);

import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { offlineQueue } from '../lib/offline-queue.ts';
import type { PipelineDevPreset, DashboardDevPreset } from './components/console/DevStateSwitcher';

function ConsoleLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-8 text-xs font-mono text-[#78716C]">
      Loading console surface...
    </div>
  );
}

function MainApp() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Authentication State
  const { user, role: authRole, loading: authLoading, signOut } = useAuth();

  // Global Console Connectivity & Resilience
  const [connectionState, setConnectionState] = useState<ConnectionState>('online');
  const [pendingWritesCount, setPendingWritesCount] = useState<number>(0);
  const [currentRole, setCurrentRole] = useState<TeamRole>('Lead');

  useEffect(() => {
    if (authRole) {
      setCurrentRole(authRole);
    }
  }, [authRole]);

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe((status, pending) => {
      setConnectionState(status);
      setPendingWritesCount(pending);
    });
    return unsubscribe;
  }, []);
  const [pipelinePreset, setPipelinePreset] = useState<PipelineDevPreset>('normal');
  const [dashboardPreset, setDashboardPreset] = useState<DashboardDevPreset>('normal');

  // Filter state for the public home directory
  const [filters, setFilters] = useState<FilterState>({
    city: 'All',
    category: 'All',
    month: 'All',
    format: 'All',
  });

  // Submission state passed down to SubmitForm
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: 'idle',
  });

  // Synchronise browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Load repository events on mount
  useEffect(() => {
    let isMounted = true;
    getAllEvents().then((events) => {
      if (isMounted) {
        setAllEvents(events);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter events client-side based on active filter state
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (filters.city !== 'All' && event.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }
      if (
        filters.category !== 'All' &&
        event.category.toLowerCase() !== filters.category.toLowerCase()
      ) {
        return false;
      }
      if (
        filters.format !== 'All' &&
        event.format.toLowerCase() !== filters.format.toLowerCase()
      ) {
        return false;
      }
      if (filters.month !== 'All') {
        const d = new Date(event.startDate);
        const monthName = d.toLocaleString('en-US', { month: 'long' }).toLowerCase();
        const filterMonthLower = filters.month.toLowerCase();
        if (!filterMonthLower.includes(monthName)) {
          return false;
        }
      }
      return true;
    });
  }, [allEvents, filters]);

  // Submission handler
  const handleEventSubmit = (_submission: EventSubmission) => {
    // TODO(handoff): replace with real server call
    setSubmissionState({ status: 'submitting' });
    setTimeout(() => setSubmissionState({ status: 'success', id: 'mock-1' }), 900);
  };

  const handleResetSubmission = () => {
    setSubmissionState({ status: 'idle' });
  };

  // -------------------------------------------------------------
  // CONSOLE SHELL & ROUTING
  // Aesthetic: Light, dense, plain business tool (#FAFAF9, #FFFFFF, #E7E5E4)
  // -------------------------------------------------------------
  if (currentPath.startsWith('/console')) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center font-mono text-xs text-[#78716C]">
          Authenticating Loops Console...
        </div>
      );
    }

    if (!user) {
      return (
        <React.Suspense fallback={<ConsoleLoadingFallback />}>
          <ConsoleLogin onNavigatePublic={() => navigate('/')} />
        </React.Suspense>
      );
    }

    const renderConsoleContent = () => {
      if (currentPath === '/console' || currentPath === '/console/') {
        return (
          <ConsoleDashboard
            onNavigate={navigate}
            dashboardPreset={dashboardPreset}
          />
        );
      }

      if (currentPath.startsWith('/console/pipeline/')) {
        const orgId = currentPath.replace('/console/pipeline/', '').split('?')[0].split('#')[0];
        return (
          <ConsoleOrganisationDetail
            orgId={orgId}
            onNavigate={navigate}
            currentRole={currentRole}
          />
        );
      }

      if (currentPath.startsWith('/console/pipeline')) {
        return (
          <ConsolePipeline
            onNavigate={navigate}
            currentRole={currentRole}
            pipelinePreset={pipelinePreset}
          />
        );
      }

      if (currentPath.startsWith('/console/events')) {
        return (
          <ConsoleEvents
            onNavigate={navigate}
            currentRole={currentRole}
          />
        );
      }

      if (currentPath.startsWith('/console/ingest')) {
        return (
          <ConsoleIngest
            onNavigatePublic={() => navigate('/')}
            isEmbedded={true}
          />
        );
      }

      if (currentPath.startsWith('/console/team')) {
        return <ConsoleTeam currentRole={currentRole} />;
      }

      // Default to Dashboard
      return (
        <ConsoleDashboard
          onNavigate={navigate}
          dashboardPreset={dashboardPreset}
        />
      );
    };

    return (
      <React.Suspense fallback={<ConsoleLoadingFallback />}>
        <ConsoleShell
          currentPath={currentPath}
          onNavigate={navigate}
          onNavigatePublic={() => navigate('/')}
          onSignOut={signOut}
          connectionState={connectionState}
          setConnectionState={setConnectionState}
          pendingWritesCount={pendingWritesCount}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          pipelinePreset={pipelinePreset}
          setPipelinePreset={setPipelinePreset}
          dashboardPreset={dashboardPreset}
          setDashboardPreset={setDashboardPreset}
        >
          {renderConsoleContent()}
        </ConsoleShell>
      </React.Suspense>
    );
  }

  // -------------------------------------------------------------
  // PUBLIC PORTAL ROUTING
  // Aesthetic: AI Loops Dark Editorial (#0A0A0A, #FAFAFA, monospace accents)
  // -------------------------------------------------------------
  const renderPublicView = () => {
    if (currentPath === '/submit') {
      return (
        <SubmitForm
          submissionState={submissionState}
          onSubmit={handleEventSubmit}
          onReset={handleResetSubmission}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    if (currentPath.startsWith('/events/')) {
      const slug = currentPath.replace('/events/', '').split('?')[0].split('#')[0];
      return (
        <EventDetail
          slug={slug}
          onNavigateHome={() => navigate('/')}
          onSelectEvent={(newSlug) => navigate(`/events/${newSlug}`)}
        />
      );
    }

    // Home directory
    if (currentPath === '/' || currentPath === '') {
      return (
        <main className="space-y-6">
          <Hero onNavigateSubmit={() => navigate('/submit')} />
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            totalCount={allEvents.length}
            filteredCount={filteredEvents.length}
            onExportFilteredIcs={() => {
              if (filteredEvents.length > 0) {
                downloadIcsFile(filteredEvents, 'ai-loops-nigeria-events.ics');
              }
            }}
          />
          {loading ? (
            <div className="py-24 text-center text-xs uppercase font-mono tracking-widest text-[#737373]">
              SYNCHRONISING AI LOOPS REPOSITORY...
            </div>
          ) : (
            <EventList
              events={filteredEvents}
              onSelectEvent={(slug) => navigate(`/events/${slug}`)}
            />
          )}
        </main>
      );
    }

    // Unmatched public route: Custom 404
    return <NotFound onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col font-sans selection:bg-[#FAFAFA] selection:text-[#0A0A0A]">
      <Header currentPath={currentPath} onNavigate={navigate} />
      <div className="flex-1 w-full">{renderPublicView()}</div>
      <Footer
        onNavigateHome={() => navigate('/')}
        onNavigateSubmit={() => navigate('/submit')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
