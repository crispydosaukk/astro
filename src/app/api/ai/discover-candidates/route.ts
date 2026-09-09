import { NextRequest, NextResponse } from 'next/server';
import { discoverAstrologersAI } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const location = body?.location || 'Chennai';
    const specialisation = body?.specialisation || 'Vedic Astrology';
    const source = body?.source || 'Google Places & Web Search';
    const count = body?.count || 4;

    const candidates = await discoverAstrologersAI({
      location,
      specialisation,
      source,
      count,
    });

    return NextResponse.json({
      success: true,
      candidates,
      count: candidates.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error discovering candidates via OpenAI:', err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to discover astrologer candidates',
      },
      { status: 500 }
    );
  }
}
