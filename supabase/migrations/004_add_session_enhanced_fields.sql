-- Add enhanced tracking fields to driving_sessions
ALTER TABLE public.driving_sessions 
ADD COLUMN IF NOT EXISTS route jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mistakes jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_distance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS location_summary text;
