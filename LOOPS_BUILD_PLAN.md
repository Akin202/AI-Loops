# Loops — Build Plan
**AI UniPod Partnership & Outreach Platform**
Owner: Mustang (FlagIQ) · Drafted 18 Sept 2026

One product, two surfaces:

| Surface | Name | Audience | Access |
|---|---|---|---|
| Public | **AI Loops** | Nigerian AI/tech ecosystem | Open |
| Internal | **Loops Console** | Partnership team, Prof, exec | Auth-gated |

Same codebase, same database, same design system. The public portal is a filtered view of the internal events table — not a second app.

---

## 1. What the grounding revealed

Sources: the 18 Sept meeting transcript (1h 22m, full verbatim), the Gemini meeting notes, the minutes now filed in Drive, and the prior UniPod curriculum work in this project.

The written scope — Divine's thirteen modules — and the actual conversation diverge in four ways that change the build.

**1. Divine specified a CRM. What he actually needs is a reporting instrument.**
Everything he listed traces back to one anxiety, stated twice: the partnership team must be able to say what it has done, and must not embarrass the hub. *"Reputation is everything. Reputation is breached."* Document control, KPI trackers, quarterly targets, attendance — these are all instruments for producing an account of the team's work to Prof and to the UNDP. This reframes the dashboard from a vanity screen into the primary deliverable, and it means **every module needs an export**. A CRM you can't report out of has failed at the actual job.

**2. AI Loops is not a feature of the admin tool. It is the only thing with a public deadline and a public audience.**
The admin tool has one internal reviewer. AI Loops goes live on the UniPod's own website by 31 October, in front of the Nigerian tech ecosystem, carrying UNDP association. If it launches with nine listings it damages exactly the reputation Divine spent twenty minutes protecting. It carries the highest risk in the build and should be the best-finished surface.

**3. The real motivation for the tracker is lead generation, not community service.**
Divine said it directly: *"that's actually a lead... a portal system for us to track."* Combined with his point that events are where you finally meet the people you've been emailing, AI Loops is a prospecting instrument wearing a public-good jacket. That changes the schema — every event needs an optional link to an organisation record, so that "who is organising and sponsoring events in this space" becomes a queryable lead list. **This connection does not exist in Divine's spec and it is the most valuable thing in the build.**

**4. Divine is a phone-first, late-night, bad-connection user.**
He ran a 1am strategy meeting from two phones, swapped devices mid-call because one was dying, and the line dropped four separate times. He is not going to open a desktop dashboard at his desk. The Console must be fully usable one-handed on a phone over unreliable mobile data. That is an architectural input, not a responsive-design afterthought.

### The one screen that justifies the build

**The event ingest and review queue.**

Not the dashboard, not the pipeline. Someone must get 25–40 real Nigerian AI/tech events into AI Loops before 31 October, and then keep it fed weekly forever. If that job is manual data entry, the portal is stale by December and the whole thing quietly dies — the exact fate of every abandoned internal tool. If pasting a Luma link produces a reviewable, structured event in four seconds, the portal stays alive with ten minutes of work a week and can be delegated to anyone on the team.

Everything else in this build is a CRM that plenty of tools already do. This screen is the reason it's worth building at all, and it's also what makes the walkthrough land in the room.

### Deployment realities

- **Devices:** mid-tier Android, mobile data, Lagos. Assume Slow 4G and intermittent loss.
- **Distribution:** AI Loops will be shared via WhatsApp groups and X. **Link previews are mandatory**, which means server-rendered metadata, which means Next.js. This is not negotiable and it drives the framework choice in section 4.
- **Console usage:** phone-first, often late at night, often on a dying battery. Optimistic UI and offline tolerance on writes.
- **Power/network:** sessions must survive a dropped connection without losing typed input.

### Still unspecified — chase these

| # | Missing | From whom | Blocks |
|---|---|---|---|
| 1 | UniPod website stack + who controls DNS | Divine / web team | AI Loops hosting; **critical path** |
| 2 | UniPod logo, brand colours, official name lockup | Divine | Co-branding on AI Loops |
| 3 | Team roster — names, roles, units, emails | You (action item 3) | Team directory seeding |
| 4 | Product list for the knowledge library | Unit leads | Phase 3 |
| 5 | Approval chain members for document control | Prof / exec | Phase 3 |
| 6 | Whether AI Loops carries UNDP marks | Divine → Prof | Design; **check early, UN marks have usage rules** |
| 7 | 25–40 seed events for October | Delegate on Saturday | AI Loops launch |

Items 1 and 7 are the ones that will hurt if left. Raise both on Saturday.

---

## 2. Phase 0 — setup before any prompting

**Accounts**
- Supabase project (your personal account for now — see the migration rules below)
- Vercel project
- Google AI Studio API key (event ingest) — Flash tier is still free-tier eligible
- GitHub private repo: `loops`

**Supabase discipline, since this migrates to UniPod later**
1. Every Supabase value in env vars from commit one. No project refs, URLs, or keys in code.
2. **Seed with fake data only.** No real partner names, no real contact emails in your personal instance. Fifteen fake organisations, forty fake events. A demo with populated realistic data also presents far better than an empty CRM.
3. Keep all migrations as SQL files in `/supabase/migrations`. Migration day is then: new project, run migrations, restore dump, swap env.

**Ownership note — send before the walkthrough, not after**

> The tool is built and maintained by me on my own stack and time. The UniPod holds full ownership of all data in the system and can export it at any time. I retain ownership of the codebase and grant the UniPod a perpetual free licence to use it. If the UniPod later wants to take over hosting, I'll migrate it to a UniPod-owned account.

One paragraph, to Divine, cc Prof. Once they've seen a working tool this becomes a negotiation; right now it's a clarification.

