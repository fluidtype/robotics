import Parser from 'rss-parser';
import { RawNewsData } from './types';
import { RetriableError, retry } from './retry';

const RSS_REQUEST_TIMEOUT_MS = Number(process.env.RSS_REQUEST_TIMEOUT_MS ?? 10000);
const RSS_MAX_RETRIES = Number(process.env.RSS_MAX_RETRIES ?? 2);
const parser = new Parser({ timeout: RSS_REQUEST_TIMEOUT_MS });

const FALLBACK_PUBLISHED_AT = new Date(0);

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function extractContent(item: Parser.Item): string {
  return (
    ((item as Record<string, unknown>)['content:encoded'] as string | undefined) ??
    item.contentSnippet ??
    item.content ??
    ''
  ).trim();
}

function extractPublishedAt(item: Parser.Item): Date {
  const candidates = [item.isoDate, item.pubDate].filter(Boolean) as string[];
  for (const candidate of candidates) {
    const parsed = new Date(candidate);
    if (isValidDate(parsed)) {
      return parsed;
    }
  }
  return FALLBACK_PUBLISHED_AT;
}

function mapItems(items: Parser.Item[]): RawNewsData[] {
  return items
    .map((item) => ({
      title_raw: item.title?.trim() ?? 'Untitled',
      content_raw: extractContent(item),
      url: item.link?.trim() ?? '',
      published_at: extractPublishedAt(item),
    }))
    .filter((entry) => Boolean(entry.url));
}

async function parseXml(xml: string): Promise<RawNewsData[]> {
  const feed = await parser.parseString(xml);
  return mapItems(feed.items ?? []);
}

export interface FetchRssOptions {
  fallbackXml?: string;
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message ?? '';
  return /ENETUNREACH|ENOTFOUND|ECONNRESET|ECONNREFUSED|timed out|fetch failed/i.test(message);
}

export async function fetchAndParseRss(url: string, options: FetchRssOptions = {}): Promise<RawNewsData[]> {
  try {
    const feed = await retry(
      () => parser.parseURL(url),
      {
        retries: RSS_MAX_RETRIES,
        baseDelayMs: 1000,
        shouldRetry: (error) => error instanceof RetriableError || isNetworkError(error),
      },
    );
    const items = feed.items ?? [];
    return mapItems(items);
  } catch (error) {
    if (options.fallbackXml) {
      console.warn(`RSS fetch failed for ${url}. Using fixture fallback.`);
      return parseXml(options.fallbackXml);
    }
    throw error;
  }
}
