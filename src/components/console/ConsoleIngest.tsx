import React, { useEffect, useState, useCallback, useId } from 'react';
import type {
  ExtractedEventData,
  ExtractionState,
  Organisation,
  QueueItem,
} from '../../../types';
import { extractEvent, getAllOrganisations } from '../../../lib/data-access';
import { ConsoleHeader } from './ConsoleHeader';
import { ReviewCard } from './ReviewCard';
import { ReviewCardSkeleton } from './ReviewCardSkeleton';
import { QueueTable } from './QueueTable';
import { DevStateSwitcher, type DevStatePreset } from './DevStateSwitcher';

interface ConsoleIngestProps {
  onNavigatePublic?: () => void;
  isEmbedded?: boolean;
}

// Preset samples for rich testing and authentic review
const SAMPLE_READY_DATA: ExtractedEventData = {
  title: 'Nigeria Blockchain & AI Week 2026',
  startDate: '2026-11-06T09:00:00Z',
  endDate: '2026-11-07T18:00:00Z',
  city: 'Lagos',
  venue: 'Landmark Event Centre, Water Corporation Drive, Victoria Island, Lagos',
  organiser: 'Blockchain & AI Ecosystem Association',
  category: 'Conference',
  format: 'Hybrid',
  priceType: 'Free',
  registrationUrl: 'https://nigeriablockchainaiweek.ng',
  description:
    'The biggest AI event left in 2026. Theme: Agenda 2036 - AI, Blockchain & Stablecoins. 100+ speakers, policymakers, and investors convening to explore sovereign AI, decentralized compute, and financial rails.',
  organisationId: 'org-1',
  confidences: {
    title: 'green',
    startDate: 'green',
    endDate: 'green',
    city: 'green',
    venue: 'green',
    organiser: 'green',
    category: 'green',
    format: 'green',
    priceType: 'green',
    registrationUrl: 'green',
    description: 'green',
  },
};

const SAMPLE_PARTIAL_DATA: ExtractedEventData = {
  title: 'GritinAI Connect: Practical AI Adoption',
  startDate: '2026-09-26T09:30:00Z',
  endDate: '',
  city: 'Benin City',
  venue: 'Victor Uwaifo Creative Hub, Airport Road, Benin City, Edo State',
  organiser: 'GritinAI',
  category: 'Conference',
  format: 'In-Person',
  priceType: 'Free',
  registrationUrl: 'https://gritinai.com/connect-benin',
  description:
    'Dedicated South-South forum in Benin City accelerating practical AI adoption across agriculture, regional logistics, and grassroots talent development.',
  organisationId: 'org-3',
  confidences: {
    title: 'green',
    startDate: 'green',
    endDate: 'grey',
    city: 'green',
    venue: 'green',
    organiser: 'green',
    category: 'green',
    format: 'green',
    priceType: 'green',
    registrationUrl: 'green',
    description: 'green',
  },
};

const SAMPLE_LONG_TITLE_DATA: ExtractedEventData = {
  ...SAMPLE_READY_DATA,
  title:
    '7 International AI Conferences Lagos 2026: The Pan-African Mega-Summit on Computer Vision, NLP, Clinical Healthcare & Embedded Robotics',
  confidences: {
    ...SAMPLE_READY_DATA.confidences,
    title: 'green',
  },
};

const SAMPLE_MISSING_DATE_DATA: ExtractedEventData = {
  ...SAMPLE_READY_DATA,
  title: 'Tech for Real Estate Summit: PropTech & Smart Cities',
  startDate: '',
  city: 'Port Harcourt',
  venue: 'Golden Tulip Hotel, 1C Evo Road, GRA Phase 2, Port Harcourt',
  organiser: 'Rivers Tech Network & Niger Delta PropTech Guild',
  confidences: {
    ...SAMPLE_READY_DATA.confidences,
    startDate: 'grey',
  },
};

const DEFAULT_QUEUE: QueueItem[] = [
  {
    id: 'q-1',
    rawInput: 'https://lu.ma/nigeria-blockchain-ai-week-2026',
    status: 'ready',
    extractedTitle: 'Nigeria Blockchain & AI Week 2026',
    timestamp: '10:42 PM',
    extractedData: SAMPLE_READY_DATA,
  },
  {
    id: 'q-2',
    rawInput: 'https://gritinai.com/events/connect-benin-city',
    status: 'partial',
    extractedTitle: 'GritinAI Connect: Practical AI Adoption',
    timestamp: '10:15 PM',
    extractedData: SAMPLE_PARTIAL_DATA,
  },
  {
    id: 'q-3',
    rawInput: 'Forwarded WhatsApp: Join IEEE NIGERCON at UNILAG Nov 5-6 for the Heavy AI & Data track',
    status: 'pending',
    extractedTitle: undefined,
    timestamp: '09:50 PM',
  },
  {
    id: 'q-4',
    rawInput: 'https://x.com/tech_rivers/status/1838823901928301',
    status: 'error',
    error: 'HTTP 403 Forbidden: Protected post or rate limited',
    timestamp: '08:30 PM',
  },
];

