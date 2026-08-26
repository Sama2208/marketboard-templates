-- Samandar sahifasidan ko'chirilgan "Lidlar bo'yicha to'liq hisobot".
-- Har bir mijoz + oy uchun bitta JSONB hisobot; barcha yozuvlar user_id bilan himoyalangan.

create table if not exists public.lead_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  year integer not null check (year between 2000 and 2100),
  month integer not null check (month between 1 and 12),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (client_id, year, month)
);

create index if not exists lead_reports_user_id_idx on public.lead_reports(user_id);
create index if not exists lead_reports_client_id_idx on public.lead_reports(client_id);

alter table public.lead_reports enable row level security;

drop policy if exists lead_reports_select_own on public.lead_reports;
drop policy if exists lead_reports_insert_own on public.lead_reports;
drop policy if exists lead_reports_update_own on public.lead_reports;
drop policy if exists lead_reports_delete_own on public.lead_reports;

create policy lead_reports_select_own
  on public.lead_reports for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy lead_reports_insert_own
  on public.lead_reports for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy lead_reports_update_own
  on public.lead_reports for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy lead_reports_delete_own
  on public.lead_reports for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.lead_reports from anon;
grant select, insert, update, delete on table public.lead_reports to authenticated;
grant all on table public.lead_reports to service_role;
