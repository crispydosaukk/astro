import { NextRequest, NextResponse } from 'next/server';
import {
  deleteNotificationById,
  getAdminNotificationOverview,
  getCustomerNotifications,
  sendDynamicNotification,
  updateUserNotificationState,
  NotificationAudience,
  NotificationCategory,
  NotificationDeliveryMode,
  NotificationPriority,
} from '@/lib/notificationService';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    if (mode === 'admin') {
      const overview = await getAdminNotificationOverview();
      return NextResponse.json({ success: true, ...overview }, { headers: corsHeaders });
    }

    const uid = searchParams.get('uid') || undefined;
    const phone = searchParams.get('phone') || undefined;
    const result = await getCustomerNotifications(uid, phone);
    return NextResponse.json({ success: true, ...result }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[API /notifications GET] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to load notifications',
        notifications: [],
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = String(body?.title || '').trim();
    const messageBody = String(body?.body || '').trim();

    if (!title || !messageBody) {
      return NextResponse.json(
        { success: false, error: 'Title and message body are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const audience: NotificationAudience = body?.audience === 'specific' ? 'specific' : 'all';
    const recipientUids: string[] = Array.isArray(body?.recipientUids) ? body.recipientUids : [];
    const recipientNames: string[] = Array.isArray(body?.recipientNames) ? body.recipientNames : [];

    if (audience === 'specific' && recipientUids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one target customer' },
        { status: 400, headers: corsHeaders }
      );
    }

    const validCategories: NotificationCategory[] = [
      'horoscope',
      'panchang',
      'consultation',
      'offers',
      'remedies',
      'system',
    ];
    const category: NotificationCategory = validCategories.includes(body?.category)
      ? body.category
      : 'system';

    const priority: NotificationPriority = body?.priority === 'normal' ? 'normal' : 'high';
    const deliveryMode: NotificationDeliveryMode =
      body?.deliveryMode === 'push_only' || body?.deliveryMode === 'inapp_only'
        ? body.deliveryMode
        : 'push_and_inapp';

    const notification = await sendDynamicNotification({
      title,
      subtitle: typeof body?.subtitle === 'string' ? body.subtitle : undefined,
      body: messageBody,
      ctaText: typeof body?.ctaText === 'string' ? body.ctaText : undefined,
      deliveryMode,
      category,
      audience,
      recipientUids,
      recipientNames,
      imageUrl: body?.imageUrl || undefined,
      actionRoute: body?.actionRoute || '/notifications-screen',
      priority,
      sentBy: body?.sentBy || 'Admin',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Notification sent successfully',
        notification,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[API /notifications POST] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send notification' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const uid = String(body?.uid || '').trim();
    const action = body?.action;

    if (!uid || !['markRead', 'markAllRead', 'delete', 'clearAll'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'uid and valid action are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const state = await updateUserNotificationState({
      uid,
      action,
      notificationId: body?.notificationId,
      notificationIds: body?.notificationIds,
    });

    return NextResponse.json({ success: true, ...state }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[API /notifications PATCH] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update notification state' },
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
        { success: false, error: 'Notification id is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    await deleteNotificationById(id);
    return NextResponse.json(
      { success: true, message: 'Notification deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[API /notifications DELETE] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete notification' },
      { status: 500, headers: corsHeaders }
    );
  }
}
