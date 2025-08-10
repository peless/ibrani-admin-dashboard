import { supabaseKey, supabaseUrl } from "@/lib/constants";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(supabaseUrl, supabaseKey);
