import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

const MANAGED_ASTROLOGER_STATUSES = [
  'approved',
  'active',
  'full_time',
  'full-time active',
  'probation',
  'verified',
  'onboarded',
  'suspended',
  'deactivated',
  'inactive',
];

function isBlockedStatus(status: string): boolean {
  return ['suspended', 'deactivated', 'inactive', 'blocked'].includes(status);
}

function normalizeAstrologerRecord(id: string, data: Record<string, any>) {
  const status = String(data.status || 'approved').toLowerCase().trim();
  const isSuspended = Boolean(data.isSuspended || status === 'suspended');
  const isActive = isSuspended
    ? false
    : data.isActive !== undefined
    ? Boolean(data.isActive)
    : !['deactivated', 'inactive', 'suspended', 'blocked', 'rejected'].includes(status);
  const isOnline = isSuspended || !isActive ? false : Boolean(data.isOnline);
  const showOnWebsite = isSuspended || !isActive
    ? false
    : data.showOnWebsite !== undefined
    ? Boolean(data.showOnWebsite)
    : data.isPublished !== undefined
    ? Boolean(data.isPublished)
    : true;

  const skillsStr = Array.isArray(data.skills)
    ? data.skills.join(', ')
    : typeof data.skills === 'string' && data.skills.trim()
    ? data.skills
    : Array.isArray(data.specialisations)
    ? data.specialisations.join(', ')
    : data.speciality || data.specialization || 'Vedic Astrology';

  const languagesStr = Array.isArray(data.languages)
    ? data.languages.join(', ')
    : typeof data.languages === 'string' && data.languages.trim()
    ? data.languages
    : 'English, Hindi';

  const expNum =
    Number(data.experienceYears) ||
    (typeof data.experience === 'string'
      ? Number(data.experience.replace(/[^0-9]/g, ''))
      : Number(data.experience)) ||
    10;

  return {
    id,
    name: data.name || 'Unknown Astrologer',
    email: data.email || '',
    phone: data.phone || data.whatsapp || data.mobile || '',
    specialty: skillsStr,
    experience: expNum,
    rating: Number(data.rating) || 4.9,
    reviewsCount: Number(data.reviewsCount || data.reviews) || 0,
    consultations: Number(data.totalConsultations || data.consultations || data.consultationsCount) || 0,
    revenue: data.revenue || '₹0',
    amount: Number(data.amount || data.pricePerMinute || data.pricePerMin || data.price) || 25,
    badge: data.badge || (status === 'probation' ? 'Probation' : 'Top Rated'),
    status,
    previousStatus: data.previousStatus || (isBlockedStatus(status) ? 'approved' : status),
    isOnline,
    isActive,
    isSuspended,
    isFeatured: Boolean(data.isFeatured),
    isFullTimeApproved: Boolean(data.isFullTimeApproved || status === 'full_time'),
    dashboardDisabled: Boolean(data.dashboardDisabled || isSuspended || !isActive),
    showOnWebsite,
    suspensionReason: data.suspensionReason || '',
    suspendedAt: data.suspendedAt || '',
    avatar:
      data.profileImageUrl ||
      data.photoURL ||
      data.avatar ||
      data.imageUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Astrologer')}&background=713B32&color=fff&size=256`,
    tokenNumber: data.tokenNumber || 'N/A',
    dob: data.dob || '',
    gender: data.gender || '',
    city: data.city || 'Varanasi, India',
    phoneType: data.phoneType || '',
    languages: languagesStr,
    learningSource: data.learningSource || '',
    workingElsewhere: data.workingElsewhere || '',
    dailyHours: data.dailyHours || '',
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
    bio: data.bio || data.about || '',
    education: data.education || '',
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    reviewsList: Array.isArray(data.reviewsList) ? data.reviewsList : [],
  };
}