**Build it multi-tenant-shaped from day one.** Every UNDP UniPod in Africa has a partnership team with these thirteen problems and a spreadsheet. Generic table names (`organisations`, not `unipod_partners`), all branding in config, zero hardcoded "UniPod" strings in the schema. UNILAG is customer zero. This costs nothing now and is the difference between free work and a distribution channel.

---

## 3. Design system

Derived from the AI Loops logo: black canvas, white geometric grotesque wordmark, tangled continuous line-art, and a wide-tracked uppercase metadata strip — `AUTONOMOUS · ITERATIVE · LEARNING · OPTIMIZING · PERPETUAL LOOPS`.

That last element is the most usable thing in the logo. The spaced-uppercase label strip becomes the metadata pattern across the entire product: every event card carries `LAGOS · 24 OCT · HACKATHON` in the same treatment. It ties the two surfaces together without repeating the logo everywhere.

### Tokens

```ts
// AI Loops — public, dark, editorial
--loops-bg:        #0A0A0A
--loops-surface:   #141414
--loops-line:      #262626
--loops-text:      #FAFAFA
--loops-muted:     #8A8A8A
--loops-accent:    #FFFFFF   // the brand is monochrome. Resist adding colour here.

// Loops Console — internal, light, dense, boring on purpose
--console-bg:      #FAFAF9
--console-surface: #FFFFFF
--console-line:    #E7E5E4
--console-text:    #1C1917
--console-muted:   #78716C
--console-accent:  #1D4ED8

// Pipeline stage semantics (Console only)
--stage-prospect:  #78716C
--stage-contacted: #0369A1
--stage-assessed:  #7C3AED
--stage-proposal:  #C2410C
--stage-active:    #15803D
--stage-inactive:  #A8A29E
```

### Typography

The logo is set in a tight neo-grotesque, most likely Helvetica Now Display — licensed and expensive. The free match that holds the same proportions is **Inter Tight** (SIL OFL, free for commercial use, self-hostable).

- Display: Inter Tight, weights 700/800, tracking `-0.03em`
- Body: Inter, 400/500/600
- Metadata strip: Inter, 600, `11px`, `uppercase`, tracking `0.18em`
- Numerals: `font-variant-numeric: tabular-nums` everywhere a figure appears in the Console

Self-host and subset. Google Fonts on Lagos mobile data costs a visible chunk of your LCP.

### The loop motif

Reproduce the logo's line-art as an inline SVG at 6–8% opacity behind the AI Loops hero only. Never on the Console, never behind text at body size, never animated on a listing page. It is a signature, not a texture — repeating it everywhere flattens it and costs you paint time on mid-tier Android.

### Aesthetic separation — enforce this

AI Loops is dark, spacious, editorial, confident. The Console is light, dense, plain, fast, and deliberately unstyled. An operations tool that looks like a launch page reads as unserious to the person who has to report with it. This instruction goes explicitly into the visual prompts, because builders will otherwise apply the striking theme to the admin screens.

---

## 4. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15, App Router, TypeScript** | AI Loops is distributed by WhatsApp link. Crawlers don't run JS. SSR is mandatory. |
| Styling | Tailwind + shadcn/ui | Console gets near-stock shadcn; AI Loops gets custom |
| Data | Supabase — Postgres, Auth, RLS, Storage | RLS is the security boundary between public and internal |
| AI | Gemini via a thin provider interface | `gemini-3.8-flash` for extraction; swap per task |
| Email | Resend (Phase 2) | Intro and follow-up mails |
| Deploy | Vercel | Preview URLs double as Divine's walkthrough link |

**Visual builder: use v0, not AI Studio or Lovable.** v0 emits Next.js + shadcn natively, which means no framework migration tax — and the migration is otherwise a real, unglamorous chunk of your first engineering session. AI Studio and Lovable both emit React + Vite and both will build you a backend you didn't ask for. If v0 credits run out, fall back to AI Studio with the DO NOT block below applied strictly, and budget a day for the Vite → Next migration at the top of Session 1.

### Schema shape

Nine tables. `organisations` is deliberately one table for both leads and partners — the `stage` field is what distinguishes them, so a conversion is a field update rather than a record migration between tables. Splitting them is the single most common mistake in this kind of build.

```
profiles           id, full_name, role, unit, title, phone, avatar_url
organisations      id, name, sector, tier, stage, inactive_reason, owner_id,
                   source, website, notes, next_action, next_action_at
contacts           id, organisation_id, full_name, email, phone, role, is_primary
interactions       id, organisation_id, contact_id, channel, direction,
                   summary, occurred_at, created_by
events             id, title, slug, description, starts_at, ends_at, city, venue,
                   organiser_name, organisation_id?, category, format, price_type,
                   registration_url, source_url, image_url, status, submitted_by,
                   created_by
event_submissions  id, raw_input, extraction_json, status, reviewed_by, event_id
partner_kpis       id, organisation_id, period, score, visits, contributions, notes
documents          id, organisation_id?, title, kind, storage_path, status,
                   approvals_json, created_by            -- Phase 3
engagements        id, organisation_id, event_id?, phase, responses_json  -- Phase 2
```

`events.organisation_id` is the lead-generation seam from grounding finding 3. It is nullable, it is not in Divine's spec, and it is where the commercial value of this tool actually sits.

---

## 5. Contracts

Write these three files first, before any prompt goes to any builder. They are the interface between the visual track and the engineering track, and neither tool is allowed to redesign them.

### `/types/index.ts`

