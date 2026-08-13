import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente admin (service role): permite invitar/crear usuarios via
// supabase.auth.admin.*. Nunca se expone al browser (solo se importa desde
// server actions). Si SUPABASE_SERVICE_ROLE_KEY no esta configurada, la
// funcionalidad de invitar usuarios queda deshabilitada en vez de romper.
export function createAdminClient(): SupabaseClient | null {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !url) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
