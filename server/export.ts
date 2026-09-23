import type { Request, Response } from 'express';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { mockOrganisations, mockEvents } from '../lib/mock-data.ts';
import { loopsConfig } from '../config/loops.config.ts';

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(cells: any[]): string {
  return cells.map(escapeCsvCell).join(',') + '\r\n';
}

function getQueryParams(req: any): Record<string, string> {
  if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0) {
    return req.query as Record<string, string>;
  }
  const urlObj = new URL(req.url || '', 'http://localhost');
  return Object.fromEntries(urlObj.searchParams);
}

/**
 * GET /api/export/organisations
 */
export async function handleExportOrganisations(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="loops-organisations-${new Date().toISOString().slice(0, 10)}.csv"`);

  res.write(toCsvRow([
    'ID',
    'Organisation Name',
    'Sector',
    'Tier',
    'Pipeline Stage',
    'Status',
    'Owner',
    'Next Action',
    'Next Action Date (ISO)',
    'Inactive Reason',
    'Website',
  ]));

  let orgs: any[] = [];
  if (isSupabaseConfigured) {
    try {
      const { data } = await getSupabase().from('organisations').select('*').order('name', { ascending: true });
      if (data && data.length > 0) {
        orgs = data;
      }
    } catch {
      // fallback to mock
    }
  }

  if (orgs.length === 0) {
    orgs = mockOrganisations;
  }

  // Filter if query params provided
  const query = getQueryParams(req);
  const { stage, sector, tier } = query;
  if (stage && typeof stage === 'string' && stage !== 'All') {
    orgs = orgs.filter((o) => (o.stage || '').toLowerCase() === stage.toLowerCase());
  }
  if (sector && typeof sector === 'string' && sector !== 'All') {
    orgs = orgs.filter((o) => (o.sector || '').toLowerCase() === sector.toLowerCase());
  }
  if (tier && typeof tier === 'string' && tier !== 'All') {
    orgs = orgs.filter((o) => (o.tier || '').toLowerCase() === tier.toLowerCase());
  }

  for (const o of orgs) {
    res.write(toCsvRow([
      o.id,
      o.name,
      o.sector,
      o.tier || 'Tier 2',
      o.stage || 'Lead',
      o.status || 'active',
      o.owner || 'Unassigned',
      o.nextAction || o.next_action || '',
      o.nextActionAt || o.next_action_at || '',
      o.inactiveReason || o.inactive_reason || '',
      o.website || '',
    ]));
  }

  res.end();
}

/**
 * GET /api/export/events
 */
export async function handleExportEvents(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="loops-events-${new Date().toISOString().slice(0, 10)}.csv"`);

  res.write(toCsvRow([
    'ID',
    'Slug',
    'Title',
    'Category',
    'City',
    'Venue',
    'Organiser',
    'Format',
    'Price Type',
    'Price',
    'Start Date (WAT/ISO)',
    'End Date',
    'Registration URL',
    'Status',
  ]));

  let events: any[] = [];
  if (isSupabaseConfigured) {
    try {
      const { data } = await getSupabase().from('events').select('*').order('start_date', { ascending: true });
      if (data && data.length > 0) {
        events = data.map((d) => ({
          id: d.id,
          slug: d.slug,
          title: d.title,
          category: d.category,
          city: d.city,
          venue: d.venue,
          organiser: d.organiser,
          format: d.format,
          priceType: d.price_type,
          price: d.price,
          startDate: d.start_date,
          endDate: d.end_date,
          registrationUrl: d.registration_url,
          status: d.status,
        }));
      }
    } catch {
      // fallback
    }
  }

  if (events.length === 0) {
    events = mockEvents;
  }

  const query = getQueryParams(req);
  const { status, city, category } = query;
  if (status && typeof status === 'string' && status !== 'All') {
    events = events.filter((e) => (e.status || 'published').toLowerCase() === status.toLowerCase());
  }
  if (city && typeof city === 'string' && city !== 'All') {
    events = events.filter((e) => (e.city || '').toLowerCase() === city.toLowerCase());
  }
  if (category && typeof category === 'string' && category !== 'All') {
    events = events.filter((e) => (e.category || '').toLowerCase() === category.toLowerCase());
  }

  for (const e of events) {
    res.write(toCsvRow([
      e.id,
      e.slug,
      e.title,
      e.category,
      e.city,
      e.venue,
      e.organiser,
      e.format,
      e.priceType,
      e.price || 'Free',
      e.startDate,
      e.endDate || '',
      e.registrationUrl || '',
      e.status || 'published',
    ]));
  }

  res.end();
}

/**
 * GET /api/export/quarterly-summary
 * Core reporting deliverable for Prof and UNDP
 */