```ts
// ---------- Enums ----------
export type PipelineStage =
  | "prospect" | "contacted" | "assessed" | "proposal" | "active" | "inactive";

export type PartnerTier = "hni" | "headline" | "platinum" | "standard";

export type EventCategory =
  | "conference" | "hackathon" | "meetup" | "workshop"
  | "webinar" | "demo-day" | "bootcamp" | "other";

export type EventFormat = "in-person" | "virtual" | "hybrid";
export type PriceType = "free" | "paid" | "invite-only";
export type EventStatus = "draft" | "review" | "published" | "archived";
export type Channel = "email" | "whatsapp" | "call" | "meeting" | "event" | "other";
export type UserRole = "admin" | "member" | "viewer";

// ---------- Entities ----------
export interface Profile {
  id: string;
  fullName: string;
  role: UserRole;
  unit: string | null;
  title: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

export interface Organisation {
  id: string;
  name: string;
  sector: string | null;
  tier: PartnerTier;
  stage: PipelineStage;
  inactiveReason: string | null;   // required by UI when stage === "inactive"
  ownerId: string | null;
  source: string | null;
  website: string | null;
  notes: string | null;
  nextAction: string | null;
  nextActionAt: string | null;     // ISO
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  organisationId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  isPrimary: boolean;
}

export interface Interaction {
  id: string;
  organisationId: string;
  contactId: string | null;
  channel: Channel;
  direction: "inbound" | "outbound";
  summary: string;
  occurredAt: string;
  createdBy: string;
}

export interface LoopEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  city: string;
  venue: string | null;
  organiserName: string | null;
  organisationId: string | null;   // the lead-gen seam
  category: EventCategory;
  format: EventFormat;
  priceType: PriceType;
  registrationUrl: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  status: EventStatus;
  createdAt: string;
}

export interface EventSubmission {
  id: string;
  rawInput: string;                // pasted URL or text
  extraction: ExtractedEvent | null;
  status: "pending" | "extracting" | "ready" | "approved" | "rejected";
  errorMessage: string | null;
  reviewedBy: string | null;
  eventId: string | null;
  createdAt: string;
}

// What the model must return. Every field nullable — never trust extraction.
export interface ExtractedEvent {
  title: string | null;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  city: string | null;
  venue: string | null;
  organiserName: string | null;
  category: EventCategory | null;
  format: EventFormat | null;
  priceType: PriceType | null;
  registrationUrl: string | null;
  confidence: "high" | "medium" | "low";
  missingFields: string[];
}

export interface PartnerKpi {
  id: string;
  organisationId: string;
  period: string;                  // "2026-Q4"
  score: number;                   // 0-100, computed server-side
  visits: number;
  contributions: number;
  notes: string | null;
}

export interface DashboardStats {
  leadsByStage: Record<PipelineStage, number>;
  activePartners: number;
  inactivePartners: number;
  conversionsThisQuarter: number;
  upcomingEvents: number;
  publishedEvents: number;
  pendingSubmissions: number;
  overdueActions: number;
}

// ---------- Async state ----------
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "empty" }
  | { status: "error"; message: string };

export type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

export type ExtractionState =
  | { status: "idle" }
  | { status: "extracting" }
  | { status: "ready"; result: ExtractedEvent }
  | { status: "partial"; result: ExtractedEvent; missing: string[] }
  | { status: "error"; message: string };

// ---------- Pure helpers — shared by UI and server ----------
export function isOverdue(o: Organisation, now = new Date()): boolean {
  return !!o.nextActionAt && new Date(o.nextActionAt) < now
    && o.stage !== "active" && o.stage !== "inactive";
}

export function stageLabel(s: PipelineStage): string {
  return {
    prospect: "Prospect", contacted: "Contacted", assessed: "Needs Assessed",
    proposal: "Proposal Sent", active: "Active Partner", inactive: "Inactive",
  }[s];
}

export function slugify(title: string, startsAt: string): string {
  const d = startsAt.slice(0, 10);
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)}-${d}`;
}
```

### `/config/loops.config.ts`

Nothing instance-specific may be hardcoded into a component. This file is what makes the build reusable across other UniPods.

```ts
export const loopsConfig = {
  org: {
    name: "AI UniPod",
    institution: "University of Lagos",
    programme: "United Nations Development Programme",
    logoPath: "/brand/unipod-logo.svg",        // TODO(handoff): awaiting asset
  },
  public: {
    productName: "AI Loops",
    tagline: "AUTONOMOUS · ITERATIVE · LEARNING · OPTIMIZING · PERPETUAL LOOPS",
    description: "Every AI and tech event in Nigeria, in one place.",
    logoPath: "/brand/ai-loops-logo.svg",
    baseUrl: "https://loops.example.org",      // TODO(handoff): awaiting DNS decision
    ogImagePath: "/brand/ai-loops-og.png",
    submitCtaLabel: "Submit an event",
  },
  console: { productName: "Loops Console" },
  cities: ["Lagos","Abuja","Ibadan","Port Harcourt","Kano","Enugu","Benin City","Online","Other"],
  sectors: ["Healthcare","Education","Financial Services","Agriculture","Government",
            "Energy","Logistics","Media","Manufacturing","Research","Other"],
  quarters: [
    { id: "2026-Q4", label: "Q4 2026", startsAt: "2026-10-01", endsAt: "2026-12-31" },
    { id: "2027-Q1", label: "Q1 2027", startsAt: "2027-01-01", endsAt: "2027-03-31" },
  ],
  features: {
    aiIngest: true,
    publicSubmissions: true,
    pitchTranslator: false,   // Phase 3
    documentControl: false,   // Phase 3
    attendance: false,        // Phase 4
  },
} as const;
```

### `/lib/data-access.ts`

The single seam. Components call these and nothing else. The engineering track replaces the bodies; the signatures never change.

```ts
import type {
  Organisation, Contact, Interaction, LoopEvent, EventSubmission,
  Profile, DashboardStats, ExtractedEvent, PipelineStage,
} from "@/types";

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// --- Organisations ---
export async function getOrganisations(filters?: {
  stage?: PipelineStage; q?: string;
}): Promise<Organisation[]> { await delay(); return []; }
export async function getOrganisation(id: string): Promise<Organisation | null> { await delay(); return null; }
export async function createOrganisation(input: Omit<Organisation,"id"|"createdAt"|"updatedAt">): Promise<Organisation> { await delay(); throw new Error("mock"); }
export async function updateOrganisation(id: string, patch: Partial<Organisation>): Promise<void> { await delay(); }

