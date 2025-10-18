'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { propertyService } from '@/lib/propertyService';
import { Property } from '@/types/property';
import Image from 'next/image';
import Link from 'next/link';

export default function MyPropertiesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchMyProperties();
    }
  }, [user]);

  const fetchMyProperties = async () => {
  if (!user) return;
  
  try {
    setLoading(true);
    console.log('Fetching properties for user:', user.id);
    const data = await propertyService.getUserProperties(user.id);
    console.log('Properties fetched:', data);
    setProperties(data);
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    console.error('Error details:', error.message, error.details, error.hint);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (propertyId: string) => {
    try {
      await propertyService.deleteProperty(propertyId);
      alert('Property deleted successfully');
      setDeleteConfirm(null);
      fetchMyProperties();
    } catch (error: any) {
      alert(error.message || 'Failed to delete property');
    }
  };

  const stats = {
    pending: properties.filter(p => p.status === 'pending').length,
    approved: properties.filter(p => p.status === 'approved').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
    total: properties.length,
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Properties</h1>
            <p className="text-gray-600">Manage your property listings</p>
          </div>
          <Link
            href="/properties/upload"
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            + Add New Property
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Total</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Pending</h3>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting admin approval</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Live</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500 mt-1">Visible to public</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Rejected</h3>
              <span className="text-2xl">❌</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-gray-500 mt-1">Need revision</p>
          </div>
        </div>

        {/* Properties List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Properties Yet</h3>
            <p className="text-gray-600 mb-6">Start by listing your first property</p>
            <Link
              href="/properties/upload"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
            >
              + List Your First Property
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-80 h-64 relative flex-shrink-0">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        property.status === 'pending' ? 'bg-orange-500 text-white' :
                        property.status === 'approved' ? 'bg-green-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {property.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {property.location.address}, {property.location.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{property.price.toLocaleString()}/mo
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {property.bedrooms > 0 && <span>🛏️ {property.bedrooms} Beds</span>}
                      {property.bathrooms > 0 && <span>🚿 {property.bathrooms} Baths</span>}
                      <span>📏 {property.area} sq ft</span>
                      <span className="capitalize">🪑 {property.furnishing}</span>
                    </div>

                    {/* Status Messages */}
                    {property.status === 'pending' && (
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                          ⏳ <strong>Pending Approval:</strong> Your property is under review by our admin team
                        </p>
                      </div>
                    )}

                    {property.status === 'rejected' && property.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {property.rejectionReason}
                        </p>
                        <p className="text-xs text-red-600 mt-1">Please edit and resubmit your property</p>
                      </div>
                    )}

                    {property.status === 'approved' && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          ✅ <strong>Live:</strong> Your property is now visible to all users
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href={`/properties/${property.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        View
                      </Link>

                      {(property.status === 'pending' || property.status === 'rejected') && (
                        <>
                          <Link
                            href={`/properties/edit/${property.id}`}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(property.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Property?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
