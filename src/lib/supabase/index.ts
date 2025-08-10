import { supabaseKey, supabaseUrl } from "@/lib/constants";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const supabase: SupabaseClient | null = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;
