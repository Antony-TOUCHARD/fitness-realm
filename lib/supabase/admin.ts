import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client using the service role key.
 * This bypasses Row Level Security — use only in server-side
 * trusted contexts (webhooks, cron jobs, admin API routes).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
