import { NextResponse } from 'next/server';
import { getAIPromptSettings, updateAIPromptSettings, AIPromptSettingsData } from '@/lib/aiPromptSettings';

export async function GET() {
  try {
    const data = await getAIPromptSettings();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching AI prompt settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch AI prompts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: AIPromptSettingsData = await req.json();
    if (!body || !body.prompts || !body.config) {
      return NextResponse.json({ error: 'Invalid prompt settings data payload' }, { status: 400 });
    }

    await updateAIPromptSettings(body);
    return NextResponse.json({ success: true, message: 'AI Prompts and directives saved successfully' });
  } catch (error: any) {
    console.error('Error updating AI prompt settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to save AI prompts' }, { status: 500 });
  }
}
