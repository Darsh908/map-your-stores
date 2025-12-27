// Simple geocoding utility using OpenStreetMap Nominatim (free)
// For production, you'd want to use Google Geocoding API for reliability

interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'StoreLocatorMVP/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding request failed:', response.status);
      return null;
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

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'StoreLocatorMVP/1.0',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

// Batch geocode addresses with rate limiting (1 request per second for Nominatim)
export async function batchGeocodeAddresses(
  addresses: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<(GeocodingResult | null)[]> {
  const results: (GeocodingResult | null)[] = [];

  for (let i = 0; i < addresses.length; i++) {
    const result = await geocodeAddress(addresses[i]);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, addresses.length);
    }

    // Rate limit: wait 1 second between requests for Nominatim
    if (i < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
