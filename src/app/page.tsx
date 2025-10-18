'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { propertyService } from '@/lib/propertyService';
import { Property } from '@/types/property';
import PropertyCard from '@/components/properties/PropertyCard';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filters
  const [selectedCity, setSelectedCity] = useState('');
  const [radius, setRadius] = useState(10);
  const [propertyType, setPropertyType] = useState('');
  const [bhkType, setBhkType] = useState('');
  const [tenantType, setTenantType] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const allProperties = await propertyService.getProperties();
      
      const featured = allProperties.filter(p => p.featured).slice(0, 3);
      setFeaturedProperties(featured);

      const recent = allProperties.slice(0, 6);
      setRecentProperties(recent);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchNearMe = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          const params = new URLSearchParams();
          params.set('lat', latitude.toString());
          params.set('lng', longitude.toString());
          params.set('radius', radius.toString());
          if (propertyType) params.set('propertyType', propertyType);
          if (bhkType) params.set('bedrooms', bhkType);
          if (tenantType) params.set('tenant', tenantType);
          
          router.push(`/search?${params.toString()}`);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Please enable location access to search nearby properties');
          setLocationLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setLocationLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery);
    if (selectedCity) params.set('city', selectedCity);
    if (propertyType) params.set('propertyType', propertyType);
    if (bhkType) params.set('bedrooms', bhkType);
    if (tenantType) params.set('tenant', tenantType);
    
    router.push(`/search?${params.toString()}`);
    setShowMobileFilters(false);
  };

  const cities = ['Kochi', 'Trivandrum', 'Kozhikode', 'Thrissur', 'Kottayam', 'Kollam'];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Compact Search */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NGgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEG0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Rental Home
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Premium Houses  • Verified Listings • Affordable Prices
            </p>
          </div>

          {/* Compact Search Box */}
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-4">
              {/* Main Search Row */}
              <div className="flex flex-col md:flex-row gap-3 mb-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border-2 border-gray-200 focus-within:border-blue-500 transition">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-400"
                  />
                </div>

                <div className="flex gap-2">
                  {/* Mobile Filter Button - Only visible on mobile/tablet */}
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className={`lg:hidden flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition ${
                      showMobileFilters 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filters
                  </button>

                  <button
  type="button"
  onClick={handleSearchNearMe}
  disabled={locationLoading}
  className="flex-1 md:flex-initial px-1.5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
>
  {locationLoading ? (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  ) : (
    <>
      {/* Icon - Only show on desktop */}
      <svg className="w-5 h-5 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      </svg>
      {/* Text - Always show */}
      <span>Near Me</span>
    </>
  )}
</button>


                  <button
                    type="submit"
                    className="flex-1 md:flex-initial px-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Desktop Filters - Always visible on desktop */}
              <div className="hidden lg:grid grid-cols-5 gap-2">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                </select>

                <select
                  value={bhkType}
                  onChange={(e) => setBhkType(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">BHK Type</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>

                <select
                  value={tenantType}
                  onChange={(e) => setTenantType(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Preferred For</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                </select>

                <select
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="15">Within 15 km</option>
                  <option value="20">Within 20 km</option>
                  <option value="30">Within 30 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              </div>

              {/* Mobile/Tablet Filters - Collapsible */}
              {showMobileFilters && (
                <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>

                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Property Type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                  </select>

                  <select
                    value={bhkType}
                    onChange={(e) => setBhkType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">BHK Type</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>

                  <select
                    value={tenantType}
                    onChange={(e) => setTenantType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Preferred For</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                  </select>

                  <select
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="15">Within 15 km</option>
                    <option value="20">Within 20 km</option>
                    <option value="30">Within 30 km</option>
                    <option value="50">Within 50 km</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity('');
                      setPropertyType('');
                      setBhkType('');
                      setTenantType('');
                      setRadius(10);
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </form>

            {/* Popular Cities */}
            <div className="mt-6 text-center">
              <p className="text-gray-300 text-sm mb-3">Popular Cities</p>
              <div className="flex flex-wrap justify-center gap-2">
                {cities.map(city => (
                  <Link
                    key={city}
                    href={`/search?city=${city}`}
                    className="px-4 py-1.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-sm rounded-full transition border border-white/20"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-gray-300 text-xs">Properties</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-gray-300 text-xs">Locations</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold mb-1">1K+</div>
              <div className="text-gray-300 text-xs">Happy Users</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-gray-300 text-xs">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Keep all other sections the same - Featured, Why Choose Us, Recent Properties, CTA */}
      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-semibold mb-4 text-sm">
                ⭐ Featured Properties
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Handpicked for You
              </h2>
              <p className="text-lg text-gray-600">
                Premium properties verified by our experts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why Choose Future Homes?
            </h2>
            <p className="text-lg text-gray-600">
              India's most trusted platform for rental properties
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Listings</h3>
              <p className="text-gray-600 text-sm">
                Every property verified for authenticity
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Near Me Search</h3>
              <p className="text-gray-600 text-sm">
                Find properties closest to you
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Response</h3>
              <p className="text-gray-600 text-sm">
                Quick replies via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Properties */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Recently Added
              </h2>
              <p className="text-lg text-gray-600">
                Fresh listings updated daily
              </p>
            </div>
            <Link
              href="/properties"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              View All
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  View All Properties
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-xl text-gray-600 mb-4">No properties available yet</p>
              <Link
                href="/properties/upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                List First Property
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of happy customers across Kerala
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition shadow-lg"
            >
              Browse Properties
            </Link>
            <Link
              href="/properties/upload"
              className="px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition shadow-lg"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
