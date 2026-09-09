/**
 * Google Places API Integration for AstroParihar Astrologer Discovery
 */

const GOOGLE_PLACES_KEY = 
  process.env.GOOGLE_PLACES_API_KEY || 
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
  '';

export interface DiscoveredPlaceAstrologer {
  placeId: string;
  name: string;
  businessName: string;
  address: string;
  location: string;
  rating?: number;
  userRatingsTotal?: number;
  phone?: string;
  website?: string;
  source: 'Google Places';
  estimatedAiScore: number;
  specialisations: string[];
}

/**
 * Tests live connection to Google Places API
 */
export async function testGooglePlacesConnection(): Promise<{
  success: boolean;
  status: string;
  latencyMs: number;
  sampleCount: number;
  message: string;
}> {
  const start = Date.now();
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=astrologer+in+chennai&key=${GOOGLE_PLACES_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const latencyMs = Date.now() - start;

    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      return {
        success: true,
        status: data.status,
        latencyMs,
        sampleCount: data.results?.length || 0,
        message: `Google Places API verified active (${data.results?.length || 0} live places reachable).`,
      };
    } else {
      return {
        success: false,
        status: data.status,
        latencyMs,
        sampleCount: 0,
        message: data.error_message || `Google Places returned status: ${data.status}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      status: 'ERROR',
      latencyMs: Date.now() - start,
      sampleCount: 0,
      message: err?.message || 'Failed to connect to Google Places API',
    };
  }
}

/**
 * Searches real astrologers across Indian locations using Google Places API
 */
export async function searchAstrologersGooglePlaces(
  city: string,
  specialization: string = 'Vedic Astrology'
): Promise<DiscoveredPlaceAstrologer[]> {
  try {
    const query = `${specialization} astrologer in ${city}, India`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.results) {
      console.warn(`Google Places returned non-OK status: ${data.status} (${data.error_message || ''})`);
      return [];
    }

    return data.results.map((place: any, index: number) => {
      const rating = place.rating || 4.2;
      const reviews = place.user_ratings_total || 15;
      // Calculate realistic starting AI score based on rating and reviews
      const score = Math.min(98, Math.max(72, Math.round((rating / 5) * 80 + Math.min(reviews, 100) * 0.18)));

      return {
        placeId: place.place_id || `gplaces-${index}-${Date.now()}`,
        name: place.name?.replace(/(Astrologer|Jyotish|Kendra|Centre|Center|Consultant|Services)/gi, '').trim() || place.name,
        businessName: place.name,
        address: place.formatted_address || `${city}, India`,
        location: city,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        source: 'Google Places',
        estimatedAiScore: score,
        specialisations: [specialization, 'Vedic'],
      };
    });
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    return [];
  }
}
