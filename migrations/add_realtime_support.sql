-- Migration: Add realtime support for record_values
-- Run this once in your Supabase SQL editor or via migrations
-- Language: PostgreSQL

-- Add table_id column to record_values for efficient filtering
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'record_values' AND column_name = 'table_id'
    ) THEN
        ALTER TABLE record_values ADD COLUMN table_id UUID;
        -- Add foreign key constraint if needed:
        -- ALTER TABLE record_values ADD CONSTRAINT fk_record_values_table_id FOREIGN KEY (table_id) REFERENCES tables(id);
    END IF;
END $$;

-- Create function to auto-populate table_id from the related record
CREATE OR REPLACE FUNCTION set_record_values_table_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.table_id IS NULL THEN
    NEW.table_id := (SELECT r.table_id FROM records r WHERE r.id = NEW.record_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-populate table_id
DROP TRIGGER IF EXISTS trg_set_record_values_table_id ON record_values;
CREATE TRIGGER trg_set_record_values_table_id
  BEFORE INSERT OR UPDATE ON record_values
  FOR EACH ROW EXECUTE FUNCTION set_record_values_table_id();

-- Add index for efficient filtering by table_id
CREATE INDEX IF NOT EXISTS idx_record_values_table ON record_values(table_id);

-- Backfill existing records (one-time operation)
UPDATE record_values 
SET table_id = (
  SELECT r.table_id 
  FROM records r 
  WHERE r.id = record_values.record_id
)
WHERE table_id IS NULL;
