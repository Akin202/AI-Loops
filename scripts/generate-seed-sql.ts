import fs from 'fs';
import path from 'path';
import { mockOrganisations, mockEvents } from '../lib/mock-data';

function escapeSql(str: string | undefined | null): string {
  if (str === undefined || str === null) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function escapeJson(obj: any): string {
  if (!obj) return 'NULL';
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

let sql = `-- Supabase Migration: 20260923000002_seed_data.sql
-- Seed Data: 15 Fake Organisations and 40 Fake Events (Sept - Dec 2026)
-- Clean realistic Nigerian ecosystem data for staging and demos

`;

// Organisations
sql += `-- 1. Seed Organisations\n`;
for (const org of mockOrganisations) {
  const orgUuid = `00000000-0000-0000-0000-${org.id.replace('org-', '').padStart(12, '0')}`;
  sql += `INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '${orgUuid}',
  ${escapeSql(org.name)},
  ${escapeSql(org.sector)},
  ${escapeSql(org.website)},
  ${escapeSql(org.description)},
  ${escapeSql(org.tier || 'Tier 2')},
  ${escapeSql(org.stage || 'Lead')},
  ${escapeSql(org.owner || 'Tolu Adebayo')},
  ${escapeSql(org.nextAction)},
  ${org.nextActionAt ? escapeSql(org.nextActionAt) : 'NULL'},
  ${escapeSql(org.status || 'active')},
  ${org.inactiveReason ? escapeSql(org.inactiveReason) : 'NULL'}
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();\n\n`;

  // Contacts
  if (org.contacts && org.contacts.length > 0) {
    for (const c of org.contacts) {
      const contactUuid = `00000000-0000-0000-0001-${c.id.replace(/[^0-9]/g, '').padStart(12, '0')}`;
      sql += `INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '${contactUuid}',
  '${orgUuid}',
  ${escapeSql(c.name)},
  ${escapeSql(c.title)},
  ${escapeSql(c.email)},
  ${escapeSql(c.phone)},
  ${c.isPrimary ? 'TRUE' : 'FALSE'}
) ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  // Interactions
  if (org.interactions && org.interactions.length > 0) {
    for (const inter of org.interactions) {
      const interUuid = `00000000-0000-0000-0002-${inter.id.replace(/[^0-9]/g, '').padStart(12, '0')}`;
      sql += `INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '${interUuid}',
  '${orgUuid}',
  ${escapeSql(inter.date)},
  ${escapeSql(inter.channel)},
  ${escapeSql(inter.direction)},
  ${escapeSql(inter.summary)},
  ${escapeSql(inter.loggedBy)}
) ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  // KPIs
  if (org.kpis) {
    sql += `INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '${orgUuid}',
  '2026-Q4',
  ${org.kpis.periodScore},
  ${org.kpis.visits},
  ${org.kpis.contributions},
  ${escapeSql(org.kpis.lastScoredAt)}
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;\n\n`;
  }
}

// Events
sql += `\n-- 2. Seed Events (40 Nigerian AI and Tech Events)\n`;
for (let i = 0; i < mockEvents.length; i++) {
  const ev = mockEvents[i];
  const evUuid = `00000000-0000-0000-0003-${(i + 1).toString().padStart(12, '0')}`;
  
  // Link to org if organiserId matches
  let linkedOrgUuid = 'NULL';
  if (ev.organiserId) {
    linkedOrgUuid = `'00000000-0000-0000-0000-${ev.organiserId.replace('org-', '').padStart(12, '0')}'`;
  }

  sql += `INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '${evUuid}',
  ${escapeSql(ev.slug)},
  ${escapeSql(ev.title)},
  ${escapeSql(ev.description)},
  ${escapeSql(ev.startDate)},
  ${ev.endDate ? escapeSql(ev.endDate) : 'NULL'},
  ${escapeSql(ev.city)},
  ${escapeSql(ev.venue)},
  ${escapeSql(ev.organiser)},
  ${linkedOrgUuid},
  ${escapeSql(ev.category)},
  ${escapeSql(ev.format)},
  ${escapeSql(ev.priceType)},
  ${ev.price ? escapeSql(ev.price) : 'NULL'},
  ${escapeSql(ev.registrationUrl)},
  ${ev.featured ? 'TRUE' : 'FALSE'},
  ${escapeSql(ev.status || 'published')}
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;\n`;
}

const outPath = path.resolve(process.cwd(), 'supabase/migrations/20260923000002_seed_data.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`Generated seed SQL at ${outPath} (${sql.length} bytes)`);
