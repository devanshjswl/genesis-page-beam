import { supabase } from "@/integrations/supabase/client";

/** Resolve a stored project image reference to a usable URL.
 *  Supports both legacy full URLs and storage paths in the `project-images` bucket. */
export async function resolveProjectImage(ref: string | null | undefined): Promise<string | null> {
  if (!ref) return null;
  if (ref.startsWith("http://") || ref.startsWith("https://")) return ref;
  const { data, error } = await supabase.storage
    .from("project-images")
    .createSignedUrl(ref, 60 * 60 * 24 * 7); // 7 days
  if (error || !data) return null;
  return data.signedUrl;
}
