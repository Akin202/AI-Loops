import type { Request, Response } from 'express';
import { loopsConfig } from '../config/loops.config.ts';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wraps text into lines that fit within maxCharsPerLine.
 */
function wrapText(text: string, maxCharsPerLine: number = 38): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.slice(0, 3); // Max 3 lines
}

function getQueryParams(req: any): Record<string, string> {
  if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0) {
    return req.query as Record<string, string>;
  }
  try {
    const urlObj = new URL(req.url || '', 'http://localhost');
    return Object.fromEntries(urlObj.searchParams);
  } catch {
    return {};
  }
}

/**
 * GET /api/og
 * Generates dynamic 1200x630 Open Graph card in the AI Loops dark aesthetic.
 * Ultra-lightweight (< 20KB, well under WhatsApp's 300KB ceiling).
 */
export function handleOgImage(req: Request, res: Response) {
  const query = getQueryParams(req);
  const title = query.title || loopsConfig.name;
  const category = query.category || 'Convening';
  const date = query.date || 'Upcoming Tech Convening';
  const location = query.location || 'Lagos, Nigeria';
  const organiser = query.organiser || loopsConfig.org.name;

  const lines = wrapText(title, 36);

  const titleSvgSpans = lines
    .map(
      (line, idx) =>
        `<tspan x="80" dy="${idx === 0 ? 0 : 54}">${escapeXml(line)}</tspan>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A0A0A" />
      <stop offset="100%" stop-color="#141414" />
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#262626" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#0A0A0A" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#glow)" />

  <!-- Continuous tangled line-art motif background -->
  <g opacity="0.08" stroke="#FFFFFF" stroke-width="2" fill="none">
    <path d="M-50,300 C200,100 350,550 600,300 C850,50 1000,500 1250,300" />
    <path d="M-50,350 C220,150 370,600 620,350 C870,100 1020,550 1250,350" />
    <path d="M-50,400 C240,200 390,650 640,400 C890,150 1040,600 1250,400" />
    <circle cx="950" cy="180" r="140" stroke="#FFFFFF" stroke-width="1.5" />
    <circle cx="950" cy="180" r="90" stroke="#FFFFFF" stroke-width="1" />
  </g>

  <!-- Outer frame border -->
  <rect x="30" y="30" width="1140" height="570" fill="none" stroke="#262626" stroke-width="1" />

  <!-- Header Wordmark & Strip -->
  <g transform="translate(80, 85)">
    <!-- Brand Wordmark -->
    <text font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" letter-spacing="4">
      ${escapeXml(loopsConfig.name.toUpperCase())}
    </text>
    
    <!-- Sub-label -->
    <text x="175" y="-1" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" fill="#737373" letter-spacing="2">
      ${escapeXml(loopsConfig.tagline.toUpperCase())}
    </text>

    <!-- Meta Strip -->
    <text x="0" y="32" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="9" fill="#525252" letter-spacing="3">
      AUTONOMOUS · ITERATIVE · LEARNING · OPTIMIZING · PERPETUAL LOOPS
    </text>
  </g>

  <!-- Category Badge -->
  <g transform="translate(80, 200)">
    <rect width="${Math.max(120, category.length * 11 + 28)}" height="28" rx="4" fill="#1C1917" stroke="#44403C" stroke-width="1" />
    <text x="14" y="18" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11" font-weight="600" fill="#E7E5E4" letter-spacing="1">
      ${escapeXml(category.toUpperCase())}
    </text>
  </g>

  <!-- Event Title -->
  <text x="80" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">
    ${titleSvgSpans}
  </text>

  <!-- Bottom Metadata Section -->
  <g transform="translate(80, 480)">
    <!-- Date & Time -->
    <g>
      <text font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10" fill="#737373" letter-spacing="1.5">DATE &amp; TIME (WAT)</text>
      <text y="24" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#F5F5F4">
        ${escapeXml(date)}
      </text>
    </g>

    <!-- Location & City -->
    <g transform="translate(360, 0)">
      <text font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10" fill="#737373" letter-spacing="1.5">LOCATION</text>
      <text y="24" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#F5F5F4">
        ${escapeXml(location.length > 36 ? location.slice(0, 33) + '…' : location)}
      </text>
    </g>

    <!-- Organiser / Host -->
    <g transform="translate(740, 0)">
      <text font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10" fill="#737373" letter-spacing="1.5">ORGANISER</text>
      <text y="24" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#F5F5F4">
        ${escapeXml(organiser.length > 28 ? organiser.slice(0, 25) + '…' : organiser)}
      </text>
    </g>
  </g>

  <!-- Bottom Strip Signature -->
  <g transform="translate(80, 560)">
    <line x1="0" y1="0" x2="1040" y2="0" stroke="#262626" stroke-width="1" />
    <text x="0" y="24" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10" fill="#525252" letter-spacing="2">
      ${escapeXml(loopsConfig.org.name.toUpperCase())} · NATIONAL CONVENING REGISTRY
    </text>
    <text x="1040" y="24" text-anchor="end" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10" fill="#525252" letter-spacing="2">
      AI-LOOPS.NG
    </text>
  </g>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  if (typeof (res as any).send === 'function') {
    (res as any).send(svg);
  } else {
    res.end(svg);
  }
}
