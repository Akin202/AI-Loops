import type {
  AsyncState,
  Contact,
  DashboardStats,
  Event,
  EventStatus,
  ExtractedEventData,
  FilterState,
  Interaction,
  Organisation,
  PipelineFilters,
  PipelineStage,
  TeamMember,
} from '../types';
import { mockEvents, mockOrganisations, mockTeamMembers } from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Access layer contract for all event, organisation, and pipeline queries.
 * Only this module accesses the underlying mock-data provider.
 */

// Module-level state for in-memory session persistence
let eventsStore: Event[] = mockEvents.map((e) => ({
  ...e,
  status: e.status || 'published',
}));

let organisationsStore: Organisation[] = mockOrganisations.map((o) => ({
  ...o,
  tier: o.tier || 'Tier 2',
  stage: o.stage || 'Lead',
  status: o.status || 'active',
  contacts: o.contacts ? [...o.contacts] : [],
  interactions: o.interactions ? [...o.interactions] : [],
  kpis: o.kpis || {
    periodScore: 70,
    visits: 850,
    contributions: 2,
    lastScoredAt: '2026-09-01T00:00:00Z',
  },
}));

let teamStore: TeamMember[] = [...mockTeamMembers];

// Dev Switcher mode for pipeline testing
let pipelineDevMode: 'normal' | 'empty' | '200-orgs' | 'all-overdue' = 'normal';

export function setPipelineDevMode(mode: 'normal' | 'empty' | '200-orgs' | 'all-overdue') {
  pipelineDevMode = mode;
}

export function getPipelineDevMode() {
  return pipelineDevMode;
}

// Generate 200 synthetic organisations for stress testing
function generate200Organisations(): Organisation[] {
  const sectors = [
    'Artificial Intelligence',
    'Fintech',
    'HealthTech',
    'GovTech',
    'EdTech',
    'AgriTech',
    'Creative Tech',
  ] as const;
  const stages: PipelineStage[] = [
    'Lead',
    'Contacted',
    'Engaged',
    'Partnered',
    'Champion',
    'Inactive',
  ];
  const owners = [
    'Tolu Adebayo',
    'Chidi Okafor',
    'Amina Bello',
    'Damilola Yusuf',
    'Ngozi Eze',
  ];
  const list: Organisation[] = [];

  for (let i = 1; i <= 200; i++) {
    const stage = stages[i % stages.length];
    const isOverdue = i % 3 === 0;
    const dateStr = isOverdue
      ? new Date(Date.now() - (i % 10 + 1) * 86400000).toISOString()
      : new Date(Date.now() + (i % 14 + 1) * 86400000).toISOString();

    list.push({
      id: `synthetic-org-${i}`,
      name: `Enterprise Partner ${i} Solutions`,
      sector: sectors[i % sectors.length],
      tier: i % 4 === 0 ? 'Tier 1' : i % 2 === 0 ? 'Tier 2' : 'Tier 3',
      stage,
      owner: owners[i % owners.length],
      nextAction: `Execute bilateral milestone review #${i}`,
      nextActionAt: dateStr,
      status: stage === 'Inactive' ? 'inactive' : 'active',
      inactiveReason: stage === 'Inactive' ? 'Strategic misalignment with roadmap' : undefined,
      description: `Scalable enterprise entity #${i} deploying regional West African technology initiatives.`,
      contacts: [
        {
          id: `c-syn-${i}`,
          name: `Director ${i} Adeleke`,
          title: 'Managing Director',
          email: `director${i}@partner${i}.ng`,
          phone: `+234 80${(10000000 + i).toString().slice(0, 8)}`,
          isPrimary: true,
        },
      ],
      interactions: [],
      kpis: {
        periodScore: 50 + (i % 45),
        visits: 200 + i * 15,
        contributions: (i % 6),
        lastScoredAt: '2026-09-01T00:00:00Z',
      },
    });
  }
  return list;
}

// ---------------------------------------------------------------------------
// PUBLIC PORTAL EVENT QUERIES
// ---------------------------------------------------------------------------