// --- Contacts & interactions ---
export async function getContacts(organisationId: string): Promise<Contact[]> { await delay(); return []; }
export async function getInteractions(organisationId: string): Promise<Interaction[]> { await delay(); return []; }
export async function logInteraction(input: Omit<Interaction,"id">): Promise<void> { await delay(); }

// --- Events ---
export async function getEvents(filters?: {
  city?: string; category?: string; from?: string; status?: string;
}): Promise<LoopEvent[]> { await delay(); return []; }
export async function getEventBySlug(slug: string): Promise<LoopEvent | null> { await delay(); return null; }
export async function createEvent(input: Omit<LoopEvent,"id"|"createdAt">): Promise<LoopEvent> { await delay(); throw new Error("mock"); }
export async function updateEvent(id: string, patch: Partial<LoopEvent>): Promise<void> { await delay(); }

// --- Ingest ---
export async function extractEvent(rawInput: string): Promise<ExtractedEvent> { await delay(1200); throw new Error("mock"); }
export async function getSubmissions(status?: string): Promise<EventSubmission[]> { await delay(); return []; }
export async function approveSubmission(id: string, patch: Partial<LoopEvent>): Promise<void> { await delay(); }
export async function rejectSubmission(id: string, reason: string): Promise<void> { await delay(); }

// --- Team & dashboard ---
export async function getProfiles(): Promise<Profile[]> { await delay(); return []; }
export async function getDashboardStats(): Promise<DashboardStats> { await delay(); throw new Error("mock"); }

// TODO(handoff): replace every body above with real Supabase queries.
// Signatures must not change — every component depends on them.
```

---

## 6. Visual track — three prompts

Paste into v0 in order. Each builds on the last; don't re-paste the whole spec each time.

### Prompt 1 — Foundation and AI Loops public surface

```
You are building ONLY the visual front-end of a product called Loops. A separate
engineer will add all backend functionality later. Your job is design and
presentation. What you must NOT build matters as much as what you must build.

=== ABSOLUTE CONSTRAINTS — DO NOT VIOLATE ===
DO NOT install or configure any database, ORM, or backend service.
DO NOT create API routes, route handlers, or server actions.
DO NOT write fetch(), axios, or any network call.
DO NOT use localStorage, sessionStorage, or cookies.
DO NOT implement authentication of any kind.
DO NOT create .env files or reference environment variables.
DO NOT call any AI or LLM API.
DO NOT install any npm package beyond the allowlist.

If a feature seems to need data, read it from the mock data file through
/lib/data-access.ts. If a button seems to need an action, call a prop callback
and leave a `// TODO(handoff):` comment. That is the CORRECT behaviour — do not
"helpfully" implement the backend. Implementing it is the wrong answer.

=== ALLOWED DEPENDENCIES (nothing else) ===
next, react, react-dom, typescript, tailwindcss, clsx, tailwind-merge,
lucide-react, date-fns, class-variance-authority, and shadcn/ui components.

=== STACK ===
Next.js 15 App Router, TypeScript, Tailwind. Server components for pages,
client components only where interaction requires it.

=== CONTRACTS — create these files FIRST, exactly as given, before any component ===
[PASTE /types/index.ts IN FULL]
[PASTE /config/loops.config.ts IN FULL]
[PASTE /lib/data-access.ts IN FULL]

These are contracts. A backend will be built to match them exactly. Do not
deviate from them, do not extend them, do not rename fields.

Also create /lib/mock-data.ts with 40 realistic Nigerian AI/tech events spread
across Oct-Dec 2026 (mix of Lagos, Abuja, Ibadan, Port Harcourt and Online;
mix of hackathons, conferences, meetups, workshops, demo days) and 15 fake
organisations across the sectors in config. ONLY /lib/data-access.ts may import
this file. No page or component may import it directly.

=== BRAND: AI LOOPS (the public surface) ===
Monochrome, dark, editorial, confident. Not a startup landing page — closer to
a design-magazine index.

Colours:  bg #0A0A0A · surface #141414 · hairline #262626 · text #FAFAFA · muted #8A8A8A
Type:     Inter Tight 700/800 for display with -0.03em tracking; Inter for body.
          Self-host from /public/fonts — do not link Google Fonts.

THE SIGNATURE ELEMENT — a metadata strip used throughout:
uppercase, 11px, weight 600, letter-spacing 0.18em, separated by " · ".
Example on an event card: LAGOS · 24 OCT · HACKATHON
Build this as a <MetaStrip items={string[]} /> component and use it everywhere
metadata appears. It is the through-line of the whole design.

=== PAGES TO BUILD ===

1. / — AI Loops home
   a. Hero: the wordmark large, the tagline from config rendered as a MetaStrip,
      one line of description. Behind it at 6% opacity, an inline SVG of loose
      overlapping continuous curved lines in thin white strokes (3-4 parallel
      hairlines per stroke, like contour lines) — abstract, no text. Static, no
      animation. Hero only; nowhere else.
   b. Filter bar: city, category, month, format. Horizontally scrollable pill
      row on mobile; inline row on desktop. Purely visual state.
   c. Event list: not a card grid — a dense editorial list. Each row: date block
      on the left (day numeral large, month in MetaStrip style), title at
      18-20px, MetaStrip beneath with city/category/price, thin hairline divider.
      Whole row is a link. Sticky month headers as the list scrolls.
   d. Footer: co-branding lockup (AI Loops + the org logo from config), a link
      to submit an event, UNDP programme line from config.

2. /events/[slug] — event detail
   Large title, MetaStrip, date and venue block, description, a prominent
   register button, a "back to all events" link, and three related events.
   Structure this page so metadata tags can be server-rendered later — leave
   `// TODO(handoff): generateMetadata for link previews` at the top.

