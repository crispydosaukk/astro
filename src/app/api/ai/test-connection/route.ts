import { NextResponse } from 'next/server';
import { testOpenAIConnection } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await testOpenAIConnection();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to verify OpenAI connection',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
