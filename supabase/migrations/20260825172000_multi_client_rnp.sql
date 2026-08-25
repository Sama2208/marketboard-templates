-- 5-qadam: har bir foydalanuvchi uchun bir nechta mijoz va mijozga bog'langan RNP oylar.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients(user_id);

alter table public.rnp_months
  add column if not exists client_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rnp_months_client_id_fkey'
      and conrelid = 'public.rnp_months'::regclass
  ) then
    alter table public.rnp_months
      add constraint rnp_months_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete cascade;
  end if;
end $$;

-- Avvalgi bir mijozli yozuvlarni foydalanuvchining eng eski mijoziga biriktiramiz.
update public.rnp_months as r
set client_id = (
  select c.id
  from public.clients as c
  where c.user_id = r.user_id
  order by c.created_at asc, c.id asc
  limit 1
)
where r.client_id is null;

alter table public.rnp_months
  drop constraint if exists rnp_months_user_period_key;

create index if not exists rnp_months_client_id_idx on public.rnp_months(client_id);
create unique index if not exists rnp_months_client_month_uidx
  on public.rnp_months(client_id, year, month);

alter table public.clients enable row level security;

drop policy if exists clients_select_own on public.clients;
create policy clients_select_own on public.clients
  for select using (auth.uid() = user_id);

drop policy if exists clients_insert_own on public.clients;
create policy clients_insert_own on public.clients
  for insert with check (auth.uid() = user_id);

drop policy if exists clients_update_own on public.clients;
create policy clients_update_own on public.clients
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists clients_delete_own on public.clients;
create policy clients_delete_own on public.clients
  for delete using (auth.uid() = user_id);
