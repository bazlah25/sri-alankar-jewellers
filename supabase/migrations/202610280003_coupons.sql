create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  valid_from timestamptz not null,
  valid_to timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (valid_to > valid_from),
  check (discount_type <> 'percentage' or discount_value <= 100)
);

alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount integer not null default 0 check (discount >= 0);

alter table public.coupons enable row level security;
revoke all on public.coupons from anon, authenticated;
grant select, insert, update, delete on public.coupons to service_role;
