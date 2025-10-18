import { supabase } from './supabase';

export const favoritesService = {
  // Add property to favorites
  async addFavorite(userId: string, propertyId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, property_id: propertyId }])
      .select()
      .single();

    if (error) {
      // If already exists, ignore error
      if (error.code === '23505') {
        return null;
      }
      throw error;
    }
    return data;
  },

  // Remove property from favorites
  async removeFavorite(userId: string, propertyId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) throw error;
  },

  // Check if property is favorited
  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  // Get all favorite property IDs for a user
  async getFavoriteIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(f => f.property_id) || [];
  },

  // Get all favorite properties with full details
  async getFavoriteProperties(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        property_id,
        properties (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map((item: any) => {
      const property = item.properties;
      return {
        id: property.id,
        title: property.title,
        description: property.description,
        price: parseFloat(property.price),
        deposit: parseFloat(property.deposit),
        location: {
          address: property.address,
          city: property.city,
          state: property.state,
          pincode: property.pincode,
          coordinates: property.latitude && property.longitude ? {
            lat: parseFloat(property.latitude),
            lng: parseFloat(property.longitude),
          } : undefined,
        },
        propertyType: property.property_type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        furnishing: property.furnishing,
        amenities: property.amenities || [],
        images: property.images || [],
        availability: property.availability,
        availableFrom: property.available_from,
        featured: property.featured,
        status: property.status,
        rejectionReason: property.rejection_reason,
        approvedBy: property.approved_by,
        approvedAt: property.approved_at,
        ownerId: property.owner_id,
        contactDetails: {
          name: property.contact_name,
          phone: property.contact_phone,
          email: property.contact_email,
        },
        createdAt: property.created_at,
        updatedAt: property.updated_at,
      };
    }) || [];
  },
};
