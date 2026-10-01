import { NextResponse } from 'next/server';
import { testVedikaConnection } from '@/lib/vedikaClient';

/**
 * POST /api/settings/test-vedika
 * Verifies that the configured Vedika API key is valid and the server is reachable.
 * Used by the Admin Settings UI "Test Connection" button.
 */
export async function POST() {
  try {
    const result = await testVedikaConnection();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { connected: false, message: err?.message || 'Unexpected error testing Vedika connection.' },
      { status: 500 }
    );
  }
}
