import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (typeof url !== 'string' || url.length === 0 || typeof anonKey !== 'string' || anonKey.length === 0) {
    client = null
    return client
  }

  client = createClient(url, anonKey)
  return client
}
