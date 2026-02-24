-- Bootstrap helper to ensure setup_status exists before running main setup
CREATE OR REPLACE FUNCTION run_setup_bootstrap()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS setup_status (
    id boolean PRIMARY KEY DEFAULT true,
    initialized boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
  );

  INSERT INTO setup_status (id, initialized)
  VALUES (true, false)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Main setup function: creates tables, indexes, RLS policies idempotently
CREATE OR REPLACE FUNCTION run_setup_sql()
RETURNS void AS $$
BEGIN
  -- Extension for gen_random_uuid()
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  -- =========================
  -- Submissions
  -- =========================
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

  ALTER TABLE ed_cell_submissions ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Allow public insert" ON ed_cell_submissions;
  CREATE POLICY "Allow public insert" ON ed_cell_submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow read for authenticated" ON ed_cell_submissions;
  CREATE POLICY "Allow read for authenticated" ON ed_cell_submissions
    FOR SELECT
    TO authenticated
    USING (true);

  -- =========================
  -- Events
  -- =========================
  CREATE TABLE IF NOT EXISTS ed_cell_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TEXT,
    time TEXT,
    location TEXT,
    description TEXT,
    status TEXT DEFAULT 'Coming Soon',
    registration_link TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_ed_cell_events_status ON ed_cell_events(status);
  CREATE INDEX IF NOT EXISTS idx_ed_cell_events_order ON ed_cell_events(order_index);

  ALTER TABLE ed_cell_events ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Events insert (authenticated)" ON ed_cell_events;
  CREATE POLICY "Events insert (authenticated)" ON ed_cell_events
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Events update (authenticated)" ON ed_cell_events;
  CREATE POLICY "Events update (authenticated)" ON ed_cell_events
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Events delete (authenticated)" ON ed_cell_events;
  CREATE POLICY "Events delete (authenticated)" ON ed_cell_events
    FOR DELETE
    TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Events read (authenticated)" ON ed_cell_events;
  CREATE POLICY "Events read (authenticated)" ON ed_cell_events
    FOR SELECT
    TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Events read (public)" ON ed_cell_events;
  CREATE POLICY "Events read (public)" ON ed_cell_events
    FOR SELECT
    TO anon
    USING (true);

  -- =========================
  -- Team Members
  -- =========================
  CREATE TABLE IF NOT EXISTS ed_cell_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    initials TEXT,
    email TEXT,
    linkedin TEXT,
    photo_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_ed_cell_team_order ON ed_cell_team_members(order_index);

  ALTER TABLE ed_cell_team_members ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Team insert (authenticated)" ON ed_cell_team_members;
  CREATE POLICY "Team insert (authenticated)" ON ed_cell_team_members
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Team update (authenticated)" ON ed_cell_team_members;
  CREATE POLICY "Team update (authenticated)" ON ed_cell_team_members
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Team delete (authenticated)" ON ed_cell_team_members;
  CREATE POLICY "Team delete (authenticated)" ON ed_cell_team_members
    FOR DELETE
    TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Team read (authenticated)" ON ed_cell_team_members;
  CREATE POLICY "Team read (authenticated)" ON ed_cell_team_members
    FOR SELECT
    TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Team read (public)" ON ed_cell_team_members;
  CREATE POLICY "Team read (public)" ON ed_cell_team_members
    FOR SELECT
    TO anon
    USING (true);

  -- =========================
  -- Gallery Items
  -- =========================
  CREATE TABLE IF NOT EXISTS ed_cell_gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    src TEXT NOT NULL,
    alt TEXT,
    caption TEXT,
    tags TEXT,
    visible BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_ed_cell_gallery_visible ON ed_cell_gallery_items(visible);
  CREATE INDEX IF NOT EXISTS idx_ed_cell_gallery_order ON ed_cell_gallery_items(order_index);

  ALTER TABLE ed_cell_gallery_items ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Gallery insert (authenticated)" ON ed_cell_gallery_items;
  CREATE POLICY "Gallery insert (authenticated)" ON ed_cell_gallery_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Gallery update (authenticated)" ON ed_cell_gallery_items;
  CREATE POLICY "Gallery update (authenticated)" ON ed_cell_gallery_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Gallery delete (authenticated)" ON ed_cell_gallery_items;
  CREATE POLICY "Gallery delete (authenticated)" ON ed_cell_gallery_items
    FOR DELETE
    TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Gallery read (public visible)" ON ed_cell_gallery_items;
  CREATE POLICY "Gallery read (public visible)" ON ed_cell_gallery_items
    FOR SELECT
    TO anon
    USING (visible = true);

  DROP POLICY IF EXISTS "Gallery read (authenticated)" ON ed_cell_gallery_items;
  CREATE POLICY "Gallery read (authenticated)" ON ed_cell_gallery_items
    FOR SELECT
    TO authenticated
    USING (true);
END;
$$ LANGUAGE plpgsql;