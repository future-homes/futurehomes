export interface Property {
  id: string;
  title: string;
  slug?: string;
  description: string;
  price: number;
  deposit: number;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  propertyType: 'apartment' | 'house' | 'villa' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnishing: 'furnished' | 'semi-furnished' | 'unfurnished';
  amenities: string[];
  images: string[];
  availability: 'available' | 'rented' | 'coming-soon';
  availableFrom: string;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  ownerId: string;
  tenantType?: ('male' | 'female' | 'couple' | 'family')[];
  nearbyPlaces?: {
    bus_stops?: Array<{ name: string; distance: string; time?: string }>;
    schools?: Array<{ name: string; distance: string; time?: string }>;
    hospitals?: Array<{ name: string; distance: string; time?: string }>;
    malls?: Array<{ name: string; distance: string; time?: string }>;
    restaurants?: Array<{ name: string; distance: string; time?: string }>;
  };
  contactDetails: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
