export type EventCity = 'Lagos' | 'Abuja' | 'Ibadan' | 'Port Harcourt' | 'Benin City' | 'Online';

export type EventCategory = 'Hackathon' | 'Conference' | 'Meetup' | 'Workshop' | 'Demo Day';

export type EventFormat = 'In-Person' | 'Virtual' | 'Hybrid';

export type EventPriceType = 'Free' | 'Paid';

export type Sector =
  | 'Artificial Intelligence'
  | 'Fintech'
  | 'HealthTech'
  | 'GovTech'
  | 'EdTech'
  | 'AgriTech'
  | 'Creative Tech';

export type EventStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string; // ISO format e.g. "2026-10-12T09:00:00Z"
  endDate?: string;
  city: EventCity;
  venue: string;
  organiser: string;
  organiserId?: string;
  category: EventCategory;
  format: EventFormat;
  priceType: EventPriceType;
  price?: string;
  registrationUrl: string;
  featured?: boolean;
  status?: EventStatus;
}

export type OrganisationTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export type PipelineStage = 'Lead' | 'Contacted' | 'Engaged' | 'Partnered' | 'Champion' | 'Inactive';

export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary?: boolean;
}

export type InteractionChannel = 'Email' | 'WhatsApp' | 'Call' | 'In-Person' | 'Event';

export type InteractionDirection = 'Inbound' | 'Outbound';

export interface Interaction {
  id: string;
  date: string;
  channel: InteractionChannel;
  direction: InteractionDirection;
  summary: string;
  loggedBy: string;
}

export interface OrganisationKPIs {
  periodScore: number;
  visits: number;
  contributions: number;
  lastScoredAt: string;
}

export interface Organisation {
  id: string;
  name: string;
  sector: Sector;
  website?: string;
  logoUrl?: string;
  description?: string;
  tier?: OrganisationTier;
  stage?: PipelineStage;
  owner?: string;
  nextAction?: string;
  nextActionAt?: string;
  status?: 'active' | 'inactive';
  inactiveReason?: string;
  contacts?: Contact[];
  interactions?: Interaction[];
  kpis?: OrganisationKPIs;
}

export interface FilterState {
  city: EventCity | 'All';
  category: EventCategory | 'All';
  month: string | 'All';
  format: EventFormat | 'All';
}

export interface SubmissionState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  id?: string;
  error?: string;
}

export interface EventSubmission {
  title: string;
  date: string;
  city: EventCity;
  venue: string;
  organiser: string;
  category: EventCategory;
  format: EventFormat;
  priceType: EventPriceType;
  registrationUrl: string;
  description: string;
  submitterEmail: string;
}

export type ExtractionStatus = 'idle' | 'extracting' | 'ready' | 'partial' | 'error';

export type ConfidenceLevel = 'green' | 'amber' | 'grey';

export interface ExtractedEventData {
  title: string;
  startDate: string; // ISO date-time or string
  endDate?: string;
  city: EventCity;
  venue: string;
  organiser: string;
  category: EventCategory;
  format: EventFormat;
  priceType: EventPriceType;
  price?: string;
  registrationUrl: string;
  description: string;
  organisationId?: string;
  confidences?: Partial<Record<string, ConfidenceLevel>>;
}

export interface ExtractionState {
  status: ExtractionStatus;
  data?: ExtractedEventData;
  missingFieldsCount?: number;
  error?: string;
  rawInput?: string;
}

export type QueueItemStatus = 'pending' | 'ready' | 'partial' | 'error' | 'approved' | 'rejected' | 'draft';

export interface QueueItem {
  id: string;
  rawInput: string;
  status: QueueItemStatus;
  extractedTitle?: string;
  timestamp: string;
  extractedData?: ExtractedEventData;
  error?: string;
}

export type TeamRole = 'Lead' | 'Admin' | 'Editor' | 'Viewer';

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  unit: string;
  role: TeamRole;
  phone: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  active?: boolean;
}

export interface AsyncState<T> {
  status: 'loading' | 'success' | 'empty' | 'error';
  data?: T;
  error?: string;
}

export interface OverdueActionItem {
  orgId: string;
  orgName: string;
  tier: OrganisationTier;
  stage: PipelineStage;
  nextAction: string;
  nextActionAt: string;
  owner: string;
}

export interface ThisWeekEventItem {
  event: Event;
  linkedOrg?: Organisation;
}

export interface DashboardStats {
  leadsByStage: Record<PipelineStage, number>;
  activePartners: number;
  inactivePartners: number;
  conversionsQuarter: number;
  upcomingEventsCount: number;
  publishedEventsCount: number;
  pendingSubmissionsCount: number;
  overdueActions: OverdueActionItem[];
  thisWeekEvents: ThisWeekEventItem[];
}

export interface PipelineFilters {
  stage?: PipelineStage | 'All';
  tier?: OrganisationTier | 'All';
  sector?: Sector | 'All';
  owner?: string | 'All';
  overdueOnly?: boolean;
  searchQuery?: string;
}

export interface ConsoleUser {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
}

export type ConnectionState = 'online' | 'offline' | 'syncing';


