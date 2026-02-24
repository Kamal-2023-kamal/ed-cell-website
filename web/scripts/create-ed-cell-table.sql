-- Create ed_cell_submissions table
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

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_ed_cell_submissions_email ON ed_cell_submissions(email);
CREATE INDEX IF NOT EXISTS idx_ed_cell_submissions_created_at ON ed_cell_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE ed_cell_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow anyone to insert
CREATE POLICY "Allow public insert" ON ed_cell_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create RLS policy to deny select unless admin (we'll handle admin auth in app)
CREATE POLICY "Allow read for authenticated" ON ed_cell_submissions
  FOR SELECT
  USING (false);  -- Default deny, app will handle admin auth
