create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  product jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending',
  payment_method text not null check (payment_method in ('cod')),
  customer jsonb not null,
  items jsonb not null,
  subtotal integer not null check (subtotal >= 0),
  shipping integer not null check (shipping >= 0),
  total integer not null check (total >= 0)
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.products enable row level security;
alter table public.orders enable row level security;

revoke all on public.products from anon, authenticated;
revoke all on public.orders from anon, authenticated;
grant select, insert, update, delete on public.products to service_role;
grant select, insert, update, delete on public.orders to service_role;
