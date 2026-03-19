-- ============================================================
-- ContractHub: Full database schema + Row Level Security
-- ============================================================

-- 1. USERS (extends Supabase auth.users)
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  business_name text,
  phone         text,
  subscription_status  text not null default 'trialing'
    check (subscription_status in ('trialing','active','past_due','cancelled','inactive')),
  subscription_plan    text default 'solo',
  trial_start_date     timestamptz not null default now(),
  square_customer_id   text,
  square_subscription_id text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- Auto-create a users row when someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. CLIENTS
create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  first_name  text not null,
  last_name   text not null,
  email       text,
  phone       text,
  notes       text,
  status      text not null default 'active'
    check (status in ('active','archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users manage own clients"
  on public.clients for all using (auth.uid() = user_id);


-- 3. ADDRESSES
create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  street      text not null,
  city        text,
  state       text,
  zip         text,
  notes       text,
  created_at  timestamptz not null default now()
);

alter table public.addresses enable row level security;

create policy "Users manage own addresses"
  on public.addresses for all using (auth.uid() = user_id);


-- 4. RECURRING RULES
create table public.recurring_rules (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  client_id     uuid not null references public.clients(id) on delete cascade,
  address_id    uuid not null references public.addresses(id) on delete cascade,
  frequency     text not null
    check (frequency in ('weekly','biweekly','monthly','custom')),
  custom_interval_days int,
  start_date    date not null,
  end_date      date,
  price         numeric(10,2),
  duration_minutes int,
  service_type  text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.recurring_rules enable row level security;

create policy "Users manage own recurring rules"
  on public.recurring_rules for all using (auth.uid() = user_id);


-- 5. JOBS
create table public.jobs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  client_id         uuid not null references public.clients(id) on delete cascade,
  address_id        uuid not null references public.addresses(id) on delete cascade,
  recurring_rule_id uuid references public.recurring_rules(id) on delete set null,
  scheduled_date    date not null,
  start_time        time,
  duration_minutes  int,
  service_type      text,
  price             numeric(10,2),
  status            text not null default 'scheduled'
    check (status in ('scheduled','in_progress','completed','invoiced','cancelled')),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Users manage own jobs"
  on public.jobs for all using (auth.uid() = user_id);


-- 6. ESTIMATES
create table public.estimates (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  client_id     uuid not null references public.clients(id) on delete cascade,
  line_items    jsonb not null default '[]',
  total         numeric(10,2),
  notes         text,
  contract_text text,
  status        text not null default 'draft'
    check (status in ('draft','sent','accepted','declined','expired')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.estimates enable row level security;

create policy "Users manage own estimates"
  on public.estimates for all using (auth.uid() = user_id);


-- 7. INVOICES
create table public.invoices (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  client_id     uuid not null references public.clients(id) on delete cascade,
  job_id        uuid references public.jobs(id) on delete set null,
  line_items    jsonb not null default '[]',
  total         numeric(10,2),
  status        text not null default 'unpaid'
    check (status in ('unpaid','paid','void')),
  due_date      date,
  payment_date  date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "Users manage own invoices"
  on public.invoices for all using (auth.uid() = user_id);


-- 8. NOTIFICATIONS LOG
create table public.notifications_log (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  recipient       text not null,
  type            text not null
    check (type in ('reminder','confirmation','invoice','estimate','receipt','other')),
  channel         text not null default 'email'
    check (channel in ('email','sms')),
  subject         text,
  body            text,
  delivery_status text not null default 'pending'
    check (delivery_status in ('pending','sent','delivered','failed')),
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);

alter table public.notifications_log enable row level security;

create policy "Users view own notifications"
  on public.notifications_log for select using (auth.uid() = user_id);

create policy "Users insert own notifications"
  on public.notifications_log for insert with check (auth.uid() = user_id);


-- Indexes for common queries
create index idx_clients_user_id on public.clients(user_id);
create index idx_addresses_client_id on public.addresses(client_id);
create index idx_jobs_user_id on public.jobs(user_id);
create index idx_jobs_scheduled_date on public.jobs(user_id, scheduled_date);
create index idx_jobs_client_id on public.jobs(client_id);
create index idx_invoices_user_id on public.invoices(user_id);
create index idx_estimates_user_id on public.estimates(user_id);
create index idx_recurring_rules_user_id on public.recurring_rules(user_id);
create index idx_notifications_user_id on public.notifications_log(user_id);
