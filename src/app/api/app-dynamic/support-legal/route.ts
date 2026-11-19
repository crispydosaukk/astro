import { NextRequest, NextResponse } from 'next/server';
import {
  getAppSupportLegalContent,
  saveAppSupportLegalContent,
  DEFAULT_SUPPORT_LEGAL_CONTENT,
} from '@/lib/appDynamicContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const content = await getAppSupportLegalContent();

    if (section && (section in content)) {
      return NextResponse.json(
        { success: true, [section]: (content as any)[section] },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, content },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error fetching dynamic support legal content:', error);
    return NextResponse.json(
      { success: true, content: DEFAULT_SUPPORT_LEGAL_CONTENT, fallback: true },
      { headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'object') {
      return NextResponse.json(
        { success: false, error: 'content must be an object' },
        { status: 400, headers: corsHeaders }
      );
    }

    await saveAppSupportLegalContent(content);
    return NextResponse.json(
      {
        success: true,
        message: 'Support & Legal content updated successfully',
        content,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error saving support & legal content:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save content' },
      { status: 500, headers: corsHeaders }
    );
  }
}
