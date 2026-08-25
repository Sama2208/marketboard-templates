import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Tashqi Supabase project uchun browser client.
 * Faqat publishable/anon public key ishlatiladi — secret key hech qachon bu yerda bo'lmaydi.
 * Qiymatlar environment variable'lardan olinadi (hardcode qilinmagan).
 */
const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const supabasePublishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as
  | string
  | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

const isBrowser = typeof window !== "undefined";

export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabasePublishableKey ?? "placeholder-anon-key",
  {
    auth: {
      // SSR/build vaqtida browser API'larga tegmaslik uchun
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
      storage: isBrowser ? window.localStorage : undefined,
    },
  },
);
