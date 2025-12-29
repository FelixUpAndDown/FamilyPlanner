import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzxtjxuelcfkueqyqcft.supabase.co'
const supabaseAnonKey = 'sb_publishable_SNN_EIrKiMe92RKBwJkVkQ_BSAL4T_L'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
