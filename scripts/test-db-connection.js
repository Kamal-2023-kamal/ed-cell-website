
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    // Check if table exists
    console.log('Checking for ed_cell_submissions table...');
    const { count, error: countError } = await supabase.from('ed_cell_submissions').select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Table check failed:', countError.message);
      return;
    } 
    console.log(`Table exists. Current row count: ${count}`);

    // Try to insert a test record
    console.log('Attempting test insert...');
    const testData = {
      full_name: "Test User",
      register_number: "123456789012",
      email: "test@stjosephs.ac.in",
      department: "Test Dept",
      year: "I Year",
      reason: "Test submission",
      interests: ["Testing"],
      startup_experience: "no"
    };

    const { data, error: insertError } = await supabase
      .from('ed_cell_submissions')
      .insert([testData])
      .select();

    if (insertError) {
      console.error('Insert failed:', insertError.message);
    } else {
      console.log('Insert successful:', data);
      
      // Clean up
      console.log('Cleaning up test record...');
      await supabase.from('ed_cell_submissions').delete().eq('id', data[0].id);
      console.log('Cleanup done.');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
