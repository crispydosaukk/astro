import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GOOGLE_PLACES_KEY = 
  process.env.GOOGLE_PLACES_API_KEY || 
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
  '';

export interface LocationPrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  source: 'google' | 'curated';
}

// Curated high-priority Indian cities, spiritual centers & regional hubs
const CURATED_INDIAN_LOCATIONS: Array<{ mainText: string; state: string }> = [
  { mainText: 'Hyderabad', state: 'Telangana, India' },
  { mainText: 'Secunderabad', state: 'Telangana, India' },
  { mainText: 'Warangal', state: 'Telangana, India' },
  { mainText: 'Bengaluru', state: 'Karnataka, India' },
  { mainText: 'Mysuru', state: 'Karnataka, India' },
  { mainText: 'Mangaluru', state: 'Karnataka, India' },
  { mainText: 'Hubballi', state: 'Karnataka, India' },
  { mainText: 'Chennai', state: 'Tamil Nadu, India' },
  { mainText: 'Coimbatore', state: 'Tamil Nadu, India' },
  { mainText: 'Madurai', state: 'Tamil Nadu, India' },
  { mainText: 'Thanjavur', state: 'Tamil Nadu, India' },
  { mainText: 'Tiruchirappalli', state: 'Tamil Nadu, India' },
  { mainText: 'Salem', state: 'Tamil Nadu, India' },
  { mainText: 'Kumbakonam', state: 'Tamil Nadu, India' },
  { mainText: 'Mumbai', state: 'Maharashtra, India' },
  { mainText: 'Pune', state: 'Maharashtra, India' },
  { mainText: 'Nagpur', state: 'Maharashtra, India' },
  { mainText: 'Nashik', state: 'Maharashtra, India' },
  { mainText: 'Thane', state: 'Maharashtra, India' },
  { mainText: 'Navi Mumbai', state: 'Maharashtra, India' },
  { mainText: 'Shirdi', state: 'Maharashtra, India' },
  { mainText: 'Kolhapur', state: 'Maharashtra, India' },
  { mainText: 'New Delhi', state: 'Delhi, India' },
  { mainText: 'Noida', state: 'Uttar Pradesh, India' },
  { mainText: 'Greater Noida', state: 'Uttar Pradesh, India' },
  { mainText: 'Gurugram', state: 'Haryana, India' },
  { mainText: 'Faridabad', state: 'Haryana, India' },
  { mainText: 'Ghaziabad', state: 'Uttar Pradesh, India' },
  { mainText: 'Varanasi', state: 'Uttar Pradesh, India' },
  { mainText: 'Ayodhya', state: 'Uttar Pradesh, India' },
  { mainText: 'Prayagraj', state: 'Uttar Pradesh, India' },
  { mainText: 'Lucknow', state: 'Uttar Pradesh, India' },
  { mainText: 'Kanpur', state: 'Uttar Pradesh, India' },
  { mainText: 'Mathura', state: 'Uttar Pradesh, India' },
  { mainText: 'Vrindavan', state: 'Uttar Pradesh, India' },
  { mainText: 'Haridwar', state: 'Uttarakhand, India' },
  { mainText: 'Rishikesh', state: 'Uttarakhand, India' },
  { mainText: 'Dehradun', state: 'Uttarakhand, India' },
  { mainText: 'Ujjain', state: 'Madhya Pradesh, India' },
  { mainText: 'Indore', state: 'Madhya Pradesh, India' },
  { mainText: 'Bhopal', state: 'Madhya Pradesh, India' },
  { mainText: 'Jabalpur', state: 'Madhya Pradesh, India' },
  { mainText: 'Omkareshwar', state: 'Madhya Pradesh, India' },
  { mainText: 'Jaipur', state: 'Rajasthan, India' },
  { mainText: 'Jodhpur', state: 'Rajasthan, India' },
  { mainText: 'Udaipur', state: 'Rajasthan, India' },
  { mainText: 'Pushkar', state: 'Rajasthan, India' },
  { mainText: 'Ajmer', state: 'Rajasthan, India' },
  { mainText: 'Kolkata', state: 'West Bengal, India' },
  { mainText: 'Howrah', state: 'West Bengal, India' },
  { mainText: 'Siliguri', state: 'West Bengal, India' },
  { mainText: 'Ahmedabad', state: 'Gujarat, India' },
  { mainText: 'Surat', state: 'Gujarat, India' },
  { mainText: 'Vadodara', state: 'Gujarat, India' },
  { mainText: 'Rajkot', state: 'Gujarat, India' },
  { mainText: 'Dwarka', state: 'Gujarat, India' },
  { mainText: 'Somnath', state: 'Gujarat, India' },
  { mainText: 'Kochi', state: 'Kerala, India' },
  { mainText: 'Thiruvananthapuram', state: 'Kerala, India' },
  { mainText: 'Kozhikode', state: 'Kerala, India' },
  { mainText: 'Thrissur', state: 'Kerala, India' },
  { mainText: 'Visakhapatnam', state: 'Andhra Pradesh, India' },
  { mainText: 'Vijayawada', state: 'Andhra Pradesh, India' },
  { mainText: 'Tirupati', state: 'Andhra Pradesh, India' },
  { mainText: 'Guntur', state: 'Andhra Pradesh, India' },
  { mainText: 'Nellore', state: 'Andhra Pradesh, India' },
  { mainText: 'Bhubaneswar', state: 'Odisha, India' },
  { mainText: 'Cuttack', state: 'Odisha, India' },
  { mainText: 'Puri', state: 'Odisha, India' },
  { mainText: 'Patna', state: 'Bihar, India' },
  { mainText: 'Gaya', state: 'Bihar, India' },
  { mainText: 'Ranchi', state: 'Jharkhand, India' },
  { mainText: 'Jamshedpur', state: 'Jharkhand, India' },
  { mainText: 'Guwahati', state: 'Assam, India' },
  { mainText: 'Chandigarh', state: 'Punjab & Haryana, India' },
  { mainText: 'Amritsar', state: 'Punjab, India' },
  { mainText: 'Ludhiana', state: 'Punjab, India' },
  { mainText: 'Shimla', state: 'Himachal Pradesh, India' },
  { mainText: 'Jammu', state: 'Jammu and Kashmir, India' },
  { mainText: 'Srinagar', state: 'Jammu and Kashmir, India' },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('placeId');

    // Handle Place Details lookup to resolve exact coordinates silently
    if (placeId) {
      if (GOOGLE_PLACES_KEY && !placeId.startsWith('curated-')) {
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
            placeId
          )}&fields=geometry,formatted_address,name&key=${GOOGLE_PLACES_KEY}`;
          const res = await fetch(detailsUrl);
          const data = await res.json();
          if (data.status === 'OK' && data.result?.geometry?.location) {
            return NextResponse.json({
              success: true,
              lat: data.result.geometry.location.lat.toString(),
              lon: data.result.geometry.location.lng.toString(),
              formattedAddress: data.result.formatted_address || data.result.name,
            });
          }
        } catch (err) {
          console.warn('Google Place Details lookup error:', err);
        }
      }
      return NextResponse.json({ success: true, placeId });
    }

    const query = (searchParams.get('query') || searchParams.get('q') || '').trim();

    if (!query) {
      return NextResponse.json({ success: true, predictions: [] });
    }

    const countryParam = searchParams.get('country');
    const predictions: LocationPrediction[] = [];
    const seenNames = new Set<string>();

    // 1. Query Google Places Autocomplete API
    if (GOOGLE_PLACES_KEY) {
      try {
        const countryFilter = countryParam ? `&components=country:${countryParam}` : '';
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&types=geocode${countryFilter}&key=${GOOGLE_PLACES_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && Array.isArray(data.predictions)) {
          for (const p of data.predictions) {
            const mainText = p.structured_formatting?.main_text || p.description.split(',')[0].trim();
            const secondaryText = p.structured_formatting?.secondary_text || '';
            const key = (mainText + ' ' + secondaryText).toLowerCase();

            if (!seenNames.has(key)) {
              seenNames.add(key);
              predictions.push({
                placeId: p.place_id,
                description: p.description,
                mainText,
                secondaryText,
                source: 'google',
              });
            }
          }
        }
      } catch (err) {
        console.warn('Google Places Autocomplete API fetch error:', err);
      }
    }

    // 2. Curated matching (adds instant, high-speed recommendations)
    const qLower = query.toLowerCase();
    const curatedMatches = CURATED_INDIAN_LOCATIONS.filter(item =>
      item.mainText.toLowerCase().includes(qLower) || item.state.toLowerCase().includes(qLower)
    ).sort((a, b) => {
      const aStarts = a.mainText.toLowerCase().startsWith(qLower);
      const bStarts = b.mainText.toLowerCase().startsWith(qLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.mainText.localeCompare(b.mainText);
    });

    for (const item of curatedMatches) {
      const key = (item.mainText + ' ' + item.state).toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        predictions.push({
          placeId: `curated-${item.mainText.toLowerCase()}`,
          description: `${item.mainText}, ${item.state}`,
          mainText: item.mainText,
          secondaryText: item.state,
          source: 'curated',
        });
      }
      if (predictions.length >= 10) break;
    }

    return NextResponse.json({
      success: true,
      query,
      predictions: predictions.slice(0, 10),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
