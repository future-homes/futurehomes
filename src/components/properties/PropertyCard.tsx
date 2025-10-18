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
  const href = `/properties/${property.slug || property.id}`

  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
        {/* Image section */}
        <div className="relative w-full h-56 sm:h-64 md:h-72 lg:h-64 xl:h-72 2xl:h-80 overflow-hidden">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            priority
          />
          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full font-semibold text-sm select-none block whitespace-nowrap">
                ⭐ Featured
              </span>
            </div>
          )}

          {/* Favorite Button */}
          <div className="absolute top-4 right-4 z-20">
            <FavoriteButton propertyId={property.id} size="md" />
          </div>

          {/* Availability Badge */}
          <div className="absolute bottom-4 left-4 z-20">
            <span
              className={`px-4 py-1 rounded-full font-semibold text-sm select-none block whitespace-nowrap ${
                property.availability === 'available'
                  ? 'bg-green-600 text-white'
                  : property.availability === 'rented'
                  ? 'bg-red-600 text-white'
                  : 'bg-yellow-500 text-white'
              }`}
            >
              {property.availability === 'available'
                ? 'Available'
                : property.availability === 'rented'
                ? 'Rented'
                : 'Coming Soon'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-5">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 truncate">
            {property.location.city}, {property.location.state}
          </p>

          <p className="text-gray-700 text-base mb-5 line-clamp-3 flex-grow">
            {property.description}
          </p>

          <div className="flex items-center gap-8 text-gray-700 font-medium mb-5">
            {property.bedrooms > 0 && <span>{property.bedrooms} Bedrooms</span>}
            {property.bathrooms > 0 && <span>{property.bathrooms} Bathrooms</span>}
            <span>{property.area.toLocaleString()} sqft</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                ₹{property.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">per month</div>
            </div>
            <div className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold cursor-pointer select-none transition-colors hover:bg-blue-700">
              View Details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
