import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env from parent directory
config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const adminClient = createClient(supabaseUrl, serviceKey);
const anonClient = createClient(supabaseUrl, anonKey);

async function checkProfile() {
  const userId = 'f4fca66c-324c-4f99-baa3-c6b9436dbc26';
  
  console.log('🔍 Checking profile with SERVICE_ROLE key...');
  const { data: adminData, error: adminError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('user_id', userId);
  
  console.log('Admin result:', { data: adminData, error: adminError });
  
  console.log('\n🔍 Checking profile with ANON key (simulating app)...');
  const { data: anonData, error: anonError } = await anonClient
    .from('profiles')
    .select('*')
    .eq('user_id', userId);
  
  console.log('Anon result:', { data: anonData, error: anonError });
  
  console.log('\n🔍 Checking RLS policies...');
  const { data: policies } = await adminClient
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'profiles');
  
  console.log('RLS Policies:', policies);
}

checkProfile();
