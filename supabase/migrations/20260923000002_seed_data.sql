-- Supabase Migration: 20260923000002_seed_data.sql
-- Seed Data: 15 Fake Organisations and 40 Fake Events (Sept - Dec 2026)
-- Clean realistic Nigerian ecosystem data for staging and demos

-- 1. Seed Organisations
INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Blockchain & AI Ecosystem Association',
  'Artificial Intelligence',
  'https://nigeriablockchainaiweek.ng',
  'National coalition organising Nigeria Blockchain & AI Week 2026 under the Agenda 2036 framework with 100+ global speakers.',
  'Tier 1',
  'Champion',
  'Tolu Adebayo',
  'Finalise Landmark Event Centre stage specs and international speaker logistics',
  '2026-09-25T10:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Dr. Chuka Monye',
  'Convener & Chairman',
  'chuka@nigeriablockchainaiweek.ng',
  '+234 802 334 1109',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Zainab Bello',
  'Director of Policy Alliances',
  'zainab@nigeriablockchainaiweek.ng',
  '+234 814 990 2231',
  FALSE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '2026-09-20T14:30:00Z',
  'In-Person',
  'Outbound',
  'Aligned on ministerial keynote panel and stablecoin regulatory sandboxing session.',
  'Tolu Adebayo'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '2026-09-15T10:00:00Z',
  'Email',
  'Inbound',
  'Received final conference programme and hackathon problem statements.',
  'Chidi Okafor'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '2026-Q4',
  98,
  8450,
  12,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'AI Forum Nigeria & National AI Alliance',
  'Artificial Intelligence',
  'https://aiforum.ng',
  'The dedicated apex forum for Nigerian AI policy leaders, academic researchers, and institutional technology executives.',
  'Tier 1',
  'Champion',
  'Tolu Adebayo',
  'Confirm Lagos Oriental Hotel VIP delegate briefing schedule',
  '2026-09-28T14:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'Prof. Folashade Ogunsola',
  'Steering Committee Chair',
  'chair@aiforum.ng',
  '+234 803 771 9044',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000003',
  '00000000-0000-0000-0000-000000000002',
  '2026-09-18T16:00:00Z',
  'Call',
  'Outbound',
  'Confirmed keynote topics on national compute sovereign clusters and LLM data dignity.',
  'Tolu Adebayo'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '2026-Q4',
  95,
  5200,
  9,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'GritinAI',
  'Artificial Intelligence',
  'https://gritinai.com',
  'Pioneering practical applied AI adoption, regional builder chapters, and real-world ML deployment across South-South Nigeria.',
  'Tier 1',
  'Partnered',
  'Damilola Yusuf',
  'Finalise Victor Uwaifo Creative Hub AV setup and livestream testing in Benin',
  '2026-09-24T11:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0000-000000000003',
  'Osasere Osagie',
  'Founder & AI Lead',
  'osas@gritinai.com',
  '+234 809 555 4321',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000004',
  '00000000-0000-0000-0000-000000000003',
  '2026-09-19T09:00:00Z',
  'Email',
  'Outbound',
  'Sent co-branding promotional collateral for GritinAI Connect Benin City.',
  'Damilola Yusuf'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '2026-Q4',
  91,
  3890,
  6,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'IEEE Nigeria Section & UNILAG',
  'Artificial Intelligence',
  'https://ieeenigercon.org',
  'Technical academic community hosting NIGERCON 2026 with an intensive Artificial Intelligence and Big Data research track at UNILAG.',
  'Tier 1',
  'Partnered',
  'Damilola Yusuf',
  'Review peer-reviewed AI paper submissions and IEEE Xplore indexing metadata',
  '2026-09-26T10:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0000-000000000004',
  'Engr. Dr. Abdullahi Musa',
  'Technical Program Chair',
  'musa.a@ieee.org',
  '+234 802 118 7632',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000005',
  '00000000-0000-0000-0000-000000000004',
  '2026-09-14T11:30:00Z',
  'In-Person',
  'Inbound',
  'Met with UNILAG engineering dean regarding student workshop scholarships.',
  'Damilola Yusuf'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  '2026-Q4',
  89,
  4100,
  7,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Fintech Association of Nigeria (FintechNGR)',
  'Fintech',
  'https://fintechng.org',
  'Nigeria’s premier self-regulatory fintech umbrella body organising the annual Nigeria Fintech Week.',
  'Tier 1',
  'Champion',
  'Chidi Okafor',
  'Coordinate live event coverage across Lagos, Abuja, and Port Harcourt nodes',
  '2026-09-22T08:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000006',
  '00000000-0000-0000-0000-000000000005',
  'Dr. Babatunde Obrimah',
  'Chief Operating Officer',
  'bobrimah@fintechng.org',
  '+234 803 124 5567',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000006',
  '00000000-0000-0000-0000-000000000005',
  '2026-09-21T15:00:00Z',
  'Call',
  'Outbound',
  'Final check-in on event opening ceremonies and AI in fraud detection panel.',
  'Chidi Okafor'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '2026-Q4',
  96,
  9800,
  14,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'AI & Automation Guild Nigeria',
  'Artificial Intelligence',
  'https://aiautomation.ng',
  'Community of enterprise automation engineers, RPA practitioners, and autonomous agent swarms architects.',
  'Tier 2',
  'Engaged',
  'Amina Bello',
  'Distribute participant terminal codes for Zone Tech Park masterclass',
  '2026-09-23T12:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000007',
  '00000000-0000-0000-0000-000000000006',
  'Kolawole Sanusi',
  'Guild Coordinator',
  'kola@aiautomation.ng',
  '+234 812 770 1923',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000007',
  '00000000-0000-0000-0000-000000000006',
  '2026-09-20T17:00:00Z',
  'Email',
  'Inbound',
  'Received curriculum slides on LangGraph and workflow agent benchmarks.',
  'Amina Bello'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  '2026-Q4',
  78,
  1650,
  3,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000007',
  'SME Africa Network',
  'Fintech',
  'https://smeafricasummit.org',
  'Supporting 50,000+ Nigerian micro-enterprises with AI accounting, supply chain logistics, and payment integration.',
  'Tier 2',
  'Engaged',
  'Chidi Okafor',
  'Confirm SME digital tool showcase sponsors at Civic Centre',
  '2026-09-27T10:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000008',
  '00000000-0000-0000-0000-000000000007',
  'Grace Adeleke',
  'Program Lead',
  'grace@smeafricasummit.org',
  '+234 805 441 2289',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000008',
  '00000000-0000-0000-0000-000000000007',
  '2026-09-16T11:00:00Z',
  'WhatsApp',
  'Outbound',
  'Shared exhibition booth allocations for early-stage proptech and edtech sponsors.',
  'Chidi Okafor'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000007',
  '2026-Q4',
  75,
  2100,
  4,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000008',
  'National Centre for AI & Robotics (NCAIR)',
  'Artificial Intelligence',
  'https://ncair.nitda.gov.ng',
  'Federal digital innovation centre driving national AI research, sovereign computing clusters, and deep tech incubation.',
  'Tier 1',
  'Champion',
  'Tolu Adebayo',
  'Review 3MTT and national AI fellowship graduation project papers in Abuja',
  '2026-09-29T09:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000009',
  '00000000-0000-0000-0000-000000000008',
  'Dr. Bunmi Ajila',
  'Director of Research',
  'bunmi.ajila@ncair.gov.ng',
  '+234 803 220 8911',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000009',
  '00000000-0000-0000-0000-000000000008',
  '2026-09-17T14:00:00Z',
  'Call',
  'Outbound',
  'Agreed on evaluation metrics for national fellow NLP model prototypes.',
  'Tolu Adebayo'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000008',
  '2026-Q4',
  94,
  6300,
  10,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000009',
  'CWG Plc & TeXcellence Council',
  'Fintech',
  'https://texcellenceconference.com',
  'Flagship enterprise technology conveners highlighting cloud migration, AI in banking infrastructure, and cybersecurity.',
  'Tier 1',
  'Partnered',
  'Chidi Okafor',
  'Finalise banking CTO panel at Balmoral Convention Centre',
  '2026-10-02T11:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000010',
  '00000000-0000-0000-0000-000000000009',
  'Adewale Adeyipo',
  'Group CEO',
  'adewale@cwg-plc.com',
  '+234 816 772 4430',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000010',
  '00000000-0000-0000-0000-000000000009',
  '2026-09-15T15:00:00Z',
  'In-Person',
  'Outbound',
  'Discussed sovereign enterprise AI infrastructure adoption in Nigerian tier-1 banks.',
  'Chidi Okafor'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000009',
  '2026-Q4',
  88,
  4500,
  5,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Inspire Africa Initiative',
  'Creative Tech',
  'https://inspireafricaconference.org',
  'Curating premier continental gatherings uniting technology pioneers, venture capitalists, and innovators.',
  'Tier 2',
  'Engaged',
  'Amina Bello',
  'Confirm venture partner lineup for Eko Hotel Grand Ballroom',
  '2026-10-04T10:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000011',
  '00000000-0000-0000-0000-000000000010',
  'Ifeoma Okonkwo',
  'Executive Producer',
  'ifeoma@inspireafricaconference.org',
  '+234 802 441 5590',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000011',
  '00000000-0000-0000-0000-000000000010',
  '2026-09-12T16:00:00Z',
  'In-Person',
  'Outbound',
  'Completed site visit at Eko Hotel Grand Ballroom.',
  'Amina Bello'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2026-Q4',
  82,
  3100,
  4,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  'Arewa Tech Community',
  'Artificial Intelligence',
  'https://arewatechfest.com',
  'Grassroots Northern Nigeria developer community spearheading Hausa speech models and regional digital trade.',
  'Tier 2',
  'Engaged',
  'Damilola Yusuf',
  'Finalise travel bursaries for Northern tech delegates traveling to Lagos',
  '2026-10-08T09:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000012',
  '00000000-0000-0000-0000-000000000011',
  'Mustapha Shehu',
  'Community Convener',
  'mustapha@arewatechfest.com',
  '+234 803 881 7722',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000012',
  '00000000-0000-0000-0000-000000000011',
  '2026-09-11T13:00:00Z',
  'Email',
  'Outbound',
  'Confirmed hackathon prizes for the Hausa dialect synthetic dataset track.',
  'Damilola Yusuf'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  '2026-Q4',
  80,
  2700,
  4,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  'Rivers Tech Network & Niger Delta PropTech Guild',
  'Creative Tech',
  'https://proptechph.ng',
  'Port Harcourt hub advancing smart city telemetry, land registry digitisation, and AI property analytics across the South-South.',
  'Tier 2',
  'Partnered',
  'Chidi Okafor',
  'Confirm Golden Tulip Port Harcourt audio-visual and proptech demo stands',
  '2026-10-15T10:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000013',
  '00000000-0000-0000-0000-000000000012',
  'Tamuno Briggs',
  'Port Harcourt Convener',
  'tamuno@proptechph.ng',
  '+234 810 449 1180',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000013',
  '00000000-0000-0000-0000-000000000012',
  '2026-09-14T11:00:00Z',
  'Call',
  'Inbound',
  'Aligned on Port Harcourt real estate developer roundtables and GIS sensor demos.',
  'Chidi Okafor'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  '2026-Q4',
  84,
  2950,
  5,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  'GAMMA Technology Group',
  'Artificial Intelligence',
  'https://gammatechsummit.com',
  'International tech collective driving high-scale distributed backend systems, ML engineering, and cloud platforms.',
  'Tier 2',
  'Engaged',
  'Damilola Yusuf',
  'Publish official speaker agenda for The Zone Gbagada',
  '2026-10-18T13:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000014',
  '00000000-0000-0000-0000-000000000013',
  'Femi Johnson',
  'Lead Architect',
  'femi@gammatechsummit.com',
  '+234 805 119 4022',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000014',
  '00000000-0000-0000-0000-000000000013',
  '2026-09-10T14:00:00Z',
  'Email',
  'Outbound',
  'Invited local open-source maintainers to host lightning talks.',
  'Damilola Yusuf'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  '2026-Q4',
  76,
  1800,
  3,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000014',
  'Edo Innovates & Benin Tech Community',
  'Artificial Intelligence',
  'https://benintechfest.ng',
  'Edo State innovation agency fostering software incubation, robotics labs, and digital skills.',
  'Tier 2',
  'Partnered',
  'Amina Bello',
  'Confirm government innovation grant finalists for Benin Tech Fest 2.0',
  '2026-10-20T11:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000015',
  '00000000-0000-0000-0000-000000000014',
  'Precious Ikhide',
  'Managing Director',
  'precious@edoinnovates.ng',
  '+234 802 884 1009',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000015',
  '00000000-0000-0000-0000-000000000014',
  '2026-09-12T10:00:00Z',
  'In-Person',
  'Outbound',
  'Walked through the Sir Victor Uwaifo Soundstage stage configuration.',
  'Amina Bello'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000014',
  '2026-Q4',
  87,
  3400,
  6,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000015',
  'IMT Advisory Council',
  'Fintech',
  'https://insurancemeetstech.com',
  'Accelerating AI underwriting, IoT claims assessment, and digital insurance penetration across West Africa.',
  'Tier 2',
  'Engaged',
  'Chidi Okafor',
  'Release Insurance Meets Tech actuarial AI whitepaper draft',
  '2026-10-28T10:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000016',
  '00000000-0000-0000-0000-000000000015',
  'Odion Martins',
  'Conference Director',
  'odion@insurancemeetstech.com',
  '+234 809 332 7711',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000016',
  '00000000-0000-0000-0000-000000000015',
  '2026-09-08T15:00:00Z',
  'WhatsApp',
  'Inbound',
  'Confirmed keynotes from NAICOM and leading digital insurtechs.',
  'Chidi Okafor'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000015',
  '2026-Q4',
  79,
  2200,
  3,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000016',
  'Automation Nigeria Builders Guild',
  'Artificial Intelligence',
  'https://9jaautomationfest.ng',
  'Promoting robotic process automation, industrial IoT controllers, and autonomous workflow swarms in Nigerian enterprises.',
  'Tier 2',
  'Contacted',
  'Amina Bello',
  'Review robotic process automation and AI workflow hackathon guidelines',
  '2026-10-30T14:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000017',
  '00000000-0000-0000-0000-000000000016',
  'Kunle Bakare',
  'Guild President',
  'kunle@9jaautomationfest.ng',
  '+234 803 912 3344',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000017',
  '00000000-0000-0000-0000-000000000016',
  '2026-09-05T12:00:00Z',
  'Email',
  'Outbound',
  'Provided guidelines for multi-agent framework demos at Landmark Hall 2.',
  'Amina Bello'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000016',
  '2026-Q4',
  72,
  1450,
  2,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000017',
  'Techfeast Community',
  'Creative Tech',
  'https://techfeast.ng',
  'High-energy developer and creator festival celebrating open-source, indie hackers, and creative engineering.',
  'Tier 3',
  'Contacted',
  'Damilola Yusuf',
  'Finalise open-air pavilion layout at Muri Okunola Park',
  '2026-11-02T10:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000018',
  '00000000-0000-0000-0000-000000000017',
  'Bukola Lawal',
  'Lead Organiser',
  'bukola@techfeast.ng',
  '+234 814 119 8832',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000018',
  '00000000-0000-0000-0000-000000000017',
  '2026-09-09T16:00:00Z',
  'In-Person',
  'Outbound',
  'Reviewed park permits and acoustic equipment zoning.',
  'Damilola Yusuf'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000017',
  '2026-Q4',
  68,
  1950,
  2,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000018',
  'Global AI Consortium & Nigerian AI Academic Forum',
  'Artificial Intelligence',
  'https://7aiconferences.ng',
  'International academic and industrial consortium orchestrating the 7 simultaneous international AI conferences in Lagos.',
  'Tier 1',
  'Champion',
  'Tolu Adebayo',
  'Coordinate 7 simultaneous track program chairs across Eko Convention Centre',
  '2026-11-10T10:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000019',
  '00000000-0000-0000-0000-000000000018',
  'Dr. Kelechi Nwosu',
  'Steering Committee General Chair',
  'k.nwosu@7aiconferences.ng',
  '+234 802 334 1109',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000019',
  '00000000-0000-0000-0000-000000000018',
  '2026-09-18T10:00:00Z',
  'Call',
  'Outbound',
  'Aligned on international paper reviewers and keynote video links.',
  'Tolu Adebayo'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000018',
  '2026-Q4',
  97,
  7800,
  11,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;

