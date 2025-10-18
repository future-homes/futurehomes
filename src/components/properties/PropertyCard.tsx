'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/types/property'
import FavoriteButton from '../FavoriteButton'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Use slug if available, fallback to ID
  const href = `/properties/${property.slug || property.id}`;
  
  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Favorite Button */}
          <div className="absolute top-4 right-4 z-10">
            <FavoriteButton propertyId={property.id} />
          </div>

          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-semibold">
                ⭐ Featured
              </span>
            </div>
          )}

          {/* Availability Badge */}
          <div className="absolute bottom-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              property.availability === 'available' ? 'bg-green-500 text-white' :
              property.availability === 'rented' ? 'bg-red-500 text-white' :
              'bg-yellow-500 text-white'
            }`}>
              {property.availability === 'available' ? 'Available' :
               property.availability === 'rented' ? 'Rented' :
               'Coming Soon'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-1">
            {property.title}
          </h3>
          
          <p className="text-gray-600 flex items-center mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location.city}, {property.location.state}
          </p>

          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {property.bedrooms > 0 && <span>🛏️ {property.bedrooms}</span>}
            {property.bathrooms > 0 && <span>🚿 {property.bathrooms}</span>}
            <span>📏 {property.area} sq ft</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{property.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">per month</div>
            </div>
            <div className="px-4 py-2 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition font-semibold">
              View Details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
