'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { propertyService } from '@/lib/propertyService';
import { uploadService } from '@/lib/uploadService';
import { Property } from '@/types/property';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-600">Loading map...</div>
    </div>
  )
});

const amenitiesList = [
  'Parking', 'Gym', 'Swimming Pool', 'Security',
  'Power Backup', 'Lift', 'Garden', 'Water Supply',
  'AC', 'WiFi', 'Playground', 'Club House'
];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deposit: '',
    address: '',
    city: 'Kochi',
    pincode: '',
    propertyType: 'apartment',
    bedrooms: '1',
    bathrooms: '1',
    area: '',
    furnishing: 'unfurnished',
    amenities: [] as string[],
    availableFrom: new Date().toISOString().split('T')[0],
    availability: 'available',
    featured: false,
    status: 'pending',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });

  // Fetch property data
  useEffect(() => {
    async function fetchProperty() {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const data = await propertyService.getPropertyById(params.id as string);
        setProperty(data);
        
        // Populate form
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          deposit: data.deposit.toString(),
          address: data.location.address,
          city: data.location.city,
          pincode: data.location.pincode,
          propertyType: data.propertyType,
          bedrooms: data.bedrooms.toString(),
          bathrooms: data.bathrooms.toString(),
          area: data.area.toString(),
          furnishing: data.furnishing,
          amenities: data.amenities,
          availableFrom: data.availableFrom,
          availability: data.availability,
          featured: data.featured,
          status: data.status,
          contactName: data.contactDetails.name,
          contactPhone: data.contactDetails.phone,
          contactEmail: data.contactDetails.email,
        });

        // Set existing images
        setExistingImages(data.images);

        // Set location
        if (data.location.coordinates) {
          setLocationData({
            lat: data.location.coordinates.lat,
            lng: data.location.coordinates.lng,
          });
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        alert('Failed to load property');
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [params.id]);

  // Check permissions
  useEffect(() => {
    if (!loading && property && user) {
      // Only owner or admin can edit
      if (property.ownerId !== user.id && !isAdmin) {
        alert('You do not have permission to edit this property');
        router.push('/properties');
      }
    }
  }, [loading, property, user, isAdmin, router]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setSelectedImages(files);
      setPreviewUrls(files.map(file => URL.createObjectURL(file)));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Fixed location handler
  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setLocationData(location);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !property) return;
    if (!locationData) {
      alert('Please pin your property location on the map');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images if any
      let finalImages = [...existingImages];
      if (selectedImages.length > 0) {
        const newImageUrls = await uploadService.uploadMultipleImages(selectedImages);
        finalImages = [...existingImages, ...newImageUrls];
      }

      const updatedProperty = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        deposit: parseFloat(formData.deposit),
        location: {
          address: formData.address,
          city: formData.city,
          state: 'Kerala',
          pincode: formData.pincode,
          coordinates: {
            lat: locationData.lat,
            lng: locationData.lng,
          },
        },
        propertyType: formData.propertyType as any,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseInt(formData.area),
        furnishing: formData.furnishing as any,
        amenities: formData.amenities,
        images: finalImages,
        availableFrom: formData.availableFrom,
        availability: formData.availability as any,
        featured: formData.featured,
        status: formData.status as any,
        contactDetails: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
      };

      // Use admin update if user is admin
      if (isAdmin) {
        await propertyService.updatePropertyAdmin(property.id, updatedProperty);
      } else {
        await propertyService.updateProperty(property.id, updatedProperty);
      }

      alert('Property updated successfully!');
      router.push(isAdmin ? '/admin' : '/my-properties');
    } catch (error: any) {
      console.error('Update error:', error);
      alert(error.message || 'Failed to update property');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Property</h1>
            <p className="text-gray-600">Update property details</p>
          </div>
          {isAdmin && (
            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full">
              ADMIN MODE
            </span>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Images
              </label>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image src={url} alt={`Existing ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add More Images (Max 5 total)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative h-20 rounded-lg overflow-hidden border-2 border-green-400">
                    <Image src={url} alt={`New ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Property Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price & Deposit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Rent (₹) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Security Deposit (₹) *</label>
              <input
                type="number"
                required
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location Map */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Update Property Location *
            </label>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLat={locationData?.lat}
              initialLng={locationData?.lng}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Kochi">Kochi</option>
                <option value="Trivandrum">Trivandrum</option>
                <option value="Kozhikode">Kozhikode</option>
                <option value="Thrissur">Thrissur</option>
                <option value="Kottayam">Kottayam</option>
                <option value="Kollam">Kollam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Property Type & Furnishing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type *</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Furnishing *</label>
              <select
                value={formData.furnishing}
                onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          {/* Bedrooms, Bathrooms, Area */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Area (sq ft) *</label>
              <input
                type="number"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Amenities</label>
            <div className="grid grid-cols-3 gap-3">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Available From & Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Available From *</label>
              <input
                type="date"
                required
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Availability *</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="coming-soon">Coming Soon</option>
              </select>
            </div>
          </div>

          {/* Admin-only fields */}
          {isAdmin && (
            <div className="border-t pt-6 bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-orange-800">Admin Controls</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-700">Mark as Featured</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !locationData}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Updating Property...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