const TWELVE_ITEM_QUEUE: QueueItem[] = [
  ...DEFAULT_QUEUE,
  {
    id: 'q-5',
    rawInput: 'https://aiforum.ng/lagos-2026-summit',
    status: 'ready',
    extractedTitle: 'The AI Forum Nigeria 2026',
    timestamp: '08:15 PM',
  },
  {
    id: 'q-6',
    rawInput: 'https://buildnigeria.ng/final-demo-day',
    status: 'approved',
    extractedTitle: 'Build Nigeria Final: Hardware & AI Products',
    timestamp: '07:45 PM',
  },
  {
    id: 'q-7',
    rawInput: 'https://9jaautomationfest.ng/rsvp',
    status: 'draft',
    extractedTitle: '9ja Automation Fest 2026',
    timestamp: '06:30 PM',
  },
  {
    id: 'q-8',
    rawInput: 'https://proptechph.ng/golden-tulip-summit',
    status: 'pending',
    timestamp: '05:10 PM',
  },
  {
    id: 'q-9',
    rawInput: 'https://insurancemeetstech.com/imt-4-registration',
    status: 'partial',
    extractedTitle: 'Insurance Meets Tech 2026 (IMT 4.0)',
    timestamp: '04:00 PM',
  },
  {
    id: 'q-10',
    rawInput: 'https://gammatechsummit.com/lagos-agenda',
    status: 'ready',
    extractedTitle: 'GAMMA Tech Summit 2026',
    timestamp: '02:30 PM',
  },
  {
    id: 'q-11',
    rawInput: 'Email text from Benin Tech Fest 2.0 committee regarding Edo Soundstage schedule',
    status: 'pending',
    timestamp: 'Yesterday',
  },
  {
    id: 'q-12',
    rawInput: 'https://lu.ma/broken-url-404-check',
    status: 'error',
    error: 'DNS lookup failed for destination domain',
    timestamp: 'Yesterday',
  },
];

