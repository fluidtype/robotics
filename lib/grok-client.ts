import { z } from 'zod';
import { AI_MODEL } from './ai-config';
import { EnrichedArticleData, RawNewsData } from './types';
import { RetriableError, retry } from './retry';

const DEFAULT_BASE_URL = process.env.XAI_API_BASE_URL ?? 'https://api.x.ai/v1';
const MAX_XAI_RETRIES = Number(process.env.XAI_MAX_RETRIES ?? 2);

type GrokRole = 'system' | 'user' | 'assistant' | 'tool';

interface GrokChatMessage {
  role: GrokRole;
  content: string;
}

interface GrokChatCompletionRequest {
  model: string;
  messages: GrokChatMessage[];
  temperature?: number;
  response_format?: { type: 'json_object' | 'text' };
}

interface GrokChatCompletionResponse {
  choices: Array<{
    message?: {
      content?: string | null;
    } | null;
  }>;
}

class GrokApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'GrokApiError';
    this.status = status;
    this.details = details;
  }
}

function getApiKey(): string {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error('XAI_API_KEY is not configured');
  }
  return apiKey;
}

function getBaseUrl(): string {
  return DEFAULT_BASE_URL.replace(/\/$/, '');
}

async function createChatCompletion(payload: GrokChatCompletionRequest): Promise<GrokChatCompletionResponse> {
  const response = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();
  let parsedBody: unknown = null;
  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (error) {
      if (!response.ok) {
        throw new GrokApiError('Grok API request failed', response.status, rawBody);
      }
      throw new Error(`Failed to parse Grok response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (!response.ok) {
    throw new GrokApiError('Grok API request failed', response.status, parsedBody);
  }

  if (!parsedBody) {
    throw new Error('Grok API returned an empty response body.');
  }

  return parsedBody as GrokChatCompletionResponse;
}

const ENRICH_SYSTEM_PROMPT = `You are an AI editor that summarizes robotics news. Respond with strict JSON and include fields title, summary_ai, category, robot_tags, importance_score, company_name, company_website. Category must be one of product, funding, partnership, policy, or other. importance_score is an integer from 0-100.`;

const trimmedString = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().min(1));

const optionalTrimmedString = z
  .string()
  .transform((value) => value.trim())
  .transform((value) => (value.length ? value : null))
  .nullable()
  .optional();

const enrichmentSchema = z.object({
  title: trimmedString,
  summary_ai: trimmedString,
  category: z.enum(['product', 'funding', 'partnership', 'policy', 'other']),
  robot_tags: z.array(z.string()).optional().default([]),
  importance_score: z.number().int().min(0).max(100),
  company_name: optionalTrimmedString,
  company_website: optionalTrimmedString,
});

function sanitizeRobotTags(tags: string[]): string[] {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter((tag) => Boolean(tag)),
    ),
  );
}

function normalizeEnrichment(data: z.infer<typeof enrichmentSchema>): EnrichedArticleData {
  return {
    ...data,
    company_name: data.company_name ?? null,
    company_website: data.company_website ?? null,
    robot_tags: sanitizeRobotTags(data.robot_tags ?? []),
  };
}

function isRetryableGrokError(error: unknown): boolean {
  if (error instanceof RetriableError) {
    return true;
  }

  if (typeof error === 'object' && error !== null) {
    const status = (error as { status?: number }).status;
    if (typeof status === 'number' && [408, 409, 429, 500, 502, 503, 504].includes(status)) {
      return true;
    }
  }

  if (error instanceof Error) {
    return /ENETUNREACH|ECONNRESET|ETIMEDOUT/i.test(error.message);
  }
  return false;
}

async function callGrok(prompt: string): Promise<EnrichedArticleData> {
  const completion = await retry(
    () =>
      createChatCompletion({
        model: AI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: ENRICH_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    {
      retries: MAX_XAI_RETRIES,
      baseDelayMs: 1500,
      shouldRetry: isRetryableGrokError,
    },
  );

  const content = completion.choices[0]?.message?.content?.trim() ?? '';
  if (!content) {
    throw new Error('Grok completion returned empty content.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse Grok response as JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  const result = enrichmentSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Grok response failed validation: ${result.error.message}`);
  }

  return normalizeEnrichment(result.data);
}

export async function enrichNews(rawNews: RawNewsData): Promise<EnrichedArticleData> {
  const prompt = `Title: ${rawNews.title_raw}\nURL: ${rawNews.url}\nPublished at: ${rawNews.published_at.toISOString()}\nContent: ${rawNews.content_raw}`;
  return callGrok(prompt);
}

const AGENT_SYSTEM_PROMPT = `You are Robotics Hub, a helpful agent that answers user questions using the supplied context. Reference the context when available and reply concisely.`;

export async function queryAgent(context: string, userQuery: string): Promise<string> {
  const completion = await retry(
    () =>
      createChatCompletion({
        model: AI_MODEL,
        temperature: 0.3,
        messages: [
          { role: 'system', content: AGENT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Context:\n${context}\n\nUser question: ${userQuery}`,
          },
        ],
      }),
    {
      retries: MAX_XAI_RETRIES,
      baseDelayMs: 1000,
      shouldRetry: isRetryableGrokError,
    },
  );

  const messageContent = completion.choices[0]?.message?.content ?? '';
  return messageContent.trim();
}
