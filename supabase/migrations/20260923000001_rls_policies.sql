-- Supabase Migration: 20260923000001_rls_policies.sql
-- Row Level Security (RLS) Policies for Public vs Authenticated Operations

-- Enable RLS across all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_kpis ENABLE ROW LEVEL SECURITY;

-- Helper function: get role of current authenticated user
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: check if caller has edit permission
CREATE OR REPLACE FUNCTION can_edit()
RETURNS BOOLEAN AS $$
  SELECT auth_user_role() IN ('Lead', 'Admin', 'Editor');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ========================================================
-- 1. PROFILES POLICIES
-- ========================================================
-- Authenticated members can view all team profiles
CREATE POLICY "profiles_select_auth"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile; Admins/Leads can update any
CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR auth_user_role() IN ('Lead', 'Admin'))
  WITH CHECK (id = auth.uid() OR auth_user_role() IN ('Lead', 'Admin'));

-- Admins and Leads can insert new profiles
CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_role() IN ('Lead', 'Admin'));

-- ========================================================
-- 2. EVENTS POLICIES (Public Boundary)
-- ========================================================
-- Public (anon) and authenticated can view published events
CREATE POLICY "events_select_published_anon"
  ON events FOR SELECT
  TO anon
  USING (status = 'published');

-- Authenticated team members can view all events (including drafts & archives)
CREATE POLICY "events_select_auth"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- Editors, Leads, Admins can insert events
CREATE POLICY "events_insert_auth"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (can_edit());

-- Editors, Leads, Admins can update events
CREATE POLICY "events_update_auth"
  ON events FOR UPDATE
  TO authenticated
  USING (can_edit())
  WITH CHECK (can_edit());

-- Admins and Leads can delete events
CREATE POLICY "events_delete_auth"
  ON events FOR DELETE
  TO authenticated
  USING (auth_user_role() IN ('Lead', 'Admin'));

-- ========================================================
-- 3. EVENT SUBMISSIONS POLICIES
-- ========================================================
-- Public (anon) can submit events via public form
CREATE POLICY "submissions_insert_anon"
  ON event_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated can view all submissions in ingest queue
CREATE POLICY "submissions_select_auth"
  ON event_submissions FOR SELECT
  TO authenticated
  USING (true);

-- Editors, Leads, Admins can update/approve submissions
CREATE POLICY "submissions_update_auth"
  ON event_submissions FOR UPDATE
  TO authenticated
  USING (can_edit())
  WITH CHECK (can_edit());

-- Editors, Leads, Admins can insert submissions from console
CREATE POLICY "submissions_insert_auth"
  ON event_submissions FOR INSERT
  TO authenticated
  WITH CHECK (can_edit());

-- ========================================================
-- 4. ORGANISATIONS POLICIES (Strictly Authenticated)
-- ========================================================
-- Authenticated users can view organisations
CREATE POLICY "orgs_select_auth"
  ON organisations FOR SELECT
  TO authenticated
  USING (true);

-- Editors, Leads, Admins can insert organisations
CREATE POLICY "orgs_insert_auth"
  ON organisations FOR INSERT
  TO authenticated
  WITH CHECK (can_edit());

-- Editors, Leads, Admins can update organisations
CREATE POLICY "orgs_update_auth"
  ON organisations FOR UPDATE
  TO authenticated
  USING (can_edit())
  WITH CHECK (can_edit());

-- Admins and Leads can delete organisations
CREATE POLICY "orgs_delete_auth"
  ON organisations FOR DELETE
  TO authenticated
  USING (auth_user_role() IN ('Lead', 'Admin'));

-- ========================================================
-- 5. CONTACTS POLICIES (Strictly Authenticated)
-- ========================================================
CREATE POLICY "contacts_select_auth"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "contacts_insert_auth"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (can_edit());

CREATE POLICY "contacts_update_auth"
  ON contacts FOR UPDATE
  TO authenticated
  USING (can_edit())
  WITH CHECK (can_edit());

CREATE POLICY "contacts_delete_auth"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth_user_role() IN ('Lead', 'Admin'));

-- ========================================================
-- 6. INTERACTIONS POLICIES (Strictly Authenticated)
-- ========================================================
CREATE POLICY "interactions_select_auth"
  ON interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "interactions_insert_auth"
  ON interactions FOR INSERT
  TO authenticated
  WITH CHECK (can_edit());

CREATE POLICY "interactions_update_auth"
  ON interactions FOR UPDATE
  TO authenticated
  USING (can_edit())
  WITH CHECK (can_edit());

-- ========================================================
-- 7. PARTNER KPIS POLICIES (Strictly Authenticated)
-- ========================================================
CREATE POLICY "kpis_select_auth"
  ON partner_kpis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "kpis_insert_auth"
  ON partner_kpis FOR INSERT
  TO authenticated
  WITH CHECK (can_edit());

CREATE POLICY "kpis_update_auth"
  ON partner_kpis FOR UPDATE
  TO authenticated
  USING (can_edit())
  WITH CHECK (can_edit());