async function mirrorCandidateStatus(astrologerId: string, patch: Record<string, any>) {
  try {
    const candRef = adminDb.collection('candidates').doc(astrologerId);
    const snap = await candRef.get();
    if (snap.exists) {
      await candRef.set(patch, { merge: true });
    }
  } catch (err) {
    console.warn('[admin/astrologers] candidate mirror warning:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    const snap = await adminDb.collection('astrologers').get();
    const list: ReturnType<typeof normalizeAstrologerRecord>[] = [];

    snap.docs.forEach((docSnap: any) => {
      const data = docSnap.data() || {};
      const status = String(data.status || '').toLowerCase().trim();
      const isManaged =
        includeAll ||
        MANAGED_ASTROLOGER_STATUSES.includes(status) ||
        Boolean(data.isVerified || data.isSuspended || data.previousStatus);

      if (isManaged) {
        list.push(normalizeAstrologerRecord(docSnap.id, data));
      }
    });

    list.sort((a, b) => {
      if (a.isSuspended !== b.isSuspended) return a.isSuspended ? 1 : -1;
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    const stats = {
      total: list.length,
      activeCount: list.filter((a) => a.isActive && !a.isSuspended).length,
      inactiveCount: list.filter((a) => !a.isActive && !a.isSuspended).length,
      onlineCount: list.filter((a) => a.isOnline && a.isActive && !a.isSuspended).length,
      offlineCount: list.filter((a) => !a.isOnline && a.isActive && !a.isSuspended).length,
      suspendedCount: list.filter((a) => a.isSuspended).length,
      fullTimeCount: list.filter((a) => a.isFullTimeApproved && !a.isSuspended).length,
    };

    return NextResponse.json({
      success: true,
      astrologers: list,
      stats,
    });
  } catch (error: any) {
    console.error('[API /admin/astrologers GET] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load human astrologers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, astrologerId } = body;
    const nowIso = new Date().toISOString();

    if (action === 'create_astrologer') {
      const input = body.astrologer || {};
      const name = String(input.name || '').trim();
      const phone = String(input.phone || '').trim();
      if (!name) {
        return NextResponse.json(
          { success: false, error: 'Astrologer name is required' },
          { status: 400 }
        );
      }

      const newId = `ast-${Date.now()}`;
      const skillsArr = Array.isArray(input.skills)
        ? input.skills
        : String(input.specialty || input.skills || 'Vedic Astrology')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
      const langsArr = Array.isArray(input.languages)
        ? input.languages
        : String(input.languages || 'Hindi, English')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
      const rate = Math.max(1, Number(input.amount) || 25);

      const newRecord = {
        id: newId,
        name,
        email: String(input.email || '').trim(),
        phone,
        skills: skillsArr.join(', '),
        specialisations: skillsArr,
        speciality: skillsArr[0] || 'Vedic Astrology',
        languages: langsArr.join(', '),
        experienceYears: Number(input.experience) || 10,
        experience: `${Number(input.experience) || 10} Years`,
        amount: rate,
        pricePerMin: rate,
        pricePerMinute: rate,
        rating: Number(input.rating) || 4.9,
        reviewsCount: Number(input.reviewsCount) || 0,
        reviews: Number(input.reviewsCount) || 0,
        consultations: Number(input.consultations) || 0,
        totalConsultations: Number(input.consultations) || 0,
        badge: input.badge || 'Verified Expert',
        city: input.city || 'Varanasi, India',
        bio: input.bio || `${name} is a verified Vedic Astrologer providing personalized astrological guidance.`,
        about: input.bio || `${name} is a verified Vedic Astrologer providing personalized astrological guidance.`,
        profileImageUrl:
          input.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=713B32&color=fff&size=256`,
        status: 'approved',
        previousStatus: 'approved',
        isVerified: true,
        isFullTimeApproved: true,
        isActive: true,
        isSuspended: false,
        dashboardDisabled: false,
        isOnline: input.isOnline !== undefined ? Boolean(input.isOnline) : true,
        showOnWebsite: true,
        isPublished: true,
        isFeatured: Boolean(input.isFeatured),
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await adminDb.collection('astrologers').doc(newId).set(newRecord);
      return NextResponse.json({
        success: true,
        astrologer: normalizeAstrologerRecord(newId, newRecord),
      });
    }

    if (!astrologerId) {
      return NextResponse.json(
        { success: false, error: 'astrologerId is required' },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection('astrologers').doc(astrologerId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: 'Astrologer record not found' },
        { status: 404 }
      );
    }
    const existing = snap.data() || {};
    const currentStatus = String(existing.status || 'approved').toLowerCase().trim();

    // 1. Toggle Online / Offline
    if (action === 'toggle_online') {
      const nextOnline = Boolean(body.isOnline);
      if (nextOnline && (existing.isSuspended || currentStatus === 'suspended')) {
        return NextResponse.json(
          { success: false, error: 'Cannot set a suspended astrologer Online. Unsuspend first.' },
          { status: 400 }
        );
      }
      if (nextOnline && (existing.isActive === false || currentStatus === 'deactivated')) {
        return NextResponse.json(
          { success: false, error: 'Cannot set a deactivated astrologer Online. Activate first.' },
          { status: 400 }
        );
      }
      const patch = {
        isOnline: nextOnline,
        updatedAt: nowIso,
      };
      await docRef.set(patch, { merge: true });
      return NextResponse.json({
        success: true,
        astrologer: normalizeAstrologerRecord(astrologerId, { ...existing, ...patch }),
      });
    }

    // 2. Toggle Active / Deactive
    if (action === 'toggle_active') {
      const nextActive = Boolean(body.isActive);
      if (nextActive && (existing.isSuspended || currentStatus === 'suspended')) {
        return NextResponse.json(
          { success: false, error: 'This astrologer is suspended. Unsuspend to reactivate.' },
          { status: 400 }
        );
      }

      const restoredStatus =
        existing.previousStatus && !isBlockedStatus(String(existing.previousStatus).toLowerCase())
          ? existing.previousStatus
          : 'approved';

      const patch: Record<string, any> = nextActive
        ? {
            isActive: true,
            isSuspended: false,
            dashboardDisabled: false,
            showOnWebsite: true,
            isPublished: true,
            status: isBlockedStatus(currentStatus) ? restoredStatus : currentStatus || 'approved',
            reactivatedAt: nowIso,
            updatedAt: nowIso,
          }
        : {
            isActive: false,
            isOnline: false,
            dashboardDisabled: true,
            showOnWebsite: false,
            isPublished: false,
            previousStatus: isBlockedStatus(currentStatus)
              ? existing.previousStatus || 'approved'
              : currentStatus || 'approved',
            status: 'deactivated',
            deactivatedAt: nowIso,
            updatedAt: nowIso,
          };

      await docRef.set(patch, { merge: true });
      await mirrorCandidateStatus(astrologerId, {
        isActive: patch.isActive,
        dashboardDisabled: patch.dashboardDisabled,
        status: patch.status,
        showOnWebsite: patch.showOnWebsite,
        isPublished: patch.isPublished,
        updatedAt: nowIso,
      });

      return NextResponse.json({
        success: true,
        astrologer: normalizeAstrologerRecord(astrologerId, { ...existing, ...patch }),
      });
    }

    // 3. Suspend Astrologer (Hides from App & Web + Forces Offline + Disables Individual Dashboard)
    if (action === 'suspend') {
      const reason = String(body.reason || '').trim() || 'Suspended by Administrator';
      const patch = {
        isSuspended: true,
        isActive: false,
        isOnline: false,
        showOnWebsite: false,
        isPublished: false,
        dashboardDisabled: true,
        previousStatus: isBlockedStatus(currentStatus)
          ? existing.previousStatus || 'approved'
          : currentStatus || 'approved',
        status: 'suspended',
        suspensionReason: reason,
        suspendedAt: nowIso,
        suspendedBy: 'Admin',
        updatedAt: nowIso,
      };

      await docRef.set(patch, { merge: true });
      await mirrorCandidateStatus(astrologerId, {
        isSuspended: true,
        isActive: false,
        dashboardDisabled: true,
        status: 'suspended',
        suspensionReason: reason,
        suspendedAt: nowIso,
        showOnWebsite: false,
        isPublished: false,
        updatedAt: nowIso,
      });

      return NextResponse.json({
        success: true,
        astrologer: normalizeAstrologerRecord(astrologerId, { ...existing, ...patch }),
      });
    }

    // 4. Unsuspend / Restore Astrologer
    if (action === 'unsuspend') {
      const restoredStatus =
        existing.previousStatus && !isBlockedStatus(String(existing.previousStatus).toLowerCase())
          ? existing.previousStatus
          : 'approved';

      const patch = {
        isSuspended: false,
        isActive: true,
        dashboardDisabled: false,
        showOnWebsite: true,
        isPublished: true,
        status: restoredStatus,
        suspensionReason: '',
        unsuspendedAt: nowIso,
        updatedAt: nowIso,
      };

      await docRef.set(patch, { merge: true });
      await mirrorCandidateStatus(astrologerId, {
        isSuspended: false,
        isActive: true,
        dashboardDisabled: false,
        status: restoredStatus,
        suspensionReason: '',
        showOnWebsite: true,
        isPublished: true,
        updatedAt: nowIso,
      });

      return NextResponse.json({
        success: true,
        astrologer: normalizeAstrologerRecord(astrologerId, { ...existing, ...patch }),
      });
    }

    // 5. Toggle Featured
    if (action === 'toggle_featured') {
      const patch = {
        isFeatured: Boolean(body.isFeatured),
        updatedAt: nowIso,
      };
      await docRef.set(patch, { merge: true });
      return NextResponse.json({
        success: true,
        astrologer: normalizeAstrologerRecord(astrologerId, { ...existing, ...patch }),
      });
    }

    // 6. Approve Full-Time
    if (action === 'approve_full_time') {
      const patch = {
        isFullTimeApproved: true,
        isVerified: true,
        isSuspended: false,
        isActive: true,
        dashboardDisabled: false,
        showOnWebsite: true,
        isPublished: true,
        status: 'full_time',
        lifecycleStatus: 'full_time',
        previousStatus: 'full_time',
        updatedAt: nowIso,
      };
      await docRef.set(patch, { merge: true });
      await mirrorCandidateStatus(astrologerId, {
        isFullTimeApproved: true,
        isVerified: true,
        isSuspended: false,
        isActive: true,
        dashboardDisabled: false,
        status: 'full_time',
        lifecycleStatus: 'full_time',
        updatedAt: nowIso,
      });
      return NextResponse.json({
        success: true,
        astrologer: normalizeAstrologerRecord(astrologerId, { ...existing, ...patch }),
      });
    }

    // 7. Update Admin Stats, Pricing, Profile & Reviews
    if (action === 'update_profile') {
      const updates = body.updates || {};
      const rate =
        updates.amount !== undefined ? Math.max(1, Number(updates.amount) || 20) : undefined;
      const patch: Record<string, any> = {
        updatedAt: nowIso,
      };

      if (rate !== undefined) {
        patch.amount = rate;
        patch.pricePerMin = rate;
        patch.pricePerMinute = rate;
      }
      if (updates.rating !== undefined) patch.rating = Number(updates.rating) || 4.9;
      if (updates.reviewsCount !== undefined) {
        const rc = Number(updates.reviewsCount) || 0;
        patch.reviewsCount = rc;
        patch.reviews = rc;
      }
      if (updates.consultations !== undefined) {
        const cc = Number(updates.consultations) || 0;
        patch.consultations = cc;
        patch.totalConsultations = cc;
      }
      if (updates.badge !== undefined) patch.badge = String(updates.badge);
      if (Array.isArray(updates.reviewsList)) patch.reviewsList = updates.reviewsList;
      if (updates.name !== undefined && String(updates.name).trim()) {
        patch.name = String(updates.name).trim();
      }
      if (updates.phone !== undefined) patch.phone = String(updates.phone).trim();
      if (updates.email !== undefined) patch.email = String(updates.email).trim();
      if (updates.specialty !== undefined) {
        const list = String(updates.specialty)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        patch.skills = list.join(', ');
        patch.specialisations = list;
        if (list[0]) patch.speciality = list[0];
      }
      if (updates.languages !== undefined) patch.languages = String(updates.languages).trim();
      if (updates.experience !== undefined) {
        const exp = Number(updates.experience) || 0;
        patch.experienceYears = exp;
        patch.experience = `${exp} Years`;
      }
      if (updates.city !== undefined) patch.city = String(updates.city).trim();
      if (updates.bio !== undefined) {
        patch.bio = String(updates.bio).trim();
        patch.about = String(updates.bio).trim();
      }
      if (updates.showOnWebsite !== undefined) {
        patch.showOnWebsite = Boolean(updates.showOnWebsite);
        patch.isPublished = Boolean(updates.showOnWebsite);
      }

      await docRef.set(patch, { merge: true });
      return NextResponse.json({
        success: true,
        astrologer: normalizeAstrologerRecord(astrologerId, { ...existing, ...patch }),
      });
    }

    // 8. Permanently Delete Astrologer
    if (action === 'delete_astrologer') {
      await docRef.delete();
      return NextResponse.json({ success: true, deletedId: astrologerId });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /admin/astrologers POST] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update astrologer' },
      { status: 500 }
    );
  }
}