export async function getAllEvents(): Promise<Event[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          slug: d.slug,
          title: d.title,
          description: d.description,
          startDate: d.start_date,
          endDate: d.end_date || undefined,
          city: d.city,
          venue: d.venue,
          organiser: d.organiser,
          organiserId: d.organisation_id || d.organiser_id,
          category: d.category,
          format: d.format,
          priceType: d.price_type,
          price: d.price || undefined,
          registrationUrl: d.registration_url,
          featured: d.featured,
          status: d.status,
        }));
      }
    } catch (err) {
      console.warn('Supabase getAllEvents failed, falling back to local store:', err);
    }
  }

  return [...eventsStore].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export async function getEvents(filters?: Partial<FilterState>): Promise<Event[]> {
  let events = await getAllEvents();

  if (!filters) {
    return events;
  }

  if (filters.city && filters.city !== 'All') {
    events = events.filter((e) => e.city.toLowerCase() === filters.city!.toLowerCase());
  }

  if (filters.category && filters.category !== 'All') {
    events = events.filter((e) => e.category.toLowerCase() === filters.category!.toLowerCase());
  }

  if (filters.format && filters.format !== 'All') {
    events = events.filter((e) => e.format.toLowerCase() === filters.format!.toLowerCase());
  }

  if (filters.month && filters.month !== 'All') {
    const monthLower = filters.month.toLowerCase();
    events = events.filter((e) => {
      const d = new Date(e.startDate);
      const monthName = d.toLocaleString('en-US', { month: 'long' }).toLowerCase();
      const monthShort = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
      const year = d.getFullYear().toString();
      return (
        monthLower.includes(monthName) ||
        monthLower.includes(monthShort) ||
        (monthLower.includes(year) && monthLower.includes(monthName))
      );
    });
  }

  return events;
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const event = eventsStore.find((e) => e.slug === slug);
  return event ? { ...event } : null;
}

export async function getRelatedEvents(currentSlug: string, limit: number = 3): Promise<Event[]> {
  const current = eventsStore.find((e) => e.slug === currentSlug);
  if (!current) {
    return eventsStore.slice(0, limit);
  }

  const others = eventsStore.filter((e) => e.slug !== currentSlug);
  const matched = others.filter(
    (e) => e.category === current.category || e.city === current.city
  );

  if (matched.length >= limit) {
    return matched.slice(0, limit);
  }

  const remaining = others.filter((e) => !matched.includes(e));
  return [...matched, ...remaining].slice(0, limit);
}

export async function getAllOrganisations(): Promise<Organisation[]> {
  return [...organisationsStore];
}

export async function getOrganisationById(id: string): Promise<Organisation | null> {
  // If 200 synthetic mode is active, check synthetic list as well
  if (pipelineDevMode === '200-orgs') {
    const synthetic = generate200Organisations().find((o) => o.id === id);
    if (synthetic) return synthetic;
  }
  const org = organisationsStore.find((o) => o.id === id);
  return org ? JSON.parse(JSON.stringify(org)) : null;
}

export async function getFeaturedEvents(): Promise<Event[]> {
  return eventsStore.filter((e) => Boolean(e.featured));
}

