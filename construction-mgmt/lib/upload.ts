import imageCompression from "browser-image-compression";
import { IMAGE_COMPRESSION_OPTIONS } from "@/config/constants";
import { createClient } from "@/config/supabase/client";

export async function compressAndUploadImage(
  file: File,
  bucket: string = "receipts"
): Promise<string> {
  // Compress client-side
  const compressed = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);

  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}_${Math.random().toString(36).slice(2, 8)}.jpg`;

  // Upload to Supabase Storage
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, compressed, {
      contentType: compressed.type,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
