import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import prisma from '@/lib/prisma';
import { fetchAndParseRss } from '@/lib/rss-client';
import { enrichNews } from '@/lib/grok-client';
import { fetchRoboticsTokens } from '@/lib/coingecko-client';
import { ensureSeedSources } from '@/prisma/seed';

interface CronStats {
  newRawNews: number;
  newArticles: number;
  newCompanies: number;
  tokenSnapshots: number;
  logs: string[];
}

const EMPTY_STATS: CronStats = {
  newRawNews: 0,
  newArticles: 0,
  newCompanies: 0,
  tokenSnapshots: 0,
  logs: [],
};

function extractSecret(req: NextRequest): string | null {
  const cronHeader = req.headers.get('x-vercel-cron-secret');
  if (cronHeader) {
    return cronHeader.trim();
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  return authHeader.trim();
}

async function ingestSources(stats: CronStats) {
  const sources = await prisma.source.findMany();

  for (const source of sources) {
    try {
      const entries = await fetchAndParseRss(source.url);
      for (const entry of entries) {
        const existing = await prisma.rawNews.findUnique({ where: { url: entry.url } });
        if (existing) {
          continue;
        }

        await prisma.rawNews.create({
          data: {
            sourceId: source.id,
            url: entry.url,
            title_raw: entry.title_raw,
            content_raw: entry.content_raw,
            published_at: entry.published_at,
          },
        });
        stats.newRawNews += 1;
      }
    } catch (error) {
      const errorMessage = `RSS ingestion failed for source ${source.name}: ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error(errorMessage);
      stats.logs.push(errorMessage);
    }
  }
}

async function processRawNews(stats: CronStats) {
  const rawItems = await prisma.rawNews.findMany({ where: { processed: false } });

  for (const raw of rawItems) {
    try {
      const enriched = await enrichNews({
        title_raw: raw.title_raw,
        content_raw: raw.content_raw,
        url: raw.url,
        published_at: raw.published_at,
      });
      let companyId: string | null = null;

      const companyName = enriched.company_name?.trim();
      if (companyName) {
        const existingCompany = await prisma.company.findUnique({ where: { name: companyName } });
        if (existingCompany) {
          await prisma.company.update({
            where: { id: existingCompany.id },
            data: {
              website: enriched.company_website ?? existingCompany.website,
              last_seen_at: new Date(),
            },
          });
          companyId = existingCompany.id;
        } else {
          const company = await prisma.company.create({
            data: {
              name: companyName,
              website: enriched.company_website,
              categories: [],
              summary_ai: null,
              last_seen_at: new Date(),
            },
          });
          companyId = company.id;
          stats.newCompanies += 1;
        }
      }

      await prisma.article.create({
        data: {
          sourceId: raw.sourceId,
          companyId,
          url: raw.url,
          title: enriched.title,
          summary_ai: enriched.summary_ai,
          category: enriched.category,
          robot_tags: enriched.robot_tags ?? [],
          importance_score: enriched.importance_score,
          published_at: raw.published_at,
        },
      });
      stats.newArticles += 1;

      await prisma.rawNews.update({
        where: { id: raw.id },
        data: { processed: true },
      });
    } catch (error) {
      const errorMessage = `AI enrichment failed for raw news ${raw.id}: ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error(errorMessage);
      stats.logs.push(errorMessage);
    }
  }
}

async function snapshotRoboticsTokens(stats: CronStats) {
  try {
    const tokens = await fetchRoboticsTokens();
    if (!tokens.length) {
      return;
    }

    await prisma.roboticsTokenSnapshot.createMany({ data: tokens });
    stats.tokenSnapshots += tokens.length;
  } catch (error) {
    const errorMessage = `CoinGecko snapshot failed: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(errorMessage);
    stats.logs.push(errorMessage);
  }
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { success: false, message: 'CRON_SECRET is not configured', stats: EMPTY_STATS },
      { status: 500 },
    );
  }

  const providedSecret = extractSecret(req);
  if (!providedSecret || providedSecret !== cronSecret) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized', stats: EMPTY_STATS },
      { status: 401 },
    );
  }

  const stats: CronStats = { ...EMPTY_STATS, logs: [] };

  try {
    stats.logs.push('Starting seed sources...');
    await ensureSeedSources(prisma);
    stats.logs.push('Seed sources ensured.');

    stats.logs.push('Starting RSS ingestion...');
    await ingestSources(stats);
    stats.logs.push(`RSS ingestion complete. New raw news: ${stats.newRawNews}`);

    stats.logs.push('Starting AI enrichment...');
    await processRawNews(stats);
    stats.logs.push(
      `AI enrichment complete. New articles: ${stats.newArticles}, New companies: ${stats.newCompanies}`,
    );

    stats.logs.push('Starting CoinGecko snapshot...');
    await snapshotRoboticsTokens(stats);
    stats.logs.push(`CoinGecko snapshot complete. New tokens: ${stats.tokenSnapshots}`);

    return NextResponse.json({
      success: true,
      message: 'Daily batch completed successfully',
      stats,
    });
  } catch (error) {
    console.error('Daily batch failed', error);
    return NextResponse.json(
      { success: false, message: 'Daily batch failed', stats },
      { status: 500 },
    );
  }
}
