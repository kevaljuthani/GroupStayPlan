import type { ParsedStay } from '@/lib/chat-parser';

type LlmStay = {
  name?: string;
  address?: string;
  mapsLink?: string;
  rating?: number;
  pricePerNight?: number;
  foodIncluded?: boolean;
  images?: string[];
  recommendedBy?: string[];
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  category?: string;
  sourceMessage?: string;
};

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.1';

function stripCodeFence(content: string): string {
  return content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

function sanitizeEntries(entries: LlmStay[]): ParsedStay[] {
  return entries
    .map((entry) => {
      const name = entry.name?.trim();
      const address = entry.address?.trim();
      if (!name || !address) {
        return null;
      }

      const categoryNote = entry.category?.trim() ? `Category: ${entry.category.trim()}` : '';
      const notes = [categoryNote, entry.notes?.trim()].filter(Boolean).join('\n');

      return {
        name,
        address,
        mapsLink: entry.mapsLink?.trim(),
        rating: typeof entry.rating === 'number' ? entry.rating : undefined,
        pricePerNight: typeof entry.pricePerNight === 'number' ? entry.pricePerNight : undefined,
        foodIncluded: Boolean(entry.foodIncluded),
        images: Array.isArray(entry.images) ? entry.images.filter(Boolean) : [],
        recommendedBy: Array.isArray(entry.recommendedBy) ? entry.recommendedBy.filter(Boolean) : [],
        contactName: entry.contactName?.trim(),
        contactPhone: entry.contactPhone?.trim(),
        notes: notes || undefined,
        sourceMessage: entry.sourceMessage?.trim() || ''
      } satisfies ParsedStay;
    })
    .filter((entry): entry is ParsedStay => Boolean(entry));
}

export async function extractStaysUsingOllama(chatText: string): Promise<ParsedStay[]> {
  const prompt = `Extract stay recommendations from this WhatsApp chat text.

Return JSON only with this exact shape:
{
  "stays": [
    {
      "name": "string",
      "address": "string",
      "mapsLink": "string or empty",
      "rating": "number or null",
      "pricePerNight": "number or null",
      "foodIncluded": "boolean",
      "images": ["string"],
      "recommendedBy": ["string"],
      "contactName": "string or empty",
      "contactPhone": "string or empty",
      "category": "one short label: budget/luxury/family/adventure/other",
      "notes": "short summary",
      "sourceMessage": "original or summarized relevant line"
    }
  ]
}

Rules:
- Include only stay/property/accommodation suggestions.
- Infer missing values cautiously; use null/empty when unknown.
- pricePerNight must be integer in INR if obvious.
- Do not include any text outside JSON.

Chat:
${chatText}`;

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: 'json',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { message?: { content?: string } };
  const content = payload.message?.content;

  if (!content) {
    return [];
  }

  const jsonContent = stripCodeFence(content);
  const parsed = JSON.parse(jsonContent) as { stays?: LlmStay[] };

  if (!Array.isArray(parsed.stays)) {
    return [];
  }

  return sanitizeEntries(parsed.stays);
}
