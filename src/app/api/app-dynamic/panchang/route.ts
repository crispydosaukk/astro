import { NextRequest, NextResponse } from 'next/server';
import { calculatePanchang } from '@/lib/panchangEngine';
import { fetchVedikaPanchang } from '@/lib/vedikaClient';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const location = url.searchParams.get('location') || 'New Delhi, India';

    let panchang = calculatePanchang(date, location);

    // Try enriching with Vedika live ephemeris if available
    try {
      const vRes = await fetchVedikaPanchang({ date, latitude: 28.6139, longitude: 77.209 });
      if (vRes && vRes.success && vRes.data) {
        const v = vRes.data;
        if (v.tithi?.name) panchang.tithi = v.tithi.name;
        if (v.nakshatra?.name) panchang.nakshatra = v.nakshatra.name;
        if (v.yoga?.name) panchang.yoga = v.yoga.name;
        if (v.karana?.name) panchang.karana = v.karana.name;
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      panchang,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error fetching panchang in app-dynamic:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to calculate Panchang',
    }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const date = body.date || new Date().toISOString().split('T')[0];
    const location = body.location || 'New Delhi, India';

    const panchang = calculatePanchang(date, location);
    return NextResponse.json({
      success: true,
      panchang,
    }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to calculate Panchang',
    }, { status: 500, headers: corsHeaders });
  }
}
