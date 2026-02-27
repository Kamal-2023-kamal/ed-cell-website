import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTable() {
  try {
    console.log('[v0] Creating ed_cell_submissions table...')
    
    const { error } = await supabase.rpc('exec_raw_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ed_cell_submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          full_name TEXT NOT NULL,
          register_number TEXT NOT NULL,
          email TEXT NOT NULL,
          department TEXT NOT NULL,
          year TEXT NOT NULL,
          reason TEXT,
          interests TEXT[] DEFAULT '{}',
          startup_experience TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_ed_cell_submissions_email ON ed_cell_submissions(email);
        CREATE INDEX IF NOT EXISTS idx_ed_cell_submissions_created_at ON ed_cell_submissions(created_at DESC);
      `
    })

    if (error) throw error
    console.log('[v0] Table created successfully')
  } catch (error) {
    console.error('[v0] Error creating table:', error)
    process.exit(1)
  }
}

createTable()
