-- Add image_url column to events table if missing
ALTER TABLE ed_cell_events ADD COLUMN IF NOT EXISTS image_url TEXT;