// 100% Free - No API key needed - Uses OpenStreetMap
interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(
  address: string,
  city: string,
  state: string = 'Kerala',
  country: string = 'India'
): Promise<GeocodingResult | null> {
  try {
    // Construct full address
    const fullAddress = `${address}, ${city}, ${state}, ${country}`;
    
    // Call OpenStreetMap Nominatim API (FREE)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(fullAddress)}&` +
      `format=json&` +
      `limit=1`,
      {
        headers: {
          'User-Agent': 'FutureHomes/1.0' // Required by Nominatim
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Rate limiting helper (Nominatim allows 1 req/sec)
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
