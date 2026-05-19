import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://csesyypnvcvodwhgkyes.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZXN5eXBudmN2b2R3aGdreWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDE1MTAsImV4cCI6MjA5NDI3NzUxMH0.xSFaJgYoTMHsDGbZiVkGSkyOVfZjnS3Vc0cdJQ83jVI'
)

export const isSupabaseConfigured = true
export const DEMO_CLINIC_ID = 'aaaaaaaa-0000-0000-0000-000000000001'
