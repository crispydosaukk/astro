import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  DEFAULT_AI_ASTROLOGERS,
  DEFAULT_AI_DISCIPLINES,
  AIAstrologer,
  AIDiscipline,
  normalizeAIAstrologerAvatar,
} from '@/lib/aiAstrologerData';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Fetch AI Astrologers
    let astrologers: AIAstrologer[] = [];
    try {
      const astSnap = await adminDb.collection('ai_astrologers').get();
      if (!astSnap.empty) {
        astSnap.forEach((doc: any) => {
          const item = { id: doc.id, ...doc.data() } as AIAstrologer;
          astrologers.push(normalizeAIAstrologerAvatar(item));
        });
      } else {
        astrologers = [...DEFAULT_AI_ASTROLOGERS];
      }
    } catch (e) {
      astrologers = [...DEFAULT_AI_ASTROLOGERS];
    }

    // 2. Fetch AI Disciplines
    let disciplines: AIDiscipline[] = [];
    try {
      const discSnap = await adminDb.collection('ai_disciplines').get();
      if (!discSnap.empty) {
        discSnap.forEach((doc: any) => {
          disciplines.push({ id: doc.id, ...doc.data() } as AIDiscipline);
        });
      } else {
        disciplines = [...DEFAULT_AI_DISCIPLINES];
      }
    } catch (e) {
      disciplines = [...DEFAULT_AI_DISCIPLINES];
    }

    // 3. Fetch Consultations Analytics
    let totalConsultations = 0;
    let totalRevenue = 0;
    let totalMinutes = 0;
    let completedCount = 0;
    const popularAstrologers: Record<string, number> = {};
    const popularDisciplines: Record<string, number> = {};
    const popularLanguages: Record<string, number> = {};

    try {
      const consultSnap = await adminDb.collection('ai_consultations').get();
      totalConsultations = consultSnap.size;

      consultSnap.forEach((doc: any) => {
        const data = doc.data();
        if (data.status === 'completed' || data.status === 'terminated_low_balance') {
          completedCount++;
          totalRevenue += data.totalBilledAmount || 0;
          totalMinutes += data.billedMinutes || 1;

          const aName = data.astrologerName || 'Astrologer';
          popularAstrologers[aName] = (popularAstrologers[aName] || 0) + 1;

          const dName = data.primaryDiscipline || 'Vedic Jyotish';
          popularDisciplines[dName] = (popularDisciplines[dName] || 0) + 1;

          const lName = data.language || 'English';
          popularLanguages[lName] = (popularLanguages[lName] || 0) + 1;
        }
      });
    } catch (e) {
      console.warn('Analytics calculation fallback:', e);
    }

    const avgDuration = completedCount > 0 ? (totalMinutes / completedCount).toFixed(1) : '0.0';

    return NextResponse.json({
      success: true,
      astrologers,
      disciplines,
      analytics: {
        totalConsultations,
        completedConsultations: completedCount,
        totalRevenue,
        totalMinutes,
        avgDurationMinutes: avgDuration,
        popularAstrologers,
        popularDisciplines,
        popularLanguages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin AI astrologers:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, astrologer, discipline, astrologerId, isActive, isFeatured, availability } = body;

    // Toggle Active / Inactive Status
    if (action === 'toggle_status' && astrologerId !== undefined) {
      const docRef = adminDb.collection('ai_astrologers').doc(astrologerId);
      await docRef.set(
        {
          isActive: !!isActive,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return NextResponse.json({ success: true, astrologerId, isActive: !!isActive });
    }

    // Set Availability (online / offline / busy)
    if (action === 'set_availability' && astrologerId && availability) {
      const docRef = adminDb.collection('ai_astrologers').doc(astrologerId);
      await docRef.set(
        {
          availability,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return NextResponse.json({ success: true, astrologerId, availability });
    }

    // Toggle Featured
    if (action === 'toggle_featured' && astrologerId !== undefined) {
      const docRef = adminDb.collection('ai_astrologers').doc(astrologerId);
      await docRef.set(
        {
          isFeatured: !!isFeatured,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return NextResponse.json({ success: true, astrologerId, isFeatured: !!isFeatured });
    }

    // Save or Update Full Astrologer Profile
    if (action === 'save_astrologer' && astrologer) {
      const id =
        astrologer.id ||
        `ai-${astrologer.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
      const docRef = adminDb.collection('ai_astrologers').doc(id);

      const payload: AIAstrologer = {
        ...astrologer,
        id,
        availability: astrologer.availability || 'online',
        updatedAt: new Date().toISOString(),
        createdAt: astrologer.createdAt || new Date().toISOString(),
      };

      await docRef.set(payload, { merge: true });
      return NextResponse.json({ success: true, astrologer: payload });
    }

    // Save or Update Discipline
    if (action === 'save_discipline' && discipline) {
      const id = discipline.id || discipline.slug || `disc-${Date.now()}`;
      const docRef = adminDb.collection('ai_disciplines').doc(id);

      const payload: AIDiscipline = {
        ...discipline,
        id,
        slug: discipline.slug || id,
      };

      await docRef.set(payload, { merge: true });
      return NextResponse.json({ success: true, discipline: payload });
    }

    // Delete Astrologer
    if (action === 'delete_astrologer' && (astrologer?.id || astrologerId)) {
      const targetId = astrologer?.id || astrologerId;
      await adminDb.collection('ai_astrologers').doc(targetId).delete();
      return NextResponse.json({ success: true, deletedId: targetId });
    }

    // Delete Discipline
    if (action === 'delete_discipline' && discipline?.id) {
      await adminDb.collection('ai_disciplines').doc(discipline.id).delete();
      return NextResponse.json({ success: true, deletedId: discipline.id });
    }

    // One-Click Bulk Sync all 50 AI Astrologers & Disciplines to Firestore
    if (action === 'reset_astrologers' || action === 'sync_all_50') {
      const batch = adminDb.batch();
      for (const a of DEFAULT_AI_ASTROLOGERS) {
        const docRef = adminDb.collection('ai_astrologers').doc(a.id);
        batch.set(docRef, { ...a, updatedAt: new Date().toISOString() }, { merge: true });
      }
      for (const d of DEFAULT_AI_DISCIPLINES) {
        const discRef = adminDb.collection('ai_disciplines').doc(d.id);
        batch.set(discRef, d, { merge: true });
      }
      await batch.commit();
      return NextResponse.json({
        success: true,
        count: DEFAULT_AI_ASTROLOGERS.length,
        disciplinesCount: DEFAULT_AI_DISCIPLINES.length,
      });
    }

    return NextResponse.json({ error: 'Invalid action or payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Error saving admin AI astrologer/discipline:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
