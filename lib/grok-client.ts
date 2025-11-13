import OpenAI from 'openai';
import { EnrichedArticleData, RawNewsData } from './types';

const DEFAULT_MODEL = process.env.GROK_MODEL ?? 'grok-2-latest';
const DEFAULT_BASE_URL = process.env.GROK_API_BASE_URL;

let cachedClient: OpenAI | null = null;

function getApiKey(): string {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error('GROK_API_KEY is not configured');
  }
  return apiKey;
}

function getClient(): OpenAI {
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: getApiKey(),
      baseURL: DEFAULT_BASE_URL,
    });
  }
  return cachedClient;
}

const ENRICH_SYSTEM_PROMPT = `You are an AI editor that summarizes robotics news. Respond with strict JSON and include fields title, summary_ai, category, robot_tags, importance_score, company_name, company_website. Category must be one of product, funding, partnership, policy, or other. importance_score is an integer from 0-100.`;

export async function enrichNews(rawNews: RawNewsData): Promise<EnrichedArticleData> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: ENRICH_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Title: ${rawNews.title_raw}\nURL: ${rawNews.url}\nPublished at: ${rawNews.published_at.toISOString()}\nContent: ${rawNews.content_raw}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? '';
  const parsed = JSON.parse(content) as EnrichedArticleData;
  return {
    ...parsed,
    robot_tags: parsed.robot_tags ?? [],
  };
}

const AGENT_SYSTEM_PROMPT = `You are Robotics Hub, a helpful agent that answers user questions using the supplied context. Reference the context when available and reply concisely.`;

export async function queryAgent(context: string, userQuery: string): Promise<string> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.3,
    messages: [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Context:\n${context}\n\nUser question: ${userQuery}`,
      },
    ],
  });

  const messageContent = completion.choices[0]?.message?.content ?? '';
  return messageContent.trim();
}
