import { NextRequest, NextResponse } from 'next/server';
import { calculateAshtakootGunMilan } from '@/lib/vedicAstrologyEngine';


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
      groom = { name: 'Groom', dob: '1994-05-12', tob: '10:30 AM', pob: 'Mumbai, India' },
      bride = { name: 'Bride', dob: '1996-08-20', tob: '02:15 PM', pob: 'Pune, India' },
    } = body;

    const match = calculateAshtakootGunMilan(
      groom.dob,
      groom.tob || '12:00 PM',
      groom.pob || 'India',
      bride.dob,
      bride.tob || '12:00 PM',
      bride.pob || 'India',
      groom.name || 'Groom',
      bride.name || 'Bride'
    );

    return NextResponse.json({
      success: true,
      match,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error calculating kundli match in app-dynamic:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to calculate Kundli match',
    }, { status: 500, headers: corsHeaders });
  }
}