3. /submit — public event submission
   A plain form: title, date, city, venue, organiser, category, format, price
   type, registration URL, description, submitter email. Pure presentational
   component receiving `submissionState: SubmissionState` as a prop. On submit
   the parent does ONLY:
     // TODO(handoff): replace with real server call
     setState({ status: "submitting" });
     setTimeout(() => setState({ status: "success", id: "mock-1" }), 900);

=== HARD RULES ===
- MOBILE FIRST, designed at 375px. Primary user is on a mid-tier Android on
  Lagos mobile data. No horizontal overflow at any width.
- Tap targets minimum 48x48px.
- Body text minimum 16px.
- Animate only transform and opacity. Nothing else, anywhere.
- Create a useReducedMotion hook and wrap every non-essential animation in it.
- Every image gets explicit width and height.
- Contrast: all body text on #0A0A0A must hit 4.5:1 or better. #8A8A8A is for
  large or secondary text only — check it before using it on body copy.

Build it. Then list every file you created, paste back /types/index.ts and
/lib/data-access.ts so I can verify the contracts are intact, and confirm there
are zero network calls and zero direct imports of mock-data.ts outside
data-access.ts.
```

**Verify:** open on a real phone, check horizontal overflow at 320px, change `public.productName` in config and confirm every instance updates, run `npm ls --depth=0` against the allowlist.

### Prompt 2 — The ingest screen

This is the highest-stakes screen in the build. Give it the most review time.

```
Continuing the Loops build. Same constraints as before — no backend, no network
calls, no AI API calls, no new dependencies. The contracts stay exactly as they
are.

Now build the Loops Console — the internal, authenticated side. Start with the
single most important screen: EVENT INGEST.

=== CONTEXT — read this before designing ===
A team member needs to get 40 real events into the portal before the end of
October, and then keep it fed every week thereafter. They are doing this on a
phone, often late at night, on an unreliable connection, in batches. If this
screen takes more than a few seconds per event, the portal goes stale and the
whole product dies. Speed and reviewability beat everything. This screen has
no decoration and no animation.

=== AESTHETIC — DELIBERATELY DIFFERENT FROM AI LOOPS ===
The Console is a light, dense, plain business tool. Do NOT carry over the dark
editorial treatment. Do NOT use the loop line-art. Near-stock shadcn.
bg #FAFAF9 · surface #FFFFFF · hairline #E7E5E4 · text #1C1917 · muted #78716C
· accent #1D4ED8. Same Inter/Inter Tight fonts, much smaller scale, tabular
numerals on every figure. It should look like something you report with, not
something you launch with.

=== /console/ingest ===

Layout: a single input at the top, a review queue below.

1. INPUT
   A large textarea: "Paste an event link or description". Accepts a URL or
   free text. One primary button: "Extract". Below it, a hint listing accepted
   sources. Supports pasting multiple URLs, one per line — in that case create
   one queue item per line.

2. EXTRACTION STATE
   Wire the button to `extractEvent()` from data-access (which currently
   rejects). The container handles ExtractionState from the types file:
   idle / extracting / ready / partial / error. Render all five:
   - extracting: skeleton of the review card with a subtle pulse, plus the text
     "Reading the page…" — no spinner-only state
   - ready: the review card, fully populated
   - partial: the review card with missing fields highlighted amber and the
     message "N fields need your input"
   - error: plain message with a Retry button and a "Enter manually instead" link

   // TODO(handoff): replace with real Gemini extraction call

3. THE REVIEW CARD — the core of this screen
   A two-column layout on desktop, stacked on mobile. Left: every extracted
   field as an editable input, pre-filled, with a small confidence dot
   (green/amber/grey) beside each. Right: a live preview of exactly how the
   event row will look on the public AI Loops list, updating as fields are
   edited. Reuse the public event row component so the preview is literally
   the real thing.

   Fields, in this order: title, starts at (date+time), ends at, city (select
   from config), venue, organiser name, category, format, price type,
   registration URL, description.

   Plus one field not from extraction: "Link to organisation" — a combobox over
   the mock organisations, optional, with helper text "Track the organiser as a
   lead". This is important, don't drop it.

   Actions: "Approve & publish" (primary), "Save as draft", "Reject" (opens a
   small reason input). All three call prop callbacks with TODO(handoff).

4. QUEUE
   Below the card, a compact table of pending submissions: raw input truncated,
   status badge, extracted title, time, and a row action to open it in the
   review card. Empty state: "Nothing in the queue. Paste a link above."

5. KEYBOARD
   Cmd/Ctrl+Enter extracts. Cmd/Ctrl+S approves. Show the shortcuts inline.

=== DEV STATE SWITCHER ===
Add a small fixed-position dev-only panel (bottom-right, hidden in production)
that forces each state so I can review every design without real data:
idle · extracting · ready · partial · error · empty queue · long title
· missing date · 12-item queue.

=== HARD RULES ===
Same as before. Additionally: no animation on this screen beyond the extraction
skeleton pulse. Everything must work one-handed at 375px. Inputs must not lose
typed content on re-render.

Build it. Paste back /lib/data-access.ts to confirm it is unchanged, and confirm
no component imports mock-data.ts directly.
```

**Verify:** cycle all nine dev states, type into every field and confirm nothing resets, test at 375px one-handed, `grep -rn "fetch(" .` returns nothing.

### Prompt 3 — Console: pipeline, dashboard, events, team

```
Continuing the Loops build. Same constraints. Same Console aesthetic as the
ingest screen — light, dense, plain, no loop motif, no decoration.

Build the remaining Console surfaces. All data through /lib/data-access.ts —
no direct mock imports anywhere.

