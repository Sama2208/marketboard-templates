create table if not exists public.rnp_sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  year int not null check (year between 2000 and 2100),
  month int not null check (month between 1 and 12),
  operators jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (client_id, year, month)
);

alter table public.rnp_sales enable row level security;

drop policy if exists rnp_sales_select_own on public.rnp_sales;
drop policy if exists rnp_sales_insert_own on public.rnp_sales;
drop policy if exists rnp_sales_update_own on public.rnp_sales;
drop policy if exists rnp_sales_delete_own on public.rnp_sales;

create policy rnp_sales_select_own
  on public.rnp_sales for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy rnp_sales_insert_own
  on public.rnp_sales for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy rnp_sales_update_own
  on public.rnp_sales for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy rnp_sales_delete_own
  on public.rnp_sales for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.rnp_sales from anon;
grant select, insert, update, delete on table public.rnp_sales to authenticated;
grant all on table public.rnp_sales to service_role;
