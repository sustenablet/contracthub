-- Add preferred_service column to clients table (contractor work types)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_service text
  CHECK (preferred_service IN (
    'General Maintenance',
    'Plumbing',
    'Electrical',
    'HVAC / Mechanical',
    'Carpentry / Framing',
    'Drywall & Painting',
    'Roofing',
    'Concrete / Masonry',
    'Landscaping / Site Work',
    'Inspection / Punch-list'
  ));
