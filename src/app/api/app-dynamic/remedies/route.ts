import { NextRequest, NextResponse } from 'next/server';
import {
  ASTROPARIHAR_HOMAMS,
  ASTROPARIHAR_MANTRAS,
  generate48DayRemedyProtocol,
} from '@/lib/vedicRemediesEngine';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') || 'Career & Financial Growth';

    const protocol = generate48DayRemedyProtocol({ domain, concern: domain });

    // Ashta-Digbandhana (8 Directions)
    const ashtaDirections = [
      { direction: 'East (Indra)', deity: 'Surya & Indra', planet: 'Sun', element: 'Fire', remedy: 'Surya Arghya at dawn & Gayatri Mantra', purpose: 'Leadership, Vitality, Career Glory', icon: 'wb_sunny' },
      { direction: 'South-East (Agni)', deity: 'Agni Bhagavan', planet: 'Venus', element: 'Fire', remedy: 'Lighting ghee lamp & Shukra Mantra', purpose: 'Art, Prosperity, Marital Happiness', icon: 'local_fire_department' },
      { direction: 'South (Yama)', deity: 'Yama & Bhairava', planet: 'Mars', element: 'Earth', remedy: 'Mangal Kavacham & Coral offering', purpose: 'Courage, Debt Removal, Land Prosperity', icon: 'shield' },
      { direction: 'South-West (Nirriti)', deity: 'Nirriti & Ganesha', planet: 'Rahu', element: 'Earth', remedy: 'Rahu Shanti Puja & Durva grass offering', purpose: 'Removing Sudden Obstacles & Illusions', icon: 'all_inclusive' },
      { direction: 'West (Varuna)', deity: 'Varuna Deva', planet: 'Saturn', element: 'Water', remedy: 'Shani Stotra, Mustard oil deepa on Saturday', purpose: 'Discipline, Longevity, Sade Sati Relief', icon: 'water' },
      { direction: 'North-West (Vayu)', deity: 'Vayu & Hanuman', planet: 'Moon', element: 'Air', remedy: 'Hanuman Chalisa & Chandra Japa', purpose: 'Mental Peace, Travel, Mind Stability', icon: 'air' },
      { direction: 'North (Kubera)', deity: 'Kubera & Lakshmi', planet: 'Mercury', element: 'Earth', remedy: 'Sri Suktam recitation & Emerald wearing', purpose: 'Business Growth, Liquid Wealth, Commerce', icon: 'account_balance' },
      { direction: 'North-East (Ishanya)', deity: 'Shiva & Brihaspati', planet: 'Jupiter', element: 'Water/Ether', remedy: 'Maha Mrityunjaya Japa & Yellow sapphire', purpose: 'Divine Grace, Wisdom, Moksha & Children', icon: 'self_improvement' },
    ];

    return NextResponse.json({
      success: true,
      ashtaDirections,
      homams: ASTROPARIHAR_HOMAMS,
      mantras: ASTROPARIHAR_MANTRAS,
      protocol,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error fetching remedies in app-dynamic:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch remedies',
    }, { status: 500, headers: corsHeaders });
  }
}
