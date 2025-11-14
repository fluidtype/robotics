import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

config();
config({ path: '.env.local', override: true });

import type { RawNewsData, RoboticsTokenSnapshotData } from '@/lib/types';
import { fetchAndParseRss } from '@/lib/rss-client';
import { enrichNews } from '@/lib/grok-client';
import { fetchRoboticsTokens } from '@/lib/coingecko-client';
import { SOURCE_SEED_DATA } from '@/prisma/seed';

interface StepResult {
  name: string;
  success: boolean;
  detail: string;
  durationMs: number;
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

async function loadRssFixture(sourceId: string): Promise<{ xml: string; path: string } | null> {
  const fixturesDir = process.env.ETL_TEST_RSS_FIXTURE_DIR;
  if (!fixturesDir) {
    return null;
  }
  const filePath = path.resolve(fixturesDir, `${sourceId}.xml`);
  try {
    const xml = await readFile(filePath, 'utf8');
    return { xml, path: filePath };
  } catch {
    return null;
  }
}

async function testRssIngestion(): Promise<string> {
  if (!SOURCE_SEED_DATA.length) {
    throw new Error('No RSS sources configured in seed data.');
  }

  const sourceResults = await Promise.all(
    SOURCE_SEED_DATA.map(async (source) => {
      const fixture = await loadRssFixture(source.id);
      try {
        const entries = await fetchAndParseRss(source.url, { fallbackXml: fixture?.xml });
        if (!entries.length) {
          throw new Error('No entries returned.');
        }
        const newest = entries.at(0);
        return {
          source: source.name,
          success: true,
          detail: `ok (${entries.length} items${fixture ? ', fixture fallback' : ''}) Latest: ${
            newest?.title_raw ?? 'n/a'
          }`,
        };
      } catch (error) {
        return {
          source: source.name,
          success: false,
          detail: `${formatError(error)}${fixture ? ' (fixture missing or invalid)' : ''}`,
        };
      }
    }),
  );

  const successes = sourceResults.filter((result) => result.success);
  const summary = sourceResults.map((result) => `${result.success ? '✅' : '❌'} ${result.source}: ${result.detail}`).join(' | ');

  if (!successes.length) {
    throw new Error(`All RSS sources failed. Details: ${summary}`);
  }

  return `${successes.length}/${sourceResults.length} sources succeeded. ${summary}`;
}

async function loadGrokFixture(): Promise<RawNewsData | null> {
  const fixturePath = process.env.ETL_TEST_GROK_FIXTURE;
  if (!fixturePath) {
    return null;
  }
  try {
    const content = await readFile(path.resolve(fixturePath), 'utf8');
    const parsed = JSON.parse(content) as RawNewsData & { published_at: string };
    return { ...parsed, published_at: new Date(parsed.published_at) };
  } catch (error) {
    throw new Error(`Failed to read Grok fixture: ${formatError(error)}`);
  }
}

async function testGrokEnrichment(): Promise<string> {
  const fixture = await loadGrokFixture();
  const sampleRaw: RawNewsData =
    fixture ?? {
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

async function loadCoinGeckoFixture(): Promise<RoboticsTokenSnapshotData[] | null> {
  const fixturePath = process.env.ETL_TEST_COINGECKO_FIXTURE;
  if (!fixturePath) {
    return null;
  }
  try {
    const content = await readFile(path.resolve(fixturePath), 'utf8');
    return JSON.parse(content) as RoboticsTokenSnapshotData[];
  } catch (error) {
    throw new Error(`Failed to read CoinGecko fixture: ${formatError(error)}`);
  }
}

async function testCoinGeckoSnapshot(): Promise<string> {
  const fixture = await loadCoinGeckoFixture();
  const tokens = fixture ?? (await fetchRoboticsTokens());
  if (!tokens.length) {
    throw new Error('CoinGecko returned zero robotics tokens.');
  }

  const leader = tokens[0];
  return `Fetched ${tokens.length} tokens. Leader: ${leader.name} (${leader.symbol.toUpperCase()}) at $${leader.priceUsd}`;
}

async function runStep(name: string, fn: () => Promise<string>): Promise<StepResult> {
  const startedAt = performance.now();
  try {
    const detail = await fn();
    return { name, success: true, detail, durationMs: performance.now() - startedAt };
  } catch (error) {
    const detail = formatError(error);
    console.error(`\n[${name}] step failed:`, error);
    return { name, success: false, detail, durationMs: performance.now() - startedAt };
  }
}

async function main() {
  const steps = [
    ['RSS ingestion', testRssIngestion],
    ['Grok enrichment', testGrokEnrichment],
    ['CoinGecko snapshot', testCoinGeckoSnapshot],
  ] as const;

  const results = await Promise.all(steps.map(([name, fn]) => runStep(name, fn)));

  console.log(`\nETL diagnostics run @ ${new Date().toISOString()}`);
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name} (${result.durationMs.toFixed(0)}ms): ${result.detail}`);
  }

  const failures = results.filter((result) => !result.success);
  if (failures.length) {
    process.exitCode = 1;
  }
}

void main();