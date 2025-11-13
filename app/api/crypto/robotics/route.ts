import { NextResponse } from 'next/server';
import { getLatestTokenSnapshot } from '@/lib/db-queries';

export const revalidate = 3600;

export async function GET() {
  try {
    const tokens = await getLatestTokenSnapshot();
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Failed to fetch robotics token snapshot', error);
    return NextResponse.json(
      { error: 'Failed to fetch robotics token snapshot' },
      { status: 500 },
    );
  }
}
