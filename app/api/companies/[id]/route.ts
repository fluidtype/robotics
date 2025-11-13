import { NextRequest, NextResponse } from 'next/server';
import { getCompanyById } from '@/lib/db-queries';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const company = await getCompanyById(params.id);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Failed to fetch company', error);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}
