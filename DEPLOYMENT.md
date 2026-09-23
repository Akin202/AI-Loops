# AI Loops: Production Deployment & Launch Guide

This guide details deployment steps, environment configuration, database boundaries, and crawler link preview verification for AI Loops and Loops Console.

---

## 1. Environment Variables

Configure the following environment variables in your hosting provider (e.g. Vercel, Railway, or AWS):

| Variable | Required | Scope | Purpose |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Client & Server | Supabase project endpoint URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Client & Server | Public anonymous API key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server only | Administrative key for bypass tasks. Never expose to client |
| `GEMINI_API_KEY` | Yes | Server only | Google AI Studio key for Gemini Flash event ingest |
| `PORT` | Optional | Server | HTTP port (default: 3001) |

> **Security Check**:
> Run `grep -rn "SERVICE_ROLE" dist/` after any production build. It must return zero results. Only anon keys may be included in the browser bundle.

---

## 2. Database & RLS Verification

Run the versioned migration files located in `/supabase/migrations/`:
1. `20260923000000_initial_schema.sql` (Tables, checks, indexes, audit triggers)
2. `20260923000001_rls_policies.sql` (Row-Level Security boundary rules)
3. `20260923000002_seed_data.sql` (Initial Nigerian convenings and partner roster)

To verify RLS security in production, run:
```bash
npx tsx scripts/verify-rls.ts
```
Expected output:
- Anonymous users cannot read organisations or contacts.
- Anonymous users can only query published events.
- Anonymous users cannot read draft or archived events.

---

## 3. WhatsApp & Crawler Link Preview Testing

WhatsApp, X (Twitter), Facebook, and LinkedIn crawlers ignore client-side JavaScript and rely entirely on server-rendered Open Graph tags and images.

### Dynamic Open Graph Endpoint
- Route: `/api/og`
- Format: Scalable SVG rendered at 1200x630
- Size constraint: WhatsApp silently drops previews larger than 300KB. AI Loops generated cards measure **under 5KB**, ensuring reliable thumbnail generation across all networks.

### Verification Command
Run this curl command against your production domain to simulate the WhatsApp crawler bot:
```bash
curl -s -H "User-Agent: WhatsApp/2.21.12.21 A" "https://your-domain.ng/events/nigeria-fintech-week-2026" | grep -E "og:title|og:image"
```
Verify that the output contains:
1. `<meta property="og:title" content="..." />`
2. `<meta property="og:image" content="https://your-domain.ng/api/og?title=..." />`
3. `<meta name="twitter:card" content="summary_large_image" />`

---

## 4. Deploying to Vercel

1. Push your repository to GitHub or GitLab.
2. Import the project in Vercel.
3. Framework Preset: Vite.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add the environment variables listed in Section 1.
7. Deploy.

---

## 5. Multi-UniPod Rebranding & Portability

To deploy a new instance for another African UniPod hub (e.g. Makerere UniPod in Uganda, Rwanda UniPod in Kigali, or Nairobi UniPod in Kenya):

**Estimated time: 20 minutes**

### File to update:
Edit `config/loops.config.ts`:
- Change `name` to the local registry name (e.g. `UG Loops`).
- Update `org.name`, `org.shortName`, and `org.subLabel`.
- Adjust `country`, `currency`, `currencySymbol`, and `timezone`.
- Update `cities` with regional hub cities.
- Update `contactEmail` and `supportUrl`.

All navigation, editorial headers, and crawler preview cards will instantly adopt the new hub configuration.
