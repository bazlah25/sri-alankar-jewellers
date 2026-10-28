create table if not exists public.customer_accounts (
  email text primary key,
  password_hash text not null,
  details jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_accounts enable row level security;
revoke all on public.customer_accounts from anon, authenticated;
grant select, insert, update, delete on public.customer_accounts to service_role;
