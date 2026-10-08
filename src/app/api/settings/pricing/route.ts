import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings, getPricingSettings, DEFAULT_AI_SESSION_PACKAGES, AISessionPackage } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pricing = await getPricingSettings();
    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error: any) {
    console.error('Error fetching dynamic pricing settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch pricing settings',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      newUserTrialMinutes,
      aiChatPricePerMinute,
      aiChatPricePerPrompt,
      aiVoicePricePerMinute,
      aiSessionPackages,
      humanAstrologerMinRate,
      humanAstrologerMaxRate,
      humanAstrologerDefaultRate,
      pariharaPlanPrice,
      pariharaPlanTitle,
      pariharaPlanDescription,
      pariharaPlanEnabled,
    } = body;

    const current = await getSettings();

    // Sanitize session packages if provided
    let sanitizedPackages: AISessionPackage[] = current.aiSessionPackages || DEFAULT_AI_SESSION_PACKAGES;
    if (Array.isArray(aiSessionPackages) && aiSessionPackages.length > 0) {
      sanitizedPackages = aiSessionPackages.map((pkg: any, idx: number) => ({
        id: pkg.id || `session-${pkg.minutes || idx + 1}`,
        minutes: Math.max(1, Number(pkg.minutes) || 15),
        price: Math.max(0, Number(pkg.price) || 0),
        label: String(pkg.label || `${pkg.minutes}-minute AI session`),
        description: String(pkg.description || ''),
        popular: Boolean(pkg.popular),
        enabled: pkg.enabled !== false,
      }));
    }

    const updatedData = {
      ...current,
      newUserTrialMinutes: newUserTrialMinutes !== undefined ? Math.max(0, Number(newUserTrialMinutes)) : (current.newUserTrialMinutes ?? 5),
      aiChatPricePerMinute: aiChatPricePerMinute !== undefined ? Math.max(0, Number(aiChatPricePerMinute)) : (current.aiChatPricePerMinute ?? 5),
      aiChatPricePerPrompt: aiChatPricePerPrompt !== undefined ? Math.max(0, Number(aiChatPricePerPrompt)) : (current.aiChatPricePerPrompt ?? 5),
      aiVoicePricePerMinute: aiVoicePricePerMinute !== undefined ? Math.max(0, Number(aiVoicePricePerMinute)) : (current.aiVoicePricePerMinute ?? 7),
      aiSessionPackages: sanitizedPackages,
      humanAstrologerMinRate: humanAstrologerMinRate !== undefined ? Math.max(1, Number(humanAstrologerMinRate)) : (current.humanAstrologerMinRate ?? 15),
      humanAstrologerMaxRate: humanAstrologerMaxRate !== undefined ? Math.max(1, Number(humanAstrologerMaxRate)) : (current.humanAstrologerMaxRate ?? 100),
      humanAstrologerDefaultRate: humanAstrologerDefaultRate !== undefined ? Math.max(1, Number(humanAstrologerDefaultRate)) : (current.humanAstrologerDefaultRate ?? 25),
      pariharaPlanPrice: pariharaPlanPrice !== undefined ? Math.max(0, Number(pariharaPlanPrice)) : (current.pariharaPlanPrice ?? 499),
      pariharaPlanTitle: pariharaPlanTitle !== undefined ? String(pariharaPlanTitle) : (current.pariharaPlanTitle || 'Generate My Complete Parihara Plan'),
      pariharaPlanDescription: pariharaPlanDescription !== undefined ? String(pariharaPlanDescription) : (current.pariharaPlanDescription || ''),
      pariharaPlanEnabled: pariharaPlanEnabled !== undefined ? Boolean(pariharaPlanEnabled) : (current.pariharaPlanEnabled !== false),
    };

    await updateSettings(updatedData);

    return NextResponse.json({
      success: true,
      message: 'Pricing and consultation plans successfully updated',
      pricing: await getPricingSettings(),
    });
  } catch (error: any) {
    console.error('Error updating dynamic pricing settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update pricing settings',
      },
      { status: 500 }
    );
  }
}