1. /console — dashboard
   Reporting instrument, not a vanity screen. The team lead opens this on a
   phone at night to answer "what have we done and what's next".
   - A row of figures: leads by stage, active vs inactive partners, conversions
     this quarter, upcoming events, published events, pending submissions.
     Tabular numerals, no charts library, no gauges.
   - "Overdue actions" list — organisations whose nextActionAt has passed. This
     block sits high on the page; it is the most useful thing here.
   - "This week" — upcoming events with the organisations linked to them.
   - An "Export" button in the header. // TODO(handoff): CSV export
   Render loading, empty and error states via AsyncState<DashboardStats>.

2. /console/pipeline — organisations
   - Default view: a dense sortable table. Columns: name, sector, tier, stage
     badge, owner, next action, next action date (red when overdue).
   - A board view toggle: six columns by PipelineStage, drag to move.
     onStageChange prop callback only. // TODO(handoff)
   - Filters: stage, tier, sector, owner, overdue-only.
   - Search input filtering by name, calling data-access.
   - When a card or row moves to "inactive", open a small required-reason
     prompt. Inactive without a reason must not be possible — this is a real
     requirement, not a nicety.
   - Mobile: table becomes stacked rows, board becomes one column with a stage
     switcher above it.

3. /console/pipeline/[id] — organisation detail
   Header with name, tier, stage, owner. Tabs: Overview (fields, editable),
   Contacts (list + add), Timeline (interactions, newest first, with a "log
   interaction" composer: channel, direction, summary, date), KPIs (period
   score, visits, contributions — read-only, scored server-side later).

4. /console/events — internal event management
   Table of all events across every status with filters, bulk publish/archive,
   and a link to the ingest screen. Row action to open the public detail page.

5. /console/team — directory
   Profile cards: name, title, unit, role badge, phone, email. An "Add member"
   form. Each card has a "Virtual card" action that opens a preview of a
   shareable contact card in the AI Loops dark aesthetic — this is the one
   place the two design languages meet deliberately.

6. Console shell
   Sidebar on desktop, bottom tab bar on mobile. Nav: Dashboard, Pipeline,
   Events, Ingest, Team. A role badge in the header reading from a mock current
   user. // TODO(handoff): wire to real auth
   A connection indicator in the header showing online/offline/syncing states,
   visual only. // TODO(handoff): wire to real connectivity + write queue

=== DEV STATE SWITCHER ===
Extend the existing panel with: empty pipeline · 200 organisations · all
overdue · offline · syncing · viewer role (read-only UI).

Build it. Confirm no page imports mock-data.ts directly, list every
TODO(handoff) marker you left, and paste back /lib/data-access.ts.
```

**Verify:** `grep -rn "mock-data" --include=*.tsx . | grep -v "lib/data-access"` returns nothing. Expect 10–16 handoff markers total.

---

## 7. Handoff audit

Twenty minutes. Do all of it.

```bash
npm ls --depth=0
grep -rn "fetch(\|axios\|localStorage\|sessionStorage\|process\.env\|supabase\|firebase\|prisma" \
  --include=*.ts --include=*.tsx .
find . -path ./node_modules -prune -o -type d \( -name "api" -o -name "server" \) -print
grep -rn "TODO(handoff)" --include=*.ts --include=*.tsx .
grep -rn "mock-data\|MOCK_" --include=*.tsx . | grep -v "lib/data-access"
npm install && npm run build

git init && git add -A && git commit -m "chore: visual layer from v0"
gh repo create loops --private --source=. --push
git tag visual-baseline && git push --tags
```

The contraband scan should return nothing. Anything it finds is the builder having ignored the DO NOT block — delete it now, while it's isolated. No framework migration needed if you used v0; if you fell back to AI Studio, the Vite → Next.js migration goes at the top of Session 1 and costs roughly a day.

---

## 8. CLAUDE.md

Paste at the repo root before opening Claude Code.

````markdown
# Loops — AI UniPod Partnership Platform

## What this is
An internal CRM and reporting tool for the AI UniPod (University of Lagos,
UNDP programme) partnership team, plus AI Loops — a public portal listing every
AI and tech event in Nigeria. One codebase, one database, two surfaces.

The visual layer was generated in v0 and is largely finished. My job in this
repo is the engineering: schema, security, auth, real data, AI extraction,
exports, deploy.

## The actual product
The partnership team's real anxiety is accountability, not sales. Everything
they asked for traces back to being able to report what they have done to the
Director and to the UNDP, and to not embarrass the hub. **Every module needs an
export. A CRM you cannot report out of has failed at the job.**

Two audiences, two jobs:
1. **Partnership team members** — phone-first, often late at night, on
   unreliable Lagos mobile data. They log interactions, move leads, and feed the
   event queue. **The event ingest and review screen (/console/ingest) is the
   highest-stakes surface in the app** — if it isn't fast, the public portal
   goes stale within weeks and the whole product dies.
2. **The public** — the Nigerian AI/tech ecosystem browsing AI Loops, arriving
   from WhatsApp and X links.

`events.organisation_id` links an event to an organisation record. It is the
lead-generation seam: it turns the public portal into a prospecting list. It is
not in the client's written spec and it is the most commercially valuable thing
in this build. Do not drop it during refactors.

## Stack
- Next.js 15 App Router, TypeScript
- Tailwind + shadcn/ui
- Supabase — Postgres, Auth, RLS, Storage
- Gemini via a thin provider interface in /lib/ai — `gemini-3.8-flash` for
  extraction. Never call the model directly from a component.
- Resend for transactional email
- Vercel

## Contracts — do not break these
- `/types/index.ts` — the data model. The schema must match it exactly. Change
  types only with a deliberate reason, and update the schema in the same commit.
- `/config/loops.config.ts` — every instance-specific string, colour and asset
  path. **Never hardcode these into a component.** This is what makes the build
  reusable for other UniPods, which is a real commercial intention.
- `/lib/data-access.ts` — the only seam between UI and database. Replace the
  bodies with real queries; do not change the signatures.

## Conventions
- `// TODO(handoff):` marks every spot where real logic belongs. Grep for them.
- Presentational components stay pure. Data fetching lives in server components
  or data-access.ts, never in a UI component.
