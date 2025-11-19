import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !key) {
  console.error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Check your .env file.')
}

export const supabase = createClient(url ?? '', key ?? '')

