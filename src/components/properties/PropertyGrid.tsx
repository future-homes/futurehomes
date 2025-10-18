import { Property } from '@/types/property';
import PropertyCard from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
}

export default function PropertyGrid({ properties }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h3>
        <p className="text-gray-600">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
