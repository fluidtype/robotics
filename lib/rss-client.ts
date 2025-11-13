import Parser from 'rss-parser';
import { RawNewsData } from './types';

const parser = new Parser();

function extractContent(item: Parser.Item): string {
  return (
    (item as Record<string, unknown>)['content:encoded'] as string | undefined ??
    item.contentSnippet ??
    item.content ??
    ''
  ).trim();
}

function extractPublishedAt(item: Parser.Item): Date {
  if (item.isoDate) {
    return new Date(item.isoDate);
  }
  if (item.pubDate) {
    return new Date(item.pubDate);
  }
  return new Date();
}

export async function fetchAndParseRss(url: string): Promise<RawNewsData[]> {
  const feed = await parser.parseURL(url);
  const items = feed.items ?? [];

  return items
    .map((item) => ({
      title_raw: item.title?.trim() ?? 'Untitled',
      content_raw: extractContent(item),
      url: item.link?.trim() ?? '',
      published_at: extractPublishedAt(item),
    }))
    .filter((entry) => Boolean(entry.url));
}
