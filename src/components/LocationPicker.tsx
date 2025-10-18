'use client'

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [isClient, setIsClient] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Default center: Kochi, Kerala
  const defaultCenter: [number, number] = [9.9312, 76.2673];

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLoadingAddress(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'FutureHomes/1.0'
          }
        }
      );
      const data = await response.json();
      return data.display_name || 'Address not found';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Address not found';
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    const address = await reverseGeocode(lat, lng);
    onLocationSelect(lat, lng, address);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPosition([lat, lng]);
        const address = await reverseGeocode(lat, lng);
        onLocationSelect(lat, lng, address);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not get your location. Please pin manually on the map.');
      }
    );
  };

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use My Current Location
        </button>
        {loadingAddress && (
          <div className="flex items-center text-gray-600 text-sm">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            Getting address...
          </div>
        )}
      </div>

      <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 15 : 12}
          style={{ height: '100%', width: '100%' }}
          key={position ? `${position[0]}-${position[1]}` : 'default'}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      <p className="text-sm text-gray-600">
        💡 <strong>Tip:</strong> Click anywhere on the map to pin your property's exact location, or use the button above to use your current GPS location.
      </p>

      {position && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ <strong>Location pinned:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
