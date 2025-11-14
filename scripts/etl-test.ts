import { config } from 'dotenv';

config({ path: '.env.local', override: true });

import type { RawNewsData } from '@/lib/types';
import { fetchAndParseRss } from '@/lib/rss-client';
import { enrichNews } from '@/lib/grok-client';
import { fetchRoboticsTokens } from '@/lib/coingecko-client';
import { SOURCE_SEED_DATA } from '@/prisma/seed';

interface StepResult {
  name: string;
  success: boolean;
  detail: string;
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || error.toString();
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

async function testRssIngestion(): Promise<string> {
  const source = SOURCE_SEED_DATA[0];
  if (!source) {
    throw new Error('No RSS sources configured in seed data.');
  }

  const entries = await fetchAndParseRss(source.url);
  if (!entries.length) {
    throw new Error(`No entries returned from ${source.name}.`);
  }

  const sampleTitles = entries
    .slice(0, 3)
    .map((item) => item.title_raw)
    .join(' | ');

  return `Fetched ${entries.length} entries from ${source.name}. Sample: ${sampleTitles}`;
}

async function testGrokEnrichment(): Promise<string> {
  const sampleRaw: RawNewsData = {
    title_raw: 'Sample robotics breakthrough secures Series B funding',
    content_raw:
      'Fictional humanoid robotics startup RoboSample closed a $50M Series B to accelerate factory automation deployments.',
    url: 'https://example.com/sample-robotics-news',
    published_at: new Date(),
  };

  const enriched = await enrichNews(sampleRaw);
  return `Category: ${enriched.category}, Importance: ${enriched.importance_score}, Tags: ${
    enriched.robot_tags.join(', ') || 'none'
  }`;
}

async function testCoinGeckoSnapshot(): Promise<string> {
  const tokens = await fetchRoboticsTokens();
  if (!tokens.length) {
    throw new Error('CoinGecko returned zero robotics tokens.');
  }

  const leader = tokens[0];
  return `Fetched ${tokens.length} tokens. Leader: ${leader.name} (${leader.symbol.toUpperCase()}) at $${leader.priceUsd}`;
}

async function runStep(name: string, fn: () => Promise<string>): Promise<StepResult> {
  try {
    const detail = await fn();
    return { name, success: true, detail };
  } catch (error) {
    const detail = formatError(error);
    console.error(`\n[${name}] step failed:`, error);
    return { name, success: false, detail };
  }
}

async function main() {
  const steps = [
    ['RSS ingestion', testRssIngestion],
    ['Grok enrichment', testGrokEnrichment],
    ['CoinGecko snapshot', testCoinGeckoSnapshot],
  ] as const;

  const results: StepResult[] = [];
  for (const [name, fn] of steps) {
    // eslint-disable-next-line no-await-in-loop
    const result = await runStep(name, fn);
    results.push(result);
  }

  console.log(`\nETL diagnostics run @ ${new Date().toISOString()}`);
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.detail}`);
  }

  const failures = results.filter((result) => !result.success);
  if (failures.length) {
    process.exitCode = 1;
  }
}

void main();
