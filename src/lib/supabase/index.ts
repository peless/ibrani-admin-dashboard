import { supabaseKey, supabaseUrl } from "@/constants";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(supabaseUrl, supabaseKey);
