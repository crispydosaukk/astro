import { NextRequest, NextResponse } from 'next/server';
import { searchDirectoryAstrologers } from '@/lib/directorySearch';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || 'Chennai';
    const spec = searchParams.get('spec') || 'Vedic Astrology';
    const count = Number(searchParams.get('count')) || 6;

    const results = await searchDirectoryAstrologers({
      city,
      specialisation: spec,
      count,
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      city,
      spec,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to search directories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const city = body?.city || body?.location || 'Chennai';
    const spec = body?.specialisation || 'Vedic Astrology';
    const count = Number(body?.count) || 6;

    const results = await searchDirectoryAstrologers({
      city,
      specialisation: spec,
      count,
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      city,
      spec,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to search directories' },
      { status: 500 }
    );
  }
}
