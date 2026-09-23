import { z } from 'zod';
import { generateContent } from './provider.ts';
import type { ExtractedEventData, EventCity, EventCategory, EventFormat, EventPriceType, ConfidenceLevel } from '../../types/index.ts';

const cities: [EventCity, ...EventCity[]] = ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Benin City', 'Online'];
const categories: [EventCategory, ...EventCategory[]] = ['Hackathon', 'Conference', 'Meetup', 'Workshop', 'Demo Day'];
const formats: [EventFormat, ...EventFormat[]] = ['In-Person', 'Virtual', 'Hybrid'];
const priceTypes: [EventPriceType, ...EventPriceType[]] = ['Free', 'Paid'];
const confidenceLevels: [ConfidenceLevel, ...ConfidenceLevel[]] = ['green', 'amber', 'grey'];

const ExtractedEventSchema = z.object({
  title: z.string().default('Untitled Convening'),
  startDate: z.string(), // ISO format
  endDate: z.string().optional(),
  city: z.enum(cities).default('Lagos'),
  venue: z.string().default('TBD, Lagos, Nigeria'),
  organiser: z.string().default('Ecosystem Organiser'),
  category: z.enum(categories).default('Meetup'),
  format: z.enum(formats).default('In-Person'),
  priceType: z.enum(priceTypes).default('Free'),
  price: z.string().optional(),
  registrationUrl: z.string().default(''),
  description: z.string().default(''),
  confidences: z.record(z.string(), z.enum(confidenceLevels)).optional(),
});

export type ExtractedResult = 
  | { success: true; data: ExtractedEventData; missingFieldsCount: number; rawInput: string }
  | { success: false; error: string; rawInput: string };

/**
 * Fetch and extract clean text content from a public URL
 */
async function fetchPageText(url: string): Promise<{ text: string; pageTitle?: string; metaDesc?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LoopsBot/1.0; +https://loops.example.org)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Failed to fetch page (HTTP ${res.status})`);
    }

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : undefined;

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) 
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)
      || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const metaDesc = descMatch ? descMatch[1].trim() : undefined;

    // Strip scripts, styles, svg, and tags
    const cleanedText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      text: cleanedText.slice(0, 14000),
      pageTitle,
      metaDesc,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Page request timed out after 8 seconds');
    }
    throw err;
  }
}

/**
 * Extract structured event metadata from URL or raw text using Gemini Flash
 */
export async function extractEventFromInput(rawInput: string): Promise<ExtractedResult> {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { success: false, error: 'Input cannot be empty', rawInput };
  }

  const isUrl = /^https?:\/\//i.test(trimmed);
  let contentToAnalyze = trimmed;
  let sourceUrl = isUrl ? trimmed : '';

  if (isUrl) {
    try {
      const page = await fetchPageText(trimmed);
      contentToAnalyze = `Source URL: ${trimmed}\nPage Title: ${page.pageTitle || ''}\nMeta Description: ${page.metaDesc || ''}\nContent:\n${page.text}`;
    } catch (fetchErr: any) {
      // If fetching fails, we still allow model to try if URL itself contains useful tokens, or return error
      contentToAnalyze = `Source URL: ${trimmed} (Note: Direct page crawl failed: ${fetchErr.message})`;
    }
  }

  // Reference timestamp in West Africa Time (WAT = UTC+1)
  const now = new Date();
  const watOffsetMs = 1 * 60 * 60 * 1000;
  const watNow = new Date(now.getTime() + watOffsetMs);
  const nowIso = watNow.toISOString().replace('Z', '+01:00');

  const systemInstruction = `You are an expert AI curator for AI Loops, Nigeria's premier AI & Tech Convening Registry.
Your task is to accurately extract event details from event announcements, Luma links, Eventbrite pages, Twitter/X posts, and messages.

Today is ${watNow.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (${nowIso} West Africa Time).

GUIDELINES:
1. Target African / Nigerian ecosystem conventions.
2. If city is not explicitly stated but in Nigeria, infer from venue (e.g. Landmark, Civic Centre, Zone Tech Park, UNILAG, VI, Lekki, Yaba => 'Lagos'; Shehu Musa Yar'Adua, Transcorp, Idu => 'Abuja').
3. Permitted cities: 'Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Benin City', 'Online'.
4. Permitted categories: 'Hackathon', 'Conference', 'Meetup', 'Workshop', 'Demo Day'.
5. Permitted formats: 'In-Person', 'Virtual', 'Hybrid'.
6. Permitted priceType: 'Free', 'Paid'.
7. Date & Time: Always return ISO 8601 strings (e.g. "2026-10-15T09:00:00+01:00"). If time is unknown, use 09:00:00. If year is missing, assume 2026.
8. Registration URL: Use the event's ticket or sign-up link. If source was a Luma or Eventbrite link, set registrationUrl to that link.
9. Confidences: For every field (title, startDate, city, venue, organiser, category, format, priceType, registrationUrl, description), output:
   - "green": explicitly confirmed in text.
   - "amber": inferred with good reason.
   - "grey": guessed or missing.

Return ONLY a valid JSON object matching the requested schema. No markdown formatting, no code fences.`;

  const prompt = `Analyze this text and extract the Nigerian tech convening:\n\n${contentToAnalyze}\n\n${sourceUrl ? `Source link: ${sourceUrl}` : ''}`;

  try {
    const rawResponse = await generateContent(prompt, {
      systemInstruction,
      temperature: 0.1,
      responseMimeType: 'application/json',
    });

    // Clean any accidental markdown wrap
    const cleanJson = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Validate with Zod
    const validated = ExtractedEventSchema.parse({
      ...parsed,
      registrationUrl: parsed.registrationUrl || sourceUrl || '',
    });

    // Count missing or grey fields
    let missingCount = 0;
    const confidences = validated.confidences || {};
    const criticalFields = ['startDate', 'venue', 'organiser', 'registrationUrl', 'description'];
    for (const f of criticalFields) {
      if (!validated[f as keyof typeof validated] || confidences[f] === 'grey') {
        missingCount++;
      }
    }

    return {
      success: true,
      data: validated as ExtractedEventData,
      missingFieldsCount: missingCount,
      rawInput,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Extraction failed',
      rawInput,
    };
  }
}
