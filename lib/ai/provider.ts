import { GoogleGenAI } from '@google/genai';

/**
 * Thin provider interface for Google Gemini.
 * Model is configurable per task.
 */
export async function generateContent(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    responseMimeType?: string;
    responseSchema?: any;
    systemInstruction?: string;
  }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = options?.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const config: any = {
    temperature: options?.temperature ?? 0.1,
  };

  if (options?.responseMimeType) {
    config.responseMimeType = options.responseMimeType;
  }

  if (options?.responseSchema) {
    config.responseSchema = options.responseSchema;
  }

  if (options?.systemInstruction) {
    config.systemInstruction = options.systemInstruction;
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config,
  });

  const text = response.text;
  if (!text) {
    throw new Error('Empty response received from Gemini model');
  }

  return text;
}
