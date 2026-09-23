import type { Request, Response } from 'express';
import { extractEventFromInput } from '../lib/ai/extract-event.ts';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase.ts';

/**
 * Handle POST /api/extract-event
 */
export async function handleExtractEvent(req: Request, res: Response) {
  try {
    const { rawInput } = req.body;
    if (!rawInput || typeof rawInput !== 'string') {
      return res.status(400).json({ success: false, error: 'rawInput string is required' });
    }

    const result = await extractEventFromInput(rawInput);
    return res.status(result.success ? 200 : 422).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Internal extraction failure' });
  }
}

/**
 * Handle POST /api/events/submit (Public event submission)
 */
export async function handleSubmitEvent(req: Request, res: Response) {
  try {
    const submission = req.body;
    if (!submission || !submission.title || !submission.date) {
      return res.status(400).json({ success: false, error: 'Title and Date are required' });
    }

    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('event_submissions')
        .insert({
          raw_input: `Public submission: ${submission.title} (${submission.date})`,
          extracted_data: submission,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      return res.json({ success: true, id: data.id });
    }

    // Fallback when Supabase is not yet connected
    const fallbackId = `sub-${Date.now()}`;
    return res.json({ success: true, id: fallbackId });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
