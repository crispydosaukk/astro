import { NextResponse } from 'next/server';
import { evaluateAndRunDueAutomations } from '@/lib/notificationAutomations';

export const dynamic = 'force-dynamic';

async function handleCron(req: Request) {
  // Optional security check if CRON_SECRET is configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const url = new URL(req.url);
    const queryKey = url.searchParams.get('key');

    if (token !== cronSecret && queryKey !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }
  }

  try {
    const report = await evaluateAndRunDueAutomations(new Date());
    return NextResponse.json({
      success: true,
      message: `Evaluated automations at ${report.istTime} IST. Ran ${report.ranCount} schedule(s).`,
      report,
    });
  } catch (err: any) {
    console.error('[cron/daily-notifications] Execution error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Cron evaluation failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleCron(req);
}

export async function POST(req: Request) {
  return handleCron(req);
}