export function slugify(title: string, startDate?: string): string {
  const d = startDate ? startDate.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${cleanTitle}-${d}`;
}

export async function extractEvent(rawInput: string): Promise<{
  data: ExtractedEventData;
  missingFieldsCount: number;
}> {
  const res = await fetch('/api/extract-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawInput }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Extraction failed');
  }
  return {
    data: json.data,
    missingFieldsCount: json.missingFieldsCount || 0,
  };
}

export async function createEvent(eventInput: Omit<Event, 'id'>): Promise<Event> {
  const id = `ev-${Date.now()}`;
  const newEvent: Event = {
    ...eventInput,
    id,
    status: eventInput.status || 'published',
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          slug: newEvent.slug,
          title: newEvent.title,
          description: newEvent.description,
          start_date: newEvent.startDate,
          end_date: newEvent.endDate || null,
          city: newEvent.city,
          venue: newEvent.venue,
          organiser: newEvent.organiser,
          organiser_id: newEvent.organiserId || null,
          category: newEvent.category,
          format: newEvent.format,
          price_type: newEvent.priceType,
          price: newEvent.price || null,
          registration_url: newEvent.registrationUrl,
          featured: newEvent.featured || false,
          status: newEvent.status || 'published',
        })
        .select()
        .single();

      if (!error && data) {
        newEvent.id = data.id;
      }
    } catch (err) {
      console.warn('Supabase createEvent failed, using local store:', err);
    }
  }

  eventsStore = [newEvent, ...eventsStore];
  return newEvent;
}

// ---------------------------------------------------------------------------
// CONSOLE DASHBOARD QUERIES
// ---------------------------------------------------------------------------

export async function getDashboardStats(
  devOverrideState?: 'loading' | 'empty' | 'error'
): Promise<AsyncState<DashboardStats>> {
  if (devOverrideState === 'loading') {
    return { status: 'loading' };
  }
  if (devOverrideState === 'error') {
    return {
      status: 'error',
      error: 'Unable to reach ecosystem aggregation service. Please refresh or verify network.',
    };
  }

  let orgs = [...organisationsStore];
  if (pipelineDevMode === 'empty' || devOverrideState === 'empty') {
    return {
      status: 'empty',
      data: {
        leadsByStage: {
          Lead: 0,
          Contacted: 0,
          Engaged: 0,
          Partnered: 0,
          Champion: 0,
          Inactive: 0,
        },
        activePartners: 0,
        inactivePartners: 0,
        conversionsQuarter: 0,
        upcomingEventsCount: 0,
        publishedEventsCount: 0,
        pendingSubmissionsCount: 0,
        overdueActions: [],
        thisWeekEvents: [],
      },
    };
  }

  if (pipelineDevMode === '200-orgs') {
    orgs = generate200Organisations();
  }

  const now = new Date('2026-09-22T00:00:00Z').getTime();

  // Calculate leads by stage
  const leadsByStage: Record<PipelineStage, number> = {
    Lead: 0,
    Contacted: 0,
    Engaged: 0,
    Partnered: 0,
    Champion: 0,
    Inactive: 0,
  };

  let activePartners = 0;
  let inactivePartners = 0;

  for (const org of orgs) {
    const stage = org.stage || 'Lead';
    leadsByStage[stage] = (leadsByStage[stage] || 0) + 1;
    if (stage === 'Inactive' || org.status === 'inactive') {
      inactivePartners++;
    } else {
      activePartners++;
    }
  }

  // Calculate overdue actions
  const overdueActions = orgs
    .filter((org) => {
      if (org.stage === 'Inactive') return false;
      if (pipelineDevMode === 'all-overdue') return true;
      if (!org.nextActionAt) return false;
      return new Date(org.nextActionAt).getTime() < now;
    })
    .map((org) => ({
      orgId: org.id,
      orgName: org.name,
      tier: org.tier || 'Tier 2',
      stage: org.stage || 'Lead',
      nextAction: org.nextAction || 'Milestone check-in required',
      nextActionAt:
        pipelineDevMode === 'all-overdue'
          ? '2026-09-14T10:00:00Z'
          : org.nextActionAt || '2026-09-14T10:00:00Z',
      owner: org.owner || 'Unassigned',
    }))
    .sort(
      (a, b) => new Date(a.nextActionAt).getTime() - new Date(b.nextActionAt).getTime()
    );

  // "This week" events (next 14 days for comprehensive preview, or earliest upcoming events)
  const publishedEvents = eventsStore.filter((e) => e.status !== 'archived');
  const sortedUpcoming = [...publishedEvents].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const thisWeekEvents = sortedUpcoming.slice(0, 6).map((event) => {
    const linkedOrg = orgs.find(
      (o) => o.id === event.organiserId || o.name.toLowerCase() === event.organiser.toLowerCase()
    );
    return { event, linkedOrg };
  });

  const stats: DashboardStats = {
    leadsByStage,
    activePartners,
    inactivePartners,
    conversionsQuarter: 14,
    upcomingEventsCount: eventsStore.filter((e) => e.status !== 'archived').length,
    publishedEventsCount: eventsStore.filter((e) => e.status === 'published' || !e.status).length,
    pendingSubmissionsCount: 4,
    overdueActions,
    thisWeekEvents,
  };

  return {
    status: 'success',
    data: stats,
  };
}

// ---------------------------------------------------------------------------
// PIPELINE ORGANISATIONS QUERIES & MUTATIONS
// ---------------------------------------------------------------------------

export async function getPipelineOrganisations(
  filters?: PipelineFilters
): Promise<Organisation[]> {
  if (pipelineDevMode === 'empty') {
    return [];
  }

  let list: Organisation[] =
    pipelineDevMode === '200-orgs' ? generate200Organisations() : [...organisationsStore];

  if (pipelineDevMode === 'all-overdue') {
    list = list.map((org) => ({
      ...org,
      nextActionAt: '2026-09-14T10:00:00Z',
    }));
  }

  if (!filters) {
    return list;
  }

  const now = new Date('2026-09-22T00:00:00Z').getTime();

  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const query = filters.searchQuery.toLowerCase().trim();
    list = list.filter(
      (o) =>
        o.name.toLowerCase().includes(query) ||
        o.sector.toLowerCase().includes(query) ||
        (o.owner && o.owner.toLowerCase().includes(query))
    );
  }

  if (filters.stage && filters.stage !== 'All') {
    list = list.filter((o) => o.stage === filters.stage);
  }

  if (filters.tier && filters.tier !== 'All') {
    list = list.filter((o) => o.tier === filters.tier);
  }

  if (filters.sector && filters.sector !== 'All') {
    list = list.filter((o) => o.sector === filters.sector);
  }

  if (filters.owner && filters.owner !== 'All') {
    list = list.filter((o) => o.owner === filters.owner);
  }

  if (filters.overdueOnly) {
    list = list.filter((o) => {
      if (!o.nextActionAt || o.stage === 'Inactive') return false;
      return new Date(o.nextActionAt).getTime() < now;
    });
  }

  return list;
}

export async function updateOrganisationStage(
  id: string,
  newStage: PipelineStage,
  reason?: string
): Promise<Organisation> {
  if (newStage === 'Inactive' && (!reason || reason.trim().length < 5)) {
    throw new Error('A detailed reason (at least 5 characters) is mandatory when marking an organisation as Inactive.');
  }

  const orgIndex = organisationsStore.findIndex((o) => o.id === id);
  if (orgIndex === -1) {
    throw new Error(`Organisation ${id} not found`);
  }

  const org = organisationsStore[orgIndex];
  const stageInteraction: Interaction = {
    id: `int-${Date.now()}`,
    date: new Date().toISOString(),
    channel: 'Event',
    direction: 'Outbound',
    summary: `Stage changed: ${org.stage || 'Lead'} -> ${newStage}${reason ? ` (Reason: ${reason})` : ''}`,
    loggedBy: 'Audit Trail',
  };

  const updatedInteractions = org.interactions ? [stageInteraction, ...org.interactions] : [stageInteraction];

  const updatedOrg: Organisation = {
    ...org,
    stage: newStage,
    status: newStage === 'Inactive' ? 'inactive' : 'active',
    inactiveReason: newStage === 'Inactive' ? reason : undefined,
    interactions: updatedInteractions,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('organisations')
        .update({
          stage: newStage,
          status: updatedOrg.status,
          inactive_reason: updatedOrg.inactiveReason || null,
        })
        .eq('id', id);

      await supabase.from('interactions').insert({
        organisation_id: id,
        date: stageInteraction.date,
        channel: stageInteraction.channel,
        direction: stageInteraction.direction,
        summary: stageInteraction.summary,
        logged_by: stageInteraction.loggedBy,
      });
    } catch (err) {
      console.warn('Supabase updateOrganisationStage failed, using local state:', err);
    }
  }

  organisationsStore[orgIndex] = updatedOrg;
  return { ...updatedOrg };
}

export async function updateOrganisation(
  id: string,
  updates: Partial<Organisation>
): Promise<Organisation> {
  const orgIndex = organisationsStore.findIndex((o) => o.id === id);
  if (orgIndex === -1) {
    throw new Error(`Organisation ${id} not found`);
  }

  const updatedOrg: Organisation = {
    ...organisationsStore[orgIndex],
    ...updates,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('organisations')
        .update({
          name: updatedOrg.name,
          sector: updatedOrg.sector,
          tier: updatedOrg.tier,
          owner: updatedOrg.owner,
          next_action: updatedOrg.nextAction,
          next_action_at: updatedOrg.nextActionAt,
          website: updatedOrg.website,
          description: updatedOrg.description,
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase updateOrganisation error:', err);
    }
  }

  organisationsStore[orgIndex] = updatedOrg;
  return { ...updatedOrg };
}

export async function addOrganisationContact(
  orgId: string,
  contactData: Omit<Contact, 'id'>
): Promise<Contact> {
  const orgIndex = organisationsStore.findIndex((o) => o.id === orgId);
  if (orgIndex === -1) {
    throw new Error(`Organisation ${orgId} not found`);
  }

  let contactId = `c-${Date.now()}`;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          organisation_id: orgId,
          name: contactData.name,
          title: contactData.title,
          email: contactData.email,
          phone: contactData.phone,
          is_primary: contactData.isPrimary || false,
        })
        .select()
        .single();
      if (!error && data) {
        contactId = data.id;
      }
    } catch (err) {
      console.warn('Supabase addOrganisationContact error:', err);
    }
  }

  const newContact: Contact = {
    ...contactData,
    id: contactId,
  };

  const org = organisationsStore[orgIndex];
  const contacts = org.contacts ? [...org.contacts, newContact] : [newContact];

  organisationsStore[orgIndex] = {
    ...org,
    contacts,
  };

  return newContact;
}

export async function logOrganisationInteraction(
  orgId: string,
  interactionData: Omit<Interaction, 'id'>
): Promise<Interaction> {
  const orgIndex = organisationsStore.findIndex((o) => o.id === orgId);
  if (orgIndex === -1) {
    throw new Error(`Organisation ${orgId} not found`);
  }

  let interId = `int-${Date.now()}`;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          organisation_id: orgId,
          date: interactionData.date || new Date().toISOString(),
          channel: interactionData.channel,
          direction: interactionData.direction,
          summary: interactionData.summary,
          logged_by: interactionData.loggedBy || 'Team Member',
        })
        .select()
        .single();
      if (!error && data) {
        interId = data.id;
      }
    } catch (err) {
      console.warn('Supabase logOrganisationInteraction error:', err);
    }
  }

  const newInteraction: Interaction = {
    ...interactionData,
    id: interId,
  };

  const org = organisationsStore[orgIndex];
  const interactions = org.interactions
    ? [newInteraction, ...org.interactions]
    : [newInteraction];

  organisationsStore[orgIndex] = {
    ...org,
    interactions,
  };

  return newInteraction;
}

// ---------------------------------------------------------------------------
// INTERNAL EVENT MANAGEMENT QUERIES & MUTATIONS
// ---------------------------------------------------------------------------

export async function getManageableEvents(filters?: {
  status?: string;
  category?: string;
  city?: string;
  format?: string;
  query?: string;
}): Promise<Event[]> {
  let list = [...eventsStore];

  if (!filters) {
    return list;
  }

  if (filters.status && filters.status !== 'All') {
    list = list.filter((e) => (e.status || 'published') === filters.status);
  }

  if (filters.category && filters.category !== 'All') {
    list = list.filter((e) => e.category === filters.category);
  }

  if (filters.city && filters.city !== 'All') {
    list = list.filter((e) => e.city === filters.city);
  }

  if (filters.format && filters.format !== 'All') {
    list = list.filter((e) => e.format === filters.format);
  }

  if (filters.query && filters.query.trim() !== '') {
    const q = filters.query.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.organiser.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function updateEventStatus(
  eventIds: string[],
  newStatus: EventStatus
): Promise<void> {
  // TODO(handoff): bulk publish / archive event mutations
  eventsStore = eventsStore.map((e) => {
    if (eventIds.includes(e.id)) {
      return { ...e, status: newStatus };
    }
    return e;
  });
}

// ---------------------------------------------------------------------------
// TEAM DIRECTORY QUERIES & MUTATIONS
// ---------------------------------------------------------------------------

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  return [...teamStore];
}

export async function addTeamMember(
  memberData: Omit<TeamMember, 'id'>
): Promise<TeamMember> {
  // TODO(handoff): persist team member creation
  const newMember: TeamMember = {
    ...memberData,
    id: `tm-${Date.now()}`,
  };
  teamStore = [...teamStore, newMember];
  return newMember;
}


