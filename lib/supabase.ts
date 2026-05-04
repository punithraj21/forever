import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
  );
}

export const supabase = createClient(url, key);

export type Moment = {
  id: string;
  occurred_at: string;
  title: string | null;
  note: string | null;
  image_paths: string[];
  created_at: string;
};

export const MAX_PHOTOS_PER_CHAPTER = 3;

export function imageUrl(path: string): string {
  const { data } = supabase.storage.from("moments").getPublicUrl(path);
  return data.publicUrl;
}
