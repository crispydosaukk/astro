import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getHomepageContent } from '@/lib/cms';
import { getSettings } from '@/lib/settings';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userEmail, type, details, serviceId } = body;

    // Fetch dynamic settings
    const settings = await getSettings();
    const secretKey = settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

    const stripe = new Stripe(secretKey, {
      apiVersion: '2026-07-29.dahlia' as any,
    });

    // Fetch the specific remedy price from CMS
    const cmsContent = await getHomepageContent();
    let price = 8; // Default fallback
    if (serviceId && cmsContent?.services?.items) {
      const item = cmsContent.services.items.find(i => i.id === serviceId);
      if (item && item.price !== undefined) {
        price = item.price;
      }
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail !== 'demo@example.com' ? userEmail : undefined,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: type || 'AstroParihar Premium Report',
              description: `Personalized report for ${details?.dob} | ${details?.place}`,
              images: ['https://astroparihar.com/AstroParihar_Logo.png'], // Placeholder image
            },
            unit_amount: Math.round(price * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/`,
      metadata: {
        userId: userId || 'demo-user-id',
        userEmail: userEmail || 'demo@example.com',
        type: type || 'Custom Report',
        details: JSON.stringify(details),
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe session error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
