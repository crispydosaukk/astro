import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const SESSIONS_COLLECTION = 'user_sessions';

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/auth/sessions?uid=...&phone=...&sessionId=...
 * Returns all active sessions for the signed-in user and whether the caller's session was revoked.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = (searchParams.get('uid') || '').trim();
    const phone = (searchParams.get('phone') || '').trim();
    const callerSessionId = (searchParams.get('sessionId') || '').trim();

    if (!uid && !phone) {
      return NextResponse.json(
        { success: false, error: 'Authentication required (uid or phone)', sessions: [] },
        { status: 401, headers: corsHeaders }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const docsMap = new Map<string, Record<string, any>>();

    if (uid) {
      const snap = await adminDb
        .collection(SESSIONS_COLLECTION)
        .where('uid', '==', uid)
        .limit(50)
        .get();
      snap.docs.forEach((d: any) => docsMap.set(d.id, { id: d.id, ...d.data() }));
    }

    if (cleanPhone) {
      const snap = await adminDb
        .collection(SESSIONS_COLLECTION)
        .where('cleanPhone', '==', cleanPhone)
        .limit(50)
        .get();
      snap.docs.forEach((d: any) => docsMap.set(d.id, { id: d.id, ...d.data() }));
    }

    let currentSessionRevoked = false;
    if (callerSessionId) {
      const callerDocId = sanitizeId(callerSessionId);
      const callerDoc = docsMap.get(callerDocId);
      if (callerDoc && callerDoc.active === false) {
        currentSessionRevoked = true;
      } else if (!callerDoc) {
        try {
          const direct = await adminDb.collection(SESSIONS_COLLECTION).doc(callerDocId).get();
          if (direct.exists && direct.data()?.active === false) {
            currentSessionRevoked = true;
          }
        } catch {}
      }
    }

    const sessions = Array.from(docsMap.values())
      .filter((s) => s.active !== false)
      .map((s) => ({
        sessionId: String(s.sessionId || s.id),
        uid: String(s.uid || ''),
        phone: String(s.phone || ''),
        deviceName: String(s.deviceName || s.modelName || 'Mobile Device'),
        osLabel: String(s.osLabel || s.platform || 'Mobile'),
        platform: String(s.platform || 'android'),
        appVersion: String(s.appVersion || ''),
        createdAt: String(s.createdAt || ''),
        lastActiveAt: String(s.lastActiveAt || s.createdAt || ''),
        lastActiveAtMs: Number(s.lastActiveAtMs || Date.parse(s.lastActiveAt || '') || 0),
      }))
      .sort((a, b) => b.lastActiveAtMs - a.lastActiveAtMs);

    return NextResponse.json(
      {
        success: true,
        sessions,
        currentSessionRevoked,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[API /auth/sessions GET] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load sessions', sessions: [] },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/auth/sessions
 * Registers a new active device session or refreshes its heartbeat timestamp.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uid = typeof body?.uid === 'string' ? body.uid.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : '';

    if ((!uid && !phone) || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'uid/phone and sessionId are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const docId = sanitizeId(sessionId);
    const ref = adminDb.collection(SESSIONS_COLLECTION).doc(docId);
    const existing = await ref.get();

    // If this session was explicitly revoked from another device, reject heartbeat so device signs out
    if (existing.exists && existing.data()?.active === false && existing.data()?.revokedAt) {
      return NextResponse.json(
        { success: false, revoked: true, error: 'Session has been revoked' },
        { status: 401, headers: corsHeaders }
      );
    }

    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const cleanPhone = phone.replace(/\D/g, '');

    const payload = {
      sessionId,
      uid,
      phone,
      cleanPhone,
      deviceName: String(body?.deviceName || body?.modelName || 'Mobile Device').slice(0, 120),
      osLabel: String(body?.osLabel || body?.platform || 'Mobile').slice(0, 80),
      platform: String(body?.platform || 'android').slice(0, 20),
      appVersion: String(body?.appVersion || '').slice(0, 30),
      active: true,
      createdAt: existing.exists && existing.data()?.createdAt ? existing.data()?.createdAt : nowIso,
      lastActiveAt: nowIso,
      lastActiveAtMs: nowMs,
    };

    await ref.set(payload, { merge: true });

    return NextResponse.json({ success: true, session: payload }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[API /auth/sessions POST] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register session' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/auth/sessions
 * Revokes a single sessionId or all other sessions for a user.
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const uid = typeof body?.uid === 'string' ? body.uid.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : '';
    const revokeAllOthers = Boolean(body?.revokeAllOthers);
    const currentSessionId = typeof body?.currentSessionId === 'string' ? body.currentSessionId.trim() : '';

    if (!uid && !phone) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const nowIso = new Date().toISOString();

    if (revokeAllOthers) {
      const cleanPhone = phone.replace(/\D/g, '');
      const targets = new Map<string, any>();
      if (uid) {
        const snap = await adminDb.collection(SESSIONS_COLLECTION).where('uid', '==', uid).limit(50).get();
        snap.docs.forEach((d: any) => targets.set(d.id, d));
      }
      if (cleanPhone) {
        const snap = await adminDb.collection(SESSIONS_COLLECTION).where('cleanPhone', '==', cleanPhone).limit(50).get();
        snap.docs.forEach((d: any) => targets.set(d.id, d));
      }
      const keepId = currentSessionId ? sanitizeId(currentSessionId) : '';
      let revokedCount = 0;
      for (const [docId, docSnap] of targets.entries()) {
        if (keepId && docId === keepId) continue;
        if (docSnap.data()?.active !== false) {
          await docSnap.ref.set({ active: false, revokedAt: nowIso }, { merge: true });
          revokedCount += 1;
        }
      }
      return NextResponse.json({ success: true, revokedCount }, { headers: corsHeaders });
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const docId = sanitizeId(sessionId);
    const ref = adminDb.collection(SESSIONS_COLLECTION).doc(docId);
    const existing = await ref.get();
    if (existing.exists) {
      const d = existing.data() || {};
      const cleanPhone = phone.replace(/\D/g, '');
      const owns =
        (uid && d.uid === uid) ||
        (cleanPhone && d.cleanPhone === cleanPhone);
      if (!owns) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403, headers: corsHeaders }
        );
      }
      await ref.set({ active: false, revokedAt: nowIso }, { merge: true });
    }

    return NextResponse.json({ success: true, revokedSessionId: sessionId }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[API /auth/sessions DELETE] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to revoke session' },
      { status: 500, headers: corsHeaders }
    );
  }
}