- **The Console is deliberately plain.** It is a business tool. Do not "improve"
  it toward the AI Loops dark editorial aesthetic. The two design languages meet
  in exactly one place: the virtual contact card preview.
- All money and counts use tabular numerals.

## Hard constraints
- **Performance:** AI Loops home must reach LCP under 2.5s on Slow 4G with 4x
  CPU throttle. The users are on mid-tier Android on Lagos mobile data, not on
  office wifi.
- **Link previews:** AI Loops is distributed through WhatsApp groups. WhatsApp's
  crawler does not execute JavaScript and silently drops preview images over
  ~300KB. Metadata must be server-rendered and the OG image must be verified by
  byte size, not assumed.
- **Privacy:** partner contact data belongs to the UniPod, not to me. The
  database currently sits in a personal Supabase project and will be migrated to
  a UniPod-owned account. Therefore: no real contact data in seeds, every
  Supabase value in env vars, all migrations as versioned SQL files, and an
  export path for every table.
- **Security:** the public role may read only `events` where
  `status = 'published'`. Nothing else. Everything else is authenticated.
- **Accessibility:** WCAG AA. On #0A0A0A, verify #8A8A8A is only used at large
  sizes. Report measured contrast ratios, don't assert them.
- **Motion:** only transform and opacity, every animation wrapped in the
  reduced-motion check. No motion at all on /console/ingest.

## Commands
```bash
npm run dev
npm run build        # must pass before any commit
npx supabase db push
```

## Current state
UI complete and mock-driven. No database, no auth, no network calls. All seams
marked with TODO(handoff).
````

---

## 9. Engineering sessions

### Session 1 — Audit, schema, ingest live

```
Read CLAUDE.md first, then run:
grep -rn "TODO(handoff)" --include=*.ts --include=*.tsx .

This codebase was UI-generated in v0. This session: make the event ingest flow
work end to end against real data. Work in this order.

=== STEP 1: AUDIT AND HARDEN ===
Before adding anything:
- Run the build, fix every type error and warning.
- Find any component importing mock-data directly instead of going through
  /lib/data-access.ts and route it through the seam.
- Find any hardcoded instance-specific value outside loops.config.ts and move it in.
- Verify /types/index.ts matches what components actually use. Fix mismatches
  now, before the schema locks the shape in.
- Report what you found and fixed before continuing.

=== STEP 2: SCHEMA ===
Create Supabase migrations as versioned SQL files in /supabase/migrations for:
profiles, organisations, contacts, interactions, events, event_submissions,
partner_kpis — matching /types/index.ts exactly. Include foreign keys, indexes
on (events.starts_at), (events.status), (organisations.stage),
(organisations.next_action_at), and updated_at triggers.

Constraint: organisations.stage = 'inactive' REQUIRES inactive_reason to be
non-null. Enforce with a CHECK constraint, not just in the UI.

RLS — this matters because the public portal and the private CRM share one
database:
- anon role: SELECT on events WHERE status = 'published' ONLY. INSERT on
  event_submissions ONLY. Nothing else, no other table, no other verb.
- authenticated: full read on all tables; write scoped by role in profiles.
- viewer role: read-only.

After writing the policies, write a script that uses the anon key to attempt to
read organisations, contacts, and unpublished events, and confirm each fails.
Show me the actual output.

=== STEP 3: AI EXTRACTION ===
Create /lib/ai/provider.ts exposing a single generate() function so the model is
swappable per task. Then /lib/ai/extract-event.ts:
- Fetch the URL server-side, strip to readable text (handle Luma, Eventbrite,
  generic pages, and raw pasted text).
- Call gemini-3.8-flash with a response schema matching ExtractedEvent exactly.
  Use structured output — do not parse free text with regex.
- Dates: resolve relative dates against the current date, output ISO, assume
  WAT when no timezone is given.
- Every field nullable. Populate confidence and missingFields honestly.
- Validate the result with zod before it leaves the module.
- On failure return a typed error; never throw into the UI.
- Rate-limit the route. Cap input tokens.

Wire it to the ingest screen's existing ExtractionState union. Do NOT change the
union or the component props — the UI already handles all five states.

=== STEP 4: REAL DATA ACCESS ===
Replace every function body in /lib/data-access.ts with real queries.
Signatures must not change. Then delete mock-data.ts and confirm the build
still passes.

Seed with 15 fake organisations and 40 fake events. Fake names only — no real
contact data in this database.

=== DONE WHEN ===
I can paste a real Luma URL on my phone, see a populated review card, correct a
field, approve it, and find it live on the public AI Loops list. And the anon
key cannot read a single organisation row.

Commit in logical chunks with clear messages as you go.
```

### Session 2 — Auth, pipeline, exports, resilience

