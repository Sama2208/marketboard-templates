create table if not exists public.rnp_months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null check (year between 2000 and 2100),
  month integer not null check (month between 1 and 12),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rnp_months_user_period_key unique (user_id, year, month)
);

create index if not exists rnp_months_user_id_idx on public.rnp_months(user_id);

alter table public.rnp_months enable row level security;

drop policy if exists "Users can view their own RNP months" on public.rnp_months;
create policy "Users can view their own RNP months"
  on public.rnp_months for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own RNP months" on public.rnp_months;
create policy "Users can insert their own RNP months"
  on public.rnp_months for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own RNP months" on public.rnp_months;
create policy "Users can update their own RNP months"
  on public.rnp_months for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own RNP months" on public.rnp_months;
create policy "Users can delete their own RNP months"
  on public.rnp_months for delete
  using (auth.uid() = user_id);
