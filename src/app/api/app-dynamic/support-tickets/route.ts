import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const TICKETS_COLLECTION = 'support_tickets';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const snap = await adminDb
      .collection(TICKETS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const tickets = snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ success: true, tickets }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { success: true, tickets: [], error: error.message },
      { headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subject = String(body.subject || '').trim();
    const description = String(body.description || '').trim();

    if (!subject || !description) {
      return NextResponse.json(
        { success: false, error: 'Subject and description are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `ASTRO-${randomNum}`;
    const nowIso = new Date().toISOString();

    const record = {
      ticketId,
      subject,
      description,
      userName: String(body.userName || 'Guest Seeker'),
      userPhone: String(body.userPhone || ''),
      userEmail: String(body.userEmail || ''),
      userUid: String(body.userUid || ''),
      source: String(body.source || 'mobile-app'),
      status: 'open',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const docRef = await adminDb.collection(TICKETS_COLLECTION).add(record);

    return NextResponse.json(
      {
        success: true,
        id: docRef.id,
        ticketId,
        ticket: { id: docRef.id, ...record },
        message: `Support ticket submitted successfully. Ticket ID #${ticketId}`,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create support ticket' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, adminNote } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Ticket document id is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (status) updates.status = status;
    if (typeof adminNote === 'string') updates.adminNote = adminNote;

    await adminDb.collection(TICKETS_COLLECTION).doc(id).set(updates, { merge: true });

    return NextResponse.json({ success: true, id, updates }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error updating support ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update ticket' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Ticket id is required' },
        { status: 400, headers: corsHeaders }
      );
    }
    await adminDb.collection(TICKETS_COLLECTION).doc(id).delete();
    return NextResponse.json({ success: true, id }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error deleting support ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete ticket' },
      { status: 500, headers: corsHeaders }
    );
  }
}
