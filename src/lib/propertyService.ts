import { supabase } from './supabase';
import { Property } from '@/types/property';

// Generate clean slug without UUID
function generateSlug(title: string, city: string, numericId: number): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 50); // Limit length

  const citySlug = city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  // Clean URL: title-city-123
  return `${titleSlug}-${citySlug}-${numericId}`;
}

const transformProperty = (data: any): Property => {
  const property = {
    id: data.id,
    title: data.title,
    description: data.description,
    price: parseFloat(data.price),
    deposit: parseFloat(data.deposit),
    location: {
      address: data.address,
      city: data.city,
      state: data.state || 'Kerala',
      pincode: data.pincode,
      coordinates: data.latitude && data.longitude ? {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
      } : undefined,
    },
    propertyType: data.property_type,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area: data.area,
    furnishing: data.furnishing,
    amenities: data.amenities || [],
    images: data.images || [],
    availability: data.availability,
    availableFrom: data.available_from,
    featured: data.featured,
    status: data.status,
    rejectionReason: data.rejection_reason,
    approvedBy: data.approved_by,
    approvedAt: data.approved_at,
    ownerId: data.owner_id,
    tenantType: data.tenant_type || undefined,
    nearbyPlaces: data.nearby_places || undefined, // ADD THIS LINE
    contactDetails: {
      name: data.contact_name,
      phone: data.contact_phone,
      email: data.contact_email,
    },
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return {
    ...property,
    slug: data.numeric_id ? generateSlug(property.title, property.location.city, data.numeric_id) : undefined,
  };
};

export const propertyService = {
  // Get all approved properties (public)
  async getProperties(filters?: {
    city?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }
    if (filters?.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data?.map(transformProperty) || [];
  },

  // Get single property by numeric ID or UUID
  async getPropertyById(id: string) {
    console.log('Getting property by ID:', id);
    
    // Check if it's a numeric ID
    const isNumeric = /^\d+$/.test(id);
    
    let query = supabase.from('properties').select('*');
    
    if (isNumeric) {
      // Search by numeric_id
      query = query.eq('numeric_id', parseInt(id));
    } else {
      // Search by UUID
      query = query.eq('id', id);
    }
    
    const { data, error } = await query.single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return transformProperty(data);
  },

  // Get user's own properties (all statuses)
  async getUserProperties(userId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return data?.map(transformProperty) || [];
  },

  // Get all properties for admin
  async getAllPropertiesAdmin() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(transformProperty) || [];
  },

  // Create new property
  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'slug'>) {
    const { data, error } = await supabase
      .from('properties')
      .insert([
        {
          title: property.title,
          description: property.description,
          price: property.price,
          deposit: property.deposit,
          address: property.location.address,
          city: property.location.city,
          state: property.location.state,
          pincode: property.location.pincode,
          latitude: property.location.coordinates?.lat,
          longitude: property.location.coordinates?.lng,
          property_type: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          furnishing: property.furnishing,
          amenities: property.amenities,
          images: property.images,
          availability: property.availability,
          available_from: property.availableFrom,
          featured: false,
          status: 'pending',
          owner_id: property.ownerId,
          contact_name: property.contactDetails.name,
          contact_phone: property.contactDetails.phone,
          contact_email: property.contactDetails.email,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return transformProperty(data);
  },

  // Update property (users can only update their own pending/rejected properties)
  async updateProperty(id: string, property: Partial<Property>) {
    const { data, error } = await supabase
      .from('properties')
      .update({
        title: property.title,
        description: property.description,
        price: property.price,
        deposit: property.deposit,
        address: property.location?.address,
        city: property.location?.city,
        state: property.location?.state,
        pincode: property.location?.pincode,
        latitude: property.location?.coordinates?.lat,
        longitude: property.location?.coordinates?.lng,
        property_type: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        furnishing: property.furnishing,
        amenities: property.amenities,
        images: property.images,
        availability: property.availability,
        available_from: property.availableFrom,
        contact_name: property.contactDetails?.name,
        contact_phone: property.contactDetails?.phone,
        contact_email: property.contactDetails?.email,
        updated_at: new Date().toISOString(),
        status: 'pending',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformProperty(data);
  },

  // Update property as admin
  async updatePropertyAdmin(id: string, property: Partial<Property>) {
    const { data, error } = await supabase
      .from('properties')
      .update({
        title: property.title,
        description: property.description,
        price: property.price,
        deposit: property.deposit,
        address: property.location?.address,
        city: property.location?.city,
        state: property.location?.state,
        pincode: property.location?.pincode,
        latitude: property.location?.coordinates?.lat,
        longitude: property.location?.coordinates?.lng,
        property_type: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        furnishing: property.furnishing,
        amenities: property.amenities,
        images: property.images,
        availability: property.availability,
        available_from: property.availableFrom,
        featured: property.featured,
        status: property.status,
        contact_name: property.contactDetails?.name,
        contact_phone: property.contactDetails?.phone,
        contact_email: property.contactDetails?.email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformProperty(data);
  },

  // Delete property
  async deleteProperty(id: string) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Approve property (admin only)
  async approveProperty(propertyId: string, adminId: string) {
    const { error } = await supabase
      .from('properties')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', propertyId);

    if (error) throw error;
  },

  // Reject property (admin only)
  async rejectProperty(propertyId: string, reason: string) {
    const { error } = await supabase
      .from('properties')
      .update({
        status: 'rejected',
        rejection_reason: reason,
      })
      .eq('id', propertyId);

    if (error) throw error;
  },

  // Toggle featured status (admin only)
  async toggleFeatured(propertyId: string, featured: boolean) {
    const { error } = await supabase
      .from('properties')
      .update({ featured })
      .eq('id', propertyId);

    if (error) throw error;
  },
};
