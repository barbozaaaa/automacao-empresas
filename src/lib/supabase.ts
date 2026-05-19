import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Flow] ERRO: variáveis de ambiente não encontradas.\n' +
    'VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌ FALTANDO',
    '\nVITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌ FALTANDO'
  )
}

export const supabase = createClient(
  supabaseUrl  ?? 'https://placeholder.supabase.co',
  supabaseKey  ?? 'placeholder'
)

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder'))

export const DEMO_CLINIC_ID = 'aaaaaaaa-0000-0000-0000-000000000001'
