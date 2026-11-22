import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

export const BUCKET_MATERIALI = "Materiali";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
