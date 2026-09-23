-- Supabase Migration: 20260923000000_initial_schema.sql
-- Loops Core Schema: Profiles, Organisations, Contacts, Interactions, Events, Submissions, KPIs

-- Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper trigger function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES (Authenticated Team Directory)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  unit TEXT,
  role TEXT NOT NULL DEFAULT 'Viewer' CHECK (role IN ('Lead', 'Admin', 'Editor', 'Viewer')),
  phone TEXT,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- 2. ORGANISATIONS (Prospects & Active Partners)
CREATE TABLE IF NOT EXISTS organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  tier TEXT DEFAULT 'Tier 2' CHECK (tier IN ('Tier 1', 'Tier 2', 'Tier 3')),
  stage TEXT NOT NULL DEFAULT 'Lead' CHECK (stage IN ('Lead', 'Contacted', 'Engaged', 'Partnered', 'Champion', 'Inactive')),
  owner TEXT,
  next_action TEXT,
  next_action_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  inactive_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Constraint: Inactive stage strictly requires an explanation
  CONSTRAINT check_inactive_reason CHECK (
    stage != 'Inactive' OR (inactive_reason IS NOT NULL AND length(trim(inactive_reason)) > 0)
  )
);

CREATE TRIGGER trg_organisations_updated_at
  BEFORE UPDATE ON organisations
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE INDEX IF NOT EXISTS idx_organisations_stage ON organisations(stage);
CREATE INDEX IF NOT EXISTS idx_organisations_next_action_at ON organisations(next_action_at);

-- 3. CONTACTS (Partner Personnel)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organisation_id);

-- 4. INTERACTIONS (Audit Timeline)
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel TEXT NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'Call', 'In-Person', 'Event')),
  direction TEXT NOT NULL CHECK (direction IN ('Inbound', 'Outbound')),
  summary TEXT NOT NULL,
  logged_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_org ON interactions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(date DESC);

-- 5. EVENTS (Public Registry & Pipeline Lead Seam)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  city TEXT NOT NULL CHECK (city IN ('Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Benin City', 'Online')),
  venue TEXT NOT NULL,
  organiser TEXT NOT NULL,
  organiser_id TEXT,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL, -- Commercial lead-gen seam
  category TEXT NOT NULL CHECK (category IN ('Hackathon', 'Conference', 'Meetup', 'Workshop', 'Demo Day')),
  format TEXT NOT NULL CHECK (format IN ('In-Person', 'Virtual', 'Hybrid')),
  price_type TEXT NOT NULL CHECK (price_type IN ('Free', 'Paid')),
  price TEXT,
  registration_url TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_org_id ON events(organisation_id);

-- 6. EVENT SUBMISSIONS (Ingest & Public Submission Staging Queue)
CREATE TABLE IF NOT EXISTS event_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_input TEXT NOT NULL,
  extracted_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'partial', 'error', 'approved', 'rejected', 'draft')),
  error_message TEXT,
  reviewed_by TEXT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_event_submissions_updated_at
  BEFORE UPDATE ON event_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE INDEX IF NOT EXISTS idx_event_submissions_status ON event_submissions(status);

-- 7. PARTNER KPIS (Quarterly Account Scoring)
CREATE TABLE IF NOT EXISTS partner_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  period TEXT NOT NULL DEFAULT '2026-Q4',
  period_score INTEGER NOT NULL DEFAULT 70 CHECK (period_score >= 0 AND period_score <= 100),
  visits INTEGER NOT NULL DEFAULT 0,
  contributions INTEGER NOT NULL DEFAULT 0,
  last_scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_partner_kpi_period UNIQUE (organisation_id, period)
);

CREATE TRIGGER trg_partner_kpis_updated_at
  BEFORE UPDATE ON partner_kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
