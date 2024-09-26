import { createClient } from "@supabase/supabase-js";

export const createSupabase = () => {
  const supabaseUrl = "https://mxdyiwlpvxbfoyxbvoxd.supabase.co";
  // const supabaseKey = process.env.SUPABASE_KEY!;
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZHlpd2xwdnhiZm95eGJ2b3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk1NDI2MjAsImV4cCI6MjAxNTExODYyMH0.-mUdNG4nGkr0sH14lLpbERTxuhDsqV_IazCfl3ZjKx8";
  const supabase = createClient(supabaseUrl, supabaseKey);

  return supabase;
};
