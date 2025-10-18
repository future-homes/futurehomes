'use client'

import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  defaultCenter?: { lat: number; lng: number };
}

export default function MapPicker({ onLocationSelect, defaultCenter }: MapPickerProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);

  useEffect(() => {
    // Initialize map
    const center = defaultCenter || { lat: 10.8505, lng: 76.2711 }; // Kerala center
    
    const mapInstance = L.map('map-picker').setView([center.lat, center.lng], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    // Custom marker icon
    const customIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41],
    });

    // Add click handler
    mapInstance.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Remove existing marker
      if (marker) {
        mapInstance.removeLayer(marker);
      }

      // Add new marker
      const newMarker = L.marker([lat, lng], { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup('Selected Location')
        .openPopup();

      setMarker(newMarker);
      onLocationSelect({ lat, lng });
    });

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  return (
    <div className="relative">
      <div id="map-picker" className="h-96 rounded-lg border-2 border-gray-300 z-0"></div>
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg z-10">
        <p className="text-sm font-semibold text-gray-900">📍 Click on the map to pin your property location</p>
      </div>
    </div>
  );
}
