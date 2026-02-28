import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Server client with cookie handling for auth
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

// Admin client for server-side operations (bypasses RLS)
// Uses lazy initialization to provide clear error at runtime if key is missing
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    if (!supabaseServiceKey) {
      throw new Error(
        'SUPABASE_SERVICE_KEY is required for admin operations. Check your .env.local file.'
      );
    }
    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
  }
  return _supabaseAdmin;
}

// Backwards-compatible export - creates client only when service key is available
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey)
  : (new Proxy({} as ReturnType<typeof createClient<Database>>, {
      get(_, prop) {
        return (getSupabaseAdmin() as any)[prop];
      },
    }));