export const ConsoleIngest: React.FC<ConsoleIngestProps> = ({
  onNavigatePublic = () => {},
  isEmbedded = false,
}) => {
  const [rawInput, setRawInput] = useState<string>('');
  const [extractionState, setExtractionState] = useState<ExtractionState>({
    status: 'ready',
    data: SAMPLE_READY_DATA,
    missingFieldsCount: 0,
  });
  const [activeFormData, setActiveFormData] = useState<ExtractedEventData>(SAMPLE_READY_DATA);
  const [queue, setQueue] = useState<QueueItem[]>(DEFAULT_QUEUE);
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>('q-1');
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [activeDevPreset, setActiveDevPreset] = useState<DevStatePreset | null>('ready');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const inputId = useId();

  // Load organisations strictly via data-access
  useEffect(() => {
    let isMounted = true;
    getAllOrganisations().then((orgs) => {
      if (isMounted) {
        setOrganisations(orgs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Show transient toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Perform event extraction
  const handleExtract = useCallback(
    async (textToExtract: string) => {
      const trimmed = textToExtract.trim();
      if (!trimmed) return;

      const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);

      // If multiple lines are pasted, add them all to the queue
      if (lines.length > 1) {
        const newQueueItems: QueueItem[] = lines.map((line, idx) => ({
          id: `q-${Date.now()}-${idx}`,
          rawInput: line,
          status: 'pending',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));

        setQueue((prev) => [...newQueueItems, ...prev]);
        showToast(`Added ${lines.length} items to the batch queue`);
      }

      // Transition to extracting state
      setExtractionState({
        status: 'extracting',
        rawInput: lines[0],
      });
      setActiveDevPreset('extracting');

      // Wire button to extractEvent() from data-access (which currently rejects)
      try {
        // TODO(handoff): replace with real Gemini extraction call
        await extractEvent(lines[0]);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Extraction service not yet connected';

        // Sets error state in container
        setExtractionState({
          status: 'error',
          error: errorMessage,
          rawInput: lines[0],
        });
        setActiveDevPreset('error');
      }
    },
    []
  );

  // Approve action handler
  const handleApprove = useCallback(
    (dataToApprove: ExtractedEventData) => {
      // TODO(handoff): replace with real approve & publish action
      showToast(`Approved & published: "${dataToApprove.title}"`);
      if (selectedQueueId) {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === selectedQueueId
              ? { ...item, status: 'approved', extractedTitle: dataToApprove.title }
              : item
          )
        );
      }
    },
    [selectedQueueId]
  );

  // Save draft handler
  const handleSaveDraft = useCallback(
    (dataToDraft: ExtractedEventData) => {
      // TODO(handoff): replace with real draft save action
      showToast(`Saved as draft: "${dataToDraft.title}"`);
      if (selectedQueueId) {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === selectedQueueId
              ? { ...item, status: 'draft', extractedTitle: dataToDraft.title }
              : item
          )
        );
      }
    },
    [selectedQueueId]
  );

  // Reject action handler
  const handleReject = useCallback(
    (reason: string) => {
      // TODO(handoff): replace with real rejection action
      showToast(`Rejected item (${reason})`);
      if (selectedQueueId) {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === selectedQueueId ? { ...item, status: 'rejected' } : item
          )
        );
      }
      setExtractionState({ status: 'idle' });
      setSelectedQueueId(null);
    },
    [selectedQueueId]
  );

  // Open item from queue into the review card
  const handleSelectQueueItem = (id: string) => {
    setSelectedQueueId(id);
    const item = queue.find((q) => q.id === id);
    if (!item) return;

    if (item.extractedData) {
      setActiveFormData(item.extractedData);
      const isMissingFields =
        !item.extractedData.title ||
        !item.extractedData.startDate ||
        !item.extractedData.venue ||
        !item.extractedData.organiser;

      setExtractionState({
        status: isMissingFields ? 'partial' : 'ready',
        data: item.extractedData,
        missingFieldsCount: isMissingFields ? 2 : 0,
      });
      setActiveDevPreset(isMissingFields ? 'partial' : 'ready');
    } else if (item.status === 'error') {
      setExtractionState({
        status: 'error',
        error: item.error || 'Failed to extract content from target source.',
        rawInput: item.rawInput,
      });
      setActiveDevPreset('error');
    } else {
      // Extract from rawInput
      handleExtract(item.rawInput);
    }
  };

  // Keyboard shortcut listener:
  // Cmd/Ctrl+Enter -> extract
  // Cmd/Ctrl+S -> approve
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey;

      if (isModifier && e.key === 'Enter') {
        e.preventDefault();
        if (rawInput.trim()) {
          handleExtract(rawInput);
        }
      }

      if (isModifier && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (extractionState.status === 'ready' || extractionState.status === 'partial') {
          handleApprove(activeFormData);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rawInput, extractionState.status, activeFormData, handleExtract, handleApprove]);

  // Handle Dev State Switcher selections
  const handleSelectDevPreset = (preset: DevStatePreset) => {
    setActiveDevPreset(preset);

    switch (preset) {
      case 'idle':
        setExtractionState({ status: 'idle' });
        setSelectedQueueId(null);
        break;

      case 'extracting':
        setExtractionState({
          status: 'extracting',
          rawInput: 'https://lu.ma/lagos-ai-summit-2026',
        });
        break;

      case 'ready':
        setActiveFormData(SAMPLE_READY_DATA);
        setExtractionState({
          status: 'ready',
          data: SAMPLE_READY_DATA,
          missingFieldsCount: 0,
        });
        break;

      case 'partial':
        setActiveFormData(SAMPLE_PARTIAL_DATA);
        setExtractionState({
          status: 'partial',
          data: SAMPLE_PARTIAL_DATA,
          missingFieldsCount: 2,
        });
        break;

      case 'error':
        setExtractionState({
          status: 'error',
          error:
            'Extraction service not yet connected (Handshake pending)',
          rawInput: 'https://eventbrite.com/broken-url-or-private-event',
        });
        break;

      case 'empty queue':
        setQueue([]);
        setSelectedQueueId(null);
        break;

      case 'long title':
        setActiveFormData(SAMPLE_LONG_TITLE_DATA);
        setExtractionState({
          status: 'ready',
          data: SAMPLE_LONG_TITLE_DATA,
          missingFieldsCount: 0,
        });
        break;

      case 'missing date':
        setActiveFormData(SAMPLE_MISSING_DATE_DATA);
        setExtractionState({
          status: 'partial',
          data: SAMPLE_MISSING_DATE_DATA,
          missingFieldsCount: 1,
        });
        break;

      case '12-item queue':
        setQueue(TWELVE_ITEM_QUEUE);
        break;
    }
  };

  // Switch to manual input from error or idle state
  const handleEnterManually = () => {
    const blankData: ExtractedEventData = {
      title: '',
      startDate: '2026-10-25T09:00:00Z',
      city: 'Lagos',
      venue: '',
      organiser: '',
      category: 'Meetup',
      format: 'In-Person',
      priceType: 'Free',
      registrationUrl: 'https://',
      description: '',
      confidences: {
        title: 'grey',
        startDate: 'amber',
        city: 'amber',
        venue: 'grey',
        organiser: 'grey',
        category: 'amber',
        format: 'amber',
        priceType: 'amber',
        registrationUrl: 'grey',
        description: 'grey',
      },
    };
    setActiveFormData(blankData);
    setExtractionState({
      status: 'ready',
      data: blankData,
      missingFieldsCount: 0,
    });
    setActiveDevPreset('ready');
  };

  // Render main review workspace according to ExtractionState:
  // idle / extracting / ready / partial / error
  const renderExtractionWorkspace = () => {
    switch (extractionState.status) {
      case 'extracting':
        return <ReviewCardSkeleton />;

      case 'ready':
      case 'partial':
        return (
          <ReviewCard
            data={activeFormData}
            onChange={setActiveFormData}
            onApprove={handleApprove}
            onSaveDraft={handleSaveDraft}
            onReject={handleReject}
            isPartial={extractionState.status === 'partial'}
            missingFieldsCount={extractionState.missingFieldsCount}
            organisations={organisations}
          />
        );

      case 'error':
        return (
          <div
            role="alert"
            className="bg-[#FFFFFF] border border-red-200 rounded-lg p-6 space-y-4 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-900">
                  Extraction Error
                </h3>
                <p className="text-xs text-red-700 font-mono break-all">
                  {extractionState.error || 'Failed to extract event parameters from the source.'}
                </p>
                {extractionState.rawInput && (
                  <p className="text-[11px] text-[#78716C] font-mono mt-1">
                    Source: {extractionState.rawInput}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-red-100">
              <button
                type="button"
                onClick={() => handleExtract(extractionState.rawInput || rawInput || 'https://lu.ma/lagos-ai')}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors min-h-[40px] focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                Retry Extraction
              </button>

              <button
                type="button"
                onClick={handleEnterManually}
                className="text-xs font-medium text-[#1D4ED8] hover:underline focus:outline-none min-h-[40px] inline-flex items-center"
              >
                Enter manually instead →
              </button>
            </div>
          </div>
        );

      case 'idle':
      default:
        return (
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg p-8 text-center space-y-3">
            <p className="text-xs text-[#78716C] font-mono uppercase tracking-wider">
              No active event in review
            </p>
            <p className="text-xs text-[#1C1917] max-w-md mx-auto">
              Paste a convening link or description above to trigger automated extraction, or select an item from the queue below to inspect.
            </p>
            <button
              type="button"
              onClick={handleEnterManually}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1D4ED8] hover:bg-blue-50 border border-blue-200 rounded min-h-[36px]"
            >
              + Create event manually
            </button>
          </div>
        );
    }
  };

  if (isEmbedded) {
    return (
      <div className="space-y-6">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            className="fixed top-16 right-4 z-40 bg-[#1C1917] text-[#FAFAF9] border border-stone-700 px-4 py-2.5 rounded shadow-xl text-xs font-mono flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* SECTION 1: INGEST INPUT */}
        <section
          aria-labelledby="input-heading"
          className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg p-4 sm:p-5 shadow-xs space-y-3"
        >
          <div className="flex items-baseline justify-between">
            <label
              htmlFor={inputId}
              id="input-heading"
              className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1917]"
            >
              Paste an event link or description
            </label>
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#78716C]">
              Batch ingest supported (one URL per line)
            </span>
          </div>

          <div className="relative">
            <textarea
              id={inputId}
              rows={3}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste URL (e.g. lu.ma/lagos-ai-2026) or paste raw event announcement / flyer notes…"
              className="w-full text-xs font-mono p-3 bg-[#FAFAF9] border border-[#E7E5E4] rounded text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:bg-[#FFFFFF] transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Input Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnterManually}
                className="text-xs font-medium text-[#1D4ED8] hover:underline focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] rounded px-1 py-0.5"
              >
                + Enter manually
              </button>
              <span className="text-[#E7E5E4]">•</span>
              <span className="text-[11px] font-mono text-[#78716C]">
                Extracts 12 structured fields via Gemini AI parser
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleExtract(rawInput)}
              disabled={!rawInput.trim() || extractionState.status === 'extracting'}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#E7E5E4] disabled:text-[#A8A29E] disabled:cursor-not-allowed text-[#FFFFFF] text-xs font-semibold rounded shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#1D4ED8] min-h-[36px]"
            >
              <span>{extractionState.status === 'extracting' ? 'Extracting…' : 'Extract Event'}</span>
              <kbd className="hidden sm:inline-block bg-[#1E40AF] text-[#FFFFFF] text-[10px] font-mono px-1.5 py-0.5 rounded opacity-80">
                ⌘↵
              </kbd>
            </button>
          </div>

          {/* Hint listing accepted sources */}
          <div className="pt-2 border-t border-[#E7E5E4] flex items-center justify-between text-[11px] text-[#78716C]">
            <p>
              <span className="font-medium text-[#1C1917]">Accepted sources:</span> Luma, Eventbrite, Meetup, Twitter/X posts, LinkedIn events, WhatsApp broadcasts, or freeform event notes.
            </p>
            <button
              type="button"
              onClick={() => {
                const sample = 'https://lu.ma/lagos-ai-summit-2026';
                setRawInput(sample);
                handleExtract(sample);
              }}
              className="text-[#1D4ED8] hover:underline font-mono text-[11px] hidden sm:inline-block"
            >
              Load Sample Luma Link
            </button>
          </div>
        </section>

        {/* SECTION 2 & 3: EXTRACTION STATE & REVIEW CARD */}
        <section aria-label="Event Review Workspace">
          {renderExtractionWorkspace()}
        </section>

        {/* SECTION 4: QUEUE TABLE */}
        <section aria-label="Ingest Queue">
          <QueueTable
            items={queue}
            selectedId={selectedQueueId}
            onSelectItem={handleSelectQueueItem}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] font-sans antialiased pb-24">
      {/* Administrative Top Bar */}
      <ConsoleHeader
        onNavigatePublic={onNavigatePublic}
        pendingCount={queue.filter((q) => q.status === 'pending' || q.status === 'partial').length}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-16 right-4 z-40 bg-[#1C1917] text-[#FAFAF9] border border-stone-700 px-4 py-2.5 rounded shadow-xl text-xs font-mono flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Console Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* SECTION 1: INGEST INPUT */}
        <section
          aria-labelledby="input-heading"
          className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg p-4 sm:p-5 shadow-xs space-y-3"
        >
          <div className="flex items-baseline justify-between">
            <label
              htmlFor={inputId}
              id="input-heading"
              className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1917]"
            >
              Paste an event link or description
            </label>
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#78716C]">
              Batch ingest supported (one URL per line)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              id={inputId}
              rows={2}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste URL (Luma, Eventbrite, Meetup, X/Twitter, etc.) or paste raw WhatsApp / email text..."
              className="flex-1 text-xs sm:text-sm px-3 py-2 rounded border border-[#E7E5E4] bg-[#FFFFFF] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            />

            <button
              type="button"
              onClick={() => handleExtract(rawInput)}
              disabled={extractionState.status === 'extracting'}
              className="sm:w-32 flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 disabled:opacity-60 rounded transition-colors min-h-[44px] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-1"
            >
              <span>Extract</span>
              <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-blue-900/60 border border-blue-400/40 text-blue-100">
                ⌘↵
              </kbd>
            </button>
          </div>

          {/* Hint listing accepted sources */}
          <div className="pt-2 border-t border-[#E7E5E4] flex items-center justify-between text-[11px] text-[#78716C]">
            <p>
              <span className="font-medium text-[#1C1917]">Accepted sources:</span> Luma, Eventbrite, Meetup, Twitter/X posts, LinkedIn events, WhatsApp broadcasts, or freeform event notes.
            </p>
            <button
              type="button"
              onClick={() => {
                const sample = 'https://lu.ma/lagos-ai-summit-2026';
                setRawInput(sample);
                handleExtract(sample);
              }}
              className="text-[#1D4ED8] hover:underline font-mono text-[11px] hidden sm:inline-block"
            >
              Load Sample Luma Link
            </button>
          </div>
        </section>

        {/* SECTION 2 & 3: EXTRACTION STATE & REVIEW CARD */}
        <section aria-label="Event Review Workspace">
          {renderExtractionWorkspace()}
        </section>

        {/* SECTION 4: QUEUE TABLE */}
        <section aria-label="Ingest Queue">
          <QueueTable
            items={queue}
            selectedId={selectedQueueId}
            onSelectItem={handleSelectQueueItem}
          />
        </section>
      </main>

      {/* DEV STATE SWITCHER (Hidden in production) */}
      <DevStateSwitcher
        activePreset={activeDevPreset}
        onSelectPreset={handleSelectDevPreset}
      />
    </div>
  );
};
