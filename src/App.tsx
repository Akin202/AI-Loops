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

// Console Surfaces
import { ConsoleShell } from './components/console/ConsoleShell';
import { ConsoleDashboard } from './components/console/ConsoleDashboard';
import { ConsolePipeline } from './components/console/ConsolePipeline';
import { ConsoleOrganisationDetail } from './components/console/ConsoleOrganisationDetail';
import { ConsoleEvents } from './components/console/ConsoleEvents';
import { ConsoleIngest } from './components/console/ConsoleIngest';
import { ConsoleTeam } from './components/console/ConsoleTeam';
import type { PipelineDevPreset, DashboardDevPreset } from './components/console/DevStateSwitcher';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Global Console Simulated States
  const [connectionState, setConnectionState] = useState<ConnectionState>('online');
  const [currentRole, setCurrentRole] = useState<TeamRole>('Lead');
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
      <ConsoleShell
        currentPath={currentPath}
        onNavigate={navigate}
        onNavigatePublic={() => navigate('/')}
        connectionState={connectionState}
        setConnectionState={setConnectionState}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        pipelinePreset={pipelinePreset}
        setPipelinePreset={setPipelinePreset}
        dashboardPreset={dashboardPreset}
        setDashboardPreset={setDashboardPreset}
      >
        {renderConsoleContent()}
      </ConsoleShell>
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

    // Default to Public Home Directory
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
