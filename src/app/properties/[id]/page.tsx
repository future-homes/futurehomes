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

  const websiteWhatsApp = '+918921324592';

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
    const propertyUrl = window.location.href;
    const message = encodeURIComponent(
      `Hi, I'm interested in: ${property?.title}\n${property?.location.address}, ${property?.location.city}\nPrice: ₹${property?.price.toLocaleString()}/month\n\nCheck this out: ${propertyUrl}`
    );
    window.open(`https://wa.me/${websiteWhatsApp.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: property?.title, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!property) return null;

  const stats = [
    { label: 'Bedrooms', value: property.bedrooms, short: 'Beds', unit: '' },
    { label: 'Bathrooms', value: property.bathrooms, short: 'Baths', unit: '' },
    { label: 'Area', value: property.area, short: 'Sqft. Area', unit: ' sqft' },
    { label: 'Deposit', value: `₹${(property.deposit / 1000).toFixed(0)}`, short: 'Deposit', unit: 'k' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20 lg:pb-0">
      {/* Mobile-Optimized Image Gallery */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="relative flex items-center justify-center min-h-[250px] sm:min-h-[350px] md:min-h-[500px] bg-black">
            <div className="relative w-full h-full flex items-center justify-center py-2 sm:py-4">
              <Image
                src={property.images[currentImageIndex]}
                alt={property.title}
                width={1200}
                height={800}
                className="max-h-[250px] sm:max-h-[350px] md:max-h-[600px] w-auto object-contain"
                priority
              />
            </div>

            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white transition flex items-center justify-center z-10"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white transition flex items-center justify-center z-10"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex items-end justify-between z-10">
              <div className="flex gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">
                  FOR RENT
                </span>
                {property.featured && (
                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-yellow-400 text-gray-900 text-[10px] sm:text-xs font-bold rounded-full shadow-lg">
                    FEATURED
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <button
                  onClick={() => setShowAllPhotos(true)}
                  className="px-2.5 py-1 sm:px-4 sm:py-1.5 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full font-semibold text-[10px] sm:text-xs shadow-lg transition"
                >
                  All {property.images.length}
                </button>
                <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                  {currentImageIndex + 1}/{property.images.length}
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation - Hidden on Mobile */}
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden lg:flex gap-2 z-10">
              {property.images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 transition ${
                    currentImageIndex === idx ? 'border-white scale-110' : 'border-white/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
              {property.images.length > 5 && (
                <button
                  onClick={() => setShowAllPhotos(true)}
                  className="w-14 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-[10px] font-bold border-2 border-white/50 hover:bg-white/30 transition"
                >
                  +{property.images.length - 5}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Mobile-Optimized Title & Price Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 mb-3 sm:mb-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 leading-tight">
                {property.title}
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-gray-600">
                {property.location.address}, {property.location.city}, {property.location.state}
              </p>
            </div>
            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-blue-600 mb-0.5">
                ₹{property.price.toLocaleString()}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-600">per month</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl text-center">
                <div className="text-base sm:text-lg md:text-xl font-black text-gray-900">
                  {String(stat.value)}{('unit' in stat && stat.unit) ? String(stat.unit) : ''}
                </div>
                <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 font-semibold mt-0.5">
                  {stat.short}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {/* Mobile-Friendly Tabs */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-lg border border-gray-100 overflow-x-auto">
              <div className="flex gap-1.5 sm:gap-2 min-w-max">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'amenities', label: 'Amenities' },
                  { id: 'location', label: 'Location' },
                  { id: 'nearby', label: 'Nearby' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold transition whitespace-nowrap text-[11px] sm:text-xs md:text-sm ${
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
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-7 shadow-lg border border-gray-100">
              {activeTab === 'overview' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Description</h2>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Property Details</h2>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {[
                        { label: 'Property Type', value: property.propertyType },
                        { label: 'Furnishing', value: property.furnishing },
                        { label: 'Available From', value: new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                        { label: 'Preferred For', value: property.tenantType?.join(', ') || 'Anyone' },
                        { label: 'Parking', value: 'Available' },
                        { label: 'Facing', value: 'East' },
                      ].map((detail, idx) => (
                        <div key={idx} className="p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg sm:rounded-xl border border-gray-200">
                          <div className="text-[9px] sm:text-[10px] font-semibold text-gray-600 mb-0.5 sm:mb-1">{detail.label}</div>
                          <div className="text-xs sm:text-sm font-bold text-gray-900 capitalize">{detail.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Available Amenities</h2>
                  {property.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {property.amenities.map((amenity) => (
                        <div key={amenity} className="p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border border-green-200 font-semibold text-gray-900 text-xs sm:text-sm">
                          {amenity}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-6 sm:py-8 text-xs sm:text-sm">No amenities listed</p>
                  )}
                </div>
              )}

              {activeTab === 'location' && (
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Location Map</h2>
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-200 aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://www.google.com/maps?q=${property.location.coordinates?.lat || 12.9716},${property.location.coordinates?.lng || 77.5946}&output=embed`}
                    />
                  </div>
                  <div className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-200">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {property.location.address}, {property.location.city}, {property.location.pincode}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'nearby' && (
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Nearby Places</h2>
                  {property.nearbyPlaces && Object.values(property.nearbyPlaces).some(arr => arr && arr.length > 0) ? (
                    <div className="space-y-3 sm:space-y-4">
                      {property.nearbyPlaces.bus_stops && property.nearbyPlaces.bus_stops.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xs sm:text-sm mb-2 text-gray-900">Bus Stations</h3>
                          <div className="space-y-1.5 sm:space-y-2">
                            {property.nearbyPlaces.bus_stops.map((stop, idx) => (
                              <div key={idx} className="p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-200 flex justify-between items-center gap-2">
                                <span className="font-medium text-gray-900 text-xs sm:text-sm flex-1 truncate">{stop.name}</span>
                                <span className="text-blue-600 font-bold text-[10px] sm:text-xs whitespace-nowrap">{stop.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {property.nearbyPlaces.schools && property.nearbyPlaces.schools.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xs sm:text-sm mb-2 text-gray-900">Schools</h3>
                          <div className="space-y-1.5 sm:space-y-2">
                            {property.nearbyPlaces.schools.map((school, idx) => (
                              <div key={idx} className="p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border border-green-200 flex justify-between items-center gap-2">
                                <span className="font-medium text-gray-900 text-xs sm:text-sm flex-1 truncate">{school.name}</span>
                                <span className="text-green-600 font-bold text-[10px] sm:text-xs whitespace-nowrap">{school.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {property.nearbyPlaces.hospitals && property.nearbyPlaces.hospitals.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xs sm:text-sm mb-2 text-gray-900">Hospitals</h3>
                          <div className="space-y-1.5 sm:space-y-2">
                            {property.nearbyPlaces.hospitals.map((hospital, idx) => (
                              <div key={idx} className="p-2 sm:p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg sm:rounded-xl border border-red-200 flex justify-between items-center gap-2">
                                <span className="font-medium text-gray-900 text-xs sm:text-sm flex-1 truncate">{hospital.name}</span>
                                <span className="text-red-600 font-bold text-[10px] sm:text-xs whitespace-nowrap">{hospital.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-6 sm:py-8 text-xs sm:text-sm">No nearby places information available</p>
                  )}
                </div>
              )}
            </div>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Similar Properties</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {similarProperties.map((prop) => (
                    <Link key={prop.id} href={`/properties/${prop.slug || prop.id}`} className="group">
                      <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden mb-2 shadow-md">
                        <Image src={prop.images[0]} alt={prop.title} fill className="object-cover group-hover:scale-110 transition duration-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition text-xs sm:text-sm">
                        {prop.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-600 mb-1">{prop.location.city}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-black text-blue-600">₹{prop.price.toLocaleString()}/mo</span>
                        <span className="text-[10px] sm:text-xs text-gray-600">{prop.area} sqft</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sidebar with Favorite Button */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Property Owner</h3>

                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppEnquiry}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </button>

                  <a
                    href={`tel:${property.contactDetails.phone}`}
                    className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-center"
                  >
                    Call Now
                  </a>

                  <button
                    onClick={handleShare}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl shadow-md text-center transition"
                  >
                    Share Property
                  </button>

                  <div className="pt-2">
                    <FavoriteButton propertyId={property.id} size="lg" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-xs text-gray-600 mb-1">Posted On</div>
                <div className="font-bold text-gray-900 text-sm mb-3">
                  {new Date(property.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="text-xs text-gray-600 mb-1">Property ID</div>
                <div className="font-mono text-xs font-bold text-gray-900">#{property.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Photos Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="min-h-screen p-3 sm:p-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-black py-3 sm:py-4 z-10">
                <h2 className="text-white text-base sm:text-lg font-bold">All Photos ({property.images.length})</h2>
                <button onClick={() => setShowAllPhotos(false)} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl text-white font-bold backdrop-blur-lg transition text-xs sm:text-sm">
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pb-6 sm:pb-8">
                {property.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden shadow-xl">
                    <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/98 border-t border-gray-200 shadow-2xl p-3 z-50 safe-bottom">
        <div className="flex gap-2">
          <a href={`tel:${property.contactDetails.phone}`} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-center shadow-lg text-xs sm:text-sm active:scale-95 transition-transform">
            Call Owner
          </a>
          <button onClick={handleWhatsAppEnquiry} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg text-xs sm:text-sm active:scale-95 transition-transform">
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
