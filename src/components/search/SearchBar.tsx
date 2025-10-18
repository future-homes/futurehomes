'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface LocationSuggestion {
  name: string;
  type: 'city' | 'area' | 'landmark';
}

const KERALA_LOCATIONS = [
  // Major Cities
  { name: 'Kochi', type: 'city' as const },
  { name: 'Trivandrum', type: 'city' as const },
  { name: 'Kozhikode', type: 'city' as const },
  { name: 'Thrissur', type: 'city' as const },
  { name: 'Kottayam', type: 'city' as const },
  { name: 'Kollam', type: 'city' as const },
  
  // Popular Areas in Kochi
  { name: 'Marine Drive, Kochi', type: 'area' as const },
  { name: 'Kakkanad, Kochi', type: 'area' as const },
  { name: 'Edappally, Kochi', type: 'area' as const },
  { name: 'Palarivattom, Kochi', type: 'area' as const },
  { name: 'MG Road, Kochi', type: 'area' as const },
  { name: 'Fort Kochi', type: 'area' as const },
  { name: 'Kaloor, Kochi', type: 'area' as const },
  
  // Landmarks
  { name: 'Near Lulu Mall', type: 'landmark' as const },
  { name: 'Near Infopark', type: 'landmark' as const },
  { name: 'Near Smart City', type: 'landmark' as const },
];

export default function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Filter suggestions based on input
  useEffect(() => {
    if (location.length > 0) {
      const filtered = KERALA_LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(location.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [location]);

  // Get user's current location
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setLocation('Near Me');
        setLoadingLocation(false);
        
        // Search immediately with coordinates
        handleSearchWithCoords(coords);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not get your location. Please enable location services.');
        setLoadingLocation(false);
      }
    );
  };

  const handleSearchWithCoords = (coords: { lat: number; lng: number }) => {
    const params = new URLSearchParams();
    params.append('lat', coords.lat.toString());
    params.append('lng', coords.lng.toString());
    params.append('radius', '10'); // 10km radius
    
    if (propertyType) params.append('type', propertyType);
    if (priceRange) params.append('price', priceRange);
    
    router.push(`/search?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If "Near Me" search with coordinates
    if (userLocation) {
      handleSearchWithCoords(userLocation);
      return;
    }

    // Regular location search
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (propertyType) params.append('type', propertyType);
    if (priceRange) params.append('price', priceRange);
    
    router.push(`/search?${params.toString()}`);
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.name);
    setShowSuggestions(false);
    setUserLocation(null); // Clear coordinates when selecting text location
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location Input with Autocomplete */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Location (e.g., Kochi, Marine Drive)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            
            {/* Near Me Button */}
            <button
              type="button"
              onClick={handleNearMe}
              disabled={loadingLocation}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition"
              title="Find properties near me"
            >
              {loadingLocation ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition flex items-center gap-3"
                >
                  <span className="text-gray-500">
                    {suggestion.type === 'city' ? '🏙️' : 
                     suggestion.type === 'area' ? '📍' : 
                     '🏢'}
                  </span>
                  <div>
                    <div className="text-gray-900 font-medium">{suggestion.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Type */}
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Property Type</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="commercial">Commercial</option>
        </select>

        {/* Price Range */}
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Price Range</option>
          <option value="0-10000">Under ₹10,000</option>
          <option value="10000-20000">₹10,000 - ₹20,000</option>
          <option value="20000-50000">₹20,000 - ₹50,000</option>
          <option value="50000+">Above ₹50,000</option>
        </select>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
}