```
Read CLAUDE.md. Session 1 is complete — schema, RLS and the ingest flow work.
This session: make the Console real and survivable on a bad connection.

=== 1. AUTH ===
- Supabase Auth, email magic link. Nigerian phone numbers make SMS OTP
  unreliable and expensive — do not use it.
- Middleware protecting every /console route; unauthenticated redirects to login.
- Wire the existing login UI. Do not redesign it.
- Roles from profiles: admin / member / viewer. Viewer is read-only and the UI
  already renders that state.
- Sessions long-lived — 30 days. The team works at odd hours and being logged
  out mid-task is the fastest way to kill adoption.
- Confirm the service key never reaches the client bundle, and tell me how you
  verified it.

=== 2. PIPELINE ===
- Wire organisations, contacts and interactions CRUD through data-access.
- Stage changes write an interaction row automatically so the timeline is a
  real audit trail.
- Enforce the inactive_reason rule server-side as well as in the UI.
- Overdue computation server-side using the isOverdue helper already in /types
  — one definition, shared.
- Wire the board drag to a real update with optimistic UI and rollback on error.

=== 3. EXPORTS — treat as a core feature, not a nicety ===
The client's actual job is reporting to the Director and to the UNDP.
- CSV export on organisations, events, interactions and the dashboard, honouring
  the active filters.
- A quarterly summary export: leads by stage, conversions, events published,
  active partners, all scoped to a quarter from config.
- Generated server-side, streamed, no client-side blobs.

=== 4. RESILIENCE ===
The primary user is on unreliable mobile data and will lose connection
mid-action. This is not optional.
- Cache the working set on load so the pipeline and event lists render instantly
  from memory.
- Queue writes when offline; flush on reconnect.
- Wire the existing connection indicator to real state plus queue depth.
- If a queued write fails permanently, surface it loudly. The user must know if
  their work didn't save.
- No form may lose typed content on a failed request.

=== 5. EMAIL ===
Resend. Intro and follow-up templates pulled from the organisation record.
Drafts only — generate and open in the composer, never auto-send. The client has
a document control policy requiring executive and Director approval on outbound
material; auto-sending would break a policy they wrote in the same meeting.

=== DONE WHEN ===
I can log in on my phone, move a lead to inactive with a reason, log a call,
export the quarter as CSV, turn on airplane mode mid-edit, reconnect, and see
the write land.
```

### Session 3 — Performance, link previews, launch

```
Read CLAUDE.md. Sessions 1 and 2 are complete. Final session: make AI Loops fast
and shareable, then ship it.

=== 1. LINK PREVIEWS — highest priority in this session ===
AI Loops is distributed through WhatsApp groups and X. Both crawlers ignore
JavaScript.
- generateMetadata on / and /events/[slug], fully server-rendered: og:title,
  og:description, og:image, og:url, twitter:card=summary_large_image.
- Per-event OG images generated at 1200x630 in the AI Loops dark aesthetic:
  title, MetaStrip line, wordmark. **Must be under 300KB** — WhatsApp silently
  drops larger previews with no error. Report the actual byte size of three
  generated images.
- Favicon and touch icons from the same mark.

=== 2. PERFORMANCE ===
Target: LCP under 2.5s on Slow 4G with 4x CPU throttle. Measure and report
actual numbers — do not assert.
- Report total client JS for the AI Loops home route.
- Self-host and subset Inter and Inter Tight to Latin. Report the font payload.
- Explicit dimensions on every image. Report CLS.
- Lazy-load below the fold; paginate the event list at 30 with infinite scroll.
- Dynamically import the board view and anything only the Console uses, so the
  public bundle never carries it.
- ISR on the public event pages.

=== 3. ACCESSIBILITY ===
- axe-core, zero critical issues.
- Report measured contrast ratios for: #8A8A8A on #0A0A0A, #78716C on #FAFAF9,
  and every stage badge. If any fails AA, change the value in config and tell me
  what you changed.
- Keyboard reachable with visible focus rings; the ingest shortcuts documented.
- One h1 per page, no skipped levels. Errors announced with role="alert".

=== 4. ERROR HANDLING ===
- Custom 404 in the AI Loops style with a route back to the event list.
- Error boundary with a human contact route.
- If extraction fails on the ingest screen, the manual entry path must always be
  available. Never a dead end.

=== 5. REUSE PREP ===
This build is intended to be redeployable for other UniPods.
- Audit for ANY instance-specific string, colour or asset path outside
  loops.config.ts. Move every one in.
- README.md documenting exactly which files change for a new instance, with a
  realistic time estimate.
- Document the migration path to a client-owned Supabase project: export, new
  project, run migrations, restore, swap env.

=== 6. DEPLOY ===
Deploy to Vercel. Produce a launch checklist covering production env vars, RLS
policies to re-verify in production, DNS records for the subdomain, and how to
test the WhatsApp link preview before sharing.

=== REPORT AT THE END ===
Every measured number requested above, listed explicitly.
```

---

## 10. Manual QA pass

Run these yourself. The agent will report done; done is a claim.

| Check | How |
|---|---|
| WhatsApp preview | Send the AI Loops link to yourself in a WhatsApp group. Card, image, title — or it fails. |
| Real device | Cheapest Android you can find, on mobile data, not wifi. |
| Ingest speed | Time paste → reviewable card. Over 6 seconds and the screen has failed its job. |
| Extraction quality | 10 real Nigerian event URLs from different sources. Count how many need more than one field corrected. |
| Dropped connection | Airplane mode mid-edit in the pipeline. Reconnect. Confirm the write landed. |
| Security | Open the browser console on the public site and try to read `organisations` with the anon key. Must fail. |
| Inactive rule | Try to mark a partner inactive with no reason. Must be impossible in UI and via a direct API call. |
| Export integrity | Export the quarter, open in Sheets, reconcile the totals against the dashboard. |
| Empty portal | Force zero published events. The public page must still look intentional, not broken. |
| Reuse proof | Swap `loops.config.ts` for a fake second UniPod. Nothing should break. |

---

## 11. Commercial and delivery notes

**The October date is real and the seed content is the risk, not the code.** The build is comfortably doable. Forty events is not. Delegate event sourcing on Saturday — name a person, not "the team".

**Deliver AI Loops functionally complete by mid-October.** Your own FlagIQ event is on 3 October and the back half of the month should be polish and seeding, not building.

**Two things to raise on Saturday, in this order:**
1. The ownership paragraph from section 2. Before the demo.
2. Who is sourcing the seed events, by name, with a target of 40 by 20 October.

**One thing to raise with Prof, not Divine:** whether AI Loops may carry UNDP or UN marks. UN branding has formal usage rules and this is much cheaper to check now than to unwind after launch.

**The multi-tenant angle is the real asset.** You're doing this free for UNILAG. Built config-driven, the second deployment costs you a weekend and the case study writes itself — "the partnership platform running at the UNDP AI UniPod at the University of Lagos" is a strong line in a FlagIQ deck regardless of what it earned.
