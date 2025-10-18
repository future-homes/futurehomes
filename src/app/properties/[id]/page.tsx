'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { propertyService } from '@/lib/propertyService';
import { Property } from '@/types/property';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'location' | 'nearby'>('overview');

  const websiteWhatsApp = '+918431373779';

  useEffect(() => {
    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      let propertyId = params.id as string;
      if (propertyId.includes('-')) {
        const parts = propertyId.split('-');
        const lastPart = parts[parts.length - 1];
        if (/^\d+$/.test(lastPart)) propertyId = lastPart;
      }
      const data = await propertyService.getPropertyById(propertyId);
      setProperty(data);
      const allProperties = await propertyService.getProperties({
        propertyType: data.propertyType,
        city: data.location.city,
      });
      setSimilarProperties(allProperties.filter(p => p.id !== data.id).slice(0, 3));
    } catch (error) {
      console.error('Error:', error);
      alert('Property not found');
      router.push('/properties');
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (property) setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    if (property) setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleWhatsAppEnquiry = () => {
    const message = encodeURIComponent(`Hi, I'm interested in: ${property?.title}\n${property?.location.address}, ${property?.location.city}\n₹${property?.price.toLocaleString()}/month`);
    window.open(`https://wa.me/${websiteWhatsApp.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: property?.title, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!property) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <div className="backdrop-blur-2xl bg-white/90 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium overflow-x-auto">
              <Link href="/" className="text-gray-500 hover:text-blue-600 transition whitespace-nowrap">Home</Link>
              <span className="text-gray-300">/</span>
              <Link href="/properties" className="text-gray-500 hover:text-blue-600 transition whitespace-nowrap">Properties</Link>
              <span className="text-gray-300">/</span>
              <span className="text-blue-600 font-bold whitespace-nowrap">{property.location.city}</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button onClick={handleShare} className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition text-sm font-semibold whitespace-nowrap">
                Share
              </button>
              <FavoriteButton propertyId={property.id} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image Gallery */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[4/3] md:aspect-[21/9]">
            <Image
              src={property.images[currentImageIndex]}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Image Navigation */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white transition flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white transition flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter & Tags */}
            <div className="absolute bottom-6 left-4 right-4 flex items-end justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                    For Rent
                  </span>
                  {property.featured && (
                    <span className="px-4 py-1.5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full uppercase tracking-wide">
                      Featured
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => setShowAllPhotos(true)}
                  className="px-5 py-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full font-bold text-sm shadow-lg transition"
                >
                  View All {property.images.length} Photos
                </button>
                <div className="px-4 py-1.5 bg-black/70 backdrop-blur-sm text-white rounded-full text-sm font-bold">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Title & Price Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                {property.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                {property.location.address}, {property.location.city}, {property.location.state}
              </p>
            </div>
            <div className="lg:text-right">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                ₹{property.price.toLocaleString()}
              </div>
              <div className="text-lg sm:text-xl text-gray-600 font-semibold">per month</div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Bedrooms', value: property.bedrooms },
              { label: 'Bathrooms', value: property.bathrooms },
              { label: 'Area', value: `${property.area} sq ft` },
              { label: 'Deposit', value: `₹${property.deposit.toLocaleString()}` },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition"
              >
                <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm sm:text-base text-gray-600 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-3xl p-2 shadow-xl border border-gray-100 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'amenities', label: 'Amenities' },
                  { id: 'location', label: 'Location' },
                  { id: 'nearby', label: 'Nearby' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3.5 rounded-2xl font-bold transition whitespace-nowrap text-sm sm:text-base ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8 md:space-y-10">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Description</h2>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Property Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Property Type', value: property.propertyType },
                        { label: 'Furnishing', value: property.furnishing },
                        { label: 'Available From', value: new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                        { label: 'Preferred For', value: property.tenantType?.join(', ') || 'Anyone' },
                        { label: 'Parking', value: 'Available' },
                        { label: 'Facing', value: 'East' },
                      ].map((detail, idx) => (
                        <div key={idx} className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                          <div className="text-sm font-semibold text-gray-600 mb-2">{detail.label}</div>
                          <div className="text-lg font-bold text-gray-900 capitalize">{detail.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities Tab */}
              {activeTab === 'amenities' && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Available Amenities</h2>
                  {property.amenities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {property.amenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="p-4 md:p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 font-bold text-gray-900"
                        >
                          {amenity}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No amenities listed</p>
                  )}
                </div>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Location Map</h2>
                  <div className="rounded-3xl overflow-hidden shadow-xl border-2 border-gray-200 aspect-video md:aspect-[16/9]">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://www.google.com/maps?q=${property.location.coordinates?.lat || 12.9716},${property.location.coordinates?.lng || 77.5946}&output=embed`}
                    />
                  </div>
                  <div className="p-5 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <p className="text-base md:text-lg font-bold text-gray-900">
                      {property.location.address}, {property.location.city}, {property.location.pincode}
                    </p>
                  </div>
                </div>
              )}

              {/* Nearby Tab */}
              {activeTab === 'nearby' && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Nearby Places</h2>
                  {property.nearbyPlaces && Object.values(property.nearbyPlaces).some(arr => arr && arr.length > 0) ? (
                    <div className="space-y-6">
                      {property.nearbyPlaces.bus_stops && property.nearbyPlaces.bus_stops.length > 0 && (
                        <div>
                          <h3 className="font-bold text-lg md:text-xl mb-3 text-gray-900">Bus Stations</h3>
                          <div className="space-y-2">
                            {property.nearbyPlaces.bus_stops.map((stop, idx) => (
                              <div key={idx} className="p-4 md:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <span className="font-semibold text-gray-900">{stop.name}</span>
                                <span className="text-blue-600 font-bold">{stop.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {property.nearbyPlaces.schools && property.nearbyPlaces.schools.length > 0 && (
                        <div>
                          <h3 className="font-bold text-lg md:text-xl mb-3 text-gray-900">Schools</h3>
                          <div className="space-y-2">
                            {property.nearbyPlaces.schools.map((school, idx) => (
                              <div key={idx} className="p-4 md:p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <span className="font-semibold text-gray-900">{school.name}</span>
                                <span className="text-green-600 font-bold">{school.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {property.nearbyPlaces.hospitals && property.nearbyPlaces.hospitals.length > 0 && (
                        <div>
                          <h3 className="font-bold text-lg md:text-xl mb-3 text-gray-900">Hospitals</h3>
                          <div className="space-y-2">
                            {property.nearbyPlaces.hospitals.map((hospital, idx) => (
                              <div key={idx} className="p-4 md:p-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <span className="font-semibold text-gray-900">{hospital.name}</span>
                                <span className="text-red-600 font-bold">{hospital.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No nearby places information available</p>
                  )}
                </div>
              )}
            </div>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Similar Properties</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {similarProperties.map((prop) => (
                    <Link key={prop.id} href={`/properties/${prop.slug || prop.id}`} className="group">
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 shadow-md">
                        <Image
                          src={prop.images[0]}
                          alt={prop.title}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-500"
                        />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition">
                        {prop.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{prop.location.city}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-blue-600">₹{prop.price.toLocaleString()}/mo</span>
                        <span className="text-sm text-gray-600">{prop.area} sqft</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Contact (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-2xl border border-blue-100">
                <h3 className="text-2xl font-black text-gray-900 mb-6">Contact Owner</h3>
                <div className="mb-6 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Property Owner</div>
                  <div className="text-xl font-black text-gray-900">{property.contactDetails.name}</div>
                </div>
                <button
                  onClick={handleWhatsAppEnquiry}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black rounded-2xl hover:shadow-2xl transition mb-4 text-lg"
                >
                  WhatsApp Now
                </button>
                <a
                  href={`tel:${property.contactDetails.phone}`}
                  className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl hover:shadow-2xl transition text-center text-lg"
                >
                  Call Owner
                </a>
                <div className="mt-6 p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                  <p className="text-sm font-black text-orange-900 mb-2">Safety Tips</p>
                  <ul className="text-xs text-orange-800 space-y-1 font-semibold">
                    <li>• Never pay without visiting</li>
                    <li>• Verify documents</li>
                    <li>• Meet at property</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-100 rounded-2xl p-6">
                <div className="text-sm text-gray-600 mb-1">Posted On</div>
                <div className="font-bold text-gray-900">
                  {new Date(property.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Photos Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-black py-6 z-10">
                <h2 className="text-white text-2xl md:text-3xl font-black">All Photos ({property.images.length})</h2>
                <button
                  onClick={() => setShowAllPhotos(false)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-white font-bold backdrop-blur-lg transition"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-8">
                {property.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
                    <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 backdrop-blur-2xl bg-white/95 border-t border-gray-200 shadow-2xl p-4 z-50">
        <div className="flex gap-3">
          <a
            href={`tel:${property.contactDetails.phone}`}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl text-center shadow-xl"
          >
            Call Owner
          </a>
          <button
            onClick={handleWhatsAppEnquiry}
            className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black rounded-2xl shadow-xl"
          >
            WhatsApp
          </button>
        </div>
      </div>
      <div className="lg:hidden h-24"></div>
    </div>
  );
}
