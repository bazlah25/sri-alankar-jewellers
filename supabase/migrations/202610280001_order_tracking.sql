alter table public.orders add column if not exists phone_lookup text;

update public.orders
set phone_lookup = regexp_replace(coalesce(customer->>'phone', ''), '[^0-9]', '', 'g')
where phone_lookup is null;

create index if not exists orders_phone_lookup_created_at_idx
  on public.orders (phone_lookup, created_at desc);
