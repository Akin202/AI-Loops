import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { handleExtractEvent, handleSubmitEvent } from './server/api.ts';
import {
  handleExportOrganisations,
  handleExportEvents,
  handleExportQuarterlySummary,
} from './server/export.ts';
import { handleOgImage } from './server/og-image.ts';
import { getSupabase, isSupabaseConfigured } from './lib/supabase.ts';
import { mockEvents } from './lib/mock-data.ts';
import { loopsConfig } from './config/loops.config.ts';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// API Routes
app.post('/api/extract-event', handleExtractEvent);
app.post('/api/events/submit', handleSubmitEvent);
app.get('/api/export/organisations', handleExportOrganisations);
app.get('/api/export/events', handleExportEvents);
app.get('/api/export/quarterly-summary', handleExportQuarterlySummary);
app.get('/api/og', handleOgImage);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    supabaseConnected: isSupabaseConfigured,
    timestamp: new Date().toISOString(),
  });
});

// Crawler detection for WhatsApp, X (Twitter), Facebook, LinkedIn, Slack
function isSocialBot(ua: string = ''): boolean {
  return /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot/i.test(ua);
}

// Serve dist assets
const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');

// SSR Open Graph tags for event detail pages when requested by crawlers
app.get('/events/:slug', async (req: Request, res: Response) => {
  const userAgent = req.headers['user-agent'] || '';
  const slug = req.params.slug;

  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Application not built. Please run npm run build.');
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  // If not a social crawler, serve standard SPA HTML
  if (!isSocialBot(userAgent)) {
    return res.send(html);
  }

  // Find event
  let event: any = null;
  if (isSupabaseConfigured) {
    try {
      const { data } = await getSupabase()
        .from('events')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (data) {
        event = {
          title: data.title,
          description: data.description,
          city: data.city,
          startDate: data.start_date,
          category: data.category,
        };
      }
    } catch {
      // fallback
    }
  }

  if (!event) {
    event = mockEvents.find((e) => e.slug === slug);
  }

  if (event) {
    const title = `${event.title} | ${loopsConfig.name}`;
    const desc = `${event.category} in ${event.city} - ${event.description.slice(0, 160)}`;
    const host = `${req.protocol}://${req.get('host')}`;
    const ogImageUrl = `${host}/api/og?title=${encodeURIComponent(event.title)}&category=${encodeURIComponent(event.category || 'Convening')}&date=${encodeURIComponent(event.startDate || '')}&location=${encodeURIComponent(event.city || '')}&organiser=${encodeURIComponent(event.organiser || '')}`;
    const ogTags = `
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${host}/events/${slug}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    `;
    html = html.replace(/<title>[\s\S]*?<\/title>/i, ogTags);
  }

  return res.send(html);
});

// Static assets
app.use(express.static(distDir));

// Fallback to index.html for client-side routing
app.get('*', (req: Request, res: Response) => {
  if (fs.existsSync(indexPath)) {
    const userAgent = req.headers['user-agent'] || '';
    let html = fs.readFileSync(indexPath, 'utf8');
    if (isSocialBot(userAgent)) {
      const host = `${req.protocol}://${req.get('host')}`;
      const ogImageUrl = `${host}/api/og?title=${encodeURIComponent('National Nigerian AI & Tech Convenings')}&category=Registry`;
      const ogTags = `
    <title>${loopsConfig.name} - ${loopsConfig.tagline}</title>
    <meta name="description" content="${loopsConfig.description}" />
    <meta property="og:title" content="${loopsConfig.name} - ${loopsConfig.tagline}" />
    <meta property="og:description" content="${loopsConfig.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${host}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${loopsConfig.name}" />
    <meta name="twitter:description" content="${loopsConfig.description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
      `;
      html = html.replace(/<title>[\s\S]*?<\/title>/i, ogTags);
      return res.send(html);
    }
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Run npm run build.');
  }
});

app.listen(PORT, () => {
  console.log(`Loops server listening on port ${PORT}`);
});
