-- Add preferred_service column to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_service text
  CHECK (preferred_service IN (
    'Regular Clean',
    'Deep Clean',
    'Move-Out Clean',
    'Move-In Clean',
    'Post-Construction',
    'One-Time Clean',
    'Office Clean'
  ));
