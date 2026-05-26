import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Service role key bypasses RLS — keep it server-side only (no NEXT_PUBLIC_ prefix)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const key = serviceKey && serviceKey !== "your-service-role-key-here"
  ? serviceKey
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
