import { NextRequest, NextResponse } from 'next/server';
import { calculateBirthChartData, resolveCityCoordinates } from '@/lib/vedicAstrologyEngine';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      dob = '1995-10-15',
      tob = '12:00 PM',
      pob = 'New Delhi, India',
      name = 'Devotee',
      gender = 'Male',
      lat,
      lon,
    } = body;

    const coords = resolveCityCoordinates(pob, lat, lon);
    const chart = calculateBirthChartData(
      dob,
      tob,
      pob,
      coords.lat,
      coords.lon,
      name,
      gender
    );

    return NextResponse.json({
      success: true,
      chart,
      coordinates: coords,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error calculating kundli in app-dynamic:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to calculate birth chart',
    }, { status: 500, headers: corsHeaders });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dob = url.searchParams.get('dob') || '1995-10-15';
  const tob = url.searchParams.get('tob') || '12:00 PM';
  const pob = url.searchParams.get('pob') || 'New Delhi, India';
  const name = url.searchParams.get('name') || 'Devotee';
  const gender = url.searchParams.get('gender') || 'Male';

  const coords = resolveCityCoordinates(pob);
  const chart = calculateBirthChartData(dob, tob, pob, coords.lat, coords.lon, name, gender);

  return NextResponse.json({
    success: true,
    chart,
    coordinates: coords,
  }, { headers: corsHeaders });
}
