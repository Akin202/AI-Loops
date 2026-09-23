import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { extractEventFromInput } from './lib/ai/extract-event.ts';
import {
  handleExportOrganisations,
  handleExportEvents,
  handleExportQuarterlySummary,
} from './server/export.ts';
import { handleOgImage } from './server/og-image.ts';
import { mockEvents } from './lib/mock-data.ts';
import { loopsConfig } from './config/loops.config.ts';

function apiDevMiddleware(): Plugin {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/extract-event', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const parsed = JSON.parse(bodyStr || '{}');
            const { rawInput } = parsed;

            if (!rawInput || typeof rawInput !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'rawInput is required' }));
              return;
            }

            const result = await extractEventFromInput(rawInput);
            res.statusCode = result.success ? 200 : 422;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || 'Server extraction error' }));
          }
        });
      });

      server.middlewares.use('/api/events/submit', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', () => {
          try {
            const submission = JSON.parse(bodyStr || '{}');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, id: `sub-${Date.now()}` }));
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });

      server.middlewares.use('/api/export/organisations', (req, res) => {
        handleExportOrganisations(req as any, res as any);
      });

      server.middlewares.use('/api/export/events', (req, res) => {
        handleExportEvents(req as any, res as any);
      });

      server.middlewares.use('/api/export/quarterly-summary', (req, res) => {
        handleExportQuarterlySummary(req as any, res as any);
      });

      server.middlewares.use('/api/og', (req, res) => {
        handleOgImage(req as any, res as any);
      });
    },
    transformIndexHtml(html, ctx) {
      const ua = ctx.req?.headers['user-agent'] || '';
      const isCrawler = /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot/i.test(ua);
      if (!isCrawler) return html;

      const url = ctx.req?.url || '';
      if (url.startsWith('/events/')) {
        const slug = url.replace('/events/', '').split('?')[0].split('#')[0];
        const event = mockEvents.find((e) => e.slug === slug);
        if (event) {
          const host = `http://${ctx.req?.headers.host || 'localhost:3001'}`;
          const ogImageUrl = `${host}/api/og?title=${encodeURIComponent(event.title)}&category=${encodeURIComponent(event.category || 'Convening')}&date=${encodeURIComponent(event.startDate || '')}&location=${encodeURIComponent(event.city || '')}&organiser=${encodeURIComponent(event.organiser || '')}`;
          const title = `${event.title} | ${loopsConfig.name}`;
          const desc = `${event.category} in ${event.city} - ${event.description.slice(0, 160)}`;
          return html
            .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
            .replace(
              '</head>',
              `  <meta property="og:title" content="${title}" />\n  <meta property="og:description" content="${desc}" />\n  <meta property="og:image" content="${ogImageUrl}" />\n  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="630" />\n  <meta name="twitter:card" content="summary_large_image" />\n  <meta name="twitter:image" content="${ogImageUrl}" />\n</head>`
            );
        }
      }
      return html;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevMiddleware()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      port: Number(process.env.PORT) || 3001,
      host: '0.0.0.0',
    },
  };
});