INSERT INTO organisations (id, name, sector, website, description, tier, stage, owner, next_action, next_action_at, status, inactive_reason)
VALUES (
  '00000000-0000-0000-0000-000000000019',
  'Build Nigeria Initiative & Hardware Guild',
  'Artificial Intelligence',
  'https://buildnigeria.ng',
  'Empowering Nigeria’s physical hardware makers, embedded edge ML engineers, and robotics prototypers.',
  'Tier 1',
  'Partnered',
  'Damilola Yusuf',
  'Finalise high-voltage safety and demo bay allocations for hardware finalists at Zone Tech Park',
  '2026-11-15T11:00:00Z',
  'active',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  updated_at = NOW();

INSERT INTO contacts (id, organisation_id, name, title, email, phone, is_primary)
VALUES (
  '00000000-0000-0000-0001-000000000020',
  '00000000-0000-0000-0000-000000000019',
  'Engr. Yemi Williams',
  'Guild Lead & Chief Judge',
  'yemi@buildnigeria.ng',
  '+234 802 441 5590',
  TRUE
) ON CONFLICT (id) DO NOTHING;
INSERT INTO interactions (id, organisation_id, date, channel, direction, summary, logged_by)
VALUES (
  '00000000-0000-0000-0002-000000000020',
  '00000000-0000-0000-0000-000000000019',
  '2026-09-16T14:00:00Z',
  'In-Person',
  'Outbound',
  'Inspected sensor testing bays and robotics runway at Zone Tech Park.',
  'Damilola Yusuf'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO partner_kpis (organisation_id, period, period_score, visits, contributions, last_scored_at)
VALUES (
  '00000000-0000-0000-0000-000000000019',
  '2026-Q4',
  92,
  4900,
  8,
  '2026-09-01T00:00:00Z'
) ON CONFLICT (organisation_id, period) DO UPDATE SET
  period_score = EXCLUDED.period_score,
  visits = EXCLUDED.visits,
  contributions = EXCLUDED.contributions;


-- 2. Seed Events (40 Nigerian AI and Tech Events)
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000001',
  'nigeria-fintech-week-2026',
  'Nigeria Fintech Week 2026',
  'Nigeria''s flagship financial technology convening uniting regulators, payment rails architects, neobank founders, and AI fraud prevention specialists across multi-city nodes in Lagos, Abuja, and Port Harcourt.',
  '2026-09-22T09:00:00Z',
  '2026-09-23T17:30:00Z',
  'Lagos',
  'Landmark Centre, Victoria Island, Lagos (with hybrid hubs in Abuja & Port Harcourt)',
  'Fintech Association of Nigeria (FintechNGR)',
  '00000000-0000-0000-0000-000000000005',
  'Conference',
  'Hybrid',
  'Free',
  NULL,
  'https://nigeriafintechweek.org',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000002',
  'ai-automation-masterclass-lagos-2026',
  'AI & Automation Masterclass Lagos',
  'Intensive practitioner masterclass focusing on hands-on enterprise automation workflows, autonomous LLM agents, robotic process automation (RPA), and localized prompt architectures for operational efficiency.',
  '2026-09-24T10:00:00Z',
  '2026-09-24T16:00:00Z',
  'Lagos',
  'Zone Tech Park, Plot 9 Gbagada Industrial Scheme, Lagos',
  'AI & Automation Guild Nigeria',
  '00000000-0000-0000-0000-000000000006',
  'Workshop',
  'In-Person',
  'Paid',
  '₦15,000',
  'https://aiautomation.ng/masterclass',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000003',
  'gritinai-connect-benin-2026',
  'GritinAI Connect: Practical AI Adoption',
  'Major South-South AI convening in Benin City dedicated to practical, production-ready AI adoption. Features live technical case studies on deploying computer vision in local agro-processing, offline generative AI for education, and fostering regional AI talent pipelines.',
  '2026-09-26T09:30:00Z',
  '2026-09-26T17:00:00Z',
  'Benin City',
  'Victor Uwaifo Creative Hub, Airport Road, Benin City, Edo State',
  'GritinAI',
  '00000000-0000-0000-0000-000000000003',
  'Conference',
  'In-Person',
  'Free',
  NULL,
  'https://gritinai.com/connect-benin',
  TRUE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000004',
  'sme-africa-summit-lagos-2026',
  'SME Africa Summit 2026',
  'Equipping micro, small, and medium businesses across Nigeria with actionable AI tools, automated bookkeeping solutions, digital storefront algorithms, and modern credit access pipelines.',
  '2026-10-03T09:00:00Z',
  '2026-10-03T17:00:00Z',
  'Lagos',
  'The Civic Centre, Ozumba Mbadiwe Avenue, Victoria Island, Lagos',
  'SME Africa Network',
  '00000000-0000-0000-0000-000000000007',
  'Conference',
  'In-Person',
  'Free',
  NULL,
  'https://smeafricasummit.org',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000005',
  'tech-fellowship-data-science-ai-abuja-2026',
  'Tech Fellowship: Data Science & AI Showcase',
  'National fellows and applied researchers present computational models trained on sovereign Nigerian datasets, spanning public health diagnostics, agricultural yield forecasting, and civic data intelligence.',
  '2026-10-10T10:00:00Z',
  '2026-10-10T16:30:00Z',
  'Abuja',
  'National Centre for Artificial Intelligence and Robotics (NCAIR), Wuye District, Abuja',
  'National Centre for AI & Robotics (NCAIR)',
  '00000000-0000-0000-0000-000000000008',
  'Workshop',
  'Hybrid',
  'Free',
  NULL,
  'https://ncair.nitda.gov.ng/fellowship-showcase',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000006',
  'texcellence-conference-lagos-2026',
  'TeXcellence Conference 2026',
  'High-level technology leadership convention uniting enterprise banking CIOs, telecommunications leaders, cloud infrastructure executives, and sovereign AI researchers steering digital Africa.',
  '2026-10-13T09:00:00Z',
  '2026-10-13T17:00:00Z',
  'Lagos',
  'Balmoral Convention Centre, Federal Palace Hotel, Victoria Island, Lagos',
  'CWG Plc & TeXcellence Council',
  '00000000-0000-0000-0000-000000000009',
  'Conference',
  'In-Person',
  'Paid',
  '₦25,000',
  'https://texcellenceconference.com',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000007',
  'inspire-africa-conference-lagos-2026',
  'Inspire Africa Conference 2026',
  'Inspiring the next generation of African builders, venture operators, and deep tech founders with keynotes on artificial intelligence, sovereign capital, and scalable digital infrastructure.',
  '2026-10-14T09:00:00Z',
  '2026-10-14T18:00:00Z',
  'Lagos',
  'Grand Ballroom, Eko Hotel & Suites, Victoria Island, Lagos',
  'Inspire Africa Initiative',
  '00000000-0000-0000-0000-000000000010',
  'Conference',
  'In-Person',
  'Paid',
  '₦20,000',
  'https://inspireafricaconference.org',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000008',
  'arewa-tech-fest-lagos-2026',
  'Arewa Tech Fest 2026',
  'Connecting Northern Nigerian developers, entrepreneurs, and researchers with the broader coastal ecosystem. Showcases Hausa natural language processing, rural connectivity mesh, and tech talent bridges.',
  '2026-10-21T09:00:00Z',
  '2026-10-22T17:00:00Z',
  'Lagos',
  'Zone Tech Park, Plot 9 Gbagada Industrial Scheme, Lagos',
  'Arewa Tech Community',
  '00000000-0000-0000-0000-000000000011',
  'Conference',
  'Hybrid',
  'Free',
  NULL,
  'https://arewatechfest.com',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000009',
  'tech-for-real-estate-port-harcourt-2026',
  'Tech for Real Estate Summit: PropTech & Smart Cities',
  'Curated for builders and tech leaders in Port Harcourt and the Niger Delta. Covers AI property valuation engines, drone land surveying, smart IoT estate energy monitoring, and title tokenisation on digital ledgers.',
  '2026-10-31T10:00:00Z',
  '2026-10-31T16:30:00Z',
  'Port Harcourt',
  'Golden Tulip Hotel, 1C Evo Road, GRA Phase 2, Port Harcourt, Rivers State',
  'Rivers Tech Network & Niger Delta PropTech Guild',
  '00000000-0000-0000-0000-000000000012',
  'Conference',
  'In-Person',
  'Paid',
  '₦10,000',
  'https://proptechph.ng',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000010',
  'gamma-tech-summit-lagos-2026',
  'GAMMA Tech Summit 2026',
  'Premier assembly of software engineers, cloud architects, machine learning developers, and product leads exploring next-generation scalable platforms and API-first architectures.',
  '2026-11-05T09:00:00Z',
  '2026-11-05T17:00:00Z',
  'Lagos',
  'The Zone Centre, Plot 9 Gbagada Industrial Scheme, Lagos',
  'GAMMA Technology Group',
  '00000000-0000-0000-0000-000000000013',
  'Conference',
  'In-Person',
  'Free',
  NULL,
  'https://gammatechsummit.com',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000011',
  'benin-tech-fest-2026',
  'Benin Tech Fest 2.0',
  'The second edition of Edo State’s premier tech festival celebrating indigenous software products, AI hackathons, hardware prototypes, and the expansion of the Midwestern innovation corridor.',
  '2026-11-05T09:30:00Z',
  '2026-11-05T18:00:00Z',
  'Benin City',
  'Edo Innovates Hub / Sir Victor Uwaifo Soundstage, Benin City, Edo State',
  'Edo Innovates & Benin Tech Community',
  '00000000-0000-0000-0000-000000000014',
  'Conference',
  'In-Person',
  'Free',
  NULL,
  'https://benintechfest.ng',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000012',
  'ieee-nigercon-unilag-2026',
  'IEEE NIGERCON 2026 (Heavy AI & Data Track)',
  'The premier IEEE Nigeria International Conference featuring peer-reviewed research papers, IEEE Xplore indexing, and a heavy dedicated track on Artificial Intelligence, Deep Learning, Signal Processing, and Big Data.',
  '2026-11-05T08:30:00Z',
  '2026-11-06T17:30:00Z',
  'Lagos',
  'Main Auditorium & Faculty of Engineering, University of Lagos (UNILAG), Akoka, Lagos',
  'IEEE Nigeria Section & UNILAG',
  '00000000-0000-0000-0000-000000000004',
  'Conference',
  'Hybrid',
  'Paid',
  '₦15,000',
  'https://ieeenigercon.org',
  TRUE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000013',
  'nigeria-blockchain-and-ai-week-2026',
  'Nigeria Blockchain & AI Week 2026',
  'The biggest AI event left in 2026. Theme: Agenda 2036 - AI, Blockchain & Stablecoins. Features 100+ high-profile speakers, federal policymakers, institutional investors, and frontier AI researchers dissecting sovereign intelligence, decentralized compute networks, and next-decade economic frameworks.',
  '2026-11-06T09:00:00Z',
  '2026-11-07T18:00:00Z',
  'Lagos',
  'Landmark Event Centre, Water Corporation Drive, Victoria Island, Lagos',
  'Blockchain & AI Ecosystem Association',
  '00000000-0000-0000-0000-000000000001',
  'Conference',
  'Hybrid',
  'Free',
  NULL,
  'https://nigeriablockchainaiweek.ng',
  TRUE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000014',
  'insurance-meets-tech-lagos-2026',
  'Insurance Meets Tech 2026 (IMT 4.0)',
  'Where traditional insurance underwriting converges with AI risk analytics, IoT telematics, algorithmic claim verification, and climate insurance models tailored for the West African economy.',
  '2026-11-20T09:00:00Z',
  '2026-11-20T17:00:00Z',
  'Lagos',
  'The Civic Centre, Ozumba Mbadiwe Avenue, Victoria Island, Lagos',
  'IMT Advisory Council',
  '00000000-0000-0000-0000-000000000015',
  'Conference',
  'In-Person',
  'Paid',
  '₦30,000',
  'https://insurancemeetstech.com',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000015',
  '9ja-automation-fest-lagos-2026',
  '9ja Automation Fest 2026',
  'Celebrating robotic process automation (RPA), multi-agent swarms, industrial robotics, and no-code business process pipelines driving unprecedented productivity gains across Nigerian commercial sectors.',
  '2026-11-21T10:00:00Z',
  '2026-11-21T17:00:00Z',
  'Lagos',
  'Landmark Centre (Hall 2), Water Corporation Drive, Victoria Island, Lagos',
  'Automation Nigeria Builders Guild',
  '00000000-0000-0000-0000-000000000016',
  'Conference',
  'In-Person',
  'Free',
  NULL,
  'https://9jaautomationfest.ng',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000016',
  'techfeast-lagos-2026',
  'Techfeast 2026 Lagos',
  'Energetic outdoor technology festival and developer banquet uniting software engineers, product designers, game builders, and AI enthusiasts for interactive showcases, live demos, and builder camaraderie.',
  '2026-11-28T10:00:00Z',
  '2026-11-28T18:00:00Z',
  'Lagos',
  'Muri Okunola Park & Pavilions, Victoria Island, Lagos',
  'Techfeast Community',
  '00000000-0000-0000-0000-000000000017',
  'Meetup',
  'In-Person',
  'Free',
  NULL,
  'https://techfeast.ng',
  FALSE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000017',
  'the-ai-forum-nigeria-2026',
  'The AI Forum Nigeria 2026',
  'Dedicated national AI conference convened at Lagos Oriental Hotel. Uniting AI research fellows, sovereign compute architects, corporate executives, and regulatory bodies mapping national artificial intelligence roadmaps.',
  '2026-12-08T09:00:00Z',
  '2026-12-08T17:30:00Z',
  'Lagos',
  'Lagos Oriental Hotel, Grand Ballroom, 3 Lekki - Epe Expressway, Victoria Island, Lagos',
  'AI Forum Nigeria & National AI Alliance',
  '00000000-0000-0000-0000-000000000002',
  'Conference',
  'In-Person',
  'Paid',
  '₦20,000',
  'https://aiforum.ng',
  TRUE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000018',
  '7-international-ai-conferences-lagos-2026',
  '7 International AI Conferences Lagos 2026',
  'Unprecedented single-day simultaneous mega-summit co-locating 7 international AI tracks: Computer Vision & Robotics, Natural Language Processing for African Languages, AI in Clinical Healthcare, Generative Intelligence, AI Governance & Ethics, Edge & Embedded Machine Learning, and AI in Financial Systems.',
  '2026-12-13T08:30:00Z',
  '2026-12-13T19:00:00Z',
  'Lagos',
  'Eko Convention Centre & Virtual Halls, Eko Hotel & Suites, Victoria Island, Lagos',
  'Global AI Consortium & Nigerian AI Academic Forum',
  '00000000-0000-0000-0000-000000000018',
  'Conference',
  'Hybrid',
  'Free',
  NULL,
  'https://7aiconferences.ng',
  TRUE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
INSERT INTO events (id, slug, title, description, start_date, end_date, city, venue, organiser, organisation_id, category, format, price_type, price, registration_url, featured, status)
VALUES (
  '00000000-0000-0000-0003-000000000019',
  'build-nigeria-final-hardware-ai-products-2026',
  'Build Nigeria Final: Hardware & AI Products',
  'The grand national finale and demo day where Nigeria’s top hardware engineers and physical AI makers unveil real embedded edge sensors, agricultural drone telemetry systems, robotic prototypes, and sovereign compute hardware to angel investors and industry leaders.',
  '2026-12-19T10:00:00Z',
  '2026-12-19T18:00:00Z',
  'Lagos',
  'Zone Tech Park, Plot 9 Gbagada Industrial Scheme, Lagos',
  'Build Nigeria Initiative & Hardware Guild',
  '00000000-0000-0000-0000-000000000019',
  'Demo Day',
  'In-Person',
  'Free',
  NULL,
  'https://buildnigeria.ng/final',
  TRUE,
  'published'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  start_date = EXCLUDED.start_date,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status;
