import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAIAstrologers, DEFAULT_AI_ASTROLOGERS } from '@/lib/aiAstrologerData';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    // 1. Fetch AI Astrologers from Firestore / defaults
    const aiAstrologers = await getAIAstrologers();

    // 2. Fetch Human Astrologers approved in Admin Panel
    let realAstrologers: any[] = [];
    try {
      const snap = await adminDb.collection('astrologers').where('status', '==', 'approved').get();
      if (!snap.empty) {
        realAstrologers = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
    } catch (e: any) {
      console.warn('Could not read real astrologers from Firestore:', e.message);
    }

    // 3. Normalize into unified list for the mobile app
    const formattedAi = (aiAstrologers || DEFAULT_AI_ASTROLOGERS).map((a) => ({
      id: a.id,
      name: a.name,
      specialty: a.primaryDiscipline || a.tagline || 'Vedic Astrology',
      experience: `${a.experienceYears || 15}+ Yrs`,
      rating: a.rating || 4.98,
      reviews: `${Math.round((a.totalConsultations || 1200) / 100) / 10}k`,
      price: a.pricePerMin || 30,
      isOnline: a.availability === 'online' || a.isActive !== false,
      isAi: true,
      imageUrl: a.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      languages: (a.languages || ['Hindi', 'English']).join(', '),
      bio: a.bio || a.tagline || '',
    }));

    const formattedReal = realAstrologers.map((r) => ({
      id: r.id,
      name: r.name || 'Acharya Ji',
      specialty: r.specialization || r.specialties?.[0] || 'Vedic Astrology',
      experience: `${r.experience || 10}+ Yrs`,
      rating: Number(r.rating) || 4.95,
      reviews: `${Math.round((r.totalConsultations || 850) / 100) / 10}k`,
      price: Number(r.pricePerMinute || r.price) || 25,
      isOnline: r.isOnline !== false,
      isAi: false,
      imageUrl: r.photoURL || r.avatar || r.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      languages: Array.isArray(r.languages) ? r.languages.join(', ') : (r.languages || 'Hindi, English'),
      bio: r.bio || '',
    }));

    // Combine both: Real astrologers + AI astrologers
    const allAstrologers = [...formattedReal, ...formattedAi];

    return NextResponse.json(
      {
        success: true,
        astrologers: allAstrologers,
        aiCount: formattedAi.length,
        realCount: formattedReal.length,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('Error fetching unified astrologers:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
