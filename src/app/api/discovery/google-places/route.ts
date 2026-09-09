import { NextRequest, NextResponse } from 'next/server';
import { testGooglePlacesConnection, searchAstrologersGooglePlaces } from '@/lib/googlePlaces';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isTest = searchParams.get('test') === 'true';

    if (isTest) {
      const testResult = await testGooglePlacesConnection();
      return NextResponse.json(testResult);
    }

    const city = searchParams.get('city') || 'Chennai';
    const spec = searchParams.get('spec') || 'Vedic Astrology';

    const places = await searchAstrologersGooglePlaces(city, spec);
    return NextResponse.json({
      success: true,
      count: places.length,
      city,
      spec,
      results: places,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to query Google Places' },
      { status: 500 }
    );
  }
}
