'use client'

interface FilterType {
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  amenities?: string[];
}

interface PropertyFiltersProps {
  filters: FilterType;
  setFilters: (filters: FilterType) => void;
}

export default function PropertyFilters({ filters, setFilters }: PropertyFiltersProps) {
  const updateFilter = (key: keyof FilterType, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            placeholder="e.g., Kochi, Trivandrum"
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Property Type
          </label>
          <select
            value={filters.propertyType || ''}
            onChange={(e) => updateFilter('propertyType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Price Range (Monthly)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Quick Price Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: 'Under ₹20k', max: 20000 },
              { label: '₹20k-₹40k', min: 20000, max: 40000 },
              { label: '₹40k-₹60k', min: 40000, max: 60000 },
              { label: 'Above ₹60k', min: 60000 },
            ].map((range, index) => (
              <button
                key={index}
                onClick={() => {
                  updateFilter('minPrice', range.min);
                  updateFilter('maxPrice', range.max);
                }}
                className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bedrooms
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => updateFilter('bedrooms', filters.bedrooms === num ? undefined : num)}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  filters.bedrooms === num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {num}+
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bathrooms
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => updateFilter('bathrooms', filters.bathrooms === num ? undefined : num)}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  filters.bathrooms === num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {num}+
              </button>
            ))}
          </div>
        </div>

        {/* Furnishing */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Furnishing
          </label>
          <select
            value={filters.furnishing || ''}
            onChange={(e) => updateFilter('furnishing', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="furnished">Furnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </div>

        {/* Popular Amenities */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Amenities
          </label>
          <div className="space-y-2">
            {['Parking', 'Gym', 'Swimming Pool', 'Security', 'Power Backup', 'Lift'].map((amenity) => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.amenities?.includes(amenity) || false}
                  onChange={(e) => {
                    const currentAmenities = filters.amenities || [];
                    if (e.target.checked) {
                      updateFilter('amenities', [...currentAmenities, amenity]);
                    } else {
                      updateFilter('amenities', currentAmenities.filter(a => a !== amenity));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
