import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { getArticles } from '@/lib/db-queries';

export const revalidate = 60;

function parseNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? undefined;
    const category = searchParams.get('category') ?? undefined;
    const tag = searchParams.get('tag') ?? undefined;
    const companyId = searchParams.get('companyId') ?? undefined;
    const sourceId = searchParams.get('sourceId') ?? undefined;
    const from = parseDate(searchParams.get('from'));
    const to = parseDate(searchParams.get('to'));
    const limit = parseNumber(searchParams.get('limit'), 20);
    const offset = parseNumber(searchParams.get('offset'), 0);

    const data = await getArticles({
      q,
      category,
      tag,
      companyId,
      from,
      to,
      limit,
      offset,
      sourceId,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch articles', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
