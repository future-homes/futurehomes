import { supabase } from './supabase';

export const uploadService = {
  // Upload single image
  async uploadImage(file: File, folder: string = 'properties'): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  },

  // Upload multiple images
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  },

  // Delete image
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract path from public URL
      const path = imageUrl.split('/storage/v1/object/public/property-images/')[1];
      
      const { error } = await supabase.storage
        .from('property-images')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete image');
    }
  }
};
