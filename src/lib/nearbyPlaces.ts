interface Coordinates {
  lat: number;
  lng: number;
}

interface NearbyPlace {
  name: string;
  distance: string;
  time?: string;
}

interface NearbyPlaces {
  bus_stops: NearbyPlace[];
  schools: NearbyPlace[];
  hospitals: NearbyPlace[];
  malls: NearbyPlace[];
  restaurants: NearbyPlace[];
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Estimate travel time
function estimateTravelTime(distanceKm: number): string {
  if (distanceKm < 1) {
    const minutes = Math.round((distanceKm / 5) * 60);
    return `${minutes} min walk`;
  } else {
    const minutes = Math.round((distanceKm / 30) * 60);
    return `${minutes} min drive`;
  }
}

// Fetch nearby places using Overpass API (OpenStreetMap)
export async function fetchNearbyPlaces(coordinates: Coordinates): Promise<NearbyPlaces | null> {
  console.log('🔍 Fetching nearby places for:', coordinates);
  
  try {
    const radius = 3000; // 3km radius (increased for better results)
    const { lat, lng } = coordinates;

    const results: NearbyPlaces = {
      bus_stops: [],
      schools: [],
      hospitals: [],
      malls: [],
      restaurants: [],
    };

    // Simplified queries for better compatibility
    const queries = [
      {
        category: 'bus_stops',
        query: `[out:json][timeout:25];(node["highway"="bus_stop"](around:${radius},${lat},${lng}););out body;`
      },
      {
        category: 'schools',
        query: `[out:json][timeout:25];(node["amenity"="school"](around:${radius},${lat},${lng});way["amenity"="school"](around:${radius},${lat},${lng}););out center;`
      },
      {
        category: 'hospitals',
        query: `[out:json][timeout:25];(node["amenity"="hospital"](around:${radius},${lat},${lng});node["amenity"="clinic"](around:${radius},${lat},${lng}););out body;`
      },
      {
        category: 'malls',
        query: `[out:json][timeout:25];(node["shop"="mall"](around:${radius},${lat},${lng});node["shop"="supermarket"](around:${radius},${lat},${lng}););out body;`
      },
      {
        category: 'restaurants',
        query: `[out:json][timeout:25];(node["amenity"="restaurant"](around:${radius},${lat},${lng});node["amenity"="fast_food"](around:${radius},${lat},${lng}););out body;`
      }
    ];

    // Process queries sequentially with delay to avoid rate limiting
    for (const { category, query } of queries) {
      try {
        console.log(`🔄 Fetching ${category}...`);
        
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        console.log(`📡 ${category} response status:`, response.status);

        if (!response.ok) {
          console.error(`❌ ${category} request failed:`, response.statusText);
          continue;
        }

        const data = await response.json();
        console.log(`📊 ${category} data:`, data);

        if (data.elements && data.elements.length > 0) {
          const places = data.elements
            .map((element: any) => {
              const elementLat = element.lat || element.center?.lat;
              const elementLng = element.lon || element.center?.lon;
              
              if (!elementLat || !elementLng) return null;

              const name = element.tags?.name || `${category.replace('_', ' ')} near you`;
              const distance = calculateDistance(lat, lng, elementLat, elementLng);

              return {
                name,
                distance: `${distance.toFixed(1)} km`,
                time: estimateTravelTime(distance),
              };
            })
            .filter(Boolean)
            .sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance))
            .slice(0, 5);

          results[category as keyof NearbyPlaces] = places;
          console.log(`✅ Found ${places.length} ${category}`);
        } else {
          console.log(`⚠️ No ${category} found in data`);
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Error fetching ${category}:`, error);
      }
    }

    const totalPlaces = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    console.log('🎯 Total places found:', totalPlaces);

    return results;
  } catch (error) {
    console.error('❌ Fatal error in fetchNearbyPlaces:', error);
    return null;
  }
}
