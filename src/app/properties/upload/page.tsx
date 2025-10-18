'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { propertyService } from '@/lib/propertyService';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
});

// Image compression function
async function compressImage(file: File, maxSizeKB: number = 300): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = 1920;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Try different quality levels to get under target size
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }

              const sizeKB = blob.size / 1024;
              
              if (sizeKB <= maxSizeKB || quality <= 0.1) {
                // Create compressed file
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                console.log(`✅ Compressed: ${file.name} from ${(file.size / 1024).toFixed(0)}KB to ${sizeKB.toFixed(0)}KB`);
                resolve(compressedFile);
              } else {
                // Try again with lower quality
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

// Image upload function
async function uploadImage(file: File): Promise<string> {
  const fileExt = 'jpg'; // Always use jpg after compression
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `properties/${fileName}`;

  const { error } = await supabase.storage
    .from('property-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export default function UploadPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deposit: '',
    address: '',
    city: '',
    state: 'Kerala',
    pincode: '',
    propertyType: 'apartment',
    bedrooms: '',
    bathrooms: '',
    area: '',
    furnishing: 'unfurnished',
    availability: 'available',
    availableFrom: '',
    tenantType: [] as string[],
    contactName: user?.user_metadata?.full_name || '',
    contactPhone: '',
    contactEmail: user?.email || '',
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [locationData, setLocationData] = useState<{ lat: number; lng: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [nearbyPlaces, setNearbyPlaces] = useState<any>(null);
  const [fetchingNearby, setFetchingNearby] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const amenitiesList = [
    'Parking', 'Swimming Pool', 'Gym', 'Garden', 'Security', 'Power Backup',
    'Elevator', 'Water Supply', 'Internet', 'AC', 'Balcony', 'Pet Friendly'
  ];

  const cities = ['Kochi', 'Trivandrum', 'Kozhikode', 'Thrissur', 'Kottayam', 'Kollam', 'Palakkad', 'Kannur'];
  const tenantOptions = ['male', 'female', 'couple', 'family'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityToggle = (amenity: string) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleTenantTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      tenantType: prev.tenantType.includes(type)
        ? prev.tenantType.filter(t => t !== type)
        : [...prev.tenantType, type]
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (images.length + files.length > 10) {
        alert('Maximum 10 images allowed');
        return;
      }

      setCompressing(true);
      try {
        const compressedFiles: File[] = [];
        
        for (const file of files) {
          // Compress each image
          const compressed = await compressImage(file, 300);
          compressedFiles.push(compressed);
        }
        
        setImages(prev => [...prev, ...compressedFiles]);
        alert(` ${compressedFiles.length} image(s) Uploaded Successfully`);
      } catch (error) {
        console.error('Compression error:', error);
        alert('Error compressing images. Please try again.');
      } finally {
        setCompressing(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFetchNearbyPlaces = async () => {
    if (!locationData) {
      alert('Please pin your property location on the map first');
      return;
    }

    if (typeof locationData.lat !== 'number' || typeof locationData.lng !== 'number') {
      alert('Invalid location data. Please click on the map again.');
      return;
    }

    const coords = {
      lat: Number(locationData.lat),
      lng: Number(locationData.lng)
    };

    setFetchingNearby(true);
    try {
      const { fetchNearbyPlaces } = await import('@/lib/nearbyPlaces');
      const nearby = await fetchNearbyPlaces(coords);

      if (nearby && Object.values(nearby).some((arr: any) => arr.length > 0)) {
        setNearbyPlaces(nearby);
        const total = Object.values(nearby).reduce((sum: number, arr: any) => sum + arr.length, 0);
        alert(` Found ${total} nearby places!`);
      } else {
        alert('No nearby places found in this area.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching nearby places. Please try again.');
    } finally {
      setFetchingNearby(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to upload property');
      router.push('/login');
      return;
    }

    if (!locationData) {
      alert('Please select property location on the map');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalImages = images.length;
      const imageUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const url = await uploadImage(images[i]);
        imageUrls.push(url);
        setUploadProgress(Math.round(((i + 1) / totalImages) * 100));
      }

      const newProperty = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        deposit: parseFloat(formData.deposit),
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          coordinates: locationData,
        },
        propertyType: formData.propertyType as any,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseInt(formData.area),
        furnishing: formData.furnishing as any,
        amenities,
        images: imageUrls,
        availability: formData.availability as any,
        availableFrom: formData.availableFrom,
        featured: false,
        ownerId: user.id,
        tenantType: formData.tenantType.length > 0 ? formData.tenantType as any : undefined,
        nearbyPlaces: nearbyPlaces || undefined,
        contactDetails: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
      };

      await propertyService.createProperty(newProperty);
      alert('🎉 Property uploaded successfully! It will be reviewed by our team.');
      router.push('/dashboard/properties');
    } catch (error) {
      console.error('Error uploading property:', error);
      alert('❌ Error uploading property. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to upload property</h2>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Property</h1>
            <p className="text-gray-600">Fill in the details below to list your property for rent</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Images */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                Property Images <span className="text-red-500">*</span>
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={compressing}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className={`cursor-pointer ${compressing ? 'opacity-50' : ''}`}>
                  {compressing ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-lg font-semibold text-blue-600">Compressing images...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                    </div>
                  ) : (
                    <>
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-semibold text-gray-700 mb-2">Click to upload images</p>
                      <p className="text-sm text-gray-500">Upload up to 10 images</p>
                      <p className="text-xs text-blue-600 mt-1"></p>
                    </>
                  )}
                </label>
              </div>

              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {images.length} image(s) selected • Total: {(images.reduce((sum, img) => sum + img.size, 0) / 1024).toFixed(0)}KB
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded text-center">
                          {(img.size / 1024).toFixed(0)}KB
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Spacious 2BHK Apartment in Kochi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Describe your property in detail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monthly Rent (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      placeholder="25000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deposit Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      required
                      placeholder="50000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Location Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="123, MG Road"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select City</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      placeholder="682001"
                      pattern="[0-9]{6}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pin Location on Map <span className="text-red-500">*</span>
                  </label>
                  <LocationPicker onLocationSelect={setLocationData} />
                  {locationData && typeof locationData.lat === 'number' && typeof locationData.lng === 'number' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Location pinned:</span>
                        <span>{locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nearby Places */}
            {locationData && typeof locationData.lat === 'number' && typeof locationData.lng === 'number' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    Nearby Places (Optional)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Automatically discover nearby amenities using OpenStreetMap
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleFetchNearbyPlaces}
                  disabled={fetchingNearby}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {fetchingNearby ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching nearby places...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Find Nearby Places Automatically
                    </>
                  )}
                </button>

                {nearbyPlaces && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                    <p className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Places Found
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {nearbyPlaces.bus_stops?.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span>🚌 Bus Stops</span>
                          <span className="font-bold text-blue-600">{nearbyPlaces.bus_stops.length}</span>
                        </div>
                      )}
                      {nearbyPlaces.schools?.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span>🏫 Schools</span>
                          <span className="font-bold text-green-600">{nearbyPlaces.schools.length}</span>
                        </div>
                      )}
                      {nearbyPlaces.hospitals?.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span>🏥 Hospitals</span>
                          <span className="font-bold text-red-600">{nearbyPlaces.hospitals.length}</span>
                        </div>
                      )}
                      {nearbyPlaces.malls?.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                          <span>🛍️ Malls</span>
                          <span className="font-bold text-purple-600">{nearbyPlaces.malls.length}</span>
                        </div>
                      )}
                      {nearbyPlaces.restaurants?.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span>🍽️ Restaurants</span>
                          <span className="font-bold text-orange-600">{nearbyPlaces.restaurants.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Powered by OpenStreetMap
                </p>
              </div>
            )}

            {/* Property Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Furnishing <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi Furnished</option>
                    <option value="furnished">Fully Furnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bathrooms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Area (sq ft) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    placeholder="1200"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tenant Type */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred For</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tenantOptions.map(type => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                        formData.tenantType.includes(type)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.tenantType.includes(type)}
                        onChange={() => handleTenantTypeToggle(type)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="capitalize text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesList.map(amenity => (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                      amenities.includes(amenity)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Contact Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    required
                    placeholder="+91 9876543210"
                    pattern="[0-9+\s-]+"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                {uploading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Submit Property for Review
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 text-center mt-3">
                Your property will be reviewed by our team before being listed publicly
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}