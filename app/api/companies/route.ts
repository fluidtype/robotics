import { NextRequest, NextResponse } from 'next/server';
import { getCompanies } from '@/lib/db-queries';

function parseNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? undefined;
    const category = searchParams.get('category') ?? undefined;
    const country = searchParams.get('country') ?? undefined;
    const limit = parseNumber(searchParams.get('limit'), 50);
    const offset = parseNumber(searchParams.get('offset'), 0);

    const companies = await getCompanies({ q, category, country, limit, offset });
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Failed to fetch companies', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}
