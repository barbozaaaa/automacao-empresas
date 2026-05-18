import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder'))

export const DEMO_CLINIC_ID = 'aaaaaaaa-0000-0000-0000-000000000001'
