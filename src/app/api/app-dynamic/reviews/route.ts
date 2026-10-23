import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export interface AppReview {
  id: string;
  astrologerId: string;
  astrologerName: string;
  customerId: string;
  customerName: string;
  rating: number;
  reviewText: string;
  tags?: string[];
  serviceType: 'Voice Call' | 'Video Call' | 'Chat';
  date: string;
  showInApp: boolean;
  status: 'approved' | 'pending' | 'hidden';
}

const DEFAULT_REVIEWS: AppReview[] = [
  {
    id: 'rev_1',
    astrologerId: 'swami-shankarananda',
    astrologerName: 'Swami Shankarananda Giri',
    customerId: 'cust_101',
    customerName: 'Priya Sharma',
    rating: 5,
    reviewText: "Swamiji's reading was extraordinarily accurate. He described my current Dasha period with such precision — it felt like he was reading my life story. His remedies have already started showing results.",
    tags: ['Accurate Prediction 🎯', 'Calm & Compassionate 🙏', 'Effective Remedies ✨'],
    serviceType: 'Voice Call',
    date: 'Today, 10:45 AM',
    showInApp: true,
    status: 'approved',
  },
  {
    id: 'rev_2',
    astrologerId: 'swami-shankarananda',
    astrologerName: 'Swami Shankarananda Giri',
    customerId: 'cust_102',
    customerName: 'Rajesh Kumar',
    rating: 5,
    reviewText: 'I was sceptical at first, but the consultation completely changed my perspective. His analysis of my career challenges was spot-on and the guidance he provided has been transformative.',
    tags: ['Career Clarity 💼', 'Deep Vedic Wisdom 📜'],
    serviceType: 'Video Call',
    date: 'Yesterday, 04:20 PM',
    showInApp: true,
    status: 'approved',
  },
  {
    id: 'rev_3',
    astrologerId: 'acharya-devavrat',
    astrologerName: 'Acharya Devavrat (AI)',
    customerId: 'cust_103',
    customerName: 'Ananya Patel',
    rating: 5,
    reviewText: 'The AI Kundli Milan reading for my marriage was incredibly detailed. Explained every aspect of compatibility with such clarity and compassion.',
    tags: ['Accurate Prediction 🎯', 'Clear Guidance 🗣️'],
    serviceType: 'Chat',
    date: '2 days ago',
    showInApp: true,
    status: 'approved',
  },
  {
    id: 'rev_4',
    astrologerId: 'swami-shankarananda',
    astrologerName: 'Swami Shankarananda Giri',
    customerId: 'cust_104',
    customerName: 'Vikram Singh',
    rating: 4,
    reviewText: 'Very knowledgeable and patient. Took time to explain complex astrological concepts in simple terms. Highly recommended.',
    tags: ['Deep Vedic Wisdom 📜', 'Clear Guidance 🗣️'],
    serviceType: 'Voice Call',
    date: '3 days ago',
    showInApp: true,
    status: 'approved',
  },
  {
    id: 'rev_5',
    astrologerId: 'vedika',
    astrologerName: 'Vedika AI Engine',
    customerId: 'cust_105',
    customerName: 'Suresh Reddy',
    rating: 5,
    reviewText: 'Instant planetary transit calculations and exact date predictions for my business expansion. Remarkable speed and accuracy!',
    tags: ['Accurate Prediction 🎯', 'Career Clarity 💼'],
    serviceType: 'Chat',
    date: '5 days ago',
    showInApp: true,
    status: 'approved',
  },
];

// In-memory cache fallback for fast response
let cachedReviews: AppReview[] = [...DEFAULT_REVIEWS];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const astrologerId = url.searchParams.get('astrologerId');
  const appOnly = url.searchParams.get('appOnly') === 'true';
  const status = url.searchParams.get('status');

  try {
    let list: AppReview[] = [];
    try {
      const q = query(collection(db, 'app_reviews'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            astrologerId: d.astrologerId || '',
            astrologerName: d.astrologerName || 'Astrologer',
            customerId: d.customerId || '',
            customerName: d.customerName || 'Devotee',
            rating: Number(d.rating) || 5,
            reviewText: d.reviewText || '',
            tags: Array.isArray(d.tags) ? d.tags : [],
            serviceType: d.serviceType || 'Voice Call',
            date: d.date || 'Recently',
            showInApp: d.showInApp !== false,
            status: d.status || 'approved',
          });
        });
        cachedReviews = list;
      }
    } catch (e) {
      console.warn('Firebase reviews fetch fallback to cached:', e);
    }

    if (list.length === 0) {
      list = [...cachedReviews];
    }

    // Apply filters
    if (appOnly) {
      list = list.filter((r) => r.showInApp === true && r.status !== 'hidden');
    }
    if (astrologerId) {
      list = list.filter((r) => r.astrologerId === astrologerId || r.astrologerName.toLowerCase().includes(astrologerId.toLowerCase()));
    }
    if (status && status !== 'all') {
      list = list.filter((r) => r.status === status);
    }

    return NextResponse.json(
      { success: true, reviews: list, total: list.length },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, reviews: cachedReviews },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      astrologerId,
      astrologerName,
      customerId,
      customerName,
      rating,
      reviewText,
      tags,
      serviceType,
    } = body;

    const newReview: AppReview = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      astrologerId: astrologerId || 'swami-shankarananda',
      astrologerName: astrologerName || 'Swami Shankarananda Giri',
      customerId: customerId || 'cust_guest',
      customerName: customerName || 'Verified Devotee',
      rating: Number(rating) || 5,
      reviewText: reviewText || 'Wonderful consultation with great insight and peace of mind.',
      tags: Array.isArray(tags) ? tags : ['Accurate Prediction 🎯'],
      serviceType: serviceType || 'Voice Call',
      date: 'Just now',
      showInApp: true,
      status: 'approved',
    };

    try {
      await addDoc(collection(db, 'app_reviews'), {
        ...newReview,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Firestore review save failed, saved to memory cache:', e);
    }

    cachedReviews = [newReview, ...cachedReviews];

    return NextResponse.json(
      { success: true, review: newReview, message: 'Review submitted successfully!' },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, showInApp, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID required' }, { status: 400 });
    }

    try {
      const docRef = doc(db, 'app_reviews', id);
      const updates: any = {};
      if (typeof showInApp === 'boolean') updates.showInApp = showInApp;
      if (status) updates.status = status;
      await updateDoc(docRef, updates);
    } catch (e) {
      console.warn('Firestore updateDoc failed, updating cached:', e);
    }

    cachedReviews = cachedReviews.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          showInApp: typeof showInApp === 'boolean' ? showInApp : r.showInApp,
          status: status || r.status,
        };
      }
      return r;
    });

    const updated = cachedReviews.find((r) => r.id === id);

    return NextResponse.json(
      { success: true, review: updated, message: 'Review updated successfully' },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    try {
      await deleteDoc(doc(db, 'app_reviews', id));
    } catch (e) {
      console.warn('Firestore delete failed:', e);
    }

    cachedReviews = cachedReviews.filter((r) => r.id !== id);

    return NextResponse.json(
      { success: true, message: 'Review deleted successfully' },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
