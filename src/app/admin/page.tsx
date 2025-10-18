'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { propertyService } from '@/lib/propertyService';
import { Property } from '@/types/property';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchProperties();
    }
  }, [isAdmin, activeTab]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getAllPropertiesAdmin();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (propertyId: string) => {
    if (!user) return;
    
    try {
      await propertyService.approveProperty(propertyId, user.id);
      alert('Property approved successfully!');
      fetchProperties();
    } catch (error: any) {
      alert(error.message || 'Failed to approve property');
    }
  };

  const handleReject = async (propertyId: string) => {
    const reason = rejectionReason[propertyId];
    if (!reason || reason.trim() === '') {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await propertyService.rejectProperty(propertyId, reason);
      alert('Property rejected');
      setShowRejectModal(null);
      setRejectionReason({ ...rejectionReason, [propertyId]: '' });
      fetchProperties();
    } catch (error: any) {
      alert(error.message || 'Failed to reject property');
    }
  };

  const filteredProperties = properties.filter(p => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const stats = {
    pending: properties.filter(p => p.status === 'pending').length,
    approved: properties.filter(p => p.status === 'approved').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
    total: properties.length,
  };

  if (authLoading || !isAdmin) {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage property listings and approvals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Pending</h3>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Approved</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Rejected</h3>
              <span className="text-2xl">❌</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Total</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="flex border-b">
            {[
              { key: 'pending', label: 'Pending', count: stats.pending },
              { key: 'approved', label: 'Approved', count: stats.approved },
              { key: 'rejected', label: 'Rejected', count: stats.rejected },
              { key: 'all', label: 'All', count: stats.total },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Properties List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Properties</h3>
            <p className="text-gray-600">No properties in this category yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-80 h-64 relative flex-shrink-0">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        property.status === 'pending' ? 'bg-orange-500 text-white' :
                        property.status === 'approved' ? 'bg-green-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {property.status.toUpperCase()}
                      </span>
                      {property.featured && (
                        <span className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-semibold">
                          ⭐ Featured
                        </span>
                      )}
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
                          {property.location.city}
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

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>👤 {property.contactDetails.name}</span>
                      <span>📞 {property.contactDetails.phone}</span>
                    </div>

                    {property.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {property.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href={`/properties/${property.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        View Details
                      </Link>

                      <Link
                        href={`/properties/edit/${property.id}`}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                      >
                        Edit
                      </Link>

                      {property.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(property.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => setShowRejectModal(property.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}

                      {property.status === 'rejected' && (
                        <button
                          onClick={() => handleApprove(property.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Re-approve
                        </button>
                      )}

                      {property.status === 'approved' && (
                        <button
                          onClick={() => setShowRejectModal(property.id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                        >
                          Unpublish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Reject Property</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejection. This will be visible to the property owner.
              </p>
              <textarea
                value={rejectionReason[showRejectModal] || ''}
                onChange={(e) => setRejectionReason({ ...rejectionReason, [showRejectModal]: e.target.value })}
                placeholder="e.g., Images are not clear, property information is incomplete..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(null)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Reject Property
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
