import { NextResponse } from 'next/server';
import {
  getAutomatedSchedules,
  saveAutomatedSchedules,
  getISTTimeDetails,
  type AutomatedScheduleItem,
} from '@/lib/notificationAutomations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schedules = await getAutomatedSchedules();
    const ist = getISTTimeDetails();
    return NextResponse.json({
      success: true,
      schedules,
      currentTimeIST: ist.timeString,
      currentDateIST: ist.dateString,
    });
  } catch (err: any) {
    console.error('[api/automations GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Array.isArray(body?.schedules)) {
      return NextResponse.json(
        { success: false, error: 'Expected { schedules: AutomatedScheduleItem[] }' },
        { status: 400 }
      );
    }

    const saved = await saveAutomatedSchedules(body.schedules as AutomatedScheduleItem[]);
    return NextResponse.json({
      success: true,
      schedules: saved,
    });
  } catch (err: any) {
    console.error('[api/automations POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save schedules' },
      { status: 500 }
    );
  }
}
