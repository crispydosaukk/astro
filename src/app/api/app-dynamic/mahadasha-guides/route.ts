import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { DEFAULT_MAHADASHA_GUIDES, MahadashaGuide } from '@/lib/mahadasha';
import { NO_CACHE_CORS_HEADERS } from '@/lib/noCacheHeaders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const corsHeaders = NO_CACHE_CORS_HEADERS;

const GUIDE_EMOJIS: Record<string, string> = {
  'rahu-stabilisation': '🛡️',
  'rahu-survival': '🔥',
  'sani-stabilisation': '🪐',
  'sani-survival': '⚡',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const snap = await adminDb.collection('mahadasha_guides').get();
    const dbGuides: Record<string, Partial<MahadashaGuide>> = {};
    snap.forEach((docSnap: any) => {
      dbGuides[docSnap.id] = docSnap.data() as Partial<MahadashaGuide>;
    });

    const orderedIds = Array.from(
      new Set([...Object.keys(DEFAULT_MAHADASHA_GUIDES), ...Object.keys(dbGuides)])
    );

    const guides = orderedIds.map((id) => {
      const base = DEFAULT_MAHADASHA_GUIDES[id];
      const override = dbGuides[id] || {};
      const merged: any = {
        ...(base || {
          id,
          slug: `/services/${id}`,
          title: override.title || id,
          pdfTitle: override.pdfTitle || `${id}.pdf`,
          price: Number(override.price) || 499,
          priceUSD: Number(override.priceUSD) || 9.99,
          pdfUrl: override.pdfUrl || '',
          badge: override.badge || 'Mahadasha Guide',
          subtitle: override.subtitle || '',
          description: override.description || '',
          previewTopics: Array.isArray(override.previewTopics) ? override.previewTopics : [],
          chapters: Array.isArray(override.chapters) ? override.chapters : [],
        }),
        ...override,
        id,
      };
      // Ensure chapters fallback to rich defaults if admin doc didn't store chapters
      if ((!Array.isArray(merged.chapters) || merged.chapters.length === 0) && base?.chapters) {
        merged.chapters = base.chapters;
      }
      if (!merged.emoji) {
        merged.emoji = GUIDE_EMOJIS[id] || (id.includes('sani') ? '🪐' : '🛡️');
      }
      return merged;
    });

    return NextResponse.json({ success: true, guides }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[mahadasha-guides GET] error:', error);
    const fallback = Object.values(DEFAULT_MAHADASHA_GUIDES).map((g) => ({
      ...g,
      emoji: GUIDE_EMOJIS[g.id] || '🛡️',
    }));
    return NextResponse.json({ success: true, guides: fallback, fallback: true }, { headers: corsHeaders });
  }
}
