import { NextResponse } from 'next/server';
import { triggerSingleAutomation } from '@/lib/notificationAutomations';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const scheduleId = body?.scheduleId;

    if (!scheduleId || typeof scheduleId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'scheduleId is required' },
        { status: 400 }
      );
    }

    const outcome = await triggerSingleAutomation(scheduleId, {
      force: true, // Allow manual test send even if disabled or already sent today
      sentBy: 'Admin (Manual Test Trigger)',
    });

    if (!outcome.success) {
      return NextResponse.json(
        { success: false, error: outcome.error || 'Failed to trigger schedule' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: outcome.notification,
      schedule: outcome.schedule,
    });
  } catch (err: any) {
    console.error('[api/automations/trigger POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to trigger schedule' },
      { status: 500 }
    );
  }
}
