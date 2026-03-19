-- ContractHub: add columns used by app code that were missing from initial schema

-- Settings JSON blob for user preferences (used in settings page)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Notes on invoices (used in invoice create/edit forms)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS notes TEXT;

-- Start time on recurring rules (used in recurring rule TypeScript interface)
ALTER TABLE public.recurring_rules ADD COLUMN IF NOT EXISTS start_time TIME;

-- Update the initial schema comment to reflect ContractHub
COMMENT ON TABLE public.users IS 'ContractHub user profiles, extends auth.users';
