create table if not exists public.storefront_settings (
  id text primary key,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.storefront_settings enable row level security;
