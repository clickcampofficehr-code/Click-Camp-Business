import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Click Camp Cloud Storage Integration Service
 * Manages secure file uploads to Supabase Storage or compatible S3 buckets.
 */

export interface UploadResult {
  fileUrl: string;
  filePath: string;
  fileSizeBytes: number;
}

export const StorageService = {
  /**
   * Uploads employee custom profile picture (PFP) to 'avatars' bucket
   * Auto-sets cache-control and returns CDN public URL
   */
  async uploadAvatar(file: Blob | File, userId: string): Promise<UploadResult> {
    const timestamp = Date.now();
    const filePath = `${userId}/avatar_${timestamp}.webp`;

    if (!isSupabaseConfigured || !supabase) {
      // Graceful local fallback (Object URL or FileReader Data URL)
      const mockUrl = URL.createObjectURL(file);
      return {
        fileUrl: mockUrl,
        filePath,
        fileSizeBytes: file.size
      };
    }

    // 1. Upload to 'avatars' bucket
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('[Storage] Avatar upload error:', error.message);
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }

    // 2. Obtain Public URL
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);

    return {
      fileUrl: urlData.publicUrl,
      filePath: data.path,
      fileSizeBytes: file.size
    };
  },

  /**
   * Uploads statutory compliance document (PAN, Aadhaar, Form 11, etc.)
   * to private 'statutory-documents' bucket with RLS security
   */
  async uploadStatutoryDocument(
    file: File,
    employeeId: string,
    formName: string
  ): Promise<UploadResult> {
    const sanitizedName = formName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const extension = file.name.split('.').pop() || 'pdf';
    const filePath = `${employeeId}/${sanitizedName}_${Date.now()}.${extension}`;

    if (!isSupabaseConfigured || !supabase) {
      // Local fallback
      const mockUrl = URL.createObjectURL(file);
      return {
        fileUrl: mockUrl,
        filePath,
        fileSizeBytes: file.size
      };
    }

    const { data, error } = await supabase.storage
      .from('statutory-documents')
      .upload(filePath, file, {
        contentType: file.type || 'application/pdf',
        upsert: true
      });

    if (error) {
      console.error('[Storage] Document upload error:', error.message);
      throw new Error(`Failed to upload statutory document: ${error.message}`);
    }

    // For private buckets, generate a signed URL (e.g. valid for 1 year or on-demand)
    const { data: signedData, error: signedErr } = await supabase.storage
      .from('statutory-documents')
      .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year

    if (signedErr || !signedData) {
      // Fallback to direct path identifier
      return {
        fileUrl: data.path,
        filePath: data.path,
        fileSizeBytes: file.size
      };
    }

    return {
      fileUrl: signedData.signedUrl,
      filePath: data.path,
      fileSizeBytes: file.size
    };
  }
};
