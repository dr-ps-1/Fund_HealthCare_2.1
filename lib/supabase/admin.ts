import "server-only"

import { createClient } from "@supabase/supabase-js"
import { getSupabaseAdminEnv } from "@/lib/config/env"

export function createSupabaseAdminClient() {
  const { url, secretKey } = getSupabaseAdminEnv()

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