export async function handleExportQuarterlySummary(req: Request, res: Response) {
  const query = getQueryParams(req);
  const quarter = (query.quarter as string) || '2026-Q4';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="unipod-quarterly-report-${quarter}.csv"`);

  let orgs: any[] = [];
  let events: any[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data: orgData } = await getSupabase().from('organisations').select('*, partner_kpis(*)');
      if (orgData) orgs = orgData;
      const { data: evData } = await getSupabase().from('events').select('*');
      if (evData) events = evData;
    } catch {
      // fallback
    }
  }

  if (orgs.length === 0) orgs = mockOrganisations;
  if (events.length === 0) events = mockEvents;

  const now = new Date().getTime();

  // Metric computations
  const stageCounts: Record<string, number> = {
    Lead: 0,
    Contacted: 0,
    Engaged: 0,
    Partnered: 0,
    Champion: 0,
    Inactive: 0,
  };

  let activePartners = 0;
  let inactivePartners = 0;
  const overdueList: any[] = [];

  for (const o of orgs) {
    const stage = o.stage || 'Lead';
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    if (stage === 'Inactive' || o.status === 'inactive') {
      inactivePartners++;
    } else {
      activePartners++;
    }

    const nextDate = o.nextActionAt || o.next_action_at;
    if (stage !== 'Inactive' && nextDate && new Date(nextDate).getTime() < now) {
      overdueList.push(o);
    }
  }

  const publishedEventsCount = events.filter((e) => (e.status || 'published') === 'published').length;

  // 1. Title & Header
  res.write(toCsvRow([`${loopsConfig.org.name} - QUARTERLY PARTNERSHIP & OUTREACH AUDIT REPORT`]));
  res.write(toCsvRow([`Reporting Period: ${quarter}`, `Programme: ${loopsConfig.org.subLabel}`]));
  res.write(toCsvRow([`Exported At: ${new Date().toISOString()}`]));
  res.write(toCsvRow([]));

  // 2. Executive Summary
  res.write(toCsvRow(['EXECUTIVE ROLLUP SUMMARY']));
  res.write(toCsvRow(['Metric', 'Figure']));
  res.write(toCsvRow(['Total Registered Ecosystem Organisations', orgs.length]));
  res.write(toCsvRow(['Active Pipeline / Partners', activePartners]));
  res.write(toCsvRow(['Inactive Organisations', inactivePartners]));
  res.write(toCsvRow(['Quarter Conversions (Partnered + Champion)', (stageCounts['Partnered'] || 0) + (stageCounts['Champion'] || 0)]));
  res.write(toCsvRow(['Published Ecosystem Events', publishedEventsCount]));
  res.write(toCsvRow(['Overdue Action Items', overdueList.length]));
  res.write(toCsvRow([]));

  // 3. Pipeline Distribution
  res.write(toCsvRow(['PIPELINE STAGE DISTRIBUTION']));
  res.write(toCsvRow(['Stage', 'Organisation Count', 'Share (%)']));
  for (const [stg, count] of Object.entries(stageCounts)) {
    const share = orgs.length > 0 ? ((count / orgs.length) * 100).toFixed(1) + '%' : '0%';
    res.write(toCsvRow([stg, count, share]));
  }
  res.write(toCsvRow([]));

  // 4. Overdue Actions Detail
  res.write(toCsvRow(['OVERDUE PARTNERSHIP ACTION ITEMS']));
  res.write(toCsvRow(['Organisation', 'Tier', 'Owner', 'Pending Action', 'Target Date']));
  if (overdueList.length === 0) {
    res.write(toCsvRow(['None - All actions current']));
  } else {
    for (const ov of overdueList) {
      res.write(toCsvRow([
        ov.name,
        ov.tier || 'Tier 2',
        ov.owner || 'Unassigned',
        ov.nextAction || ov.next_action || '',
        ov.nextActionAt || ov.next_action_at || '',
      ]));
    }
  }
  res.write(toCsvRow([]));

  // 5. Active Partner KPI Ledger
  res.write(toCsvRow(['ACTIVE PARTNER KPI LEDGER']));
  res.write(toCsvRow(['Organisation', 'Sector', 'Tier', 'Stage', 'Owner', 'Quarter Score (0-100)', 'Visits', 'Contributions']));
  const activeOrgs = orgs.filter((o) => (o.stage || '') !== 'Inactive');
  for (const ao of activeOrgs) {
    const kpi = ao.kpis || ao.partner_kpis?.[0] || { periodScore: 70, visits: 0, contributions: 0 };
    res.write(toCsvRow([
      ao.name,
      ao.sector,
      ao.tier || 'Tier 2',
      ao.stage || 'Lead',
      ao.owner || 'Unassigned',
      kpi.periodScore ?? kpi.period_score ?? 70,
      kpi.visits ?? 0,
      kpi.contributions ?? 0,
    ]));
  }

  res.end();
}
