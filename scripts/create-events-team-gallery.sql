-- Create ed_cell_events table
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

-- Create ed_cell_team_members table
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

-- Create ed_cell_gallery_items table
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

-- Optional: enable RLS for client reads; service role bypasses RLS
ALTER TABLE ed_cell_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ed_cell_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ed_cell_gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON ed_cell_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON ed_cell_team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON ed_cell_gallery_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for authenticated" ON ed_cell_events FOR SELECT USING (false);
CREATE POLICY "Allow read for authenticated" ON ed_cell_team_members FOR SELECT USING (false);
CREATE POLICY "Allow read for authenticated" ON ed_cell_gallery_items FOR SELECT USING (false);